import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { storage } from '../lib/storage';

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
    const interval = setInterval(loadEvents, 2000); // Refresh every 2 seconds
    return () => clearInterval(interval);
  }, []);

  // Debug localStorage
  useEffect(() => {
    console.log('localStorage nexus_events:', localStorage.getItem('nexus_events'));
    console.log('localStorage nexus_user_id:', localStorage.getItem('nexus_user_id'));
  }, [events]);

  const loadEvents = async () => {
    try {
      // Try to load from API first (real-time data)
      if (typeof window !== 'undefined' && typeof fetch !== 'undefined') {
        const response = await fetch('/api/events');
        if (response.ok) {
          const data = await response.json();
          console.log('Dashboard loaded events from API:', data.count);
          setEvents(data.events);
          setLoading(false);
          return;
        }
      }
    } catch (error) {
      console.warn('API not available, using localStorage:', error.message);
    }
    
    // Fallback to localStorage
    const storedEvents = storage.getEvents();
    console.log('Dashboard loaded events from localStorage:', storedEvents.length);
    setEvents(storedEvents);
    setLoading(false);
  };

  const clearAllData = async () => {
    if (confirm('Are you sure you want to clear all analytics data? This cannot be undone.')) {
      try {
        // Clear API data if fetch is available
        if (typeof fetch !== 'undefined') {
          await fetch('/api/sync', { method: 'DELETE' });
        }
        // Clear localStorage
        storage.clearEvents();
        localStorage.removeItem('nexus_user_id');
        setEvents([]);
        alert('All data cleared successfully!');
      } catch (error) {
        console.error('Error clearing data:', error);
        // Still clear localStorage even if API fails
        storage.clearEvents();
        localStorage.removeItem('nexus_user_id');
        setEvents([]);
        alert('Data cleared from localStorage.');
      }
    }
  };

  const getDeviceStats = () => {
    const devices = {};
    const platforms = {};
    const versions = {};
    
    events.forEach(event => {
      if (event.deviceInfo) {
        const { platform, brand, systemVersion } = event.deviceInfo;
        devices[brand] = (devices[brand] || 0) + 1;
        platforms[platform] = (platforms[platform] || 0) + 1;
        versions[systemVersion] = (versions[systemVersion] || 0) + 1;
      }
    });
    
    return { devices, platforms, versions };
  };

  const getSessionStats = () => {
    const sessions = new Set(events.map(e => e.sessionId)).size;
    const avgEventsPerSession = sessions > 0 ? Math.round(events.length / sessions) : 0;
    return { sessions, avgEventsPerSession };
  };

  const getAnalytics = () => {
    const totalEvents = events.length;
    const uniqueUsers = [...new Set(events.map(e => e.userId))].length;
    const eventCounts = {};
    events.forEach(event => {
      eventCounts[event.eventName] = (eventCounts[event.eventName] || 0) + 1;
    });
    const topEvents = Object.entries(eventCounts)
      .map(([name, count]) => ({ _id: name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return { totalEvents, uniqueUsers, topEvents };
  };

  const getEventsByHour = () => {
    const hourlyData = {};
    events.forEach(event => {
      const hour = format(new Date(event.timestamp), 'HH:00');
      hourlyData[hour] = (hourlyData[hour] || 0) + 1;
    });
    
    return Object.entries(hourlyData).map(([hour, count]) => ({ hour, count }));
  };

  const analytics = getAnalytics();
  const crashes = events.filter(e => e.eventName === 'app_crash');
  const deviceStats = getDeviceStats();
  const sessionStats = getSessionStats();
  const screenshots = events.filter(e => e.eventName === 'screenshot_taken');

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard">
      <h1>Nexus Insight Pro Dashboard</h1>
      <div className="sync-status">
        <span className="sync-indicator">●</span>
        <span>Live sync active - {events.length} events tracked</span>
        <a href="/test" className="test-link">Generate Test Data</a>
        <a href="/apk-optimizer" className="test-link">📱 APK Optimizer</a>
        <button onClick={clearAllData} className="clear-btn">Clear All Data</button>
      </div>
      
      <div className="stats">
        <div className="stat-card">
          <h3>Total Events</h3>
          <p>{analytics.totalEvents}</p>
        </div>
        <div className="stat-card">
          <h3>Unique Users</h3>
          <p>{analytics.uniqueUsers}</p>
        </div>
        <div className="stat-card crash">
          <h3>App Crashes</h3>
          <p>{crashes.length}</p>
        </div>
        <div className="stat-card">
          <h3>Sessions</h3>
          <p>{sessionStats.sessions}</p>
        </div>
        <div className="stat-card">
          <h3>Screenshots</h3>
          <p>{screenshots.length}</p>
        </div>
      </div>

      <div className="charts">
        <div className="chart-container">
          <h3>Events by Hour</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getEventsByHour()}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="hour" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Top Events</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.topEvents}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="_id" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {crashes.length > 0 && (
        <div className="crashes-section">
          <h3>App Crashes ({crashes.length})</h3>
          <div className="crashes-list">
            {crashes.slice(0, 10).map((crash, index) => (
              <div key={index} className="crash-item">
                <div className="crash-header">
                  <span className="crash-time">{format(new Date(crash.timestamp), 'MMM dd, HH:mm')}</span>
                  <span className="crash-user">User: {crash.userId}</span>
                </div>
                <div className="crash-message">{crash.properties.message}</div>
                <details className="crash-stack">
                  <summary>Stack Trace</summary>
                  <pre>{crash.properties.stack}</pre>
                </details>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="device-stats">
        <h3>Device Analytics</h3>
        <div className="stats-grid">
          <div className="stat-section">
            <h4>Platforms</h4>
            {Object.entries(deviceStats.platforms).map(([platform, count]) => (
              <div key={platform} className="stat-item">
                <span>{platform}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
          <div className="stat-section">
            <h4>Devices</h4>
            {Object.entries(deviceStats.devices).slice(0, 5).map(([device, count]) => (
              <div key={device} className="stat-item">
                <span>{device}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
          <div className="stat-section">
            <h4>OS Versions</h4>
            {Object.entries(deviceStats.versions).slice(0, 5).map(([version, count]) => (
              <div key={version} className="stat-item">
                <span>{version}</span>
                <span>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="events-table">
        <h3>Recent Events</h3>
        <table>
          <thead>
            <tr>
              <th>Event</th>
              <th>User ID</th>
              <th>Timestamp</th>
              <th>Properties</th>
            </tr>
          </thead>
          <tbody>
            {events.slice(0, 50).map((event, index) => (
              <tr key={index} className={event.eventName === 'app_crash' ? 'crash-row' : ''}>
                <td>
                  <span className={`event-badge ${event.eventName.replace('_', '-')}`}>
                    {event.eventName}
                  </span>
                </td>
                <td>{event.userId}</td>
                <td>{format(new Date(event.timestamp), 'MMM dd, HH:mm')}</td>
                <td>
                  <details>
                    <summary>View Details</summary>
                    <div className="event-details">
                      {event.properties.screenshotUri && (
                        <div className="screenshot-preview">
                          <strong>Screenshot:</strong><br/>
                          <img src={event.properties.screenshotUri} alt="Screenshot" className="screenshot-img" />
                        </div>
                      )}
                      <div><strong>Properties:</strong> {JSON.stringify(event.properties, null, 2)}</div>
                      {event.deviceInfo && (
                        <div><strong>Device:</strong> {event.deviceInfo.brand} {event.deviceInfo.model} ({event.deviceInfo.platform} {event.deviceInfo.systemVersion})</div>
                      )}
                      <div><strong>Session:</strong> {event.sessionId}</div>
                    </div>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .dashboard { padding: 20px; font-family: Arial, sans-serif; }
        .loading { text-align: center; padding: 50px; }
        .stats { display: flex; gap: 20px; margin: 20px 0; }
        .stat-card { background: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; }
        .stat-card h3 { margin: 0 0 10px 0; color: #666; }
        .stat-card p { font-size: 24px; font-weight: bold; margin: 0; }
        .stat-card.crash { background: #ffe6e6; }
        .stat-card.crash h3 { color: #d32f2f; }
        .crashes-section { margin: 20px 0; }
        .crashes-list { max-height: 400px; overflow-y: auto; }
        .crash-item { background: #fff3f3; border: 1px solid #ffcdd2; margin: 10px 0; padding: 15px; border-radius: 8px; }
        .crash-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; }
        .crash-time { color: #d32f2f; }
        .crash-user { color: #666; }
        .crash-message { color: #d32f2f; margin-bottom: 10px; }
        .crash-stack pre { background: #f5f5f5; padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px; }
        .crash-row { background-color: #ffebee; }
        .charts { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 20px 0; }
        .chart-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .events-table { margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; }
        th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background-color: #f5f5f5; }
        .crash-row { background-color: #ffebee; }
        .device-stats { margin: 20px 0; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stats-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; }
        .stat-section h4 { margin: 0 0 10px 0; color: #666; }
        .stat-item { display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #eee; }
        .event-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .event-badge.app-crash { background: #ffcdd2; color: #d32f2f; }
        .event-badge.screen-view { background: #c8e6c9; color: #388e3c; }
        .event-badge.screenshot-taken { background: #bbdefb; color: #1976d2; }
        .event-badge.sdk-initialized { background: #f8bbd9; color: #7b1fa2; }
        .event-details { background: #f9f9f9; padding: 10px; margin-top: 10px; border-radius: 4px; font-size: 12px; }
        .event-details div { margin: 5px 0; }
        .sync-status { display: flex; align-items: center; gap: 8px; margin: 10px 0; color: #666; font-size: 14px; }
        .sync-indicator { color: #4caf50; font-size: 12px; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .test-link { margin-left: 20px; color: #007bff; text-decoration: none; font-size: 12px; }
        .test-link:hover { text-decoration: underline; }
        .clear-btn { margin-left: 20px; padding: 4px 12px; background: #f44336; color: white; border: none; border-radius: 4px; font-size: 12px; cursor: pointer; }
        .clear-btn:hover { background: #d32f2f; }
        .screenshot-preview { margin: 10px 0; }
        .screenshot-img { max-width: 200px; max-height: 150px; border: 1px solid #ddd; border-radius: 4px; }
      `}</style>
    </div>
  );
}