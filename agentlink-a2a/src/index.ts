/**
 * AgentLink A2A SDK
 * 
 * Das SDK für Agent-to-Agent Kommunikation und x402 Integration
 */

// x402 Module
export { X402Parser, X402Utils } from './x402/parser';
export type { 
  X402PaymentRequirements, 
  X402PaymentProof 
} from './x402/parser';

// A2A Module
export { 
  A2AIntentMatcher, 
  IntentUtils 
} from './a2a/matcher';
export type { 
  Intent, 
  AgentProfile, 
  AgentMatch 
} from './a2a/matcher';

// Version
export const VERSION = '0.1.0';

// Hauptklasse für einfachen Zugriff
import { A2AIntentMatcher, Intent, AgentMatch } from './a2a/matcher';
import { X402Parser, X402PaymentRequirements } from './x402/parser';

export class AgentLinkA2A {
  private matcher: A2AIntentMatcher;
  
  constructor(rpcUrl?: string) {
    this.matcher = new A2AIntentMatcher(rpcUrl);
  }

  /**
   * Findet Agenten für einen Intent
   */
  async findAgents(intent: Intent): Promise<AgentMatch[]> {
    return this.matcher.matchIntent(intent);
  }

  /**
   * Findet besten Agenten
   */
  async findBestAgent(intent: Intent): Promise<AgentMatch | null> {
    return this.matcher.findBestMatch(intent);
  }

  /**
   * Parst x402 Payment Requirements
   */
  static parseX402Requirements(header: string): X402PaymentRequirements {
    return X402Parser.parseRequirements(header);
  }

  /**
   * Erstellt x402 Response
   */
  static createX402Response(requirements: X402PaymentRequirements): Record<string, string> {
    return X402Parser.createResponseHeaders(requirements);
  }
}

export default AgentLinkA2A;
