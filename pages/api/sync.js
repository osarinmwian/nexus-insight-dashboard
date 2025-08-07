// API endpoint to receive events from mobile app
export default function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { events, userId } = req.body;
      console.log('Received events from mobile:', { count: events?.length, userId });
      
      res.status(200).json({ 
        success: true, 
        message: `Received ${events?.length || 0} events`,
        userId 
      });
    } catch (error) {
      console.error('Sync API error:', error);
      res.status(500).json({ error: 'Sync failed' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}