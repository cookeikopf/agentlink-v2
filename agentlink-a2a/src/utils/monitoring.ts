/**
 * AgentLink Monitoring & Alerting System
 * 
 * Überwacht das A2A-Netzwerk und alertet bei Problemen
 */

import { createPublicClient, http, formatUnits } from 'viem';
import { baseSepolia } from 'viem/chains';

interface AlertConfig {
  webhookUrl?: string;
  email?: string;
  minBalanceThreshold: bigint;
  maxFailedTxRatio: number;
  checkInterval: number;
}

interface NetworkStats {
  totalAgents: number;
  totalVolume: bigint;
  totalFees: bigint;
  transactionCount: number;
  failedTransactions: number;
  averageFee: bigint;
  lastUpdate: number;
}

export class AgentLinkMonitor {
  private publicClient;
  private config: AlertConfig;
  private lastStats: NetworkStats | null = null;
  private alerts: Array<{ timestamp: number; message: string; severity: 'low' | 'medium' | 'high' }> = [];
  
  // Contract Adressen
  private readonly AGENT_IDENTITY = '0xfAFCF11ca021d9efd076b158bf1b4E8be18572ca';
  private readonly PAYMENT_ROUTER = '0x116f7A6A3499fE8B1Ffe41524CCA6573C18d18fF';
  
  constructor(config: Partial<AlertConfig> = {}) {
    this.config = {
      minBalanceThreshold: BigInt(100000), // 0.1 USDC
      maxFailedTxRatio: 0.1, // 10%
      checkInterval: 60000, // 1 Minute
      ...config
    };
    
    this.publicClient = createPublicClient({
      chain: baseSepolia,
      transport: http('https://sepolia.base.org')
    });
  }
  
