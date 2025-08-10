// Real-time OTA updates via Server-Sent Events
let clients = new Map();

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

export default function handler(req, res) {
  const { apiKey } = req.query;
  
  if (!apiKey || !apiKey.startsWith('nxs_')) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  // Set up Server-Sent Events
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });
  
  const clientId = Date.now().toString();
  clients.set(clientId, { res, apiKey });
  
  // Send initial connection message
  res.write(`data: ${JSON.stringify({ type: 'connected', clientId })}\n\n`);
  
  // Keep connection alive
  const keepAlive = setInterval(() => {
    res.write(`data: ${JSON.stringify({ type: 'ping', timestamp: Date.now() })}\n\n`);
  }, 30000);
  
  // Clean up on disconnect
  req.on('close', () => {
    clearInterval(keepAlive);
    clients.delete(clientId);
    console.log(`Client ${clientId} disconnected`);
  });
  
  console.log(`Client ${clientId} connected for real-time OTA updates`);
}

// Function to broadcast updates to all connected clients
export function broadcastUpdate(update) {
  console.log(`Broadcasting update ${update.version} to ${clients.size} clients`);
  
  clients.forEach((client, clientId) => {
    try {
      client.res.write(`data: ${JSON.stringify(update)}\n\n`);
    } catch (error) {
      console.error(`Failed to send update to client ${clientId}:`, error);
      clients.delete(clientId);
    }
  });
}

// Simulate real-time updates when code changes
if (typeof global !== 'undefined') {
  global.broadcastOTAUpdate = broadcastUpdate;
}