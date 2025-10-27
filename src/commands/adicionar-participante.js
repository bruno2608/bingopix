const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBingos, saveBingos } = require('../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('adicionar-participante')
    .setDescription('Adiciona um participante ao bingo ativo')
    .addStringOption(option =>
      option.setName('nome')
        .setDescription('Nome do participante')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('cartelas')
        .setDescription('Números das cartelas (separados por vírgula, ex: 1,5,10)')
        .setRequired(true)),

  async execute(interaction) {
    const nome = interaction.options.getString('nome');
    const cartelasInput = interaction.options.getString('cartelas');

    const bingos = getBingos();
    const activeBingo = Object.values(bingos).find(b => 
      b.guildId === interaction.guildId && b.status === 'ativo'
    );

    if (!activeBingo) {
      return interaction.reply({
        content: '❌ Não há bingo ativo neste servidor! Use `/criar-bingo` primeiro.',
        ephemeral: true
      });
    }

    const cardNumbers = cartelasInput.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));

    if (cardNumbers.length === 0) {
      return interaction.reply({
        content: '❌ Formato inválido! Use números separados por vírgula (ex: 1,5,10)',
        ephemeral: true
      });
    }

    const uniqueCards = [...new Set(cardNumbers)];
    if (uniqueCards.length !== cardNumbers.length) {
      return interaction.reply({
        content: '❌ Você incluiu números de cartela duplicados! Cada cartela pode aparecer apenas uma vez.',
        ephemeral: true
      });
    }

    const invalidCards = uniqueCards.filter(n => n < 1 || n > activeBingo.quantidade);
    if (invalidCards.length > 0) {
      return interaction.reply({
        content: `❌ Cartelas inválidas: ${invalidCards.join(', ')}. Use números entre 1 e ${activeBingo.quantidade}.`,
        ephemeral: true
      });
    }

    const takenCards = activeBingo.participants.flatMap(p => p.cards);
    const alreadyTaken = uniqueCards.filter(n => takenCards.includes(n));
    
    if (alreadyTaken.length > 0) {
      return interaction.reply({
        content: `❌ Cartelas já escolhidas: ${alreadyTaken.join(', ')}`,
        ephemeral: true
      });
    }

    const totalValue = uniqueCards.length * activeBingo.valor;

    activeBingo.participants.push({
      nome: nome,
      userId: interaction.user.id,
      cards: uniqueCards,
      totalPaid: totalValue,
      addedAt: new Date().toISOString(),
      addedBy: interaction.user.id
    });

    saveBingos(bingos);

    const embed = new EmbedBuilder()
      .setColor('#43B581')
      .setTitle('✅ Participante Adicionado!')
      .setDescription(`**${nome}** foi registrado no bingo!`)
      .addFields(
        { name: '🎫 Cartelas', value: uniqueCards.join(', '), inline: true },
        { name: '💰 Total', value: `R$ ${totalValue.toFixed(2)}`, inline: true },
        { name: '📊 Cartelas Vendidas', value: `${takenCards.length + uniqueCards.length}/${activeBingo.quantidade}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
