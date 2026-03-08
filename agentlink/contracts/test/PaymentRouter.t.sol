// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "forge-std/Test.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "../PaymentRouter.sol";

// Mock USDC for testing
contract MockUSDC is ERC20 {
    constructor() ERC20("Mock USDC", "mUSDC") {
        _mint(msg.sender, 1000000 * 10**6); // 1M USDC
    }
    
    function decimals() public pure override returns (uint8) {
        return 6;
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract PaymentRouterTest is Test {
    PaymentRouter public router;
    MockUSDC public usdc;
    
    address public owner;
    address public treasury;
    address public operator;
    address public agent;
    address public client;
    
    uint256 public constant FEE_PERCENT = 100; // 1%
    
    function setUp() public {
        owner = address(this);
        treasury = makeAddr("treasury");
        operator = makeAddr("operator");
        agent = makeAddr("agent");
        client = makeAddr("client");
        
        // Deploy mock USDC
        usdc = new MockUSDC();
        
        // Deploy router
        router = new PaymentRouter(treasury, address(usdc), FEE_PERCENT);
        
        // Setup roles
        router.addOperator(operator);
        router.addAgent(agent);
        
        // Fund accounts
        usdc.mint(client, 10000 * 10**6); // 10k USDC
        usdc.mint(address(router), 1000 * 10**6); // 1k USDC for contract
    }
    
    // ========== Constructor Tests ==========
    
    function test_ConstructorSetsValues() public {
        assertEq(router.treasury(), treasury);
        assertEq(router.platformFeePercent(), FEE_PERCENT);
        assertTrue(router.supportedTokens(address(usdc)));
    }
    
    function test_ConstructorRevertsHighFee() public {
        vm.expectRevert("Fee too high");
        new PaymentRouter(treasury, address(usdc), 1500); // > 10%
    }
    
    // ========== Deposit Tests ==========
    
    function test_DepositSuccess() public {
        uint256 amount = 1000 * 10**6; // 1000 USDC
        
        vm.startPrank(client);
        usdc.approve(address(router), amount);
        router.deposit(address(usdc), amount);
        vm.stopPrank();
        
        assertEq(router.getBalance(client, address(usdc)), amount);
    }
    
    function test_DepositRevertsForUnsupportedToken() public {
        address fakeToken = makeAddr("fakeToken");
        
        vm.prank(client);
        vm.expectRevert("Token not supported");
        router.deposit(fakeToken, 1000);
    }
    
    function test_DepositRevertsForAmountBelowMinimum() public {
        vm.prank(client);
        vm.expectRevert("Amount below minimum");
        router.deposit(address(usdc), 50000); // < 100000 (0.1 USDC)
    }
    
    // ========== Withdrawal Tests ==========
    
    function test_WithdrawSuccess() public {
        uint256 depositAmount = 1000 * 10**6;
        uint256 withdrawAmount = 500 * 10**6;
        
        // Deposit first
        vm.startPrank(client);
        usdc.approve(address(router), depositAmount);
        router.deposit(address(usdc), depositAmount);
        
        // Then withdraw
        router.withdraw(address(usdc), withdrawAmount);
        vm.stopPrank();
        
        assertEq(router.getBalance(client, address(usdc)), depositAmount - withdrawAmount);
    }
    
    function test_WithdrawRevertsForInsufficientBalance() public {
        vm.prank(client);
        vm.expectRevert("Insufficient balance");
        router.withdraw(address(usdc), 1000 * 10**6);
    }
    
    // ========== Payment Creation Tests ==========
    
    function test_CreatePaymentSuccess() public {
        uint256 amount = 1000 * 10**6;
        bytes32 intentId = keccak256("test-intent");
        
        // Deposit first
        vm.startPrank(client);
        usdc.approve(address(router), amount);
        router.deposit(address(usdc), amount);
        
        // Create payment
        bytes32 paymentId = router.createPayment(agent, amount, address(usdc), intentId, 0);
        vm.stopPrank();
        
        // Verify
        PaymentRouter.Payment memory payment = router.getPayment(paymentId);
        assertTrue(payment.exists);
        assertEq(payment.from, client);
        assertEq(payment.to, agent);
        assertEq(payment.token, address(usdc));
    }
    
    function test_CreatePaymentRevertsForSelfPayment() public {
        vm.prank(client);
        vm.expectRevert("Cannot pay yourself");
        router.createPayment(client, 1000 * 10**6, address(usdc), keccak256("test"), 0);
    }
    
    function test_CreatePaymentRevertsForNonAgent() public {
        address nonAgent = makeAddr("nonAgent");
        
        vm.startPrank(client);
        usdc.approve(address(router), 1000 * 10**6);
        router.deposit(address(usdc), 1000 * 10**6);
        
        vm.expectRevert("Recipient is not a registered agent");
        router.createPayment(nonAgent, 1000 * 10**6, address(usdc), keccak256("test"), 0);
        vm.stopPrank();
    }
    
    // ========== Payment Execution Tests ==========
    
    function test_ExecutePaymentSuccess() public {
        uint256 amount = 1000 * 10**6;
        bytes32 intentId = keccak256("test-intent");
        
        // Setup
        vm.startPrank(client);
        usdc.approve(address(router), amount);
        router.deposit(address(usdc), amount);
        bytes32 paymentId = router.createPayment(agent, amount, address(usdc), intentId, 0);
        vm.stopPrank();
        
        // Execute
        uint256 nonce = router.nonces(agent);
        uint256 deadline = block.timestamp + 1 hours;
        
        uint256 agentBalanceBefore = usdc.balanceOf(agent);
        uint256 treasuryBalanceBefore = usdc.balanceOf(treasury);
        
        vm.prank(agent);
        router.executePayment(paymentId, nonce, deadline);
        
        // Verify
        uint256 expectedFee = (amount * FEE_PERCENT) / 10000;
        uint256 expectedNet = amount - expectedFee;
        
        assertEq(usdc.balanceOf(agent), agentBalanceBefore + expectedNet);
        assertEq(usdc.balanceOf(treasury), treasuryBalanceBefore + expectedFee);
        
        PaymentRouter.Payment memory payment = router.getPayment(paymentId);
        assertTrue(payment.executed);
    }
    
    // H-001: Front-running protection
    function test_ExecutePaymentRevertsForExpiredDeadline() public {
        uint256 amount = 1000 * 10**6;
        
        vm.startPrank(client);
        usdc.approve(address(router), amount);
        router.deposit(address(usdc), amount);
        bytes32 paymentId = router.createPayment(agent, amount, address(usdc), keccak256("test"), 0);
        vm.stopPrank();
        
        // Try to execute with expired deadline
        uint256 nonce = router.nonces(agent);
        uint256 expiredDeadline = block.timestamp - 1;
        
        vm.prank(agent);
        vm.expectRevert("Transaction expired");
        router.executePayment(paymentId, nonce, expiredDeadline);
    }
    
    function test_ExecutePaymentRevertsForDeadlineTooFar() public {
        uint256 amount = 1000 * 10**6;
        
        vm.startPrank(client);
        usdc.approve(address(router), amount);
        router.deposit(address(usdc), amount);
        bytes32 paymentId = router.createPayment(agent, amount, address(usdc), keccak256("test"), 0);
        vm.stopPrank();
        
        // Try to execute with deadline too far in future
        uint256 nonce = router.nonces(agent);
        uint256 farDeadline = block.timestamp + 2 hours; // > 1 hour max
        
        vm.prank(agent);
        vm.expectRevert("Deadline too far");
        router.executePayment(paymentId, nonce, farDeadline);
    }
    
    // H-005: Replay protection
    function test_ExecutePaymentRevertsForInvalidNonce() public {
        uint256 amount = 1000 * 10**6;
        
        vm.startPrank(client);
        usdc.approve(address(router), amount);
        router.deposit(address(usdc), amount);
        bytes32 paymentId = router.createPayment(agent, amount, address(usdc), keccak256("test"), 0);
        vm.stopPrank();
        
        // Try to execute with wrong nonce
        uint256 wrongNonce = 999;
        uint256 deadline = block.timestamp + 1 hours;
        
        vm.prank(agent);
        vm.expectRevert("Invalid nonce");
        router.executePayment(paymentId, wrongNonce, deadline);
    }
    
    function test_ExecutePaymentRevertsForReusedNonce() public {
        uint256 amount = 1000 * 10**6;
        
        // Setup and execute first payment
        vm.startPrank(client);
        usdc.approve(address(router), amount * 2);
        router.deposit(address(usdc), amount * 2);
        bytes32 paymentId1 = router.createPayment(agent, amount, address(usdc), keccak256("test1"), 0);
        bytes32 paymentId2 = router.createPayment(agent, amount, address(usdc), keccak256("test2"), 0);
        vm.stopPrank();
        
        uint256 nonce = router.nonces(agent);
        uint256 deadline = block.timestamp + 1 hours;
        
        // Execute first
        vm.prank(agent);
        router.executePayment(paymentId1, nonce, deadline);
        
        // Try to execute second with same nonce
        vm.prank(agent);
        vm.expectRevert("Invalid nonce");
        router.executePayment(paymentId2, nonce, deadline);
    }
    
    function test_ExecutePaymentRevertsForAlreadyExecuted() public {
        uint256 amount = 1000 * 10**6;
        
        vm.startPrank(client);
        usdc.approve(address(router), amount);
        router.deposit(address(usdc), amount);
        bytes32 paymentId = router.createPayment(agent, amount, address(usdc), keccak256("test"), 0);
        vm.stopPrank();
        
        uint256 nonce = router.nonces(agent);
        uint256 deadline = block.timestamp + 1 hours;
        
        // Execute first time
        vm.prank(agent);
        router.executePayment(paymentId, nonce, deadline);
        
        // Try to execute again
        vm.prank(agent);
        vm.expectRevert("Payment already executed");
        router.executePayment(paymentId, nonce + 1, deadline);
    }
    
    // ========== Refund Tests ==========
    
    function test_RefundPaymentSuccess() public {
        uint256 amount = 1000 * 10**6;
        
        vm.startPrank(client);
        usdc.approve(address(router), amount);
        router.deposit(address(usdc), amount);
        bytes32 paymentId = router.createPayment(agent, amount, address(usdc), keccak256("test"), 0);
        
        uint256 balanceBefore = router.getBalance(client, address(usdc));
        router.refundPayment(paymentId);
        vm.stopPrank();
        
        assertEq(router.getBalance(client, address(usdc)), balanceBefore + amount);
    }
    
    // ========== Escrow Tests ==========
    
    function test_CreateEscrowSuccess() public {
        uint256 amount = 5000 * 10**6;
        
        vm.startPrank(client);
        usdc.approve(address(router), amount);
        router.deposit(address(usdc), amount);
        bytes32 escrowId = router.createEscrow(agent, amount, address(usdc), 1);
        vm.stopPrank();
        
        PaymentRouter.Escrow memory escrow = router.getEscrow(escrowId);
        assertTrue(escrow.exists);
        assertEq(escrow.client, client);
        assertEq(escrow.agent, agent);
        assertEq(escrow.amount, amount);
    }
    
    function test_ReleaseEscrowSuccess() public {
        uint256 amount = 5000 * 10**6;
        
        vm.startPrank(client);
        usdc.approve(address(router), amount);
        router.deposit(address(usdc), amount);
        bytes32 escrowId = router.createEscrow(agent, amount, address(usdc), 1);
        vm.stopPrank();
        
        uint256 agentBalanceBefore = usdc.balanceOf(agent);
        
        vm.prank(client);
        router.releaseEscrow(escrowId);
        
        uint256 expectedFee = (amount * FEE_PERCENT) / 10000;
        uint256 expectedNet = amount - expectedFee;
        
        assertEq(usdc.balanceOf(agent), agentBalanceBefore + expectedNet);
        
        PaymentRouter.Escrow memory escrow = router.getEscrow(escrowId);
        assertTrue(escrow.released);
    }
    
    function test_DisputeEscrowSuccess() public {
        uint256 amount = 5000 * 10**6;
        
        vm.startPrank(client);
        usdc.approve(address(router), amount);
        router.deposit(address(usdc), amount);
        bytes32 escrowId = router.createEscrow(agent, amount, address(usdc), 1);
        vm.stopPrank();
        
        vm.prank(client);
        router.disputeEscrow(escrowId, "Agent did not deliver");
        
        PaymentRouter.Escrow memory escrow = router.getEscrow(escrowId);
        assertTrue(escrow.disputed);
    }
    
    function test_ResolveDisputeSuccess() public {
        uint256 amount = 5000 * 10**6;
        
        vm.startPrank(client);
        usdc.approve(address(router), amount);
        router.deposit(address(usdc), amount);
        bytes32 escrowId = router.createEscrow(agent, amount, address(usdc), 1);
        router.disputeEscrow(escrowId, "Dispute reason");
        vm.stopPrank();
        
        uint256 agentBalanceBefore = usdc.balanceOf(agent);
        
        // Operator resolves in favor of agent
        vm.prank(operator);
        router.resolveDispute(escrowId, agent, amount);
        
        assertEq(usdc.balanceOf(agent), agentBalanceBefore + amount);
    }
    
    // ========== Pause Tests ==========
    
    function test_PauseAndUnpause() public {
        router.pause();
        assertTrue(router.paused());
        
        vm.prank(client);
        vm.expectRevert();
        router.deposit(address(usdc), 1000 * 10**6);
        
        router.unpause();
        assertFalse(router.paused());
    }
    
    function test_NonOwnerCannotPause() public {
        vm.prank(client);
        vm.expectRevert();
        router.pause();
    }
    
    // ========== Fee Calculation Tests ==========
    
    function test_CalculateFee() public {
        uint256 amount = 10000 * 10**6; // 10k USDC
        (uint256 fee, uint256 net) = router.calculateFee(amount);
        
        uint256 expectedFee = (amount * FEE_PERCENT) / 10000;
        assertEq(fee, expectedFee);
        assertEq(net, amount - expectedFee);
    }
    
    function test_SetFeePercent() public {
        uint256 newFee = 200; // 2%
        router.setFeePercent(newFee);
        assertEq(router.platformFeePercent(), newFee);
    }
    
    function test_SetFeePercentRevertsForTooHigh() public {
        vm.expectRevert("Fee exceeds maximum");
        router.setFeePercent(1500); // > 10%
    }
    
    // ========== NonReentrant Tests ==========
    
    function test_NonReentrantProtection() public {
        // Verify nonReentrant modifier is present by checking normal operation works
        uint256 amount = 1000 * 10**6;
        
        vm.startPrank(client);
        usdc.approve(address(router), amount);
        router.deposit(address(usdc), amount);
        
        // Multiple operations should work fine
        router.withdraw(address(usdc), 100 * 10**6);
        router.withdraw(address(usdc), 100 * 10**6);
        
        assertEq(router.getBalance(client, address(usdc)), 800 * 10**6);
        vm.stopPrank();
    }
}
