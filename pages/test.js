import { useEffect } from 'react';
import { storage } from '../lib/storage';

export default function TestPage() {
  useEffect(() => {
    // Generate test data
    const generateTestData = () => {
      const events = [];
      const eventTypes = ['app_start', 'screen_view', 'button_click', 'app_crash', 'screenshot_taken'];
      const devices = [
        { brand: 'Apple', model: 'iPhone 14', platform: 'ios', systemVersion: '16.0' },
        { brand: 'Samsung', model: 'Galaxy S23', platform: 'android', systemVersion: '13.0' },
        { brand: 'Google', model: 'Pixel 7', platform: 'android', systemVersion: '13.0' }
      ];

      for (let i = 0; i < 50; i++) {
        const device = devices[Math.floor(Math.random() * devices.length)];
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        let properties = { testData: true };
        
        if (eventType === 'app_crash') {
          properties = {
            message: 'Test crash error',
            stack: 'Error: Test crash\\n    at TestFunction (app.js:123:45)',
            isFatal: false
          };
        } else if (eventType === 'screenshot_taken') {
          properties = {
            screenshotUri: device.platform === 'ios' 
              ? 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k='
              : 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
          };
        }
        
        events.push({
          id: `test_${i}`,
          eventName: eventType,
          properties,
          userId: `user_${Math.floor(Math.random() * 5) + 1}`,
          sessionId: `session_${Math.floor(Math.random() * 10) + 1}`,
          timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
          deviceInfo: {
            deviceId: `device_${i}`,
            brand: device.brand,
            model: device.model,
            systemVersion: device.systemVersion,
            appVersion: '1.0.0',
            screenSize: device.platform === 'ios' ? '390x844' : '412x915',
            platform: device.platform
          }
        });
      }

      storage.setEvents(events);
      alert('Test data generated! Go back to dashboard to view.');
    };

    generateTestData();
  }, []);

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Test Data Generated</h1>
      <p>50 test events have been created with:</p>
      <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
        <li>Multiple event types</li>
        <li>Different devices and platforms</li>
        <li>Sample crash reports</li>
        <li>Various users and sessions</li>
      </ul>
      <br />
      <a href="/" style={{ color: '#007bff', textDecoration: 'none' }}>
        ← Back to Dashboard
      </a>
    </div>
  );
}