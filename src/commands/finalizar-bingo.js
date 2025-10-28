const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  PermissionFlagsBits,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require('discord.js');
const { getBingos, saveBingos, getHistory, saveHistory, getSettings } = require('../utils/dataManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('finalizar-bingo')
    .setDescription('Finaliza um bingo ativo (somente administradores)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Verificar permissões
    if (!hasPermission(interaction)) {
      return interaction.reply({
        content: '❌ Você não tem permissão para usar este comando! Apenas administradores ou cargos autorizados podem finalizar bingos.',
        ephemeral: true
      });
    }

    const bingos = getBingos();
    const activeBingos = Object.entries(bingos).filter(
      ([_, bingo]) => bingo.guildId === interaction.guildId && bingo.status === 'ativo'
    );

    if (activeBingos.length === 0) {
      return interaction.reply({
        content: '❌ Não há bingos ativos neste servidor para finalizar.',
        ephemeral: true
      });
    }

    if (activeBingos.length === 1) {
      // Se há apenas um bingo ativo, mostrar confirmação direta
      await showFinalizationConfirmation(interaction, activeBingos[0][0], activeBingos[0][1]);
    } else {
      // Se há múltiplos bingos, mostrar menu de seleção
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_bingo_to_finalize')
        .setPlaceholder('🎰 Selecione o bingo que deseja finalizar')
        .addOptions(
          activeBingos.map(([id, bingo]) => ({
            label: bingo.nome,
            description: `${bingo.participants.length} participantes | ${bingo.drawnNumbers.length} números sorteados`,
            value: id
          }))
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);

      const embed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('⚠️ Finalizar Bingo')
        .setDescription('Selecione o bingo que deseja finalizar:')
        .addFields({
          name: '📋 Bingos Ativos',
          value: activeBingos.map(([_, b]) => `• **${b.nome}** - ${b.participants.length} participantes`).join('\n'),
          inline: false
        })
        .setFooter({ text: 'Selecione um bingo no menu abaixo' })
        .setTimestamp();

      await interaction.reply({
        embeds: [embed],
        components: [row],
        ephemeral: true
      });
    }
  }
};

function hasPermission(interaction) {
  // Verifica se tem permissão de administrador
  if (interaction.memberPermissions && interaction.memberPermissions.has(PermissionFlagsBits.Administrator)) {
    return true;
  }

  // Verifica se tem um dos cargos autorizados
  const settings = getSettings(interaction.guildId);
  if (settings.adminRoles && settings.adminRoles.length > 0) {
    const memberRoles = interaction.member.roles.cache.map(r => r.id);
    return settings.adminRoles.some(roleId => memberRoles.includes(roleId));
  }

  return false;
}

async function showFinalizationConfirmation(interaction, bingoId, bingo) {
  const embed = new EmbedBuilder()
    .setColor('#FFA500')
    .setTitle('⚠️ Confirmação de Finalização')
    .setDescription(`Você está prestes a finalizar o bingo **${bingo.nome}**.`)
    .addFields(
      { name: '🎫 Total de Cartelas', value: `${bingo.quantidade}`, inline: true },
      { name: '👥 Participantes', value: `${bingo.participants.length}`, inline: true },
      { name: '🔢 Números Sorteados', value: `${bingo.drawnNumbers.length}`, inline: true },
      { name: '💰 Valor por Cartela', value: `R$ ${bingo.valor.toFixed(2)}`, inline: true },
      { name: '💵 Total Arrecadado', value: `R$ ${(bingo.participants.reduce((sum, p) => sum + (p.totalPaid || 0), 0)).toFixed(2)}`, inline: true },
      { name: '🏆 Vencedor', value: bingo.winner ? `<@${bingo.winner.userId}>` : 'Nenhum', inline: true },
      { name: '\u200b', value: '\u200b', inline: false },
      { name: '⚠️ Atenção', value: 'Ao finalizar o bingo:\n• Ele será movido para o histórico\n• Não será possível sortear mais números\n• Não será possível adicionar participantes\n• Esta ação **NÃO** pode ser desfeita', inline: false }
    )
    .setFooter({ text: `ID: ${bingoId}` })
    .setTimestamp();

  const confirmButton = new ButtonBuilder()
    .setCustomId(`confirm_finalize:${bingoId}`)
    .setLabel('✅ Confirmar Finalização')
    .setStyle(ButtonStyle.Danger);

  const cancelButton = new ButtonBuilder()
    .setCustomId('cancel_finalize')
    .setLabel('❌ Cancelar')
    .setStyle(ButtonStyle.Secondary);

  const row = new ActionRowBuilder().addComponents(confirmButton, cancelButton);

  if (interaction.replied || interaction.deferred) {
    await interaction.editReply({
      embeds: [embed],
      components: [row]
    });
  } else {
    await interaction.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });
  }
}

