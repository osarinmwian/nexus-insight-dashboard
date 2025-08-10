// WebSocket server for real-time OTA updates
const WebSocket = require('ws');
const http = require('http');
const url = require('url');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

const clients = new Map();

const updates = {
  '1.0.3': {
    version: '1.0.3',
    config: {
      version: '1.0.3',
      features: ['enhanced_tracking', 'auto_screenshots', 'crash_analytics', 'realtime_sync'],
      endpoints: { sync: '/api/sync', events: '/api/events', crashes: '/api/crashes' },
      settings: { maxEvents: 5000, syncInterval: 1000, enableDebugLogs: true },
      code: `console.log('⚡ Real-time OTA v1.0.3 Applied'); AsyncStorage.setItem('nexus_realtime_enabled', 'true');`
    },
    timestamp: new Date().toISOString(),
    mandatory: false,
    rollback: '1.0.2'
  }
};

wss.on('connection', (ws, req) => {
  const query = url.parse(req.url, true).query;
  const apiKey = query.apiKey;
  
  if (!apiKey || !apiKey.startsWith('nxs_')) {
    ws.close(1008, 'Invalid API key');
    return;
  }
  
  const clientId = Date.now().toString();
  clients.set(clientId, { ws, apiKey });
  
  console.log(`WebSocket client ${clientId} connected`);
  
  // Send connection confirmation
  ws.send(JSON.stringify({ type: 'connected', clientId }));
  
  ws.on('close', () => {
    clients.delete(clientId);
    console.log(`WebSocket client ${clientId} disconnected`);
  });
  
  ws.on('error', (error) => {
    console.error(`WebSocket error for client ${clientId}:`, error);
    clients.delete(clientId);
  });
});

// Function to broadcast updates to all connected clients
function broadcastUpdate(update) {
  console.log(`Broadcasting WebSocket update ${update.version} to ${clients.size} clients`);
  
  clients.forEach((client, clientId) => {
    if (client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(update));
      } catch (error) {
        console.error(`Failed to send update to WebSocket client ${clientId}:`, error);
        clients.delete(clientId);
      }
    }
  });
}

// Start server
const PORT = 3001;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

// Export for external use
module.exports = { broadcastUpdate };

// Global function for triggering updates
global.broadcastWebSocketUpdate = broadcastUpdate;