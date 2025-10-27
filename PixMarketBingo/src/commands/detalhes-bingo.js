const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBingos, getHistory } = require('../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('detalhes-bingo')
    .setDescription('Mostra detalhes completos de um bingo específico')
    .addStringOption(option =>
      option.setName('bingo')
        .setDescription('Selecione o bingo')
        .setRequired(true)
        .setAutocomplete(true)),

  async autocomplete(interaction) {
    const bingos = getBingos();
    const history = getHistory();
    
    const activeBingos = Object.entries(bingos).filter(([id, b]) => 
      b.guildId === interaction.guildId
    );
    
    const historicalBingos = history.games.filter(g => 
      g.guildId === interaction.guildId
    );

    const choices = [];

    activeBingos.forEach(([id, bingo]) => {
      const status = bingo.status === 'ativo' ? '🟢' : '🔴';
      choices.push({
        name: `${status} ${bingo.nome} (${bingo.participants.length} participantes)`,
        value: id
      });
    });

    historicalBingos.slice(0, 20).forEach(game => {
      if (!choices.find(c => c.value === game.id)) {
        choices.push({
          name: `🏆 ${game.nome} - Vencedor: ${game.winner.participant}`,
          value: game.id
        });
      }
    });

    if (choices.length === 0) {
      choices.push({
        name: 'Nenhum bingo encontrado',
        value: 'none'
      });
    }

    await interaction.respond(choices.slice(0, 25));
  },

  async execute(interaction) {
    const bingoId = interaction.options.getString('bingo');

    if (bingoId === 'none') {
      return interaction.reply({
        content: '❌ Nenhum bingo encontrado neste servidor!',
        ephemeral: true
      });
    }
    
    const bingos = getBingos();
    let bingo = bingos[bingoId];
    
    if (!bingo) {
      const history = getHistory();
      const historicalGame = history.games.find(g => g.id === bingoId);
      
      if (historicalGame) {
        const embed = new EmbedBuilder()
          .setColor('#7289DA')
          .setTitle(`📋 Detalhes: ${historicalGame.nome}`)
          .addFields(
            { name: '🏆 Vencedor', value: `${historicalGame.winner.participant} (Cartela #${historicalGame.winner.cardNumber})`, inline: false },
            { name: '👥 Total de Participantes', value: `${historicalGame.totalParticipants}`, inline: true },
            { name: '💰 Arrecadação Total', value: `R$ ${historicalGame.totalRevenue.toFixed(2)}`, inline: true },
            { name: '🔢 Números Sorteados', value: `${historicalGame.drawnNumbers}`, inline: true },
            { name: '📅 Criado em', value: new Date(historicalGame.createdAt).toLocaleString('pt-BR'), inline: true },
            { name: '🏁 Finalizado em', value: new Date(historicalGame.finishedAt).toLocaleString('pt-BR'), inline: true },
            { name: '📝 ID', value: `\`${historicalGame.id}\``, inline: false }
          )
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      }
      
      return interaction.reply({
        content: '❌ Bingo não encontrado! Verifique o ID e tente novamente.',
        ephemeral: true
      });
    }

    const totalSold = bingo.participants.reduce((sum, p) => sum + p.cards.length, 0);
    const totalRevenue = bingo.participants.reduce((sum, p) => sum + p.totalPaid, 0);

    const embed = new EmbedBuilder()
      .setColor(bingo.status === 'ativo' ? '#43B581' : '#7289DA')
      .setTitle(`📋 Detalhes: ${bingo.nome}`)
      .addFields(
        { name: '📊 Status', value: bingo.status === 'ativo' ? '🟢 Ativo' : '🔴 Finalizado', inline: true },
        { name: '🎫 Cartelas', value: `${totalSold}/${bingo.quantidade}`, inline: true },
        { name: '💰 Arrecadação', value: `R$ ${totalRevenue.toFixed(2)}`, inline: true },
        { name: '💵 Valor por Cartela', value: `R$ ${bingo.valor.toFixed(2)}`, inline: true },
        { name: '👥 Participantes', value: `${bingo.participants.length}`, inline: true },
        { name: '🔢 Números Sorteados', value: `${bingo.drawnNumbers.length}/75`, inline: true },
        { name: '📅 Criado em', value: new Date(bingo.createdAt).toLocaleString('pt-BR'), inline: true }
      );

    if (bingo.status === 'finalizado' && bingo.winner) {
      embed.addFields({
        name: '🏆 Vencedor',
        value: `${bingo.winner.participant} (Cartela #${bingo.winner.cardNumber})`,
        inline: false
      });
      embed.addFields({
        name: '🏁 Finalizado em',
        value: new Date(bingo.finishedAt).toLocaleString('pt-BR'),
        inline: true
      });
    }

    if (bingo.participants.length > 0) {
      const participantsList = bingo.participants
        .map(p => `• **${p.nome}**: ${p.cards.length} cartela(s) - R$ ${p.totalPaid.toFixed(2)}`)
        .join('\n');

      embed.addFields({
        name: '👤 Participantes',
        value: participantsList.length > 1024 ? participantsList.substring(0, 1021) + '...' : participantsList,
        inline: false
      });
    }

    embed.addFields({
      name: '📝 ID do Bingo',
      value: `\`${bingoId}\``,
      inline: false
    });

    embed.setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
