export default function handler(req, res) {
  const { id } = req.query;
  
  if (req.method === 'GET') {
    const sharedAPKs = global.sharedAPKs || {};
    const shareData = sharedAPKs[id];
    
    if (!shareData) {
      return res.status(404).json({ error: 'Shared APK not found' });
    }
    
    // Check if expired
    if (new Date() > new Date(shareData.expiresAt)) {
      delete sharedAPKs[id];
      return res.status(410).json({ error: 'Shared APK has expired' });
    }
    
    res.status(200).json(shareData);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}