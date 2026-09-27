const { spawn } = require('child_process');

function startTunnel() {
  console.log('[Tunnel Supervisor] Starting localtunnel on port 5173...');
  const child = spawn('npx --yes localtunnel --port 5173', {
    shell: true,
    stdio: 'inherit'
  });

  child.on('close', (code) => {
    console.log(`[Tunnel Supervisor] Tunnel disconnected (code: ${code}). Reconnecting in 3s...`);
    setTimeout(startTunnel, 3000);
  });

  child.on('error', (err) => {
    console.error('[Tunnel Supervisor] Error:', err);
    setTimeout(startTunnel, 3000);
  });
}

startTunnel();
