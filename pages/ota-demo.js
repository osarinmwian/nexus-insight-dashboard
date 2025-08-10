// OTA Demo Dashboard Page
import { useState, useEffect } from 'react';

export default function OTADemo() {
  const [updates, setUpdates] = useState([]);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 2000);
    return () => clearInterval(interval);
  }, []);

  const loadData = () => {
    // Load events from localStorage
    try {
      const storedEvents = localStorage.getItem('nexus_events');
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents);
        setEvents(parsedEvents.slice(-10)); // Last 10 events
      }
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const triggerUpdate = async () => {
    try {
      const response = await fetch('/api/ota?apiKey=nxs_test_demo12345678&currentVersion=1.0.0');
      if (response.ok) {
        const update = await response.json();
        setUpdates(prev => [update, ...prev].slice(0, 5));
      }
    } catch (error) {
      console.error('Error triggering update:', error);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🚀 OTA Updates Dashboard</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        {/* OTA Updates Section */}
        <div>
          <h2>📡 OTA Updates</h2>
          <button 
            onClick={triggerUpdate}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginBottom: '20px'
            }}
          >
            🔄 Check for Updates
          </button>
          
          {updates.length === 0 ? (
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '5px',
              textAlign: 'center'
            }}>
              <p>No updates available</p>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Click "Check for Updates" or edit SDK files to trigger updates
              </p>
            </div>
          ) : (
            updates.map((update, index) => (
              <div key={index} style={{
                padding: '15px',
                margin: '10px 0',
                backgroundColor: '#e7f3ff',
                border: '1px solid #b3d9ff',
                borderRadius: '5px'
              }}>
                <h4>Version {update.version}</h4>
                <p><strong>Features:</strong> {update.config.features.join(', ')}</p>
                <p><strong>Timestamp:</strong> {new Date(update.timestamp).toLocaleString()}</p>
                {update.config.code && (
                  <details>
                    <summary>Code Update</summary>
                    <pre style={{ backgroundColor: '#f1f1f1', padding: '10px', fontSize: '12px' }}>
                      {update.config.code}
                    </pre>
                  </details>
                )}
              </div>
            ))
          )}
        </div>

        {/* Events Section */}
        <div>
          <h2>📊 Recent Events</h2>
          {events.length === 0 ? (
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '5px',
              textAlign: 'center'
            }}>
              <p>No events tracked yet</p>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Run the SDK to see events appear here
              </p>
            </div>
          ) : (
            events.map((event, index) => (
              <div key={index} style={{
                padding: '10px',
                margin: '5px 0',
                backgroundColor: event.eventName.includes('ota') ? '#fff3cd' : '#d4edda',
                border: '1px solid #ccc',
                borderRadius: '3px',
                fontSize: '14px'
              }}>
                <strong>{event.eventName}</strong>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(event.timestamp).toLocaleTimeString()}
                </div>
                {Object.keys(event.properties).length > 0 && (
                  <div style={{ fontSize: '12px', marginTop: '5px' }}>
                    {JSON.stringify(event.properties, null, 2)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: '#f8f9fa',
        borderRadius: '5px'
      }}>
        <h3>🧪 Test Instructions</h3>
        <ol>
          <li>Start the real-time environment: <code>npm run dev:realtime</code></li>
          <li>Run the test script: <code>node test-ota.js</code></li>
          <li>Edit files in <code>react-native-sdk/src/</code> to trigger updates</li>
          <li>Watch updates appear in real-time above</li>
        </ol>
        
        <h4>🔗 Quick Links</h4>
        <ul>
          <li><a href="/realtime-test">Real-time Updates Test</a></li>
          <li><a href="/">Main Dashboard</a></li>
          <li><a href="/api/ota?apiKey=nxs_test_demo12345678">OTA API Endpoint</a></li>
        </ul>
      </div>
    </div>
  );
}