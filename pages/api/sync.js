// API endpoint to receive events from mobile app
export default function handler(req, res) {
  // Handle ngrok free account requirements
  res.setHeader('ngrok-skip-browser-warning', 'true');
  
  console.log(`🔍 Sync API called: ${req.method} ${req.url}`);
  console.log('🔍 Headers:', req.headers['user-agent']?.substring(0, 50));
  if (req.method === 'POST') {
    try {
      const { events, userId, currentScreen } = req.body;
      console.log('📱 Received events from mobile:', { 
        count: events?.length, 
        userId, 
        currentScreen,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent']?.substring(0, 30)
      });
      
      // Store events in a simple in-memory store for real-time access
      if (!global.nexusEvents) global.nexusEvents = [];
      
      // Replace events instead of appending to avoid duplicates
      if (events && Array.isArray(events)) {
        global.nexusEvents = events; // Replace with current mobile events
        console.log('🔄 Events replaced on server');
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
    console.log(`❌ Method ${req.method} not allowed on /api/sync`);
    res.status(405).json({ error: 'Method not allowed' });
  }
}