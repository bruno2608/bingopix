const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBingos } = require('../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('status')
    .setDescription('Mostra o status do bingo ativo'),

  async execute(interaction) {
    const bingos = getBingos();
    const activeBingo = Object.values(bingos).find(b => 
      b.guildId === interaction.guildId && b.status === 'ativo'
    );

    if (!activeBingo) {
      return interaction.reply({
        content: '❌ Não há bingo ativo neste servidor!',
        ephemeral: true
      });
    }

    const totalSold = activeBingo.participants.reduce((sum, p) => sum + p.cards.length, 0);
    const totalRevenue = activeBingo.participants.reduce((sum, p) => sum + p.totalPaid, 0);

    const embed = new EmbedBuilder()
      .setColor('#7289DA')
      .setTitle(`📊 Status: ${activeBingo.nome}`)
      .addFields(
        { name: '🎫 Cartelas Vendidas', value: `${totalSold}/${activeBingo.quantidade}`, inline: true },
        { name: '💰 Arrecadação', value: `R$ ${totalRevenue.toFixed(2)}`, inline: true },
        { name: '👥 Participantes', value: `${activeBingo.participants.length}`, inline: true },
        { name: '🔢 Números Sorteados', value: `${activeBingo.drawnNumbers.length}/75`, inline: true },
        { name: '💵 Valor por Cartela', value: `R$ ${activeBingo.valor.toFixed(2)}`, inline: true },
        { name: '📅 Criado em', value: new Date(activeBingo.createdAt).toLocaleString('pt-BR'), inline: true }
      );

    if (activeBingo.participants.length > 0) {
      const participantsList = activeBingo.participants
        .map(p => `• **${p.nome}**: ${p.cards.length} cartela(s) (${p.cards.join(', ')})`)
        .join('\n');

      embed.addFields({
        name: '👤 Lista de Participantes',
        value: participantsList.length > 1024 ? participantsList.substring(0, 1021) + '...' : participantsList,
        inline: false
      });
    }

    if (activeBingo.drawnNumbers.length > 0) {
      const last15 = activeBingo.drawnNumbers.slice(-15).reverse();
      embed.addFields({
        name: '📝 Últimos 15 Números Sorteados',
        value: last15.join(', '),
        inline: false
      });
    }

    embed.setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
