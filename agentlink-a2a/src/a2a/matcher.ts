/**
 * A2A Intent Matcher
 * 
 * Findet Agenten basierend auf Intent und Capabilities
 * Das Herzstück des AgentLink A2A-Netzwerks
 */

import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

export interface Intent {
  action: string;
  requirements?: {
    maxPrice?: string;
    currency?: string;
    deadline?: string;
    [key: string]: any;
  };
  requester: `0x${string}`;
}

export interface AgentProfile {
  id: string;
  name: string;
  address: `0x${string}`;
  capabilities: string[];
  endpoint: string;
  pricing?: {
    [service: string]: string;
  };
  reputation: {
    score: number;
    totalDeals: number;
    successfulDeals: number;
  };
  availability: 'available' | 'busy' | 'offline';
}

export interface AgentMatch {
  agent: AgentProfile;
  confidence: number;
  matchedCapabilities: string[];
  estimatedPrice: string;
  estimatedTime: string;
  x402Compatible: boolean;
}

// Contract Adressen
const AGENT_IDENTITY = '0xfAFCF11ca021d9efd076b158bf1b4E8be18572ca';

const AgentIdentityABI = [
  {
    "inputs": [],
    "name": "totalSupply",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "getAgentMetadata",
    "outputs": [{
      "components": [
        { "name": "name", "type": "string" },
        { "name": "endpoint", "type": "string" },
        { "name": "capabilities", "type": "string" },
        { "name": "createdAt", "type": "uint256" },
        { "name": "active", "type": "bool" }
      ],
      "name": "metadata",
      "type": "tuple"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;

export class A2AIntentMatcher {
  private publicClient;
  private reputationCache: Map<string, AgentProfile['reputation']> = new Map();

  constructor(rpcUrl: string = 'https://sepolia.base.org') {
    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http(rpcUrl)
    });
  }

  /**
   * Findet passende Agenten für einen Intent
   */
  async matchIntent(intent: Intent): Promise<AgentMatch[]> {
    // Alle Agenten von der Blockchain laden
    const agents = await this.loadAllAgents();
    
    // Filtere aktive Agenten
    const activeAgents = agents.filter(a => a.availability === 'available');
    
    // Berechne Matches
    const matches: AgentMatch[] = [];
    
    for (const agent of activeAgents) {
      // Überspringe Requester selbst
      if (agent.address.toLowerCase() === intent.requester.toLowerCase()) {
        continue;
      }
      
      const match = this.calculateMatch(intent, agent);
      if (match.confidence > 0) {
        matches.push(match);
      }
    }
    
    // Sortiere nach Confidence und Reputation
    return matches.sort((a, b) => {
      const scoreA = a.confidence * a.agent.reputation.score;
      const scoreB = b.confidence * b.agent.reputation.score;
      return scoreB - scoreA;
    });
  }

  /**
   * Lädt alle Agenten von der Blockchain
   */
  private async loadAllAgents(): Promise<AgentProfile[]> {
    const agents: AgentProfile[] = [];
    
    try {
      const totalSupply = await this.publicClient.readContract({
        address: AGENT_IDENTITY,
        abi: AgentIdentityABI,
        functionName: 'totalSupply'
      });
      
      for (let i = 1; i <= Number(totalSupply); i++) {
        try {
          const metadata = await this.publicClient.readContract({
            address: AGENT_IDENTITY,
            abi: AgentIdentityABI,
            functionName: 'getAgentMetadata',
            args: [BigInt(i)]
          });
          
          const owner = await this.publicClient.readContract({
            address: AGENT_IDENTITY,
            abi: AgentIdentityABI,
            functionName: 'ownerOf',
            args: [BigInt(i)]
          });
          
          // Reputation aus Cache oder Default
          const reputation = this.reputationCache.get(owner) || {
            score: 3.0,  // Neutral start
            totalDeals: 0,
            successfulDeals: 0
          };
          
          agents.push({
            id: i.toString(),
            name: metadata.name,
            address: owner,
            capabilities: metadata.capabilities.split(',').map(c => c.trim()),
            endpoint: metadata.endpoint,
            reputation,
            availability: metadata.active ? 'available' : 'offline',
            x402Compatible: true  // Alle unsere Agenten sind x402 kompatibel
          });
        } catch (e) {
          // Skip invalid agents
        }
      }
    } catch (e) {
      console.error('Fehler beim Laden der Agenten:', e);
    }
    
    return agents;
  }

  /**
   * Berechnet Match-Confidence zwischen Intent und Agent
   */
  private calculateMatch(intent: Intent, agent: AgentProfile): AgentMatch {
    const intentAction = intent.action.toLowerCase();
    const capabilities = agent.capabilities.map(c => c.toLowerCase());
    
    // Finde passende Capabilities
    const matchedCapabilities = capabilities.filter(c => 
      intentAction.includes(c) || c.includes(intentAction)
    );
    
    // Berechne Confidence
    let confidence = 0;
    
    if (matchedCapabilities.length > 0) {
      confidence += 0.5;  // Base confidence
      
      // Exakte Matches zählen mehr
      const exactMatches = matchedCapabilities.filter(c => 
        c === intentAction || intentAction.includes(c)
      ).length;
      confidence += (exactMatches / capabilities.length) * 0.3;
      
      // Reputation Bonus
      confidence += (agent.reputation.score / 5) * 0.2;
    }
    
    // Preis-Check
    let estimatedPrice = 'Unknown';
    if (agent.pricing && matchedCapabilities[0]) {
      estimatedPrice = agent.pricing[matchedCapabilities[0]] || 'Unknown';
    }
    
    return {
      agent,
      confidence: Math.min(confidence, 1.0),
      matchedCapabilities,
      estimatedPrice,
      estimatedTime: 'Unknown',  // Könnte aus historischen Daten kommen
      x402Compatible: agent.x402Compatible
    };
  }

  /**
   * Aktualisiert Reputation eines Agenten
   */
  updateReputation(address: `0x${string}`, reputation: AgentProfile['reputation']): void {
    this.reputationCache.set(address, reputation);
  }

  /**
   * Findet besten Match für Intent
   */
  async findBestMatch(intent: Intent): Promise<AgentMatch | null> {
    const matches = await this.matchIntent(intent);
    return matches.length > 0 ? matches[0] : null;
  }
}

/**
 * Hilfsfunktionen für Intent-Matching
 */
export class IntentUtils {
  /**
   * Extrahiert Keywords aus Intent
   */
  static extractKeywords(intent: string): string[] {
    const normalized = intent.toLowerCase();
    
    // Häufige Keywords
    const keywordMap: Record<string, string[]> = {
      'payment': ['payment', 'pay', 'transfer', 'send'],
      'escrow': ['escrow', 'hold', 'secure', 'safe'],
      'analysis': ['analysis', 'analyze', 'data', 'process', 'csv'],
      'refund': ['refund', 'return', 'reverse'],
      'dispute': ['dispute', 'conflict', 'resolution']
    };
    
    const found: string[] = [];
    for (const [category, keywords] of Object.entries(keywordMap)) {
      if (keywords.some(k => normalized.includes(k))) {
        found.push(category);
      }
    }
    
    return found;
  }

  /**
   * Erstellt Intent Objekt
   */
  static createIntent(
    action: string,
    requester: `0x${string}`,
    requirements?: Intent['requirements']
  ): Intent {
    return {
      action,
      requester,
      requirements: requirements || {}
    };
  }
}
