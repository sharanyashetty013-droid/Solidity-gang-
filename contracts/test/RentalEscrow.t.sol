// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Test} from "forge-std/Test.sol";
import {RentalEscrow} from "../src/RentalEscrow.sol";

/// Receiver that can be told to reject ETH (to test the pull-payment fallback).
contract ToggleReceiver {
    bool public accept;
    function setAccept(bool v) external { accept = v; }
    receive() external payable { if (!accept) revert("no thanks"); }
    function callWithdraw(RentalEscrow e) external { e.withdraw(); }
    function createAs(RentalEscrow e, address tenant, uint256 dep, uint64 win) external returns (uint256) {
        return e.createAgreement(tenant, dep, win);
    }
    function claimAs(RentalEscrow e, uint256 id, RentalEscrow.ClaimItemInput[] calldata items) external {
        e.submitClaim(id, items);
    }
}

/// Tenant that tries to re-enter release() when it receives its refund.
contract ReentrantTenant {
    RentalEscrow public escrow;
    uint256 public id;
    bool public reenterReverted;
    function setup(RentalEscrow e, uint256 _id) external { escrow = e; id = _id; }
    function fund() external payable { escrow.fundDeposit{value: msg.value}(id); }
    function checkoutAndEvidence() external {
        escrow.submitEvidence(id, keccak256("in"), "cidIn", RentalEscrow.EvidenceType.MoveIn);
        escrow.requestCheckout(id);
    }
    receive() external payable {
        try escrow.release(id) { } catch { reenterReverted = true; }
    }
}

