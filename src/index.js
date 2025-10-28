require('dotenv').config();
const { Client, GatewayIntentBits, Collection, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');
const config = require('./config.json');
const express = require('express');
const pixWebhook = require('./webhooks/pix-webhook');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    client.commands.set(command.data.name, command);
  }
}

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  console.log(`📊 Servidores: ${client.guilds.cache.size}`);
  console.log(`👥 Usuários: ${client.users.cache.size}`);
});

client.on('interactionCreate', async interaction => {
  if (interaction.isAutocomplete()) {
    const command = client.commands.get(interaction.commandName);
    
    if (!command || !command.autocomplete) return;

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(`Erro ao executar autocomplete ${interaction.commandName}:`, error);
    }
    return;
  }

  const comprarCartelaCommand = client.commands.get('comprar-cartela');
  if (comprarCartelaCommand && comprarCartelaCommand.handleInteraction) {
    if (interaction.isStringSelectMenu() || interaction.isModalSubmit() || interaction.isButton()) {
      try {
        await comprarCartelaCommand.handleInteraction(interaction);
        return;
      } catch (error) {
        console.error('Erro ao processar interação de comprar-cartela:', error);
      }
    }
  }

  const finalizarBingoCommand = client.commands.get('finalizar-bingo');
  if (finalizarBingoCommand && finalizarBingoCommand.handleInteraction) {
    if (interaction.isStringSelectMenu() || interaction.isButton()) {
      try {
        await finalizarBingoCommand.handleInteraction(interaction);
        return;
      } catch (error) {
        console.error('Erro ao processar interação de finalizar-bingo:', error);
      }
    }
  }

  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);

  if (!command) return;

  try {
    await command.execute(interaction);
  } catch (error) {
    console.error(`Erro ao executar comando ${interaction.commandName}:`, error);
    const errorMessage = { content: 'Ocorreu um erro ao executar este comando!', ephemeral: true };
    
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp(errorMessage);
    } else {
      await interaction.reply(errorMessage);
    }
  }
});

const app = express();
const PORT = process.env.PORT || 5000;

function getReplitDomain() {
  const domains = process.env.REPLIT_DOMAINS || process.env.REPLIT_DEV_DOMAIN;
  
  if (!domains) {
    return null;
  }
  
  try {
    const parsed = JSON.parse(domains);
    return Array.isArray(parsed) ? parsed[0] : parsed;
  } catch {
    return domains;
  }
}

const replitDomain = getReplitDomain();
const webhookUrl = replitDomain
  ? `https://${replitDomain}/webhook/pix/notification`
  : `http://localhost:${PORT}/webhook/pix/notification`;

process.env.WEBHOOK_URL = webhookUrl;

app.use(express.json());
app.use('/webhook', pixWebhook);

app.get('/', (req, res) => {
  res.json({
    name: 'Discord Bingo Bot API',
    version: '1.0.0',
    status: 'online',
    bot: client.user ? {
      username: client.user.tag,
      servers: client.guilds.cache.size
    } : 'not connected',
    endpoints: {
      webhook_pix: '/webhook/pix/notification',
      health: '/webhook/pix/health'
    },
    webhook_url: webhookUrl
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    bot: client.isReady() ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString() 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 Servidor webhook rodando na porta ${PORT}`);
  console.log(`📡 Webhook URL: ${webhookUrl}`);
});

client.login(process.env.DISCORD_TOKEN);
