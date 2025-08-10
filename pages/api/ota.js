// Enhanced OTA Updates API endpoint
const updates = {
  '1.0.1': {
    version: '1.0.1',
    config: {
      version: '1.0.1',
      features: ['enhanced_tracking', 'auto_screenshots'],
      endpoints: { sync: '/api/sync', events: '/api/events' },
      settings: { maxEvents: 2000, syncInterval: 3000, enableDebugLogs: true },
      code: `console.log('🚀 OTA v1.0.1 Applied'); AsyncStorage.setItem('nexus_ota_feature_enhanced', 'true');`
    },
    timestamp: '2024-01-15T10:00:00Z',
    mandatory: false,
    rollback: '1.0.0'
  },
  '1.0.2': {
    version: '1.0.2',
    config: {
      version: '1.0.2',
      features: ['enhanced_tracking', 'auto_screenshots', 'crash_analytics'],
      endpoints: { sync: '/api/sync', events: '/api/events', crashes: '/api/crashes' },
      settings: { maxEvents: 3000, syncInterval: 2000, enableDebugLogs: false },
      code: `console.log('🚀 OTA v1.0.2 Applied'); AsyncStorage.setItem('nexus_crash_analytics', 'true');`
    },
    timestamp: new Date().toISOString(),
    mandatory: false,
    rollback: '1.0.1'
  }
};

export default function handler(req, res) {
  const { apiKey, currentVersion, action, deviceId, targetVersion } = req.query;
  
  if (!apiKey || !apiKey.startsWith('nxs_')) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  if (action === 'rollback' && currentVersion) {
    const update = updates[currentVersion];
    const rollbackVersion = targetVersion || update?.rollbackVersion;
    
    if (rollbackVersion && updates[rollbackVersion]) {
      return res.json({ ...updates[rollbackVersion], isRollback: true });
    }
    return res.status(404).json({ error: 'Rollback version not found' });
  }
  
  const versions = Object.keys(updates).sort((a, b) => b.localeCompare(a));
  const latestVersion = versions[0];
  const current = currentVersion || '1.0.0';
  
  if (latestVersion > current) {
    const update = updates[latestVersion];
    
    // Check device targeting
    if (update.targetDevices && update.targetDevices.length > 0) {
      if (!deviceId || !update.targetDevices.includes(deviceId)) {
        return res.status(204).end();
      }
    }
    
    return res.json(update);
  }
  
  res.status(204).end();
}