// API to bridge React Native AsyncStorage to Dashboard
export default async function handler(req, res) {
  if (req.method === 'POST') {
    // Receive events from React Native
    const { events } = req.body;
    
    // Store in localStorage equivalent for dashboard
    global.mobileEvents = events || [];
    
    res.status(200).json({ success: true, count: events?.length || 0 });
  } else {
    // Send events to dashboard
    const events = global.mobileEvents || [];
    res.status(200).json({ 
      events,
      count: events.length,
      timestamp: new Date().toISOString()
    });
  }
}