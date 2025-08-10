// Real-time OTA test page
import { useState, useEffect } from 'react';

export default function RealtimeTest() {
  const [updates, setUpdates] = useState([]);
  const [connected, setConnected] = useState(false);
  const [connectionType, setConnectionType] = useState('');

  useEffect(() => {
    // Try WebSocket first
    const connectWebSocket = () => {
      try {
        const ws = new WebSocket('ws://localhost:3001/ota-updates?apiKey=nxs_test_demo12345678');
        
        ws.onopen = () => {
          setConnected(true);
          setConnectionType('WebSocket');
          console.log('🔗 Connected via WebSocket');
        };
        
        ws.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.version) {
            setUpdates(prev => [data, ...prev].slice(0, 10));
            console.log('⚡ WebSocket update received:', data.version);
          }
        };
        
        ws.onerror = () => {
          console.log('WebSocket failed, trying Server-Sent Events...');
          connectSSE();
        };
        
        ws.onclose = () => {
          setConnected(false);
          setTimeout(connectWebSocket, 5000);
        };
        
        return ws;
      } catch {
        connectSSE();
        return null;
      }
    };
    
    // Fallback to Server-Sent Events
    const connectSSE = () => {
      try {
        const eventSource = new EventSource('/api/ota-stream?apiKey=nxs_test_demo12345678');
        
        eventSource.onopen = () => {
          setConnected(true);
          setConnectionType('Server-Sent Events');
          console.log('🔗 Connected via Server-Sent Events');
        };
        
        eventSource.onmessage = (event) => {
          const data = JSON.parse(event.data);
          if (data.version) {
            setUpdates(prev => [data, ...prev].slice(0, 10));
            console.log('⚡ SSE update received:', data.version);
          }
        };
        
        eventSource.onerror = () => {
          setConnected(false);
          setTimeout(connectSSE, 5000);
        };
        
        return eventSource;
      } catch (error) {
        console.error('Failed to connect via SSE:', error);
        return null;
      }
    };
    
    const connection = connectWebSocket();
    
    return () => {
      if (connection) {
        if (connection instanceof WebSocket) {
          connection.close();
        } else if (connection instanceof EventSource) {
          connection.close();
        }
      }
    };
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🚀 Real-time OTA Updates Test</h1>
      
      <div style={{ 
        padding: '10px', 
        backgroundColor: connected ? '#d4edda' : '#f8d7da',
        border: `1px solid ${connected ? '#c3e6cb' : '#f5c6cb'}`,
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <strong>Connection Status:</strong> {connected ? '✅ Connected' : '❌ Disconnected'}
        {connected && <span> via {connectionType}</span>}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>📝 Instructions:</h3>
        <ol>
          <li>Run <code>npm run dev:realtime</code> in the dashboard directory</li>
          <li>Make changes to any file in <code>../react-native-sdk/src/</code></li>
          <li>Watch real-time OTA updates appear below instantly!</li>
        </ol>
      </div>
      
      <h3>📡 Recent Updates ({updates.length})</h3>
      
      {updates.length === 0 ? (
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f8f9fa', 
          border: '1px solid #dee2e6',
          borderRadius: '5px',
          textAlign: 'center'
        }}>
          <p>No updates received yet. Make a change to trigger an update!</p>
          <p style={{ fontSize: '12px', color: '#6c757d' }}>
            Try editing a file in react-native-sdk/src/ directory
          </p>
        </div>
      ) : (
        <div>
          {updates.map((update, index) => (
            <div key={index} style={{
              padding: '15px',
              margin: '10px 0',
              backgroundColor: '#f8f9fa',
              border: '1px solid #dee2e6',
              borderRadius: '5px',
              borderLeft: '4px solid #007bff'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4 style={{ margin: 0, color: '#007bff' }}>
                  Version {update.version}
                </h4>
                <small style={{ color: '#6c757d' }}>
                  {new Date(update.timestamp).toLocaleTimeString()}
                </small>
              </div>
              
              {update.changedFile && (
                <p style={{ margin: '5px 0', fontSize: '14px' }}>
                  📄 Changed file: <code>{update.changedFile}</code>
                </p>
              )}
              
              <div style={{ marginTop: '10px' }}>
                <strong>Features:</strong>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '5px' }}>
                  {update.config.features.map((feature, i) => (
                    <span key={i} style={{
                      padding: '2px 8px',
                      backgroundColor: '#e9ecef',
                      borderRadius: '12px',
                      fontSize: '12px'
                    }}>
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
              
              {update.config.code && (
                <div style={{ marginTop: '10px' }}>
                  <strong>Code Update:</strong>
                  <pre style={{
                    backgroundColor: '#f1f3f4',
                    padding: '10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    overflow: 'auto',
                    marginTop: '5px'
                  }}>
                    {update.config.code}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      <div style={{ 
        marginTop: '30px', 
        padding: '15px', 
        backgroundColor: '#fff3cd',
        border: '1px solid #ffeaa7',
        borderRadius: '5px'
      }}>
        <h4>💡 Tips:</h4>
        <ul>
          <li>Updates are triggered by any file changes in the SDK source</li>
          <li>WebSocket provides faster updates than Server-Sent Events</li>
          <li>Each update increments the version automatically</li>
          <li>Code changes are extracted and included in the update</li>
        </ul>
      </div>
    </div>
  );
}