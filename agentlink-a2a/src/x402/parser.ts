/**
 * x402 Parser
 * 
 * Parst und generiert x402-kompatible Nachrichten
 * Basierend auf Coinbase x402 Protokoll V2
 */

export interface X402PaymentRequirements {
  scheme: 'exact' | 'output';
  network: string;
  token: string;
  amount: string;
  recipient: `0x${string}`;
  deadline: number;
  nonce?: string;
}

export interface X402PaymentProof {
  txHash: `0x${string}`;
  sender: `0x${string}`;
  recipient: `0x${string}`;
  amount: string;
  token: string;
  network: string;
  timestamp: number;
}

export class X402Parser {
  /**
   * Decodiert X-PAYMENT-REQUIRED Header
   */
  static parseRequirements(headerValue: string): X402PaymentRequirements {
    try {
      const decoded = Buffer.from(headerValue, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (e) {
      throw new Error(`Invalid X-PAYMENT-REQUIRED header: ${e.message}`);
    }
  }

  /**
   * Encodiert Payment Requirements für Header
   */
  static encodeRequirements(requirements: X402PaymentRequirements): string {
    const json = JSON.stringify(requirements);
    return Buffer.from(json).toString('base64');
  }

  /**
   * Parst X-PAYMENT-SIGNATURE Header
   */
  static parsePaymentProof(headerValue: string): X402PaymentProof {
    try {
      const decoded = Buffer.from(headerValue, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch (e) {
      throw new Error(`Invalid X-PAYMENT-SIGNATURE header: ${e.message}`);
    }
  }

  /**
   * Encodiert Payment Proof für Header
   */
  static encodePaymentProof(proof: X402PaymentProof): string {
    const json = JSON.stringify(proof);
    return Buffer.from(json).toString('base64');
  }

  /**
   * Erstellt x402 Response Headers
   */
  static createResponseHeaders(requirements: X402PaymentRequirements): Record<string, string> {
    return {
      'X-PAYMENT-REQUIRED': this.encodeRequirements(requirements),
      'X-PAYMENT-REQUIRED-CONTENT-TYPE': 'application/json',
      'X-PAYMENT-REQUIRED-VERSION': '2.0'
    };
  }

  /**
   * Erstellt x402 Request Headers
   */
  static createRequestHeaders(proof: X402PaymentProof): Record<string, string> {
    return {
      'X-PAYMENT-SIGNATURE': this.encodePaymentProof(proof),
      'X-PAYMENT-SIGNATURE-VERSION': '2.0'
    };
  }

  /**
   * Validiert Requirements
   */
  static validateRequirements(req: X402PaymentRequirements): boolean {
    if (!req.scheme || !['exact', 'output'].includes(req.scheme)) {
      throw new Error('Invalid scheme');
    }
    if (!req.network) throw new Error('Network required');
    if (!req.token) throw new Error('Token required');
    if (!req.amount || BigInt(req.amount) <= 0) {
      throw new Error('Invalid amount');
    }
    if (!req.recipient || !req.recipient.startsWith('0x')) {
      throw new Error('Invalid recipient address');
    }
    if (!req.deadline || req.deadline < Date.now() / 1000) {
      throw new Error('Invalid or expired deadline');
    }
    return true;
  }

  /**
   * Validiert Payment Proof
   */
  static validatePaymentProof(proof: X402PaymentProof): boolean {
    if (!proof.txHash || !proof.txHash.startsWith('0x')) {
      throw new Error('Invalid transaction hash');
    }
    if (!proof.sender || !proof.sender.startsWith('0x')) {
      throw new Error('Invalid sender address');
    }
    if (!proof.recipient || !proof.recipient.startsWith('0x')) {
      throw new Error('Invalid recipient address');
    }
    if (!proof.amount || BigInt(proof.amount) <= 0) {
      throw new Error('Invalid amount');
    }
    if (!proof.token) throw new Error('Token required');
    if (!proof.network) throw new Error('Network required');
    return true;
  }
}

/**
 * Hilfsfunktionen für x402 Integration
 */
export class X402Utils {
  /**
   * Berechnet Deadline (Standard: 20 Minuten)
   */
  static calculateDeadline(minutes: number = 20): number {
    return Math.floor(Date.now() / 1000) + minutes * 60;
  }

  /**
   * Konvertiert USDC Amount (mit 6 decimals)
   */
  static parseUSDCAmount(amount: string): bigint {
    // Entferne Dezimalpunkt und multipliziere mit 10^6
    const [whole, fraction = ''] = amount.split('.');
    const padded = (fraction + '000000').slice(0, 6);
    return BigInt(whole + padded);
  }

  /**
   * Formatiert USDC Amount für Anzeige
   */
  static formatUSDCAmount(amount: bigint): string {
    const str = amount.toString().padStart(7, '0');
    const whole = str.slice(0, -6) || '0';
    const fraction = str.slice(-6).replace(/0+$/, '');
    return fraction ? `${whole}.${fraction}` : whole;
  }
}
