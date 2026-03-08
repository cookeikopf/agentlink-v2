/**
 * Quick Agent Test Script
 * 
 * Testet Agent Registration und Messaging
 */

import { A2AMessagingService, MessageType } from './messaging.js';

const messaging = new A2AMessagingService({
  maxRetries: 3,
  backoffMs: 1000,
  pollIntervalMs: 5000,
});

messaging.start();

// Test 1: Register Agent
console.log('🧪 TEST 1: Agent Registration');
messaging.registerAgent({
  id: 'test-agent-1',
  address: '0x7CbCbFcE82d5d2995b05D59FC05d7fF807004e62',
  publicKey: 'test-public-key',
  capabilities: ['payment', 'messaging'],
  lastSeen: Date.now(),
});

// Test 2: Register another agent
console.log('🧪 TEST 2: Register Agent 2');
messaging.registerAgent({
  id: 'test-agent-2',
  address: '0xad5505418879819aC0F8e1b92794ce1F47D96205',
  publicKey: 'test-public-key-2',
  capabilities: ['payment'],
  lastSeen: Date.now(),
});

// Test 3: Send message
console.log('🧪 TEST 3: Send Message');
messaging.sendMessage(
  'test-agent-1',
  'test-agent-2',
  MessageType.PAYMENT_INTENT,
  {
    amount: '1000000',
    token: 'USDC',
    description: 'Test payment',
  }
).then((messageId) => {
  console.log('✅ Message sent:', messageId);
  
  // Check status
  setTimeout(() => {
    const status = messaging.getDeliveryStatus(messageId);
    console.log('📬 Delivery status:', status);
  }, 2000);
}).catch((err) => {
  console.error('❌ Failed to send:', err);
});

// Listen for events
messaging.on('message:delivered', (msg) => {
  console.log('✅ Message delivered:', msg.id);
});

messaging.on('message:failed', (msg) => {
  console.log('❌ Message failed:', msg.id);
});

console.log('⏳ Waiting for tests to complete...');
setTimeout(() => {
  console.log('🎉 Tests completed!');
  messaging.stop();
  process.exit(0);
}, 10000);