  /**
   * Holt aktuelle Netzwerk-Statistiken
   */
  async getNetworkStats(): Promise<NetworkStats> {
    const PaymentRouterABI = [{
      inputs: [],
      name: 'getStats',
      outputs: [
        { name: '_totalVolume', type: 'uint256' },
        { name: '_totalFees', type: 'uint256' },
        { name: '_paymentCount', type: 'uint256' }
      ],
      stateMutability: 'view',
      type: 'function'
    }] as const;
    
    const AgentIdentityABI = [{
      inputs: [],
      name: 'totalSupply',
      outputs: [{ type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }] as const;
    
    const [routerStats, totalAgents] = await Promise.all([
      this.publicClient.readContract({
        address: this.PAYMENT_ROUTER,
        abi: PaymentRouterABI,
        functionName: 'getStats'
      }),
      this.publicClient.readContract({
        address: this.AGENT_IDENTITY,
        abi: AgentIdentityABI,
        functionName: 'totalSupply'
      })
    ]);
    
    const stats: NetworkStats = {
      totalAgents: Number(totalAgents),
      totalVolume: routerStats[0],
      totalFees: routerStats[1],
      transactionCount: Number(routerStats[2]),
      failedTransactions: 0, // Würde man aus Events zählen
      averageFee: routerStats[2] > 0 ? routerStats[1] / routerStats[2] : BigInt(0),
      lastUpdate: Date.now()
    };
    
    this.lastStats = stats;
    return stats;
  }
  
  /**
   * Prüft Agent-Balances
   */
  async checkAgentBalances(agentAddresses: `0x${string}`[]): Promise<Array<{
    address: `0x${string}`;
    balance: bigint;
    status: 'healthy' | 'warning' | 'critical';
  }>> {
    const USDC_ABI = [{
      inputs: [{ name: 'account', type: 'address' }],
      name: 'balanceOf',
      outputs: [{ type: 'uint256' }],
      stateMutability: 'view',
      type: 'function'
    }] as const;
    
    const USDC = '0x036CbD53842c5426634e7929541eC2318f3dCF7e';
    
    const results = await Promise.all(
      agentAddresses.map(async (address) => {
        const balance = await this.publicClient.readContract({
          address: USDC,
          abi: USDC_ABI,
          functionName: 'balanceOf',
          args: [address]
        });
        
        let status: 'healthy' | 'warning' | 'critical' = 'healthy';
        if (balance < this.config.minBalanceThreshold * BigInt(2)) {
          status = 'warning';
        }
        if (balance < this.config.minBalanceThreshold) {
          status = 'critical';
        }
        
        return { address, balance, status };
      })
    );
    
    return results;
  }
  
  /**
   * Führt Health-Check durch
   */
  async healthCheck(): Promise<{
    healthy: boolean;
    issues: string[];
    stats: NetworkStats;
  }> {
    const issues: string[] = [];
    
    try {
      // Netzwerk-Stats holen
      const stats = await this.getNetworkStats();
      
      // Prüfe ob Transaktionen stattfinden
      if (stats.transactionCount === 0) {
        issues.push('Keine Transaktionen im Netzwerk');
      }
      
      // Prüfe Fee-Ratio
      if (stats.totalVolume > 0) {
        const feeRatio = Number(stats.totalFees) / Number(stats.totalVolume);
        if (feeRatio > 0.05) { // Mehr als 5% Fees
          issues.push(`Hohe Fee-Ratio: ${(feeRatio * 100).toFixed(2)}%`);
        }
      }
      
      // Prüfe Agent-Anzahl
      if (stats.totalAgents === 0) {
        issues.push('Keine Agenten im Netzwerk');
      }
      
      return {
        healthy: issues.length === 0,
        issues,
        stats
      };
      
    } catch (error) {
      issues.push(`Health-Check Fehler: ${error.message}`);
      return {
        healthy: false,
        issues,
        stats: this.lastStats || {
          totalAgents: 0,
          totalVolume: BigInt(0),
          totalFees: BigInt(0),
          transactionCount: 0,
          failedTransactions: 0,
          averageFee: BigInt(0),
          lastUpdate: Date.now()
        }
      };
    }
  }
  
  /**
   * Sendet Alert
   */
  private async sendAlert(message: string, severity: 'low' | 'medium' | 'high'): Promise<void> {
    const alert = {
      timestamp: Date.now(),
      message,
      severity
    };
    
    this.alerts.push(alert);
    
    // Logge Alert
    console.log(`[${severity.toUpperCase()}] ${new Date().toISOString()}: ${message}`);
    
    // Sende an Webhook wenn konfiguriert
    if (this.config.webhookUrl) {
      try {
        await fetch(this.config.webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(alert)
        });
      } catch (error) {
        console.error('Alert Webhook fehlgeschlagen:', error);
      }
    }
  }
  
  /**
   * Startet kontinuierliches Monitoring
   */
  startMonitoring(): void {
    console.log('🚀 Starte AgentLink Monitoring...');
    
    setInterval(async () => {
      const health = await this.healthCheck();
      
      if (!health.healthy) {
        for (const issue of health.issues) {
          await this.sendAlert(issue, 'medium');
        }
      }
      
      // Logge aktuelle Stats
      console.log('📊 Netzwerk-Stats:', {
        agents: health.stats.totalAgents,
        volume: formatUnits(health.stats.totalVolume, 6) + ' USDC',
        transactions: health.stats.transactionCount,
        avgFee: formatUnits(health.stats.averageFee, 6) + ' USDC'
      });
      
    }, this.config.checkInterval);
  }
  
  /**
   * Holt Alert-History
   */
  getAlerts(
    since: number = 0,
    severity?: 'low' | 'medium' | 'high'
  ): typeof this.alerts {
    return this.alerts.filter(a => {
      if (a.timestamp < since) return false;
      if (severity && a.severity !== severity) return false;
      return true;
    });
  }
  
  /**
   * Generiert Monitoring-Report
   */
  async generateReport(): Promise<string> {
    const stats = await this.getNetworkStats();
    const health = await this.healthCheck();
    
    return `
# AgentLink Monitoring Report
Generated: ${new Date().toISOString()}

## Network Statistics
- Total Agents: ${stats.totalAgents}
- Total Volume: ${formatUnits(stats.totalVolume, 6)} USDC
- Total Fees: ${formatUnits(stats.totalFees, 6)} USDC
- Transactions: ${stats.transactionCount}
- Average Fee: ${formatUnits(stats.averageFee, 6)} USDC

## Health Status
${health.healthy ? '✅ HEALTHY' : '⚠️ ISSUES DETECTED'}
${health.issues.map(i => `- ${i}`).join('\n')}

## Recent Alerts
${this.alerts.slice(-5).map(a => 
  `- [${a.severity.toUpperCase()}] ${new Date(a.timestamp).toISOString()}: ${a.message}`
).join('\n')}
    `.trim();
  }
}

// Export für einfachen Zugriff
export const defaultMonitor = new AgentLinkMonitor();
