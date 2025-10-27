const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { getBingos, saveBingos, getHistory, saveHistory } = require('../utils/dataManager');
const { checkFullCard } = require('../utils/bingoCard');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('sortear')
    .setDescription('Sorteia um número no bingo ativo'),

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

    if (activeBingo.participants.length === 0) {
      return interaction.reply({
        content: '❌ Nenhum participante registrado ainda!',
        ephemeral: true
      });
    }

    const availableNumbers = [];
    for (let i = 1; i <= 75; i++) {
      if (!activeBingo.drawnNumbers.includes(i)) {
        availableNumbers.push(i);
      }
    }

    if (availableNumbers.length === 0) {
      return interaction.reply({
        content: '❌ Todos os números já foram sorteados!',
        ephemeral: true
      });
    }

    const drawnNumber = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
    activeBingo.drawnNumbers.push(drawnNumber);

    let winner = null;
    for (const participant of activeBingo.participants) {
      for (const cardNum of participant.cards) {
        const card = activeBingo.cards.find(c => c.number === cardNum);
        if (card && checkFullCard(card, activeBingo.drawnNumbers)) {
          winner = {
            participant: participant.nome,
            userId: participant.userId,
            cardNumber: cardNum,
            wonAt: new Date().toISOString()
          };
          break;
        }
      }
      if (winner) break;
    }

    if (winner) {
      activeBingo.status = 'finalizado';
      activeBingo.winner = winner;
      activeBingo.finishedAt = new Date().toISOString();

      const history = getHistory();
      history.games.unshift({
        id: activeBingo.id,
        nome: activeBingo.nome,
        guildId: activeBingo.guildId,
        winner: winner,
        totalParticipants: activeBingo.participants.length,
        totalRevenue: activeBingo.participants.reduce((sum, p) => sum + p.totalPaid, 0),
        drawnNumbers: activeBingo.drawnNumbers.length,
        createdAt: activeBingo.createdAt,
        finishedAt: activeBingo.finishedAt
      });

      if (history.games.length > 50) {
        history.games = history.games.slice(0, 50);
      }

      saveHistory(history);
    }

    saveBingos(bingos);

    const embed = new EmbedBuilder()
      .setColor(winner ? '#F04747' : '#7289DA')
      .setTitle(winner ? '🎊 BINGO! TEMOS UM VENCEDOR!' : '🎲 Número Sorteado')
      .setDescription(winner ? `**${winner.participant}** venceu com a cartela #${winner.cardNumber}!` : null)
      .addFields(
        { name: '🔢 Número Sorteado', value: `**${drawnNumber}**`, inline: true },
        { name: '📊 Total Sorteado', value: `${activeBingo.drawnNumbers.length}/75`, inline: true },
        { name: '🎯 Restantes', value: `${75 - activeBingo.drawnNumbers.length}`, inline: true }
      );

    if (!winner) {
      const last10 = activeBingo.drawnNumbers.slice(-10).reverse();
      embed.addFields({
        name: '📝 Últimos 10 Números',
        value: last10.join(', ') || 'Nenhum ainda',
        inline: false
      });
    } else {
      embed.addFields(
        { name: '🏆 Status', value: 'Bingo Finalizado!', inline: false }
      );
    }

    embed.setTimestamp();

    if (activeBingo.drawMessageId) {
      try {
        const channel = await interaction.client.channels.fetch(interaction.channelId);
        const message = await channel.messages.fetch(activeBingo.drawMessageId);
        await message.edit({ embeds: [embed] });
        
        await interaction.reply({
          content: winner ? '🎉 Bingo finalizado! Veja a mensagem atualizada acima.' : '✅ Número sorteado! Mensagem atualizada.',
          ephemeral: true
        });
      } catch (error) {
        const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
        activeBingo.drawMessageId = reply.id;
        saveBingos(bingos);
      }
    } else {
      const reply = await interaction.reply({ embeds: [embed], fetchReply: true });
      activeBingo.drawMessageId = reply.id;
      saveBingos(bingos);
    }
  }
};
