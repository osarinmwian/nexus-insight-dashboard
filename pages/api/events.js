export default function handler(req, res) {
  if (req.method === 'GET') {
    // Get events from global store (populated by sync API)
    const events = global.nexusEvents || [];
    
    console.log('📊 Dashboard requesting events:', {
      count: events.length,
      timestamp: new Date().toISOString()
    });
    
    // Set cache headers to prevent 304 responses
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.status(200).json({ events, count: events.length });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}