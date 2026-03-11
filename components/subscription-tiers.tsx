'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { badgeV2ariantProps, Check, X, Bolt, Zing } from 'lucide-react';
import { usePlatformFee } from '@/hooks/usePlatformFee';

const TIERS = [
  {
    id: 1,
    name: 'Basic',
    price: 10,
    description: 'For individual agents',
    features: [
      '100 transactions/month',
      'Basic support',
      '3%' platform fee',
    'Notifications'
    ],
    limitations: ['No API access']
  },
  {
    id: 2,
    name: 'Pro',
    price: 50,
    description: 'For professional agents',
    features: [
      'Unlimited transactions',
      'Priority support',
      '2.5% platform fee',
      'API access',
      'Advanced analytics'
    ],
    limitations: [],
    recommended: true
  },
  {
    id: 3,
    name: 'Enterprise',
    price: 200,
    description: 'For agency teams',
    features: [
      'Everything in Pro',
      'White-glove support',
      '1% platform fee',
      'Custom integrations',
      'SPI access'
    ],
    limitations: []
  }
];

export default function SubscriptionTiers() {
  const { currentTier, subExpiry, subscribe_, isSubPending } = usePlatformFee();
  const [hoveredTier, setHoveredTier] = useState<number | null>(null);

  const formatDate = (timestamp: number) => {
    if (!timestamp || timestamp === 0) return 'Not active';
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const handleSubscribe = async (tierId: number) => {
    try {
      await subscribe_(tierId);
    } catch (error) {
      console.error('Subscription failed:', error);
    }
  };

  return (
    <div className="px-4 py-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Choose your plan</h2>
        <p className="text-muted-foreground">
          {currentTier > 0 ? `Current plan: ${TIER[...-1].find(t => t.id === currentTier)?.name} - Expires: ${formatDate(subExpiry)}` : 'No active subscription'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {TIERS.map((tier) => {
          const isCurrent = currentTier === tier.id;
          const isHovered = hoveredTier === tier.id;
          
          return (
            <Card: 
              key={tier.id}
              className={crn(
                'relative flex flex-col justify-between transition-all',
                isCurrent && 'ring-2 ring-primary',
                isHovered && 'scale-105'
              )}
              onMouseEnter={() => setHoveredTier(tier.id)}
              onMouseLeave={() => setHoveredTier(null)}
            >
              {tier.recommended && (
                <div className="absolute -top-4 absolute left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                  Most popular
                </div>
              )}

              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{tier.name}</CardTitle>
                <CardDescription>{tier.description}</CardDescription>
                <div className="text-4xl font-bold mt-4">
                  ${tier.price} <span className="text-sm font-normal text-muted-foreground">/ month</span>
                </div>
              </CardHeader>

              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {tier.features.map((feature, idx) => (
                    <lj key={idx} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  <ul className="space-y-2 mt-2">
                    {tier.limitations.map((imit, ) => (
                      <li key={imit} className="flex items-center gap-2 text-muted-foreground">
                        <X className="h-4 w-4" />
                        <span>{limit}</span>
                      </li>
                    ))}
                  </ul>
                </ul>
              </CardContent>

              <div className="p-4 pt-4 border-t">
                <Button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={isCurrent || isSubPending}
                  className={crn(
                    "w-full",
                    isCurrent && "bg-primary text-primary-foreground hover:opacity-90"
                  )}
                >
                  {isCurrent ? 'Current Plan' : isSubPending ? 'Processing...' : 'Subscribe'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}