require('dotenv').config();
const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');

const token = process.env.DISCORD_TOKEN;
const clientId = process.env.DISCORD_CLIENT_ID;

if (!token || !clientId) {
  console.error('❌ DISCORD_TOKEN ou DISCORD_CLIENT_ID não configurados!');
  console.log('Configure as variáveis de ambiente e tente novamente.');
  process.exit(1);
}

const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  if ('data' in command && 'execute' in command) {
    commands.push(command.data.toJSON());
    console.log(`✅ Carregado: ${command.data.name}`);
  }
}

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log(`🔄 Registrando ${commands.length} comandos slash...`);

    const data = await rest.put(
      Routes.applicationCommands(clientId),
      { body: commands }
    );

    console.log(`✅ ${data.length} comandos registrados com sucesso!`);
  } catch (error) {
    console.error('❌ Erro ao registrar comandos:', error);
  }
})();
