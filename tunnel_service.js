const path = require('path');
const localtunnel = require(path.join(__dirname, 'frontend', 'node_modules', 'localtunnel'));

async function connect() {
  try {
    console.log('[Tunnel] Establishing tunnel on port 5173...');
    const tunnel = await localtunnel({ port: 5173 });
    console.log('>>> SECONDLIFE LIVE PUBLIC URL: ' + tunnel.url + ' <<<');

    tunnel.on('close', () => {
      console.log('[Tunnel] Tunnel connection closed. Auto-reconnecting in 3s...');
      setTimeout(connect, 3000);
    });

    tunnel.on('error', (err) => {
      console.error('[Tunnel] Error:', err.message);
      setTimeout(connect, 3000);
    });
  } catch (err) {
    console.error('[Tunnel] Failed to create tunnel:', err.message);
    setTimeout(connect, 3000);
  }
}

connect();
