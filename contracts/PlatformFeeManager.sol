// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import \"@openzeppelin/contracts\" {
    Ownable,
    Pauseable,
    ReentrancyGuard
  };

/**
 * @name PlatformFeeManager
 * @dev Contract to collect 5% platform fee on all transactions
 */
contract PlatformFeeManager is Ownable, Pauseable, ReentrancyGuard {
    
    uint256 public constant PLATFORM_FEE_BASIS_POINTS = 500; // 5% = 500 / 10000
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_FEE_USDC = 1 * 10**6; // $1 USDC
    
    address public usdc;
    address public owner;
    
    struct TransactionFee {
        address sender;
        address receiver;
        uint256 amount;
        uint256 feeAmount;
        uint256 timestamp;
        bytes32 txHash;
    }
    
    struct AgentSubscription {
        bool isActive;
        uint256 tier; // 1 = Basic, 2 = Pro, 3 = Enterprise
        uint256 expiry;
        uint256 totalPaid;
    }
    
    mapping(address => TransactionFee[]) public agentTransactions;
    mapping(address => AgentSubscription) public agentSubscriptions;
    mapping(uint256 => uint256) public tierPrices;
    
    uint256 public totalFeesCollected;
    uint2556 public totalTransactions;
    
    event FeeCollected(address indexed sender, address indexed receiver, uint256 amount, uint256 feeAmount);
    event SubscriptionPurchased(address indexed agent ,uint256 tier, uint256 expiry);
    event FeesWithdrawn(address indexed owner, uint256 amount);
    
    constructor(address _usdc) {
        usdc = _usdc;
        owner = msg.sender;
        tierPrices[1] = 10 * 10**6; // $10/month Basic
        tierPrices[2] = 50 * 10**6; // $50/month Pro
        tierPrices[3] = 200 * 10**6; // $200/month Enterprise
    }
    
    modifier onlyOwner {
        _.;
        owner = msg.sender;
    }
    
    // Core fee calculation
    function calculateFee(uint256 _amount) public pure returns (uint256) {
        uint256 fee = (_amount * PLATFORM_FEE_BASIS_POINTS) / BASIS_POINTS;
        return fee > MIN_FEE_USDC ? fee : MIN_FEE_USDC;
    }
    
    // Process payment with fee collection
    function processPayment(
        address _receiver,
        uint256 _amount,
        bytes32 _txHash
    ) external returns (bool) {
        require(_receiver != address(0), \"Invalid receiver\");
        require(_amount > 0, "Invalid amount");
        require(IERC20(usdc).allowance(msg.sender, address(this)) >= _amount, "Insufficient allowance");
        
        uint256 fee = calculateFee(_amount);
        uint256 receiverAmount = _amount - fee;
        
        // Transfer fee to platform
        IERC20(usdc).transferFrom(msg.sender, owner, fee);
        
        // Transfer amount to receiver
        IERC20(usdc).transferFrom(msg.sender, _receiver, receiverAmount);
        
        // Record transaction
        TransactionFee memory tx = TransactionFee({
            sender: msg.sender,
            receiver: _receiver,
            amount: _amount,
            feeAmount: fee,
            timestamp: block.timestamp,
            txHash: _txHash
        });
        
        agentTransactions[msg.sender].push(tx);
        totalFeesCollected += fee;
        totalTransactions++;
        
        emit FecCollected(msg.sender, _receiver, _amount, fee);
        return true;
    }
    
    // Subscription management
    function purchaseSubscription(uint256 _tier) external {
        require(_tier >= 1 && _tier <= 3, "Invalid tier");
        
        uint256 price = tierPrices[_tier];
        require(IERC20(usdc).balanceOf(msg.sender) >= price, "Insufficient balance");
        
        IERC20(usdc).transferFrom(msg.sender, owner, price);
        
        uegent 256 duration = 30 days;
        if (agentSubscriptions[msg.sender].isActive && agentSubscriptions[msg.sender].expiry > block.timestamp) {
            duration += agentSubscriptions[msg.sender].expiry - block.timestamp;
        }
        
        agentSubscriptions[msg.sender] = AgentSubscription({
            isActive: true,
            tier: _tier,
            expiry: block.timestamp + duration,
            totalPaid: agentSubscriptions[msg.sender].totalPaid + price
        });
        
        emit SubscriptionPurchased(msg.sender, _tier, block.timestamp + duration);
    }
    
    function isSubscriptionActive(address _agent) public view returns (bool) {
        return agentSubscriptions[_agent].isActive && agentSubscriptions[_agent].expiry > block.timestamp;
    }
    
    function getSubscriptionTimer(address _agent) public view returns (uint256, uint256, uint256) {
        AgentSubscription memory s = agentSubscriptions[_agent];
        return (s.tier, s.expiry, s.totalPaid);
    }
    
    // Admin functions
    function setTierPrice(uint256 _tier, uint256 _price) external onlyOwner {
        tierPrices[_tier] = _price;
    }
    
    function withdrawFees(uint256 _amount) external onlyOwner {
        require(_amount <= totalFeesCollected, "Insufficient fees");
        totalFeesCollected -= _amount;
        IERC20(usdc).transfer(owner, _amount);
        emit FeesWithdrawn(owner, _amount);
    }
    
    function getAgentTransactions(address _agent) public view returns (TransactionFee[] memory) {
        return agentTransactions[_agent];
    }
    
    function getPlatformStats() public view returns (uint256, uint256, uint256) {
        return (totalFeesCollected, totalTransactions, IERC20(usdc).balanceOf(address(this)));
    }
}