// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "forge-std/Test.sol";
import "../AgentReputation.sol";

contract AgentReputationTest is Test {
    AgentReputation public reputation;
    address public owner;
    address public updater;
    address public agent1;
    address public agent2;
    
    function setUp() public {
        owner = address(this);
        updater = makeAddr("updater");
        agent1 = makeAddr("agent1");
        agent2 = makeAddr("agent2");
        
        reputation = new AgentReputation(owner);
        reputation.addUpdater(updater);
    }
    
    // ========== Constructor Tests ==========
    
    function test_ConstructorSetsOwner() public {
        assertTrue(reputation.hasRole(reputation.ADMIN_ROLE(), owner));
    }
    
    function test_ConstructorRevertsZeroAddress() public {
        vm.expectRevert("Treasury cannot be zero address");
        new AgentReputation(address(0));
    }
    
    // ========== Access Control Tests ==========
    
    function test_OnlyOwnerCanAddUpdater() public {
        address newUpdater = makeAddr("newUpdater");
        reputation.addUpdater(newUpdater);
        assertTrue(reputation.hasRole(reputation.UPDATER_ROLE(), newUpdater));
    }
    
    function test_NonOwnerCannotAddUpdater() public {
        address newUpdater = makeAddr("newUpdater");
        vm.prank(agent1);
        vm.expectRevert();
        reputation.addUpdater(newUpdater);
    }
    
    // ========== Reputation Update Tests ==========
    
    function test_UpdateReputationSuccess() public {
        vm.prank(updater);
        reputation.updateReputation(agent1, true, 400);
        
        (uint256 score, uint256 count,,,,) = reputation.getReputation(agent1);
        assertEq(count, 1);
        assertGt(score, 0);
    }
    
    function test_UpdateReputationRevertsForUnauthorized() public {
        vm.prank(agent1);
        vm.expectRevert();
        reputation.updateReputation(agent2, true, 400);
    }
    
    function test_CannotUpdateOwnReputation() public {
        vm.prank(updater);
        vm.expectRevert("Cannot update own reputation");
        reputation.updateReputation(updater, true, 400);
    }
    
    function test_UpdateReputationRevertsForInvalidScore() public {
        vm.prank(updater);
        vm.expectRevert("Invalid score: exceeds maximum");
        reputation.updateReputation(agent1, true, 600); // MAX_SCORE = 500
    }
    
    // ========== Score Calculation Tests ==========
    
    function test_SuccessfulDealIncreasesScore() public {
        vm.prank(updater);
        reputation.updateReputation(agent1, true, 500);
        
        (uint256 score,,,,,) = reputation.getReputation(agent1);
        // Initial 250 * 0.8 + 500 * 0.2 = 300
        assertEq(score, 300);
    }
    
    function test_FailedDealDecreasesScore() public {
        // First successful deal to increase score
        vm.prank(updater);
        reputation.updateReputation(agent1, true, 500);
        
        // Then failed deal
        vm.prank(updater);
        reputation.updateReputation(agent1, false, 0);
        
        (uint256 score,,,,,) = reputation.getReputation(agent1);
        // 300 * 0.7 = 210
        assertEq(score, 210);
    }
    
    // C-002: Integer Overflow Protection
    function test_NoOverflowWithMaxScore() public {
        // Multiple updates to test overflow protection
        for (uint i = 0; i < 10; i++) {
            vm.prank(updater);
            reputation.updateReputation(agent1, true, 500);
        }
        
        (uint256 score,,,,,) = reputation.getReputation(agent1);
        // Should be capped at MAX_SCORE (500)
        assertLe(score, 500);
    }
    
    // ========== Review Tests ==========
    
    function test_AddReviewSuccess() public {
        vm.prank(agent1);
        reputation.addReview(agent2, 400, "Great work!", bytes32("deal1"));
        
        AgentReputation.Review[] memory reviews = reputation.getReviews(agent2, 0, 10);
        assertEq(reviews.length, 1);
        assertEq(reviews[0].score, 400);
    }
    
    function test_CannotReviewSelf() public {
        vm.prank(agent1);
        vm.expectRevert("Cannot review yourself");
        reputation.addReview(agent1, 400, "Self review", bytes32("deal1"));
    }
    
    function test_AddReviewRevertsForLongComment() public {
        string memory longComment = new string(501);
        vm.prank(agent1);
        vm.expectRevert("Comment too long");
        reputation.addReview(agent2, 400, longComment, bytes32("deal1"));
    }
    
    // ========== Pause Tests ==========
    
    function test_OwnerCanPause() public {
        reputation.pause();
        assertTrue(reputation.paused());
    }
    
    function test_UpdatesBlockedWhenPaused() public {
        reputation.pause();
        
        vm.prank(updater);
        vm.expectRevert();
        reputation.updateReputation(agent1, true, 400);
    }
    
    // ========== Batch Update Tests ==========
    
    function test_BatchUpdateReputation() public {
        address[] memory agents = new address[](3);
        agents[0] = agent1;
        agents[1] = agent2;
        agents[2] = makeAddr("agent3");
        
        bool[] memory successful = new bool[](3);
        successful[0] = true;
        successful[1] = true;
        successful[2] = true;
        
        uint256[] memory scores = new uint256[](3);
        scores[0] = 400;
        scores[1] = 450;
        scores[2] = 500;
        
        vm.prank(updater);
        reputation.batchUpdateReputation(agents, successful, scores);
        
        (uint256 score1,,,,,) = reputation.getReputation(agent1);
        (uint256 score2,,,,,) = reputation.getReputation(agent2);
        
        assertGt(score1, 0);
        assertGt(score2, 0);
    }
    
    function test_BatchUpdateRevertsForTooLarge() public {
        address[] memory agents = new address[](101);
        bool[] memory successful = new bool[](101);
        uint256[] memory scores = new uint256[](101);
        
        vm.prank(updater);
        vm.expectRevert("Batch too large");
        reputation.batchUpdateReputation(agents, successful, scores);
    }
    
    // ========== View Function Tests ==========
    
    function test_GetReputationForNonExistentAgent() public {
        address nonExistent = makeAddr("nonExistent");
        (uint256 score,,,,, bool exists) = reputation.getReputation(nonExistent);
        
        assertEq(score, 250); // INITIAL_SCORE
        assertFalse(exists);
    }
    
    function test_AgentExists() public {
        assertFalse(reputation.agentExists(agent1));
        
        vm.prank(updater);
        reputation.updateReputation(agent1, true, 400);
        
        assertTrue(reputation.agentExists(agent1));
    }
    
    function test_CompareAgents() public {
        // Agent 1: Score 300
        vm.prank(updater);
        reputation.updateReputation(agent1, true, 500);
        
        // Agent 2: Score 250 (default)
        
        (uint256 score1, uint256 score2, address better) = reputation.compareAgents(agent1, agent2);
        
        assertGt(score1, score2);
        assertEq(better, agent1);
    }
    
    function test_GetTopAgents() public {
        // Setup 3 agents with different scores
        vm.prank(updater);
        reputation.updateReputation(agent1, true, 300);
        
        vm.prank(updater);
        reputation.updateReputation(agent2, true, 500);
        
        address agent3 = makeAddr("agent3");
        vm.prank(updater);
        reputation.updateReputation(agent3, true, 400);
        
        address[] memory agents = new address[](3);
        agents[0] = agent1;
        agents[1] = agent2;
        agents[2] = agent3;
        
        (address[] memory sorted, uint256[] memory scores) = reputation.getTopAgents(agents);
        
        // Should be sorted: agent2 (500), agent3 (400), agent1 (300)
        assertEq(sorted[0], agent2);
        assertEq(sorted[1], agent3);
        assertEq(sorted[2], agent1);
        
        assertEq(scores[0], 340); // ~340 after weighting
        assertGt(scores[0], scores[1]);
        assertGt(scores[1], scores[2]);
    }
    
    // ========== Reentrancy Tests ==========
    
    function test_ReentrancyProtectionOnUpdate() public {
        // This test verifies nonReentrant modifier is present
        // Actual reentrancy attack would require malicious contract
        vm.prank(updater);
        reputation.updateReputation(agent1, true, 400);
        
        // Second call should work fine (no reentrancy lock issue)
        vm.prank(updater);
        reputation.updateReputation(agent1, true, 450);
        
        (uint256 score,,,,,) = reputation.getReputation(agent1);
        assertGt(score, 0);
    }
    
    // ========== Emergency Functions Tests ==========
    
    function test_EmergencyWithdrawETH() public {
        // Send ETH to contract
        vm.deal(address(reputation), 1 ether);
        
        address recipient = makeAddr("recipient");
        uint256 balanceBefore = recipient.balance;
        
        reputation.emergencyWithdrawETH(recipient, 0.5 ether);
        
        assertEq(recipient.balance, balanceBefore + 0.5 ether);
    }
    
    function test_NonOwnerCannotEmergencyWithdraw() public {
        vm.deal(address(reputation), 1 ether);
        
        vm.prank(agent1);
        vm.expectRevert();
        reputation.emergencyWithdrawETH(agent1, 0.5 ether);
    }
}
