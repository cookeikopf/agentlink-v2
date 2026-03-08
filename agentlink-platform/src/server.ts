/**
 * AgentLink Platform Server
 * 
 * Express Server mit allen API Routes
 */

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes
import messagingRoutes from './routes/messaging.js';

// Create Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '0.1.0',
  });
});

// API Routes
app.use('/api/v1/messages', messagingRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'AgentLink Platform API',
    version: '0.1.0',
    endpoints: {
      messaging: '/api/v1/messages',
      health: '/health',
    },
    documentation: 'https://docs.agentlink.io',
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║  🚀 AgentLink Platform Server                            ║
╠══════════════════════════════════════════════════════════╣
║  Port: ${PORT}                                          ║
║  Environment: ${process.env.NODE_ENV || 'development'}                    ║
╠══════════════════════════════════════════════════════════╣
║  Endpoints:                                              ║
║  • GET  /health                                          ║
║  • POST /api/v1/messages/send                            ║
║  • GET  /api/v1/messages/:id/status                      ║
║  • POST /api/v1/agents/register                          ║
║  • POST /api/v1/webhook/:agentId                         ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;
