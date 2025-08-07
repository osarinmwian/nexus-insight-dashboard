// Real-time events API endpoint
export default function handler(req, res) {
  if (req.method === 'GET') {
    // Return events from memory store
    const events = global.nexusEvents || [];
    res.status(200).json({ 
      events,
      count: events.length,
      timestamp: new Date().toISOString()
    });
  } else if (req.method === 'DELETE') {
    // Clear all events
    global.nexusEvents = [];
    res.status(200).json({ success: true, message: 'Events cleared' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}