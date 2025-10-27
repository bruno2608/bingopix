const express = require('express');
const pixWebhook = require('./webhooks/pix-webhook');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use('/webhook', pixWebhook);

app.get('/', (req, res) => {
  res.json({
    name: 'Discord Bingo Bot API',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      webhook_pix: '/webhook/pix/notification',
      health: '/webhook/pix/health'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌐 Servidor webhook rodando na porta ${PORT}`);
  });
}

module.exports = app;
