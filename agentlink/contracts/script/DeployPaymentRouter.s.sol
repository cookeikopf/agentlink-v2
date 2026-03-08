// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "forge-std/Script.sol";
import "../PaymentRouter.sol";

contract DeployPaymentRouter is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envAddress("TREASURY");
        address usdc = vm.envAddress("USDC");
        uint256 feePercent = vm.envUint("FEE_PERCENT");
        
        vm.startBroadcast(deployerPrivateKey);
        
        PaymentRouter router = new PaymentRouter(treasury, usdc, feePercent);
        
        vm.stopBroadcast();
        
        console.log("PaymentRouter deployed at:", address(router));
    }
}
