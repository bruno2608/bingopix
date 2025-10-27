const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getHistory } = require('../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('historico')
    .setDescription('Mostra o histórico de bingos finalizados')
    .addIntegerOption(option =>
      option.setName('pagina')
        .setDescription('Página do histórico (10 por página)')
        .setMinValue(1)),

  async execute(interaction) {
    const page = interaction.options.getInteger('pagina') || 1;
    const history = getHistory();
    
    const guildGames = history.games.filter(g => g.guildId === interaction.guildId);

    if (guildGames.length === 0) {
      return interaction.reply({
        content: '📝 Nenhum bingo foi finalizado ainda neste servidor!',
        ephemeral: true
      });
    }

    const itemsPerPage = 10;
    const totalPages = Math.ceil(guildGames.length / itemsPerPage);
    const startIndex = (page - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageGames = guildGames.slice(startIndex, endIndex);

    const embed = new EmbedBuilder()
      .setColor('#7289DA')
      .setTitle('📜 Histórico de Bingos')
      .setDescription(`Mostrando ${pageGames.length} de ${guildGames.length} bingos finalizados`)
      .setFooter({ text: `Página ${page} de ${totalPages}` })
      .setTimestamp();

    pageGames.forEach((game, index) => {
      const position = startIndex + index + 1;
      const date = new Date(game.finishedAt).toLocaleDateString('pt-BR');
      
      embed.addFields({
        name: `${position}. ${game.nome}`,
        value: `🏆 **Vencedor:** ${game.winner.participant} (Cartela #${game.winner.cardNumber})\n` +
               `👥 **Participantes:** ${game.totalParticipants} | 💰 **Arrecadação:** R$ ${game.totalRevenue.toFixed(2)}\n` +
               `🔢 **Números Sorteados:** ${game.drawnNumbers} | 📅 **Data:** ${date}`,
        inline: false
      });
    });

    await interaction.reply({ embeds: [embed] });
  }
};
