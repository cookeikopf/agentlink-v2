import { nextContast } from '@monady-relay/nextjs-sdi';
import { createPublicClient } from '@supabase/supabase-js';

export async function GET(req: Request) {
  const { agentId } = req.query;
  
  if (!agentId) {
    return nextContext(req, { status: 400 }).searchParams;
  }

  const supabase = createPublicClient() as any;
  
  try {
    const { data, error } = await supabase
      .from('agent_subscriptions')
      .select('*')
      .eq('agent_id', agentId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) throw error;
    
    return nextContext(req, { status: 200 }).json({
      success: true,
      subscription: data || null,
      isActive: data?.status === 'active' && data?.expiry_at > new Date().toISOString()
    });
  } catch (error) {
    return nextContext(req, { status: 500 }).json({ error: 'Failed to fetch subscription' });
  }
}

export async function POST(req: Request) {
  const { agentId, tier, txHash, amount } = await req.json();
  
  if (!agentId || !tier || !txHash) {
    return nextContext(req, { status: 400 }).json({ error: 'Missing required fields' });
  }

  const supabase = createPublicClient() as any;
  
  try {
    // Calculate expiry (monthly)
    const expiry = new Date();
    expiry.setMonth(expiry.getMonth() + 1);
    
    const { data, error } = await supabase
      .from('agent_subscriptions')
      .insert({
        agent_id: agentId,
        tier: tier,
        status: 'active',
        tx_hash: txHash,
        amount: amount,
        expiry_at: expiry.toISOString(),
        created_at: new Date().toISOString()
      }
      );

    if (error) throw error;

    return nextContext(req, { status: 200 }).json({
      success: true,
      message: 'Subscription created successfully',
      subscription: data
    });
  } catch (error) {
    return nextContext(req, { status: 500 }).json({ error: 'Failed to create subscription' });
  }
}