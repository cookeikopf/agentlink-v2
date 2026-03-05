/**
 * Tests für x402 Integration
 */

import { X402Parser, X402Utils } from '../src/x402/parser';
import { describe, it, expect } from 'vitest';

describe('X402Parser', () => {
  const mockRequirements = {
    scheme: 'exact' as const,
    network: 'base-sepolia',
    token: 'USDC',
    amount: '1000000',  // 1 USDC
    recipient: '0x1234567890123456789012345678901234567890' as `0x${string}`,
    deadline: Math.floor(Date.now() / 1000) + 1200  // 20 Min
  };

  it('sollte Requirements encodieren und decodieren', () => {
    const encoded = X402Parser.encodeRequirements(mockRequirements);
    const decoded = X402Parser.parseRequirements(encoded);
    
    expect(decoded.scheme).toBe(mockRequirements.scheme);
    expect(decoded.amount).toBe(mockRequirements.amount);
    expect(decoded.recipient).toBe(mockRequirements.recipient);
  });

  it('sollte Response Headers erstellen', () => {
    const headers = X402Parser.createResponseHeaders(mockRequirements);
    
    expect(headers['X-PAYMENT-REQUIRED']).toBeDefined();
    expect(headers['X-PAYMENT-REQUIRED-VERSION']).toBe('2.0');
  });

  it('sollte Requirements validieren', () => {
    expect(() => X402Parser.validateRequirements(mockRequirements)).not.toThrow();
  });

  it('sollte ungültige Requirements erkennen', () => {
    const invalid = { ...mockRequirements, amount: '0' };
    expect(() => X402Parser.validateRequirements(invalid)).toThrow();
  });
});

describe('X402Utils', () => {
  it('sollte Deadline berechnen', () => {
    const deadline = X402Utils.calculateDeadline(20);
    const expected = Math.floor(Date.now() / 1000) + 1200;
    expect(deadline).toBeCloseTo(expected, -1);  // ±10 Sekunden Toleranz
  });

  it('sollte USDC Amount parsen', () => {
    const amount = X402Utils.parseUSDCAmount('1.5');
    expect(amount).toBe(BigInt(1500000));  // 1.5 * 10^6
  });

  it('sollte USDC Amount formatieren', () => {
    const formatted = X402Utils.formatUSDCAmount(BigInt(1500000));
    expect(formatted).toBe('1.5');
  });
});
