const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Identifica en qué slot estamos corriendo (Azure lo inyecta automáticamente)
const SLOT_NAME = process.env.WEBSITE_SLOT_NAME || 'production';
const APP_VERSION = process.env.APP_VERSION || '1.0.0';
const DEPLOYMENT_COLOR = process.env.DEPLOYMENT_COLOR || 'blue';

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.json());

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

// Endpoint de health check — usado por Azure y el pipeline CI/CD
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    slot: SLOT_NAME,
    version: APP_VERSION,
    color: DEPLOYMENT_COLOR,
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Endpoint de info — muestra detalles del deployment actual
app.get('/api/info', (req, res) => {
  res.json({
    app: 'miapp-blue-green',
    version: APP_VERSION,
    slot: SLOT_NAME,
    color: DEPLOYMENT_COLOR,
    environment: process.env.NODE_ENV || 'development',
    message: `Corriendo en slot ${SLOT_NAME.toUpperCase()} (${DEPLOYMENT_COLOR})`
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Slot: ${SLOT_NAME} | Version: ${APP_VERSION} | Color: ${DEPLOYMENT_COLOR}`);
});
