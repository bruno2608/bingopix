const { SlashCommandBuilder, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const { getBingos } = require('../utils/dataManager');
const { generateCardImage } = require('../utils/canvasGenerator');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('visualizar-cartela')
    .setDescription('Visualiza uma cartela específica')
    .addIntegerOption(option =>
      option.setName('numero')
        .setDescription('Número da cartela')
        .setRequired(true)
        .setMinValue(1)),

  async execute(interaction) {
    await interaction.deferReply();

    const cardNumber = interaction.options.getInteger('numero');
    const bingos = getBingos();
    const activeBingo = Object.values(bingos).find(b => 
      b.guildId === interaction.guildId && b.status === 'ativo'
    );

    if (!activeBingo) {
      return interaction.editReply({
        content: '❌ Não há bingo ativo neste servidor!',
        ephemeral: true
      });
    }

    if (cardNumber > activeBingo.quantidade) {
      return interaction.editReply({
        content: `❌ Cartela #${cardNumber} não existe! As cartelas vão de 1 a ${activeBingo.quantidade}.`,
        ephemeral: true
      });
    }

    const card = activeBingo.cards.find(c => c.number === cardNumber);

    if (!card) {
      return interaction.editReply({
        content: `❌ Erro ao encontrar a cartela #${cardNumber}.`,
        ephemeral: true
      });
    }

    const participant = activeBingo.participants.find(p => p.cards.includes(cardNumber));

    const imageBuffer = generateCardImage(card, activeBingo.drawnNumbers);
    const attachment = new AttachmentBuilder(imageBuffer, { name: `cartela-${cardNumber}.png` });

    const markedCount = card.grid.flat().filter(cell => 
      cell === 'FREE' || (typeof cell === 'number' && activeBingo.drawnNumbers.includes(cell))
    ).length;

    const embed = new EmbedBuilder()
      .setColor('#7289DA')
      .setTitle(`🎫 Cartela #${cardNumber}`)
      .setDescription(participant ? `**Proprietário:** ${participant.nome}` : '**Status:** Disponível')
      .addFields(
        { name: '✅ Números Marcados', value: `${markedCount}/25`, inline: true },
        { name: '📊 Progresso', value: `${((markedCount / 25) * 100).toFixed(1)}%`, inline: true }
      )
      .setImage(`attachment://cartela-${cardNumber}.png`)
      .setTimestamp();

    await interaction.editReply({ embeds: [embed], files: [attachment] });
  }
};
