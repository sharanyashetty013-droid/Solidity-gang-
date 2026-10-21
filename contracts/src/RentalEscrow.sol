// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title RentalEscrow - Walls Don't Lie
/// @notice Holds a rental security deposit. Evidence hashes are stored as events.
///         No claim in time => full refund to tenant. Claims are accepted/disputed per item.
///         Accepted amounts go to the landlord, everything else to the tenant.
contract RentalEscrow is ReentrancyGuard, Ownable {
    // ───────────── Types ─────────────
    // Order matters: the frontend/backend read these as uint8.
    enum State { Created, Funded, Active, CheckoutRequested, Claimed, Disputed, Settled }
    enum EvidenceType { MoveIn, MoveOut }
    enum ItemStatus { Pending, Accepted, Disputed, Resolved }

    struct Agreement {
        address landlord;
        address tenant;
        uint256 deposit;
        uint64 claimWindow;      // seconds
        uint64 checkoutAt;       // when tenant requested checkout
        uint64 claimedAt;        // when landlord submitted claim
        State state;
        uint16 pendingCount;     // items awaiting tenant response
        uint16 disputedCount;    // items awaiting arbiter
        uint256 landlordPayout;  // running total owed to landlord (accepted + resolved)
    }

    struct ClaimItemInput {
        string name;
        uint256 amount;
    }

    struct ClaimItem {
        string name;
        uint256 amount;   // amount claimed by landlord
        uint256 awarded;  // amount landlord finally gets for this item
        ItemStatus status;
    }

    // ───────────── Constants / storage ─────────────
    uint64 public constant MIN_WINDOW = 1 minutes;   // short on purpose so demos are possible
    uint64 public constant MAX_WINDOW = 90 days;
    uint256 public constant MAX_ITEMS = 20;

    address public arbiter;
    uint256 public nextId = 1;

    mapping(uint256 => Agreement) private _agreements;
    mapping(uint256 => ClaimItem[]) private _items;
    /// @notice ETH that could not be pushed (receiver reverted). Pull with withdraw().
    mapping(address => uint256) public pendingWithdrawals;

    // ───────────── Errors ─────────────
    error ZeroAddress();
    error InvalidParty();
    error InvalidDeposit();
    error InvalidWindow();
    error AgreementNotFound();
    error NotLandlord();
    error NotTenant();
    error NotParty();
    error NotArbiter();
    error WrongState(State current);
    error WrongAmount();
    error WrongEvidenceType();
    error EmptyHash();
    error WindowClosed();
    error WindowStillOpen();
    error NoItems();
    error TooManyItems();
    error ZeroItemAmount();
    error ClaimExceedsDeposit();
    error InvalidItem();
    error ItemNotPending();
    error ItemNotDisputed();
    error AwardExceedsClaim();
    error NotReleasable();
    error NothingToWithdraw();
    error TransferFailed();

    // ───────────── Events ─────────────
    event AgreementCreated(uint256 indexed id, address indexed landlord, address indexed tenant, uint256 deposit, uint64 claimWindow);
    event DepositFunded(uint256 indexed id, address indexed tenant, uint256 amount);
    event EvidenceSubmitted(uint256 indexed id, address indexed submitter, bytes32 hash, string cid, EvidenceType evidenceType, uint256 timestamp);
    event CheckoutRequested(uint256 indexed id, uint64 claimDeadline);
    event ClaimSubmitted(uint256 indexed id, uint256 itemCount, uint256 totalClaimed);
    event ClaimResponded(uint256 indexed id, uint256 itemIndex, bool accepted);
    event DisputesEscalated(uint256 indexed id, uint256 itemsEscalated);
    event DisputeResolved(uint256 indexed id, uint256 itemIndex, uint256 awarded);
    event Released(uint256 indexed id, uint256 toTenant, uint256 toLandlord);
    event PayoutDeferred(address indexed to, uint256 amount);
    event Withdrawn(address indexed to, uint256 amount);
    event ArbiterUpdated(address indexed arbiter);

    // ───────────── Constructor ─────────────
    constructor(address _arbiter) Ownable(msg.sender) {
        if (_arbiter == address(0)) revert ZeroAddress();
        arbiter = _arbiter;
        emit ArbiterUpdated(_arbiter);
    }

    function setArbiter(address _arbiter) external onlyOwner {
        if (_arbiter == address(0)) revert ZeroAddress();
        arbiter = _arbiter;
        emit ArbiterUpdated(_arbiter);
    }

    // ───────────── Core flow ─────────────

    /// @notice Landlord creates an agreement.
    function createAgreement(address tenant, uint256 deposit, uint64 claimWindow) external returns (uint256 id) {
        if (tenant == address(0)) revert ZeroAddress();
        if (tenant == msg.sender || tenant == arbiter || msg.sender == arbiter) revert InvalidParty();
        if (deposit == 0) revert InvalidDeposit();
        if (claimWindow < MIN_WINDOW || claimWindow > MAX_WINDOW) revert InvalidWindow();

        id = nextId++;
        Agreement storage a = _agreements[id];
        a.landlord = msg.sender;
        a.tenant = tenant;
        a.deposit = deposit;
        a.claimWindow = claimWindow;
        a.state = State.Created;

        emit AgreementCreated(id, msg.sender, tenant, deposit, claimWindow);
    }

    /// @notice Tenant locks exactly the deposit.
    function fundDeposit(uint256 id) external payable {
        Agreement storage a = _get(id);
        if (msg.sender != a.tenant) revert NotTenant();
        if (a.state != State.Created) revert WrongState(a.state);
        if (msg.value != a.deposit) revert WrongAmount();

        a.state = State.Funded;
        emit DepositFunded(id, msg.sender, msg.value);
    }

    /// @notice Tenant or landlord anchors a photo hash + IPFS CID. Block time is the timestamp.
    ///         First move-in evidence moves Funded -> Active.
    ///         Move-in: Funded/Active. Move-out: Active/CheckoutRequested (inside the window).
    function submitEvidence(uint256 id, bytes32 hash, string calldata cid, EvidenceType evidenceType) external {
        Agreement storage a = _get(id);
        if (msg.sender != a.tenant && msg.sender != a.landlord) revert NotParty();
        if (hash == bytes32(0)) revert EmptyHash();

        if (evidenceType == EvidenceType.MoveIn) {
            if (a.state != State.Funded && a.state != State.Active) revert WrongState(a.state);
            if (a.state == State.Funded) a.state = State.Active;
        } else {
            if (a.state == State.CheckoutRequested) {
                if (block.timestamp > uint256(a.checkoutAt) + a.claimWindow) revert WindowClosed();
            } else if (a.state != State.Active) {
                revert WrongState(a.state);
            }
        }

        emit EvidenceSubmitted(id, msg.sender, hash, cid, evidenceType, block.timestamp);
    }

    /// @notice Tenant says "I'm vacating". Starts the claim window.
    function requestCheckout(uint256 id) external {
        Agreement storage a = _get(id);
        if (msg.sender != a.tenant) revert NotTenant();
        if (a.state != State.Active) revert WrongState(a.state);

        a.state = State.CheckoutRequested;
        a.checkoutAt = uint64(block.timestamp);
        emit CheckoutRequested(id, uint64(block.timestamp) + a.claimWindow);
    }

    /// @notice Landlord submits itemized claims inside the window. Total can't exceed the deposit.
    function submitClaim(uint256 id, ClaimItemInput[] calldata items) external {
        Agreement storage a = _get(id);
        if (msg.sender != a.landlord) revert NotLandlord();
        if (a.state != State.CheckoutRequested) revert WrongState(a.state);
        if (block.timestamp > uint256(a.checkoutAt) + a.claimWindow) revert WindowClosed();
        if (items.length == 0) revert NoItems();
        if (items.length > MAX_ITEMS) revert TooManyItems();

        uint256 total;
        for (uint256 i = 0; i < items.length; i++) {
            if (items[i].amount == 0) revert ZeroItemAmount();
            total += items[i].amount;
            _items[id].push(ClaimItem({name: items[i].name, amount: items[i].amount, awarded: 0, status: ItemStatus.Pending}));
        }
        if (total > a.deposit) revert ClaimExceedsDeposit();

        a.state = State.Claimed;
        a.claimedAt = uint64(block.timestamp);
        a.pendingCount = uint16(items.length);

        emit ClaimSubmitted(id, items.length, total);
    }

    /// @notice Tenant accepts or disputes one item.
    function respondToClaim(uint256 id, uint256 itemIndex, bool accept) external {
        Agreement storage a = _get(id);
        if (msg.sender != a.tenant) revert NotTenant();
        if (a.state != State.Claimed) revert WrongState(a.state);
        if (itemIndex >= _items[id].length) revert InvalidItem();

        ClaimItem storage it = _items[id][itemIndex];
        if (it.status != ItemStatus.Pending) revert ItemNotPending();

        a.pendingCount--;
        if (accept) {
            it.status = ItemStatus.Accepted;
            it.awarded = it.amount;
            a.landlordPayout += it.amount;
        } else {
            it.status = ItemStatus.Disputed;
            a.disputedCount++;
        }

        // Once every item is answered, any dispute moves the agreement to the arbiter.
        if (a.pendingCount == 0 && a.disputedCount > 0) a.state = State.Disputed;

        emit ClaimResponded(id, itemIndex, accept);
    }

    /// @notice Arbiter decides a disputed item. Landlord gets `amount` (<= claimed); tenant gets the rest.
    function resolveDispute(uint256 id, uint256 itemIndex, uint256 amount) external {
        Agreement storage a = _get(id);
        if (msg.sender != arbiter) revert NotArbiter();
        if (a.state != State.Disputed) revert WrongState(a.state);
        if (itemIndex >= _items[id].length) revert InvalidItem();

        ClaimItem storage it = _items[id][itemIndex];
        if (it.status != ItemStatus.Disputed) revert ItemNotDisputed();
        if (amount > it.amount) revert AwardExceedsClaim();

        it.status = ItemStatus.Resolved;
        it.awarded = amount;
        a.landlordPayout += amount;
        a.disputedCount--;

        // All disputes decided: ready for release().
        if (a.disputedCount == 0) a.state = State.Claimed;

        emit DisputeResolved(id, itemIndex, amount);
    }

    /// @notice Anyone can trigger payout.
    ///  1. Window over with no claim            -> full deposit to tenant.
    ///  2. Claim fully answered/resolved        -> accepted+awarded to landlord, rest to tenant.
    ///  3. Tenant ignored claim past the window -> unanswered items escalate to the arbiter (no payout yet).
    function release(uint256 id) external nonReentrant {
        Agreement storage a = _get(id);

        uint256 toLandlord;
        uint256 toTenant;

        if (a.state == State.CheckoutRequested) {
            if (block.timestamp <= uint256(a.checkoutAt) + a.claimWindow) revert WindowStillOpen();
            toTenant = a.deposit;
        } else if (a.state == State.Claimed) {
            if (a.pendingCount > 0) {
                // Tenant silent: protect the tenant by sending unanswered items to the arbiter,
                // never auto-paying the landlord.
                if (block.timestamp <= uint256(a.claimedAt) + a.claimWindow) revert WindowStillOpen();
                uint256 n = _items[id].length;
                uint256 escalated;
                for (uint256 i = 0; i < n; i++) {
                    if (_items[id][i].status == ItemStatus.Pending) {
                        _items[id][i].status = ItemStatus.Disputed;
                        escalated++;
                    }
                }
                a.pendingCount = 0;
                a.disputedCount += uint16(escalated);
                a.state = State.Disputed;
                emit DisputesEscalated(id, escalated);
                return;
            }
            // pendingCount == 0 and state == Claimed implies disputedCount == 0.
            toLandlord = a.landlordPayout;
            toTenant = a.deposit - toLandlord;
        } else {
            revert NotReleasable();
        }

        // Effects before interactions.
        a.state = State.Settled;
        emit Released(id, toTenant, toLandlord);

        // Interactions.
        if (toTenant > 0) _pay(a.tenant, toTenant);
        if (toLandlord > 0) _pay(a.landlord, toLandlord);
    }

    /// @notice Pull any payout that failed to push.
    function withdraw() external nonReentrant {
        uint256 amt = pendingWithdrawals[msg.sender];
        if (amt == 0) revert NothingToWithdraw();
        pendingWithdrawals[msg.sender] = 0;
        (bool ok, ) = msg.sender.call{value: amt}("");
        if (!ok) revert TransferFailed();
        emit Withdrawn(msg.sender, amt);
    }

    // ───────────── Views ─────────────

    function getAgreement(uint256 id) external view returns (Agreement memory) {
        return _get(id);
    }

    function getItems(uint256 id) external view returns (ClaimItem[] memory) {
        _get(id);
        return _items[id];
    }

    /// @notice Unix time the claim window ends (0 before checkout).
    function claimDeadline(uint256 id) external view returns (uint256) {
        Agreement storage a = _get(id);
        if (a.checkoutAt == 0) return 0;
        return uint256(a.checkoutAt) + a.claimWindow;
    }

    // ───────────── Internal ─────────────

    function _get(uint256 id) internal view returns (Agreement storage a) {
        a = _agreements[id];
        if (a.landlord == address(0)) revert AgreementNotFound();
    }

    /// @dev Push ETH; if the receiver reverts, park it for withdraw() so one bad
    ///      party can never lock the other party's money.
    function _pay(address to, uint256 amount) internal {
        (bool ok, ) = to.call{value: amount}("");
        if (!ok) {
            pendingWithdrawals[to] += amount;
            emit PayoutDeferred(to, amount);
        }
    }
}
