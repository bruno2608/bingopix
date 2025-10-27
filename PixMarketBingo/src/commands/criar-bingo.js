const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBingos, saveBingos } = require('../utils/dataManager');
const { generateBingoCards } = require('../utils/bingoCard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('criar-bingo')
    .setDescription('Cria um novo jogo de bingo')
    .addStringOption(option =>
      option.setName('nome')
        .setDescription('Nome do bingo')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('quantidade')
        .setDescription('Quantidade de cartelas')
        .setRequired(true)
        .setMinValue(1)
        .setMaxValue(500))
    .addNumberOption(option =>
      option.setName('valor')
        .setDescription('Valor por cartela (em reais)')
        .setRequired(true)
        .setMinValue(0.01)),

  async execute(interaction) {
    const nome = interaction.options.getString('nome');
    const quantidade = interaction.options.getInteger('quantidade');
    const valor = interaction.options.getNumber('valor');

    await interaction.deferReply();

    const bingos = getBingos();
    const bingoId = `${interaction.guildId}-${Date.now()}`;

    if (Object.values(bingos).some(b => b.guildId === interaction.guildId && b.status === 'ativo')) {
      return interaction.editReply({
        content: '❌ Já existe um bingo ativo neste servidor! Finalize-o antes de criar um novo.',
        ephemeral: true
      });
    }

    const cards = generateBingoCards(quantidade);

    const newBingo = {
      id: bingoId,
      guildId: interaction.guildId,
      nome: nome,
      quantidade: quantidade,
      valor: valor,
      cards: cards,
      participants: [],
      drawnNumbers: [],
      status: 'ativo',
      createdAt: new Date().toISOString(),
      createdBy: interaction.user.id,
      winner: null,
      drawMessageId: null
    };

    bingos[bingoId] = newBingo;
    saveBingos(bingos);

    const embed = new EmbedBuilder()
      .setColor('#43B581')
      .setTitle('🎉 Novo Bingo Criado!')
      .setDescription(`**${nome}**`)
      .addFields(
        { name: '🎫 Cartelas Disponíveis', value: `${quantidade} cartelas`, inline: true },
        { name: '💰 Valor por Cartela', value: `R$ ${valor.toFixed(2)}`, inline: true },
        { name: '📊 Status', value: 'Ativo', inline: true },
        { name: '📝 ID do Bingo', value: `\`${bingoId}\``, inline: false },
        { name: 'ℹ️ Próximos Passos', value: 'Use `/adicionar-participante` para registrar jogadores e suas cartelas!', inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `Criado por ${interaction.user.tag}` });

    await interaction.editReply({ embeds: [embed] });
  }
};
