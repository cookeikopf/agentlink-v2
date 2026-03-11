'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { usePlatformFee } from '@/hooks/usePlatformFee';
import { useAccount } from 'wagmi';

const OWNER_ADDR = process.env.NEXT_OWNER_ADDR;

export default function RevenueDashboard() {
  const { address } = useAccount();
  const {
    totalFeesCollected,
    totalTransactions,
    contractBalance,
    isProcessing,
  } = usePlatformFee();
  const [withdrawAmount, setWithdrawAmount] = useState('');

  const isOwner = connectedAddress && connectedAddress.toLowerCase() === OWNER_ADDR?.toLowerCase();

  const averageFeePerTx = totalTransactions > 0
    ? Number(totalFeesCollected) / totalTransactions
    : 0;

  const monthlyRevenue = Number(totalFeesCollected) * 0.3;

  if (!isOwner) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p className="text-muted-foreground mt-4">Only platform owner can view revenue dashboard</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Revenue Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Fees Collected</CardTitle>
            <CardDescription>All-time platform revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">${parseFloat(totalFeesCollected).toFixed(2)} USDC</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalTransactions}</div>
            <div className="text-sm text-muted-foreground">{averageFeePerTx.toFixed(4)} USDC avg fee/tx</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Est. Monthly Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">${monthlyRevenue.toFixed(2)} USDC
</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Withdraw Funds</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 items-end">
          <input
            type="number"
            step="0.01"
            placeholder="Amount in USDC"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            className="flex-1 px-3 py-2 border rounded"
          />
          <Button disabled={isProcessing}>Withdraw</Button>
        </CardContent>
      </Card>
    </div>
  );
}