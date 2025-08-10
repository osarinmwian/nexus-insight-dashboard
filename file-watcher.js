// File watcher for triggering real-time OTA updates
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

// Import broadcast functions
const { broadcastUpdate } = require('./pages/api/ota-stream');

let updateVersion = '1.0.3';

// Watch for changes in SDK source files
const watchPaths = [
  '../react-native-sdk/src/**/*.ts',
  '../react-native-sdk/src/**/*.js',
  './pages/api/ota.js'
];

const watcher = chokidar.watch(watchPaths, {
  ignored: /node_modules/,
  persistent: true,
  ignoreInitial: true
});

function generateUpdate(changedFile) {
  const timestamp = new Date().toISOString();
  updateVersion = incrementVersion(updateVersion);
  
  // Read the changed file content
  let codeUpdate = '';
  try {
    const content = fs.readFileSync(changedFile, 'utf8');
    // Extract meaningful changes for OTA
    if (content.includes('console.log')) {
      const logs = content.match(/console\.log\([^)]+\)/g);
      if (logs) {
        codeUpdate = logs.join('; ');
      }
    }
  } catch (error) {
    console.error('Error reading file:', error);
  }
  
  return {
    version: updateVersion,
    config: {
      version: updateVersion,
      features: ['enhanced_tracking', 'auto_screenshots', 'crash_analytics', 'realtime_sync'],
      endpoints: { sync: '/api/sync', events: '/api/events', crashes: '/api/crashes' },
      settings: { 
        maxEvents: 5000, 
        syncInterval: 1000, 
        enableDebugLogs: true,
        lastChanged: path.basename(changedFile)
      },
      code: `console.log('⚡ Real-time update from ${path.basename(changedFile)} at ${timestamp}'); ${codeUpdate}`
    },
    timestamp,
    mandatory: false,
    rollback: decrementVersion(updateVersion),
    source: 'file-watcher',
    changedFile: path.basename(changedFile)
  };
}

function incrementVersion(version) {
  const parts = version.split('.');
  parts[2] = (parseInt(parts[2]) + 1).toString();
  return parts.join('.');
}

function decrementVersion(version) {
  const parts = version.split('.');
  const patch = Math.max(0, parseInt(parts[2]) - 1);
  parts[2] = patch.toString();
  return parts.join('.');
}

// Set up file watching
watcher.on('change', (filePath) => {
  console.log(`🔄 File changed: ${filePath}`);
  
  const update = generateUpdate(filePath);
  console.log(`📡 Broadcasting real-time OTA update: ${update.version}`);
  
  // Broadcast via Server-Sent Events
  if (typeof broadcastUpdate === 'function') {
    broadcastUpdate(update);
  }
  
  // Broadcast via WebSocket if available
  if (global.broadcastWebSocketUpdate) {
    global.broadcastWebSocketUpdate(update);
  }
  
  // Update the main OTA endpoint
  updateOTAEndpoint(update);
});

function updateOTAEndpoint(update) {
  const otaFilePath = path.join(__dirname, 'pages/api/ota.js');
  
  try {
    let content = fs.readFileSync(otaFilePath, 'utf8');
    
    // Add the new update to the updates object
    const updateEntry = `  '${update.version}': ${JSON.stringify(update, null, 4)}`;
    
    // Find the updates object and add the new version
    const updatesRegex = /(const updates = \{[\s\S]*?)(\};)/;
    const match = content.match(updatesRegex);
    
    if (match) {
      const newUpdates = match[1] + ',\n' + updateEntry + '\n' + match[2];
      content = content.replace(updatesRegex, newUpdates);
      
      fs.writeFileSync(otaFilePath, content);
      console.log(`✅ Updated OTA endpoint with version ${update.version}`);
    }
  } catch (error) {
    console.error('Error updating OTA endpoint:', error);
  }
}

console.log('🔍 File watcher started. Watching for changes in:');
watchPaths.forEach(p => console.log(`  - ${p}`));
console.log('Real-time OTA updates will be triggered on file changes.');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down file watcher...');
  watcher.close();
  process.exit(0);
});

module.exports = watcher;