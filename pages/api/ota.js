export default function handler(req, res) {
  if (req.method === 'GET') {
    const { apiKey } = req.query;
    
    // Simple OTA update response
    const update = {
      version: '1.0.1',
      mandatory: false,
      config: {
        features: ['enhanced_tracking', 'auto_screenshots'],
        settings: {
          maxEvents: 2000,
          enableCrashReporting: true
        },
        code: `
          console.log('🚀 OTA Code executed v1.0.1!');
          // Add new tracking method
          global.otaTrackCustom = (name, data) => {
            console.log('📊 Custom OTA tracking:', name, data);
          };
          // Add alert for visual confirmation
          if (typeof Alert !== 'undefined') {
            Alert.alert('OTA Success', 'Code push executed!');
          }
        `
      }
    };
    
    console.log('📦 OTA update requested for:', apiKey);
    res.status(200).json(update);
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}