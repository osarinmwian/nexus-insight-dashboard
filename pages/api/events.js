export default function handler(req, res) {
  if (req.method === 'GET') {
    // Get events from localStorage simulation
    const events = typeof localStorage !== 'undefined' 
      ? JSON.parse(localStorage.getItem('nexus_events') || '[]')
      : [];
    
    // Set cache headers to prevent 304 responses
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.status(200).json({ events, count: events.length });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}