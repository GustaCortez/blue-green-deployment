// Test básico de health check — corre antes del swap en el pipeline
const http = require('http');

const HOST = process.env.TEST_HOST || 'localhost';
const PORT = process.env.TEST_PORT || 3000;

function checkHealth() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: HOST,
      port: PORT,
      path: '/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          const body = JSON.parse(data);
          if (body.status === 'healthy') {
            resolve(body);
          } else {
            reject(new Error(`Health check falló: status=${body.status}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => reject(new Error('Timeout en health check')));
    req.end();
  });
}

checkHealth()
  .then((body) => {
    console.log('Health check OK:', JSON.stringify(body, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Health check FALLÓ:', err.message);
    process.exit(1);
  });
