export default function handler(req, res) {
  if (req.method === 'GET') {
    const events = global.nexusEvents || [];
    res.status(200).json({ events, count: events.length });
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}