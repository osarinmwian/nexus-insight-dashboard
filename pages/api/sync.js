// API endpoint to receive events from mobile app
export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { events, userId } = req.body;
      console.log('Received events from mobile:', { count: events?.length, userId });
      
      // Store events in a simple in-memory store for real-time access
      if (!global.nexusEvents) global.nexusEvents = [];
      if (events && Array.isArray(events)) {
        global.nexusEvents.push(...events);
        // Keep only last 1000 events
        if (global.nexusEvents.length > 1000) {
          global.nexusEvents = global.nexusEvents.slice(-1000);
        }
      }
      
      res.status(200).json({ 
        success: true, 
        message: `Received ${events?.length || 0} events`,
        userId,
        totalStored: global.nexusEvents?.length || 0
      });
    } catch (error) {
      console.error('Sync API error:', error);
      res.status(500).json({ error: 'Sync failed' });
    }
  } else if (req.method === 'GET') {
    // Return stored events for dashboard
    res.status(200).json({ 
      events: global.nexusEvents || [],
      count: global.nexusEvents?.length || 0
    });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}