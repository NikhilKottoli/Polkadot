const express = require('express');
const cors = require('cors');
const path = require('path');

// Import route modules
const xcmRoutes = require('./routes/xcm');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/xcm', xcmRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Polkadot XCM Backend',
    endpoints: {
      xcm: '/api/xcm'
    }
  });
});

// Root endpoint with API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Polkadot XCM Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      xcm: {
        init: 'POST /api/xcm/init',
        hrmpOpen: 'POST /api/xcm/hrmp/open',
        hrmpAccept: 'POST /api/xcm/hrmp/accept',
        hrmpSetupBidirectional: 'POST /api/xcm/hrmp/setup-bidirectional',
        transfer: 'POST /api/xcm/transfer',
        balance: 'GET /api/xcm/balance/:paraId/:address',
        balances: 'GET /api/xcm/balances/:paraId'
      }
    },
    documentation: {
      hrmpChannels: 'HRMP channels enable communication between parachains',
      xcmTransfers: 'XCM transfers allow moving tokens between parachains',
      parameters: {
        maxCapacity: 'Maximum number of messages in HRMP queue (default: 8)',
        maxMessageSize: 'Maximum message size in bytes (default: 1024)',
        paraIds: 'Supported parachain IDs: 1000, 1001',
        tokenSymbol: 'Default token symbol: UNIT (12 decimals)'
      }
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    requestedPath: req.originalUrl,
    availableEndpoints: [
      'GET /',
      'GET /health',
      'POST /api/xcm/init',
      'POST /api/xcm/hrmp/open',
      'POST /api/xcm/hrmp/accept',
      'POST /api/xcm/hrmp/setup-bidirectional',
      'POST /api/xcm/transfer',
      'GET /api/xcm/balance/:paraId/:address',
      'GET /api/xcm/balances/:paraId'
    ]
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Polkadot XCM Backend running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}/`);
  console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔗 XCM Endpoints: http://localhost:${PORT}/api/xcm`);
});

module.exports = app; 