const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { getBingos, saveBingos } = require('../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('editar-valor')
    .setDescription('Altera o valor da cartela de um bingo')
    .addStringOption(option =>
      option.setName('bingo')
        .setDescription('Selecione o bingo')
        .setRequired(true)
        .setAutocomplete(true))
    .addNumberOption(option =>
      option.setName('novo-valor')
        .setDescription('Novo valor por cartela (em reais)')
        .setRequired(true)
        .setMinValue(0.01)),

  async autocomplete(interaction) {
    const bingos = getBingos();
    const activeBingos = Object.entries(bingos).filter(([id, b]) => 
      b.guildId === interaction.guildId && b.status === 'ativo'
    );

    const choices = activeBingos.map(([id, bingo]) => ({
      name: `${bingo.nome} (${bingo.participants.length} participantes, R$ ${bingo.valor.toFixed(2)})`,
      value: id
    }));

    if (choices.length === 0) {
      choices.push({
        name: 'Nenhum bingo ativo encontrado',
        value: 'none'
      });
    }

    await interaction.respond(choices.slice(0, 25));
  },

  async execute(interaction) {
    const bingoId = interaction.options.getString('bingo');
    const novoValor = interaction.options.getNumber('novo-valor');

    if (bingoId === 'none') {
      return interaction.reply({
        content: '❌ Não há bingo ativo neste servidor!',
        ephemeral: true
      });
    }

    const bingos = getBingos();
    const bingo = bingos[bingoId];

    if (!bingo) {
      return interaction.reply({
        content: '❌ Bingo não encontrado!',
        ephemeral: true
      });
    }

    if (bingo.guildId !== interaction.guildId) {
      return interaction.reply({
        content: '❌ Este bingo não pertence a este servidor!',
        ephemeral: true
      });
    }

    if (bingo.status !== 'ativo') {
      return interaction.reply({
        content: '❌ Este bingo não está mais ativo!',
        ephemeral: true
      });
    }

    const valorAnterior = bingo.valor;
    bingo.valor = novoValor;

    bingo.participants.forEach(participant => {
      participant.totalPaid = participant.cards.length * novoValor;
    });

    saveBingos(bingos);

    const embed = new EmbedBuilder()
      .setColor('#43B581')
      .setTitle('✅ Valor da Cartela Atualizado')
      .setDescription(`O valor da cartela foi alterado com sucesso!`)
      .addFields(
        { name: '💰 Valor Anterior', value: `R$ ${valorAnterior.toFixed(2)}`, inline: true },
        { name: '💵 Novo Valor', value: `R$ ${novoValor.toFixed(2)}`, inline: true },
        { name: '📊 Bingo', value: bingo.nome, inline: false }
      )
      .setTimestamp()
      .setFooter({ text: `Alterado por ${interaction.user.tag}` });

    await interaction.reply({ embeds: [embed] });
  }
};
