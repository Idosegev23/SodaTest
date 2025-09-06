#!/usr/bin/env node

// Script להפעלת Worker בפיתוח כל 30 שניות
const { exec } = require('child_process');

console.log('🤖 Starting Worker in development mode...');
console.log('⏰ Running every 30 seconds');
console.log('🔄 Worker will process pending artworks automatically');
console.log('📍 Server: http://localhost:3008');
console.log('─'.repeat(50));

function runWorker() {
  const timestamp = new Date().toLocaleTimeString('he-IL');
  
  exec('curl -s http://localhost:3008/api/worker', (error, stdout, stderr) => {
    if (error) {
      console.log(`❌ [${timestamp}] Worker error: ${error.message}`);
      return;
    }
    
    try {
      const result = JSON.parse(stdout);
      if (result.message === 'No pending items') {
        console.log(`✅ [${timestamp}] No pending items`);
      } else if (result.success) {
        console.log(`🎨 [${timestamp}] Successfully processed artwork: ${result.artworkId}`);
      } else if (result.error) {
        console.log(`⚠️  [${timestamp}] Worker failed: ${result.error}`);
      }
    } catch (e) {
      console.log(`📝 [${timestamp}] Worker response: ${stdout.slice(0, 100)}...`);
    }
  });
}

// רץ מיד ואז כל 30 שניות
runWorker();
setInterval(runWorker, 30000);

console.log('🚀 Worker scheduler started! Press Ctrl+C to stop.');
