// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {RentalEscrow} from "../src/RentalEscrow.sol";

/// Usage (Sepolia):
///   export ARBITER=0xYourArbiterWallet
///   forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --account deployer --broadcast
/// (use `cast wallet import deployer --interactive` so the key never sits in a file)
contract Deploy is Script {
    function run() external returns (RentalEscrow escrow) {
        address arbiter = vm.envAddress("ARBITER");
        vm.startBroadcast();
        escrow = new RentalEscrow(arbiter);
        vm.stopBroadcast();
        console.log("RentalEscrow deployed at:", address(escrow));
        console.log("Arbiter:", arbiter);
    }
}
