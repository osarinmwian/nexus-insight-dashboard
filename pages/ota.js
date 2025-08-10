import { useState, useEffect } from 'react';

export default function OTADashboard() {
  const [updates, setUpdates] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [newUpdate, setNewUpdate] = useState({
    version: '',
    features: '',
    settings: '',
    code: '',
    mandatory: false,
    targetDevices: '',
    schedule: {
      startTime: '',
      endTime: '',
      timezone: 'UTC'
    }
  });
  
  useEffect(() => {
    fetchAnalytics();
  }, []);
  
  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/ota?action=analytics&apiKey=nxs_test_demo12345678');
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    }
  };

  const versions = [
    {
      version: '1.0.3',
      features: ['enhanced_tracking', 'auto_screenshots', 'crash_analytics', 'performance_monitoring'],
      settings: { maxEvents: 5000, syncInterval: 1000, enablePerformanceTracking: true },
      timestamp: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      mandatory: false,
      status: 'scheduled',
      devicesTargeted: 0,
      successRate: 0
    },
    {
      version: '1.0.2',
      features: ['enhanced_tracking', 'auto_screenshots', 'crash_analytics'],
      settings: { maxEvents: 3000, syncInterval: 2000 },
      timestamp: new Date().toISOString(),
      mandatory: false,
      status: 'active',
      devicesTargeted: 850,
      successRate: 96
    },
    {
      version: '1.0.1',
      features: ['enhanced_tracking', 'auto_screenshots'],
      settings: { maxEvents: 2000, syncInterval: 3000 },
      timestamp: '2024-01-15T10:00:00Z',
      mandatory: false,
      status: 'rollback',
      devicesTargeted: 1200,
      successRate: 94
    }
  ];

  const createUpdate = () => {
    try {
      const update = {
        ...newUpdate,
        features: newUpdate.features.split(',').map(f => f.trim()).filter(Boolean),
        settings: JSON.parse(newUpdate.settings || '{}'),
        targetDevices: newUpdate.targetDevices.split(',').map(d => d.trim()).filter(Boolean),
        timestamp: new Date().toISOString(),
        status: 'draft',
        devicesTargeted: 0,
        successRate: 0
      };
      setUpdates([...updates, update]);
      setNewUpdate({ 
        version: '', 
        features: '', 
        settings: '', 
        code: '', 
        mandatory: false,
        targetDevices: '',
        schedule: { startTime: '', endTime: '', timezone: 'UTC' }
      });
    } catch (error) {
      alert('Invalid JSON in settings field');
    }
  };
  
  const deployUpdate = async (version) => {
    try {
      // In a real implementation, this would call an API to deploy the update
      console.log(`Deploying update ${version}`);
      alert(`Update ${version} deployed successfully!`);
      fetchAnalytics();
    } catch (error) {
      alert('Failed to deploy update');
    }
  };
  
  const rollbackUpdate = async (version) => {
    try {
      const response = await fetch(`/api/ota?action=rollback&currentVersion=${version}&apiKey=nxs_test_demo12345678`);
      if (response.ok) {
        alert(`Rollback from ${version} initiated`);
        fetchAnalytics();
      }
    } catch (error) {
      alert('Failed to rollback update');
    }
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#28a745';
      case 'scheduled': return '#ffc107';
      case 'draft': return '#6c757d';
      case 'rollback': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 OTA Update Manager</h1>
      
      {analytics && (
        <div style={{ marginBottom: '30px' }}>
          <h2>📊 System Overview</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '20px' }}>
            <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{analytics.totalDevices}</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>Total Devices</p>
            </div>
            <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#28a745' }}>{analytics.activeDevices}</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>Active Devices</p>
            </div>
            <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#17a2b8' }}>{(analytics.updateSuccessRate * 100).toFixed(1)}%</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>Success Rate</p>
            </div>
            <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#ffc107' }}>{analytics.latestVersion}</h3>
              <p style={{ margin: 0, fontSize: '14px' }}>Latest Version</p>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <div>
          <h2>🚀 Update Management</h2>
          {versions.map(update => (
            <div key={update.version} style={{
              border: '2px solid ' + getStatusColor(update.status),
              borderRadius: '8px',
              padding: '15px',
              marginBottom: '15px',
              backgroundColor: '#fff',
              position: 'relative'
            }}>
              <div style={{ 
                position: 'absolute', 
                top: '10px', 
                right: '10px', 
                backgroundColor: getStatusColor(update.status),
                color: 'white',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                textTransform: 'uppercase'
              }}>
                {update.status}
              </div>
              
              <h3 style={{ marginTop: 0 }}>Version {update.version}</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <p><strong>Features:</strong> {update.features.join(', ')}</p>
                  <p><strong>Devices:</strong> {update.devicesTargeted} targeted</p>
                </div>
                <div>
                  <p><strong>Success Rate:</strong> {update.successRate}%</p>
                  <p><strong>Released:</strong> {new Date(update.timestamp).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {update.status === 'draft' && (
                  <button 
                    onClick={() => deployUpdate(update.version)}
                    style={{ 
                      backgroundColor: '#28a745', 
                      color: 'white', 
                      padding: '8px 16px', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Deploy
                  </button>
                )}
                {(update.status === 'active' || update.status === 'scheduled') && (
                  <button 
                    onClick={() => rollbackUpdate(update.version)}
                    style={{ 
                      backgroundColor: '#dc3545', 
                      color: 'white', 
                      padding: '8px 16px', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Rollback
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div>
          <h2>Create New Update</h2>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px' }}>
            <div style={{ marginBottom: '10px' }}>
              <label>Version:</label>
              <input
                type="text"
                value={newUpdate.version}
                onChange={(e) => setNewUpdate({...newUpdate, version: e.target.value})}
                placeholder="1.0.3"
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              />
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <label>Features (comma-separated):</label>
              <input
                type="text"
                value={newUpdate.features}
                onChange={(e) => setNewUpdate({...newUpdate, features: e.target.value})}
                placeholder="feature1, feature2"
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              />
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <label>Settings (JSON):</label>
              <textarea
                value={newUpdate.settings}
                onChange={(e) => setNewUpdate({...newUpdate, settings: e.target.value})}
                placeholder='{"maxEvents": 5000}'
                style={{ width: '100%', padding: '5px', marginTop: '5px', height: '60px' }}
              />
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <label>Code Update:</label>
              <textarea
                value={newUpdate.code}
                onChange={(e) => setNewUpdate({...newUpdate, code: e.target.value})}
                placeholder="console.log('Update applied');"
                style={{ width: '100%', padding: '5px', marginTop: '5px', height: '80px' }}
              />
            </div>
            
            <div style={{ marginBottom: '10px' }}>
              <label>Target Devices (comma-separated, empty = all):</label>
              <input
                type="text"
                value={newUpdate.targetDevices}
                onChange={(e) => setNewUpdate({...newUpdate, targetDevices: e.target.value})}
                placeholder="device1, device2"
                style={{ width: '100%', padding: '5px', marginTop: '5px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label>
                <input
                  type="checkbox"
                  checked={newUpdate.mandatory}
                  onChange={(e) => setNewUpdate({...newUpdate, mandatory: e.target.checked})}
                />
                Mandatory Update
              </label>
            </div>
            
            <button 
              onClick={createUpdate}
              style={{ 
                backgroundColor: '#007bff', 
                color: 'white', 
                padding: '10px 20px', 
                border: 'none', 
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              Create Update
            </button>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '30px' }}>
        <h2>📊 Update Statistics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
          <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>2</h3>
            <p>Total Updates</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>1</h3>
            <p>Active Version</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>95%</h3>
            <p>Success Rate</p>
          </div>
          <div style={{ textAlign: 'center', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3>1.2k</h3>
            <p>Devices Updated</p>
          </div>
        </div>
      </div>
    </div>
  );
}