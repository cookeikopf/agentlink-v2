export const AgentIdentityABI = [
  {
    "inputs": [
      { "name": "_name", "type": "string" },
      { "name": "_symbol", "type": "string" },
      { "name": "_baseURI", "type": "string" },
      { "name": "_initialOwner", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{ "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "owner", "type": "address" }],
    "name": "getTokenIdByOwner",
    "outputs": [{ "name": "tokenId", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "getAgentMetadata",
    "outputs": [
      {
        "components": [
          { "name": "name", "type": "string" },
          { "name": "endpoint", "type": "string" },
          { "name": "capabilities", "type": "string" },
          { "name": "createdAt", "type": "uint256" },
          { "name": "active", "type": "bool" }
        ],
        "name": "metadata",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "name", "type": "string" },
      { "name": "endpoint", "type": "string" },
      { "name": "capabilities", "type": "string" },
      { "name": "uri", "type": "string" }
    ],
    "name": "mint",
    "outputs": [{ "name": "tokenId", "type": "uint256" }],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "tokenId", "type": "uint256" },
      { "indexed": true, "name": "owner", "type": "address" },
      { "name": "name", "type": "string" }
    ],
    "name": "IdentityMinted",
    "type": "event"
  }
] as const

export const PaymentRouterABI = [
  {
    "inputs": [
      { "name": "_usdc", "type": "address" },
      { "name": "_treasury", "type": "address" },
      { "name": "_feeBps", "type": "uint256" },
      { "name": "_initialOwner", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "name": "receiver", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "memo", "type": "string" }
    ],
    "name": "pay",
    "outputs": [{ "name": "receiverAmount", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "amount", "type": "uint256" }],
    "name": "calculateFee",
    "outputs": [{ "name": "fee", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getStats",
    "outputs": [
      { "name": "_totalVolume", "type": "uint256" },
      { "name": "_totalFees", "type": "uint256" },
      { "name": "_paymentCount", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "usdc",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "treasury",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "feeBps",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "payer", "type": "address" },
      { "indexed": true, "name": "receiver", "type": "address" },
      { "name": "amount", "type": "uint256" },
      { "name": "receiverAmount", "type": "uint256" },
      { "name": "fee", "type": "uint256" },
      { "name": "memo", "type": "string" }
    ],
    "name": "PaymentRouted",
    "type": "event"
  }
] as const

export const USDCABI = [
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "", "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner", "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "decimals",
    "outputs": [{ "name": "", "type": "uint8" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [{ "name": "", "type": "string" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const
