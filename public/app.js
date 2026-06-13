async function fetchInfo() {
  const [infoRes, healthRes] = await Promise.all([
    fetch('/api/info'),
    fetch('/health')
  ]);
  return {
    info: await infoRes.json(),
    health: await healthRes.json()
  };
}

function applySlotTheme(color) {
  const badge = document.getElementById('slot-badge');
  badge.textContent = color === 'green' ? 'Slot Verde — Staging' : 'Slot Azul — Producción';
  badge.className = `badge ${color}`;
  document.body.className = color === 'green' ? 'slot-staging' : 'slot-production';
}

async function refreshStatus() {
  const dot = document.getElementById('health-dot');
  const healthText = document.getElementById('health-text');

  dot.className = 'health-dot';
  healthText.textContent = 'Verificando...';

  try {
    const { info, health } = await fetchInfo();

    document.getElementById('slot-name').textContent = info.slot;
    document.getElementById('app-version').textContent = info.version;
    document.getElementById('deploy-color').textContent = info.color;
    document.getElementById('environment').textContent = info.environment;

    dot.className = 'health-dot ok';
    healthText.textContent = 'Healthy';
    document.getElementById('uptime').textContent =
      `${Math.floor(health.uptime)}s`;

    applySlotTheme(info.color);
  } catch (err) {
    dot.className = 'health-dot error';
    healthText.textContent = 'Error al conectar';
    console.error(err);
  }
}

refreshStatus();