async function finalizeBingo(interaction, bingoId) {
  // Verificar permissões novamente
  if (!hasPermission(interaction)) {
    return interaction.update({
      content: '❌ Você não tem permissão para finalizar bingos!',
      embeds: [],
      components: []
    });
  }

  await interaction.deferUpdate();

  const bingos = getBingos();
  const bingo = bingos[bingoId];

  if (!bingo) {
    return interaction.editReply({
      content: '❌ Bingo não encontrado!',
      embeds: [],
      components: []
    });
  }

  if (bingo.status !== 'ativo') {
    return interaction.editReply({
      content: '❌ Este bingo já foi finalizado!',
      embeds: [],
      components: []
    });
  }

  // Atualizar status do bingo
  bingo.status = 'finalizado';
  bingo.finishedAt = new Date().toISOString();
  bingo.finishedBy = interaction.user.id;

  // Salvar no histórico
  const history = getHistory();
  if (!history.games) {
    history.games = [];
  }
  
  history.games.unshift({
    ...bingo,
    finalizedAt: new Date().toISOString(),
    finalizedBy: interaction.user.id
  });

  // Manter apenas os últimos 50 jogos no histórico
  if (history.games.length > 50) {
    history.games = history.games.slice(0, 50);
  }

  saveHistory(history);

  // Remover do bingos ativos
  delete bingos[bingoId];
  saveBingos(bingos);

  // Calcular estatísticas
  const totalArrecadado = bingo.participants.reduce((sum, p) => sum + (p.totalPaid || 0), 0);
  const cartelasVendidas = bingo.participants.reduce((sum, p) => sum + p.cards.length, 0);

  const embed = new EmbedBuilder()
    .setColor('#43B581')
    .setTitle('✅ Bingo Finalizado com Sucesso!')
    .setDescription(`O bingo **${bingo.nome}** foi finalizado e movido para o histórico.`)
    .addFields(
      { name: '📊 Estatísticas Finais', value: '\u200b', inline: false },
      { name: '🎫 Cartelas Vendidas', value: `${cartelasVendidas}/${bingo.quantidade}`, inline: true },
      { name: '👥 Total de Participantes', value: `${bingo.participants.length}`, inline: true },
      { name: '🔢 Números Sorteados', value: `${bingo.drawnNumbers.length}/75`, inline: true },
      { name: '💵 Total Arrecadado', value: `R$ ${totalArrecadado.toFixed(2)}`, inline: true },
      { name: '🏆 Vencedor', value: bingo.winner ? `<@${bingo.winner.userId}>\nCartela: ${bingo.winner.cardNumber}` : 'Nenhum vencedor', inline: true },
      { name: '\u200b', value: '\u200b', inline: true },
      { name: '📅 Duração', value: `Criado em: ${new Date(bingo.createdAt).toLocaleDateString('pt-BR')}\nFinalizado em: ${new Date().toLocaleDateString('pt-BR')}`, inline: false },
      { name: '📋 Como Consultar', value: `Use \`/historico\` para ver todos os bingos finalizados\nUse \`/detalhes-bingo id:${bingoId}\` para ver detalhes completos`, inline: false }
    )
    .setFooter({ text: `Finalizado por ${interaction.user.tag}` })
    .setTimestamp();

  await interaction.editReply({
    content: null,
    embeds: [embed],
    components: []
  });

  // Tentar enviar notificação no canal do servidor
  try {
    const channel = interaction.channel;
    if (channel) {
      const publicEmbed = new EmbedBuilder()
        .setColor('#e74c3c')
        .setTitle('🎰 Bingo Finalizado')
        .setDescription(`O bingo **${bingo.nome}** foi finalizado!`)
        .addFields(
          { name: '👥 Participantes', value: `${bingo.participants.length}`, inline: true },
          { name: '🏆 Vencedor', value: bingo.winner ? `<@${bingo.winner.userId}>` : 'Sem vencedor', inline: true },
          { name: '💵 Total Arrecadado', value: `R$ ${totalArrecadado.toFixed(2)}`, inline: true }
        )
        .setFooter({ text: 'Obrigado a todos que participaram!' })
        .setTimestamp();

      await channel.send({ embeds: [publicEmbed] });
    }
  } catch (error) {
    console.error('Erro ao enviar notificação pública:', error);
  }
}

async function handleCancelFinalize(interaction) {
  await interaction.update({
    content: '❌ Finalização cancelada. O bingo continua ativo.',
    embeds: [],
    components: []
  });
}

module.exports.handleInteraction = async function(interaction) {
  // Menu de seleção de bingo
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_bingo_to_finalize') {
    if (!hasPermission(interaction)) {
      return interaction.update({
        content: '❌ Você não tem permissão para finalizar bingos!',
        embeds: [],
        components: []
      });
    }

    const bingoId = interaction.values[0];
    const bingos = getBingos();
    const bingo = bingos[bingoId];

    if (!bingo) {
      return interaction.update({
        content: '❌ Bingo não encontrado!',
        embeds: [],
        components: []
      });
    }

    await interaction.deferUpdate();
    await showFinalizationConfirmation(interaction, bingoId, bingo);
    return;
  }

  // Botões de ação
  if (interaction.isButton()) {
    const [action, ...params] = interaction.customId.split(':');

    switch (action) {
      case 'confirm_finalize':
        await finalizeBingo(interaction, params[0]);
        break;
      case 'cancel_finalize':
        await handleCancelFinalize(interaction);
        break;
    }
  }
};
