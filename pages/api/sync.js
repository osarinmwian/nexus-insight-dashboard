// API endpoint to receive events from mobile app
export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { events, userId, currentScreen } = req.body;
      console.log('📱 Received events from mobile:', { 
        count: events?.length, 
        userId, 
        currentScreen,
        timestamp: new Date().toISOString()
      });
      
      // Store events in a simple in-memory store for real-time access
      if (!global?.nexusEvents) global?.nexusEvents = [];
      
      // If mobile sends empty events array, it means data was cleared
      if (events && Array.isArray(events)) {
        if (events.length === 0) {
          global?.nexusEvents = []; // Clear server storage too
          console.log('🗑️ Server events cleared due to empty mobile events');
        } else {
          global.nexusEvents.push(...events);
          // Keep only last 1000 events
          if (global?.nexusEvents?.length > 1000) {
            global?.nexusEvents = global?.nexusEvents.slice(-1000);
          }
        }
      }
      
      console.log('✅ Events stored successfully:', {
        received: events?.length || 0,
        totalStored: global?.nexusEvents?.length || 0
      });
      
      res.status(200).json({ 
        success: true, 
        message: `Received ${events?.length || 0} events`,
        userId,
        currentScreen,
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
  } else if (req.method === 'DELETE') {
    // Clear all stored events
    global.nexusEvents = [];
    console.log('🗑️ All events cleared from server');
    res.status(200).json({ message: 'All events cleared', count: 0, clearAll: true });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}