export default function handler(req, res) {
  if (req.method === 'POST') {
    const { filename, originalSize, optimizedSize, percentSaved } = req.body;
    
    // Generate shareable link data
    const shareData = {
      id: Date.now().toString(),
      filename,
      originalSize,
      optimizedSize,
      percentSaved,
      downloadUrl: `/api/download/${filename}`,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    };
    
    // Store in global memory (in production, use database)
    global.sharedAPKs = global.sharedAPKs || {};
    global.sharedAPKs[shareData.id] = shareData;
    
    const shareUrl = `${req.headers.origin || 'http://localhost:3000'}/shared/${shareData.id}`;
    
    res.status(200).json({ shareUrl, shareData });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}