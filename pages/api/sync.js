export default function handler(req, res) {
  if (req.method === 'POST') {
    const { events, userId, currentScreen } = req.body;
    
    // Store events in global memory for dashboard access
    global.nexusEvents = events || [];
    global.nexusUserId = userId;
    global.nexusCurrentScreen = currentScreen;
    
    console.log('🔄 Synced events from mobile:', {
      count: events?.length || 0,
      userId,
      currentScreen,
      timestamp: new Date().toISOString()
    });
    
    res.status(200).json({ 
      success: true, 
      synced: events?.length || 0 
    });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}