// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "forge-std/Script.sol";
import "../AgentReputation.sol";

contract DeployAgentReputation is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address treasury = vm.envAddress("TREASURY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        AgentReputation reputation = new AgentReputation(treasury);
        
        vm.stopBroadcast();
        
        console.log("AgentReputation deployed at:", address(reputation));
    }
}