contract RentalEscrowTest is Test {
    RentalEscrow escrow;

    address landlord = makeAddr("landlord");
    address tenant = makeAddr("tenant");
    address arbiter = makeAddr("arbiter");
    address stranger = makeAddr("stranger");

    uint256 constant DEPOSIT = 1.5 ether;
    uint64 constant WINDOW = 14 days;

    event AgreementCreated(uint256 indexed id, address indexed landlord, address indexed tenant, uint256 deposit, uint64 claimWindow);
    event DepositFunded(uint256 indexed id, address indexed tenant, uint256 amount);
    event EvidenceSubmitted(uint256 indexed id, address indexed submitter, bytes32 hash, string cid, RentalEscrow.EvidenceType evidenceType, uint256 timestamp);
    event CheckoutRequested(uint256 indexed id, uint64 claimDeadline);
    event ClaimSubmitted(uint256 indexed id, uint256 itemCount, uint256 totalClaimed);
    event ClaimResponded(uint256 indexed id, uint256 itemIndex, bool accepted);
    event DisputeResolved(uint256 indexed id, uint256 itemIndex, uint256 awarded);
    event DisputesEscalated(uint256 indexed id, uint256 itemsEscalated);
    event Released(uint256 indexed id, uint256 toTenant, uint256 toLandlord);

    function setUp() public {
        escrow = new RentalEscrow(arbiter);
        vm.deal(landlord, 10 ether);
        vm.deal(tenant, 10 ether);
        vm.deal(stranger, 1 ether);
    }

    // ───────── helpers ─────────
    function _create() internal returns (uint256 id) {
        vm.prank(landlord);
        id = escrow.createAgreement(tenant, DEPOSIT, WINDOW);
    }
    function _funded() internal returns (uint256 id) {
        id = _create();
        vm.prank(tenant);
        escrow.fundDeposit{value: DEPOSIT}(id);
    }
    function _active() internal returns (uint256 id) {
        id = _funded();
        vm.prank(tenant);
        escrow.submitEvidence(id, keccak256("movein"), "QmIn", RentalEscrow.EvidenceType.MoveIn);
    }
    function _checkout() internal returns (uint256 id) {
        id = _active();
        vm.prank(tenant);
        escrow.requestCheckout(id);
    }
    function _items(uint256 a, uint256 b, uint256 c) internal pure returns (RentalEscrow.ClaimItemInput[] memory it) {
        uint256 n = (a > 0 ? 1 : 0) + (b > 0 ? 1 : 0) + (c > 0 ? 1 : 0);
        it = new RentalEscrow.ClaimItemInput[](n);
        uint256 k;
        if (a > 0) it[k++] = RentalEscrow.ClaimItemInput("Wall paint", a);
        if (b > 0) it[k++] = RentalEscrow.ClaimItemInput("Broken tile", b);
        if (c > 0) it[k++] = RentalEscrow.ClaimItemInput("Carpet stain", c);
    }
    function _claimed(uint256 a, uint256 b, uint256 c) internal returns (uint256 id) {
        id = _checkout();
        vm.prank(landlord);
        escrow.submitClaim(id, _items(a, b, c));
    }
    function _state(uint256 id) internal view returns (RentalEscrow.State) {
        return escrow.getAgreement(id).state;
    }
    function _err(bytes4 sel) internal pure returns (bytes memory) { return abi.encodeWithSelector(sel); }
    function _wrong(RentalEscrow.State s) internal pure returns (bytes memory) {
        return abi.encodeWithSelector(RentalEscrow.WrongState.selector, s);
    }

    // ═════════ constructor / admin ═════════
    function test_constructor_setsArbiterAndOwner() public view {
        assertEq(escrow.arbiter(), arbiter);
        assertEq(escrow.owner(), address(this));
    }
    function test_constructor_zeroArbiterReverts() public {
        vm.expectRevert(_err(RentalEscrow.ZeroAddress.selector));
        new RentalEscrow(address(0));
    }
    function test_setArbiter_onlyOwner() public {
        address n = makeAddr("n");
        escrow.setArbiter(n);
        assertEq(escrow.arbiter(), n);
        vm.prank(stranger);
        vm.expectRevert();
        escrow.setArbiter(stranger);
        vm.expectRevert(_err(RentalEscrow.ZeroAddress.selector));
        escrow.setArbiter(address(0));
    }

    // ═════════ createAgreement ═════════
    function test_create_success() public {
        vm.expectEmit(true, true, true, true);
        emit AgreementCreated(1, landlord, tenant, DEPOSIT, WINDOW);
        uint256 id = _create();
        assertEq(id, 1);
        RentalEscrow.Agreement memory a = escrow.getAgreement(id);
        assertEq(a.landlord, landlord);
        assertEq(a.tenant, tenant);
        assertEq(a.deposit, DEPOSIT);
        assertEq(a.claimWindow, WINDOW);
        assertEq(uint8(a.state), uint8(RentalEscrow.State.Created));
        assertEq(escrow.nextId(), 2);
    }
    function test_create_zeroTenantReverts() public {
        vm.prank(landlord);
        vm.expectRevert(_err(RentalEscrow.ZeroAddress.selector));
        escrow.createAgreement(address(0), DEPOSIT, WINDOW);
    }
    function test_create_selfTenantReverts() public {
        vm.prank(landlord);
        vm.expectRevert(_err(RentalEscrow.InvalidParty.selector));
        escrow.createAgreement(landlord, DEPOSIT, WINDOW);
    }
    function test_create_arbiterAsTenantReverts() public {
        vm.prank(landlord);
        vm.expectRevert(_err(RentalEscrow.InvalidParty.selector));
        escrow.createAgreement(arbiter, DEPOSIT, WINDOW);
    }
    function test_create_arbiterAsLandlordReverts() public {
        vm.prank(arbiter);
        vm.expectRevert(_err(RentalEscrow.InvalidParty.selector));
        escrow.createAgreement(tenant, DEPOSIT, WINDOW);
    }
    function test_create_zeroDepositReverts() public {
        vm.prank(landlord);
        vm.expectRevert(_err(RentalEscrow.InvalidDeposit.selector));
        escrow.createAgreement(tenant, 0, WINDOW);
    }
    function test_create_badWindowReverts() public {
        vm.startPrank(landlord);
        vm.expectRevert(_err(RentalEscrow.InvalidWindow.selector));
        escrow.createAgreement(tenant, DEPOSIT, 59);
        vm.expectRevert(_err(RentalEscrow.InvalidWindow.selector));
        escrow.createAgreement(tenant, DEPOSIT, 91 days);
        vm.stopPrank();
    }

    // ═════════ fundDeposit ═════════
    function test_fund_success() public {
        uint256 id = _create();
        vm.expectEmit(true, true, false, true);
        emit DepositFunded(id, tenant, DEPOSIT);
        vm.prank(tenant);
        escrow.fundDeposit{value: DEPOSIT}(id);
        assertEq(address(escrow).balance, DEPOSIT);
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.Funded));
    }
    function test_fund_notTenantReverts() public {
        uint256 id = _create();
        vm.prank(landlord);
        vm.expectRevert(_err(RentalEscrow.NotTenant.selector));
        escrow.fundDeposit{value: DEPOSIT}(id);
    }
    function test_fund_wrongAmountReverts() public {
        uint256 id = _create();
        vm.startPrank(tenant);
        vm.expectRevert(_err(RentalEscrow.WrongAmount.selector));
        escrow.fundDeposit{value: DEPOSIT - 1}(id);
        vm.expectRevert(_err(RentalEscrow.WrongAmount.selector));
        escrow.fundDeposit{value: DEPOSIT + 1}(id);
        vm.stopPrank();
    }
    function test_fund_twiceReverts() public {
        uint256 id = _funded();
        vm.prank(tenant);
        vm.expectRevert(_wrong(RentalEscrow.State.Funded));
        escrow.fundDeposit{value: DEPOSIT}(id);
    }
    function test_fund_unknownAgreementReverts() public {
        vm.prank(tenant);
        vm.expectRevert(_err(RentalEscrow.AgreementNotFound.selector));
        escrow.fundDeposit{value: DEPOSIT}(99);
    }
    function test_plainEthTransferRejected() public {
        (bool ok, ) = address(escrow).call{value: 1 ether}("");
        assertFalse(ok);
    }

    // ═════════ submitEvidence ═════════
    function test_evidence_moveIn_activatesAndEmits() public {
        uint256 id = _funded();
        vm.warp(1_800_000_000);
        vm.expectEmit(true, true, false, true);
        emit EvidenceSubmitted(id, landlord, keccak256("a"), "QmA", RentalEscrow.EvidenceType.MoveIn, 1_800_000_000);
        vm.prank(landlord);
        escrow.submitEvidence(id, keccak256("a"), "QmA", RentalEscrow.EvidenceType.MoveIn);
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.Active));
        // second move-in photo stays Active
        vm.prank(tenant);
        escrow.submitEvidence(id, keccak256("b"), "QmB", RentalEscrow.EvidenceType.MoveIn);
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.Active));
    }
    function test_evidence_notPartyReverts() public {
        uint256 id = _funded();
        vm.prank(stranger);
        vm.expectRevert(_err(RentalEscrow.NotParty.selector));
        escrow.submitEvidence(id, keccak256("a"), "x", RentalEscrow.EvidenceType.MoveIn);
        vm.prank(arbiter);
        vm.expectRevert(_err(RentalEscrow.NotParty.selector));
        escrow.submitEvidence(id, keccak256("a"), "x", RentalEscrow.EvidenceType.MoveIn);
    }
    function test_evidence_emptyHashReverts() public {
        uint256 id = _funded();
        vm.prank(tenant);
        vm.expectRevert(_err(RentalEscrow.EmptyHash.selector));
        escrow.submitEvidence(id, bytes32(0), "x", RentalEscrow.EvidenceType.MoveIn);
    }
    function test_evidence_moveIn_beforeFundedReverts() public {
        uint256 id = _create();
        vm.prank(tenant);
        vm.expectRevert(_wrong(RentalEscrow.State.Created));
        escrow.submitEvidence(id, keccak256("a"), "x", RentalEscrow.EvidenceType.MoveIn);
    }
    function test_evidence_moveIn_afterCheckoutReverts() public {
        uint256 id = _checkout();
        vm.prank(landlord);
        vm.expectRevert(_wrong(RentalEscrow.State.CheckoutRequested));
        escrow.submitEvidence(id, keccak256("late"), "x", RentalEscrow.EvidenceType.MoveIn);
    }
    function test_evidence_moveOut_whileFundedReverts() public {
        uint256 id = _funded();
        vm.prank(tenant);
        vm.expectRevert(_wrong(RentalEscrow.State.Funded));
        escrow.submitEvidence(id, keccak256("a"), "x", RentalEscrow.EvidenceType.MoveOut);
    }
    function test_evidence_moveOut_activeAndCheckoutOk() public {
        uint256 id = _active();
        vm.prank(tenant);
        escrow.submitEvidence(id, keccak256("o1"), "o1", RentalEscrow.EvidenceType.MoveOut);
        vm.prank(tenant);
        escrow.requestCheckout(id);
        vm.prank(landlord);
        escrow.submitEvidence(id, keccak256("o2"), "o2", RentalEscrow.EvidenceType.MoveOut);
    }
    function test_evidence_moveOut_afterWindowReverts() public {
        uint256 id = _checkout();
        vm.warp(block.timestamp + WINDOW + 1);
        vm.prank(tenant);
        vm.expectRevert(_err(RentalEscrow.WindowClosed.selector));
        escrow.submitEvidence(id, keccak256("o"), "o", RentalEscrow.EvidenceType.MoveOut);
    }
    function test_evidence_afterClaimReverts() public {
        uint256 id = _claimed(1 ether, 0, 0);
        vm.prank(tenant);
        vm.expectRevert(_wrong(RentalEscrow.State.Claimed));
        escrow.submitEvidence(id, keccak256("o"), "o", RentalEscrow.EvidenceType.MoveOut);
    }

    // ═════════ requestCheckout ═════════
    function test_checkout_success() public {
        uint256 id = _active();
        vm.warp(1_800_000_000);
        vm.expectEmit(true, false, false, true);
        emit CheckoutRequested(id, uint64(1_800_000_000 + WINDOW));
        vm.prank(tenant);
        escrow.requestCheckout(id);
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.CheckoutRequested));
        assertEq(escrow.claimDeadline(id), 1_800_000_000 + WINDOW);
    }
    function test_checkout_notTenantReverts() public {
        uint256 id = _active();
        vm.prank(landlord);
        vm.expectRevert(_err(RentalEscrow.NotTenant.selector));
        escrow.requestCheckout(id);
    }
    function test_checkout_needsMoveInEvidence() public {
        uint256 id = _funded();
        vm.prank(tenant);
        vm.expectRevert(_wrong(RentalEscrow.State.Funded));
        escrow.requestCheckout(id);
    }
    function test_checkout_twiceReverts() public {
        uint256 id = _checkout();
        vm.prank(tenant);
        vm.expectRevert(_wrong(RentalEscrow.State.CheckoutRequested));
        escrow.requestCheckout(id);
    }
    function test_claimDeadline_zeroBeforeCheckout() public {
        uint256 id = _active();
        assertEq(escrow.claimDeadline(id), 0);
    }

    // ═════════ submitClaim ═════════
    function test_claim_success() public {
        uint256 id = _checkout();
        vm.expectEmit(true, false, false, true);
        emit ClaimSubmitted(id, 2, 0.5 ether);
        vm.prank(landlord);
        escrow.submitClaim(id, _items(0.2 ether, 0.3 ether, 0));
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.Claimed));
        RentalEscrow.ClaimItem[] memory it = escrow.getItems(id);
        assertEq(it.length, 2);
        assertEq(it[0].name, "Wall paint");
        assertEq(it[1].amount, 0.3 ether);
        assertEq(escrow.getAgreement(id).pendingCount, 2);
    }
    function test_claim_notLandlordReverts() public {
        uint256 id = _checkout();
        vm.prank(tenant);
        vm.expectRevert(_err(RentalEscrow.NotLandlord.selector));
        escrow.submitClaim(id, _items(1 ether, 0, 0));
    }
    function test_claim_wrongStateReverts() public {
        uint256 id = _active();
        vm.prank(landlord);
        vm.expectRevert(_wrong(RentalEscrow.State.Active));
        escrow.submitClaim(id, _items(1 ether, 0, 0));
    }
    function test_claim_timer_lastSecondOkThenClosed() public {
        uint256 id = _checkout();
        uint256 deadline = escrow.claimDeadline(id);
        vm.warp(deadline); // exactly at the deadline: still allowed
        vm.prank(landlord);
        escrow.submitClaim(id, _items(1 ether, 0, 0));
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.Claimed));

        uint256 id2 = _checkout();
        vm.warp(escrow.claimDeadline(id2) + 1); // one second late
        vm.prank(landlord);
        vm.expectRevert(_err(RentalEscrow.WindowClosed.selector));
        escrow.submitClaim(id2, _items(1 ether, 0, 0));
    }
    function test_claim_emptyReverts() public {
        uint256 id = _checkout();
        vm.prank(landlord);
        vm.expectRevert(_err(RentalEscrow.NoItems.selector));
        escrow.submitClaim(id, new RentalEscrow.ClaimItemInput[](0));
    }
    function test_claim_tooManyReverts() public {
        uint256 id = _checkout();
        RentalEscrow.ClaimItemInput[] memory it = new RentalEscrow.ClaimItemInput[](21);
        for (uint256 i; i < 21; i++) it[i] = RentalEscrow.ClaimItemInput("x", 1);
        vm.prank(landlord);
        vm.expectRevert(_err(RentalEscrow.TooManyItems.selector));
        escrow.submitClaim(id, it);
    }
    function test_claim_zeroAmountReverts() public {
        uint256 id = _checkout();
        RentalEscrow.ClaimItemInput[] memory it = new RentalEscrow.ClaimItemInput[](1);
        it[0] = RentalEscrow.ClaimItemInput("x", 0);
        vm.prank(landlord);
        vm.expectRevert(_err(RentalEscrow.ZeroItemAmount.selector));
        escrow.submitClaim(id, it);
    }
    function test_claim_exceedsDepositReverts() public {
        uint256 id = _checkout();
        vm.prank(landlord);
        vm.expectRevert(_err(RentalEscrow.ClaimExceedsDeposit.selector));
        escrow.submitClaim(id, _items(1 ether, 0.5 ether, 1));
    }
    function test_claim_exactlyDepositOk() public {
        uint256 id = _checkout();
        vm.prank(landlord);
        escrow.submitClaim(id, _items(1 ether, 0.5 ether, 0));
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.Claimed));
    }
    function test_claim_overflowSumReverts() public {
        uint256 id = _checkout();
        RentalEscrow.ClaimItemInput[] memory it = new RentalEscrow.ClaimItemInput[](2);
        it[0] = RentalEscrow.ClaimItemInput("a", type(uint256).max);
        it[1] = RentalEscrow.ClaimItemInput("b", 2);
        vm.prank(landlord);
        vm.expectRevert(); // arithmetic overflow panic
        escrow.submitClaim(id, it);
    }
    function test_claim_secondClaimReverts() public {
        uint256 id = _claimed(0.1 ether, 0, 0);
        vm.prank(landlord);
        vm.expectRevert(_wrong(RentalEscrow.State.Claimed));
        escrow.submitClaim(id, _items(0.1 ether, 0, 0));
    }

    // ═════════ respondToClaim ═════════
    function test_respond_acceptAndDispute() public {
        uint256 id = _claimed(0.2 ether, 0.3 ether, 0.1 ether);
        vm.expectEmit(true, false, false, true);
        emit ClaimResponded(id, 0, true);
        vm.prank(tenant);
        escrow.respondToClaim(id, 0, true);
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.Claimed)); // still waiting for others

        vm.prank(tenant);
        escrow.respondToClaim(id, 1, false);
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.Claimed)); // item 2 still pending

        vm.prank(tenant);
        escrow.respondToClaim(id, 2, true);
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.Disputed));
        RentalEscrow.Agreement memory a = escrow.getAgreement(id);
        assertEq(a.landlordPayout, 0.3 ether);
        assertEq(a.disputedCount, 1);
        assertEq(a.pendingCount, 0);
    }
    function test_respond_notTenantReverts() public {
        uint256 id = _claimed(0.2 ether, 0, 0);
        vm.prank(landlord);
        vm.expectRevert(_err(RentalEscrow.NotTenant.selector));
        escrow.respondToClaim(id, 0, true);
    }
    function test_respond_wrongStateReverts() public {
        uint256 id = _checkout();
        vm.prank(tenant);
        vm.expectRevert(_wrong(RentalEscrow.State.CheckoutRequested));
        escrow.respondToClaim(id, 0, true);
    }
    function test_respond_invalidItemReverts() public {
        uint256 id = _claimed(0.2 ether, 0, 0);
        vm.prank(tenant);
        vm.expectRevert(_err(RentalEscrow.InvalidItem.selector));
        escrow.respondToClaim(id, 1, true);
    }
    function test_respond_twiceReverts() public {
        uint256 id = _claimed(0.2 ether, 0.1 ether, 0);
        vm.startPrank(tenant);
        escrow.respondToClaim(id, 0, true);
        vm.expectRevert(_err(RentalEscrow.ItemNotPending.selector));
        escrow.respondToClaim(id, 0, false);
        vm.stopPrank();
    }

    // ═════════ resolveDispute ═════════
    function _disputed() internal returns (uint256 id) {
        id = _claimed(0.4 ether, 0.6 ether, 0);
        vm.startPrank(tenant);
        escrow.respondToClaim(id, 0, false);
        escrow.respondToClaim(id, 1, false);
        vm.stopPrank();
    }
    function test_resolve_success_andReadyForRelease() public {
        uint256 id = _disputed();
        vm.expectEmit(true, false, false, true);
        emit DisputeResolved(id, 0, 0.25 ether);
        vm.prank(arbiter);
        escrow.resolveDispute(id, 0, 0.25 ether);
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.Disputed)); // item 1 outstanding
        vm.prank(arbiter);
        escrow.resolveDispute(id, 1, 0);
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.Claimed)); // all decided
        assertEq(escrow.getAgreement(id).landlordPayout, 0.25 ether);
        RentalEscrow.ClaimItem[] memory it = escrow.getItems(id);
        assertEq(uint8(it[0].status), uint8(RentalEscrow.ItemStatus.Resolved));
        assertEq(it[0].awarded, 0.25 ether);
    }
    function test_resolve_notArbiterReverts() public {
        uint256 id = _disputed();
        address[3] memory who = [landlord, tenant, stranger];
        for (uint256 i; i < 3; i++) {
            vm.prank(who[i]);
            vm.expectRevert(_err(RentalEscrow.NotArbiter.selector));
            escrow.resolveDispute(id, 0, 0);
        }
    }
    function test_resolve_ownerIsNotArbiter() public {
        uint256 id = _disputed();
        vm.expectRevert(_err(RentalEscrow.NotArbiter.selector)); // test contract is owner
        escrow.resolveDispute(id, 0, 0);
    }
    function test_resolve_wrongStateReverts() public {
        uint256 id = _claimed(0.4 ether, 0, 0);
        vm.prank(arbiter);
        vm.expectRevert(_wrong(RentalEscrow.State.Claimed));
        escrow.resolveDispute(id, 0, 0);
    }
    function test_resolve_invalidItemReverts() public {
        uint256 id = _disputed();
        vm.prank(arbiter);
        vm.expectRevert(_err(RentalEscrow.InvalidItem.selector));
        escrow.resolveDispute(id, 5, 0);
    }
    function test_resolve_acceptedItemNotResolvable() public {
        uint256 id = _claimed(0.4 ether, 0.6 ether, 0);
        vm.startPrank(tenant);
        escrow.respondToClaim(id, 0, true);
        escrow.respondToClaim(id, 1, false);
        vm.stopPrank();
        vm.prank(arbiter);
        vm.expectRevert(_err(RentalEscrow.ItemNotDisputed.selector));
        escrow.resolveDispute(id, 0, 0.1 ether);
    }
    function test_resolve_amountAboveClaimReverts() public {
        uint256 id = _disputed();
        vm.prank(arbiter);
        vm.expectRevert(_err(RentalEscrow.AwardExceedsClaim.selector));
        escrow.resolveDispute(id, 0, 0.4 ether + 1);
    }
    function test_resolve_twiceReverts() public {
        uint256 id = _disputed();
        vm.startPrank(arbiter);
        escrow.resolveDispute(id, 0, 0.1 ether);
        vm.expectRevert(_err(RentalEscrow.ItemNotDisputed.selector));
        escrow.resolveDispute(id, 0, 0.2 ether);
        vm.stopPrank();
    }

    // ═════════ release ═════════
    function test_release_noClaim_fullRefundToTenant() public {
        uint256 id = _checkout();
        uint256 before = tenant.balance;
        vm.warp(escrow.claimDeadline(id) + 1);
        vm.expectEmit(true, false, false, true);
        emit Released(id, DEPOSIT, 0);
        vm.prank(stranger); // anyone
        escrow.release(id);
        assertEq(tenant.balance, before + DEPOSIT);
        assertEq(address(escrow).balance, 0);
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.Settled));
    }
    function test_release_beforeWindowEndsReverts() public {
        uint256 id = _checkout();
        vm.expectRevert(_err(RentalEscrow.WindowStillOpen.selector));
        escrow.release(id);
        vm.warp(escrow.claimDeadline(id)); // exactly at deadline: landlord can still claim
        vm.expectRevert(_err(RentalEscrow.WindowStillOpen.selector));
        escrow.release(id);
    }
    function test_release_wrongStatesRevert() public {
        uint256 c = _create();
        vm.expectRevert(_err(RentalEscrow.NotReleasable.selector));
        escrow.release(c);
        uint256 f = _funded();
        vm.expectRevert(_err(RentalEscrow.NotReleasable.selector));
        escrow.release(f);
        uint256 a = _active();
        vm.expectRevert(_err(RentalEscrow.NotReleasable.selector));
        escrow.release(a);
        uint256 d = _disputed();
        vm.expectRevert(_err(RentalEscrow.NotReleasable.selector));
        escrow.release(d);
        vm.expectRevert(_err(RentalEscrow.AgreementNotFound.selector));
        escrow.release(999);
    }
    function test_release_doubleReleaseReverts() public {
        uint256 id = _checkout();
        vm.warp(escrow.claimDeadline(id) + 1);
        escrow.release(id);
        vm.expectRevert(_err(RentalEscrow.NotReleasable.selector));
        escrow.release(id);
    }
    function test_release_allAccepted() public {
        uint256 id = _claimed(0.2 ether, 0.3 ether, 0);
        vm.startPrank(tenant);
        escrow.respondToClaim(id, 0, true);
        escrow.respondToClaim(id, 1, true);
        vm.stopPrank();
        uint256 lBefore = landlord.balance;
        uint256 tBefore = tenant.balance;
        escrow.release(id);
        assertEq(landlord.balance, lBefore + 0.5 ether);
        assertEq(tenant.balance, tBefore + DEPOSIT - 0.5 ether);
        assertEq(address(escrow).balance, 0);
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.Settled));
    }
    function test_release_claimWholeDeposit() public {
        uint256 id = _claimed(1 ether, 0.5 ether, 0);
        vm.startPrank(tenant);
        escrow.respondToClaim(id, 0, true);
        escrow.respondToClaim(id, 1, true);
        vm.stopPrank();
        uint256 tBefore = tenant.balance;
        escrow.release(id);
        assertEq(tenant.balance, tBefore); // tenant gets 0, no zero-value send problems
        assertEq(address(escrow).balance, 0);
    }
    function test_release_allRejected_goesToArbiterThenTenantGetsAll() public {
        uint256 id = _disputed();
        vm.startPrank(arbiter);
        escrow.resolveDispute(id, 0, 0);
        escrow.resolveDispute(id, 1, 0);
        vm.stopPrank();
        uint256 tBefore = tenant.balance;
        escrow.release(id);
        assertEq(tenant.balance, tBefore + DEPOSIT);
        assertEq(address(escrow).balance, 0);
    }
    function test_release_fullDisputePath_mixed() public {
        // item0 0.2 accepted, item1 0.3 disputed -> arbiter gives 0.1, item2 0.1 accepted
        uint256 id = _claimed(0.2 ether, 0.3 ether, 0.1 ether);
        vm.startPrank(tenant);
        escrow.respondToClaim(id, 0, true);
        escrow.respondToClaim(id, 1, false);
        escrow.respondToClaim(id, 2, true);
        vm.stopPrank();
        // cannot release while a dispute is open
        vm.expectRevert(_err(RentalEscrow.NotReleasable.selector));
        escrow.release(id);
        vm.prank(arbiter);
        escrow.resolveDispute(id, 1, 0.1 ether);

        uint256 lBefore = landlord.balance;
        uint256 tBefore = tenant.balance;
        escrow.release(id);
        assertEq(landlord.balance, lBefore + 0.4 ether); // 0.2 + 0.1 + 0.1
        assertEq(tenant.balance, tBefore + DEPOSIT - 0.4 ether);
        assertEq(address(escrow).balance, 0);
    }
    function test_release_silentTenant_escalatesInsteadOfPayingLandlord() public {
        uint256 id = _claimed(0.2 ether, 0.3 ether, 0);
        vm.prank(tenant);
        escrow.respondToClaim(id, 0, true); // item 1 left unanswered

        // too early
        vm.expectRevert(_err(RentalEscrow.WindowStillOpen.selector));
        escrow.release(id);

        vm.warp(block.timestamp + WINDOW + 1);
        vm.expectEmit(true, false, false, true);
        emit DisputesEscalated(id, 1);
        vm.prank(stranger);
        escrow.release(id);
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.Disputed));
        assertEq(address(escrow).balance, DEPOSIT); // nothing paid out yet

        vm.prank(arbiter);
        escrow.resolveDispute(id, 1, 0.3 ether);
        uint256 lBefore = landlord.balance;
        escrow.release(id);
        assertEq(landlord.balance, lBefore + 0.5 ether);
        assertEq(address(escrow).balance, 0);
    }
    function test_release_silentTenant_allItemsUnanswered() public {
        uint256 id = _claimed(0.2 ether, 0.3 ether, 0.1 ether);
        vm.warp(block.timestamp + WINDOW + 1);
        escrow.release(id);
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.Disputed));
        assertEq(escrow.getAgreement(id).disputedCount, 3);
        RentalEscrow.ClaimItem[] memory it = escrow.getItems(id);
        for (uint256 i; i < 3; i++) assertEq(uint8(it[i].status), uint8(RentalEscrow.ItemStatus.Disputed));
    }

    // ═════════ pull-payment fallback & reentrancy ═════════
    function test_release_rejectingLandlordDoesNotLockTenant() public {
        ToggleReceiver badLandlord = new ToggleReceiver();
        uint256 id = badLandlord.createAs(escrow, tenant, DEPOSIT, WINDOW);
        vm.prank(tenant);
        escrow.fundDeposit{value: DEPOSIT}(id);
        vm.prank(tenant);
        escrow.submitEvidence(id, keccak256("i"), "i", RentalEscrow.EvidenceType.MoveIn);
        vm.prank(tenant);
        escrow.requestCheckout(id);
        badLandlord.claimAs(escrow, id, _items(0.5 ether, 0, 0));
        vm.prank(tenant);
        escrow.respondToClaim(id, 0, true);

        uint256 tBefore = tenant.balance;
        escrow.release(id);
        assertEq(tenant.balance, tBefore + DEPOSIT - 0.5 ether); // tenant paid regardless
        assertEq(escrow.pendingWithdrawals(address(badLandlord)), 0.5 ether);
        assertEq(address(escrow).balance, 0.5 ether);

        // can't withdraw while rejecting
        vm.expectRevert(_err(RentalEscrow.TransferFailed.selector));
        badLandlord.callWithdraw(escrow);
        // fix receiver, withdraw works once
        badLandlord.setAccept(true);
        badLandlord.callWithdraw(escrow);
        assertEq(address(badLandlord).balance, 0.5 ether);
        assertEq(address(escrow).balance, 0);
        vm.expectRevert(_err(RentalEscrow.NothingToWithdraw.selector));
        badLandlord.callWithdraw(escrow);
    }
    function test_withdraw_nothingReverts() public {
        vm.prank(stranger);
        vm.expectRevert(_err(RentalEscrow.NothingToWithdraw.selector));
        escrow.withdraw();
    }
    function test_release_reentrancyBlocked() public {
        ReentrantTenant t = new ReentrantTenant();
        vm.prank(landlord);
        uint256 id = escrow.createAgreement(address(t), DEPOSIT, WINDOW);
        t.setup(escrow, id);
        t.fund{value: DEPOSIT}();
        t.checkoutAndEvidence();
        vm.warp(escrow.claimDeadline(id) + 1);

        escrow.release(id);
        assertTrue(t.reenterReverted());
        assertEq(address(t).balance, DEPOSIT);   // refunded exactly once
        assertEq(address(escrow).balance, 0);
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.Settled));
    }

    // ═════════ multiple agreements are isolated ═════════
    function test_multipleAgreementsIsolated() public {
        uint256 a = _checkout();
        uint256 b = _checkout();
        assertEq(address(escrow).balance, 2 * DEPOSIT);
        vm.warp(escrow.claimDeadline(a) + 1);
        escrow.release(a);
        assertEq(address(escrow).balance, DEPOSIT);
        assertEq(uint8(_state(b)), uint8(RentalEscrow.State.CheckoutRequested));
    }

    // ═════════ fuzz: money is conserved ═════════
    /// For any claim split, any accept/dispute pattern and any arbiter award,
    /// landlord + tenant payouts == deposit and the contract ends at zero.
    function testFuzz_moneyConserved(uint96 deposit, uint96 c0, uint96 c1, uint96 c2, uint8 mask, uint96 seed) public {
        deposit = uint96(bound(deposit, 3, 100 ether));
        uint96[3] memory claims = [
            uint96(bound(c0, 1, deposit / 3)),
            uint96(bound(c1, 1, deposit / 3)),
            uint96(bound(c2, 1, deposit / 3))
        ];
        uint256 id = _fuzzSetup(deposit, claims);

        uint256 expectedLandlord;
        for (uint256 i; i < 3; i++) {
            bool accept = (mask >> i) & 1 == 1;
            vm.prank(tenant);
            escrow.respondToClaim(id, i, accept);
            if (accept) expectedLandlord += claims[i];
        }
        for (uint256 i; i < 3; i++) {
            if ((mask >> i) & 1 == 0) {
                uint256 aw = uint256(keccak256(abi.encode(seed, i))) % (uint256(claims[i]) + 1);
                vm.prank(arbiter);
                escrow.resolveDispute(id, i, aw);
                expectedLandlord += aw;
            }
        }

        uint256 lBefore = landlord.balance;
        uint256 tBefore = tenant.balance;
        escrow.release(id);

        assertEq(landlord.balance - lBefore, expectedLandlord);
        assertEq(tenant.balance - tBefore, uint256(deposit) - expectedLandlord);
        assertEq(address(escrow).balance, 0);
        assertEq(uint8(_state(id)), uint8(RentalEscrow.State.Settled));
    }

    function _fuzzSetup(uint96 deposit, uint96[3] memory claims) internal returns (uint256 id) {
        vm.deal(tenant, deposit);
        vm.prank(landlord);
        id = escrow.createAgreement(tenant, deposit, WINDOW);
        vm.startPrank(tenant);
        escrow.fundDeposit{value: deposit}(id);
        escrow.submitEvidence(id, keccak256("i"), "i", RentalEscrow.EvidenceType.MoveIn);
        escrow.requestCheckout(id);
        vm.stopPrank();
        RentalEscrow.ClaimItemInput[] memory it = new RentalEscrow.ClaimItemInput[](3);
        for (uint256 i; i < 3; i++) it[i] = RentalEscrow.ClaimItemInput("item", claims[i]);
        vm.prank(landlord);
        escrow.submitClaim(id, it);
    }
}
