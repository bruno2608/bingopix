const { 
  SlashCommandBuilder, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  StringSelectMenuBuilder
} = require('discord.js');
const { getBingos, saveBingos } = require('../utils/dataManager');
const mercadoPago = require('../services/mercadoPago');

const pendingPurchases = new Map();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('comprar-cartela')
    .setDescription('Comprar cartelas de bingo com pagamento PIX'),

  async execute(interaction) {
    const bingos = getBingos();
    const activeBingos = Object.entries(bingos).filter(
      ([_, bingo]) => bingo.guildId === interaction.guildId && bingo.status === 'ativo'
    );

    if (activeBingos.length === 0) {
      return interaction.reply({
        content: '❌ Não há bingos ativos no momento! Use `/criar-bingo` para criar um novo jogo.',
        ephemeral: true
      });
    }

    if (activeBingos.length === 1) {
      await showPurchaseForm(interaction, activeBingos[0][0]);
    } else {
      const selectMenu = new StringSelectMenuBuilder()
        .setCustomId('select_bingo')
        .setPlaceholder('Selecione o bingo')
        .addOptions(
          activeBingos.map(([id, bingo]) => ({
            label: bingo.nome,
            description: `R$ ${bingo.valor.toFixed(2)} por cartela - ${bingo.participants.length} participantes`,
            value: id
          }))
        );

      const row = new ActionRowBuilder().addComponents(selectMenu);

      await interaction.reply({
        content: '🎰 Selecione o bingo que deseja participar:',
        components: [row],
        ephemeral: true
      });
    }
  }
};

async function showPurchaseForm(interaction, bingoId) {
  const modal = new ModalBuilder()
    .setCustomId(`purchase_form:${bingoId}`)
    .setTitle('Comprar Cartelas de Bingo');

  const nameInput = new TextInputBuilder()
    .setCustomId('player_name')
    .setLabel('Seu nome completo')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: João Silva')
    .setRequired(true)
    .setMaxLength(100);

  const cardsInput = new TextInputBuilder()
    .setCustomId('card_numbers')
    .setLabel('Números das cartelas (separados por vírgula)')
    .setStyle(TextInputStyle.Short)
    .setPlaceholder('Ex: 1,2,10')
    .setRequired(true)
    .setMaxLength(200);

  const firstRow = new ActionRowBuilder().addComponents(nameInput);
  const secondRow = new ActionRowBuilder().addComponents(cardsInput);

  modal.addComponents(firstRow, secondRow);

  if (interaction.replied || interaction.deferred) {
    await interaction.followUp({ content: 'Aguarde...', ephemeral: true });
  }
  
  await interaction.showModal(modal);
}

async function handlePurchaseSubmit(interaction, bingoId) {
  await interaction.deferReply({ ephemeral: true });

  const playerName = interaction.fields.getTextInputValue('player_name');
  const cardNumbersInput = interaction.fields.getTextInputValue('card_numbers');

  const cardNumbers = cardNumbersInput
    .split(',')
    .map(n => parseInt(n.trim()))
    .filter(n => !isNaN(n));

  if (cardNumbers.length === 0) {
    return interaction.editReply({
      content: '❌ Nenhum número de cartela válido fornecido! Use números separados por vírgula (ex: 1,2,10).',
      ephemeral: true
    });
  }

  const uniqueCards = [...new Set(cardNumbers)];

  const bingos = getBingos();
  const bingo = bingos[bingoId];

  if (!bingo || bingo.status !== 'ativo') {
    return interaction.editReply({
      content: '❌ Bingo não encontrado ou não está mais ativo!',
      ephemeral: true
    });
  }

  const invalidCards = uniqueCards.filter(n => n < 1 || n > bingo.quantidade);
  if (invalidCards.length > 0) {
    return interaction.editReply({
      content: `❌ Cartelas inválidas: ${invalidCards.join(', ')}. Use números entre 1 e ${bingo.quantidade}.`,
      ephemeral: true
    });
  }

  const takenCards = bingo.participants.flatMap(p => p.cards);
  const alreadyTaken = uniqueCards.filter(n => takenCards.includes(n));

  if (alreadyTaken.length > 0) {
    return interaction.editReply({
      content: `❌ As seguintes cartelas já foram escolhidas: ${alreadyTaken.join(', ')}. Por favor, escolha outras.`,
      ephemeral: true
    });
  }

  const totalAmount = uniqueCards.length * bingo.valor;

  const purchaseId = `${interaction.user.id}-${Date.now()}`;
  pendingPurchases.set(purchaseId, {
    bingoId,
    playerName,
    cardNumbers: uniqueCards,
    totalAmount,
    userId: interaction.user.id,
    createdAt: Date.now()
  });

  const embed = new EmbedBuilder()
    .setColor('#FFA500')
    .setTitle('📋 Resumo da Compra')
    .setDescription(`**Bingo:** ${bingo.nome}`)
    .addFields(
      { name: '👤 Nome', value: playerName, inline: true },
      { name: '🎫 Cartelas', value: uniqueCards.join(', '), inline: true },
      { name: '💰 Valor por Cartela', value: `R$ ${bingo.valor.toFixed(2)}`, inline: true },
      { name: '🔢 Quantidade', value: `${uniqueCards.length} cartela(s)`, inline: true },
      { name: '💵 Total a Pagar', value: `**R$ ${totalAmount.toFixed(2)}**`, inline: true },
      { name: '\u200b', value: '\u200b', inline: true }
    )
    .setFooter({ text: 'Revise as informações antes de prosseguir' })
    .setTimestamp();

  const payButton = new ButtonBuilder()
    .setCustomId(`pay:${purchaseId}`)
    .setLabel('💳 Pagar com PIX')
    .setStyle(ButtonStyle.Success);

  const editButton = new ButtonBuilder()
    .setCustomId(`edit:${purchaseId}:${bingoId}`)
    .setLabel('✏️ Editar Informações')
    .setStyle(ButtonStyle.Primary);

  const cancelButton = new ButtonBuilder()
    .setCustomId(`cancel:${purchaseId}`)
    .setLabel('❌ Cancelar')
    .setStyle(ButtonStyle.Danger);

  const row = new ActionRowBuilder().addComponents(payButton, editButton, cancelButton);

  await interaction.editReply({
    embeds: [embed],
    components: [row],
    ephemeral: true
  });

  setTimeout(() => {
    if (pendingPurchases.has(purchaseId)) {
      pendingPurchases.delete(purchaseId);
    }
  }, 600000);
}

async function handlePayButton(interaction, purchaseId) {
  const purchase = pendingPurchases.get(purchaseId);

  if (!purchase) {
    return interaction.reply({
      content: '❌ Compra expirada ou inválida! Por favor, inicie o processo novamente.',
      ephemeral: true
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const bingos = getBingos();
    const bingo = bingos[purchase.bingoId];

    const payment = await mercadoPago.createPixPayment({
      amount: purchase.totalAmount,
      description: `${bingo.nome} - Cartelas: ${purchase.cardNumbers.join(', ')}`,
      payerEmail: 'noreply@bingopix.com',
      metadata: {
        bingoId: purchase.bingoId,
        cardNumbers: purchase.cardNumbers.join(','),
        playerName: purchase.playerName,
        userId: purchase.userId
      }
    });

    pendingPurchases.set(purchaseId, {
      ...purchase,
      paymentId: payment.id,
      qrCode: payment.qrCode,
      qrCodeBase64: payment.qrCodeBase64
    });

    const embed = new EmbedBuilder()
      .setColor('#00FF00')
      .setTitle('💳 Pagamento PIX Gerado')
      .setDescription('Escaneie o QR Code abaixo ou copie o código PIX para pagar')
      .addFields(
        { name: '💵 Valor', value: `R$ ${purchase.totalAmount.toFixed(2)}`, inline: true },
        { name: '🎫 Cartelas', value: purchase.cardNumbers.join(', '), inline: true },
        { name: '\u200b', value: '\u200b', inline: true },
        { name: '📋 Código PIX (Copia e Cola)', value: `\`\`\`${payment.qrCode}\`\`\``, inline: false }
      )
      .setImage(`data:image/png;base64,${payment.qrCodeBase64}`)
      .setFooter({ text: `ID do Pagamento: ${payment.id}` })
      .setTimestamp();

    const checkButton = new ButtonBuilder()
      .setCustomId(`check_payment:${purchaseId}`)
      .setLabel('🔄 Verificar Pagamento')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(checkButton);

    await interaction.editReply({
      content: '✅ QR Code PIX gerado com sucesso!',
      embeds: [embed],
      components: [row],
      ephemeral: true
    });

    startPaymentPolling(purchaseId, interaction);

  } catch (error) {
    console.error('Erro ao gerar PIX:', error);
    await interaction.editReply({
      content: `❌ Erro ao gerar pagamento PIX: ${error.message}`,
      ephemeral: true
    });
  }
}

async function handleEditButton(interaction, purchaseId, bingoId) {
  await showPurchaseForm(interaction, bingoId);
  pendingPurchases.delete(purchaseId);
}

async function handleCancelButton(interaction, purchaseId) {
  pendingPurchases.delete(purchaseId);
  
  await interaction.update({
    content: '❌ Compra cancelada com sucesso.',
    embeds: [],
    components: [],
    ephemeral: true
  });
}

async function handleCheckPayment(interaction, purchaseId) {
  const purchase = pendingPurchases.get(purchaseId);

  if (!purchase || !purchase.paymentId) {
    return interaction.reply({
      content: '❌ Pagamento não encontrado!',
      ephemeral: true
    });
  }

  await interaction.deferReply({ ephemeral: true });

  try {
    const paymentStatus = await mercadoPago.getPaymentStatus(purchase.paymentId);

    if (mercadoPago.isPaymentApproved(paymentStatus.status)) {
      await confirmPayment(interaction, purchase);
    } else if (mercadoPago.isPaymentPending(paymentStatus.status)) {
      await interaction.editReply({
        content: '⏳ Pagamento ainda não foi confirmado. Aguarde alguns instantes e tente novamente.',
        ephemeral: true
      });
    } else {
      await interaction.editReply({
        content: `❌ Status do pagamento: ${paymentStatus.status}. Entre em contato se houver algum problema.`,
        ephemeral: true
      });
    }
  } catch (error) {
    console.error('Erro ao verificar pagamento:', error);
    await interaction.editReply({
      content: '❌ Erro ao verificar status do pagamento. Tente novamente em alguns instantes.',
      ephemeral: true
    });
  }
}

async function confirmPayment(interaction, purchase) {
  const bingos = getBingos();
  const bingo = bingos[purchase.bingoId];

  if (!bingo) {
    return interaction.editReply({
      content: '❌ Bingo não encontrado!',
      ephemeral: true
    });
  }

  bingo.participants.push({
    nome: purchase.playerName,
    userId: purchase.userId,
    cards: purchase.cardNumbers,
    totalPaid: purchase.totalAmount,
    addedAt: new Date().toISOString(),
    addedBy: 'compra_automatica',
    paymentId: purchase.paymentId,
    paymentMethod: 'pix'
  });

  saveBingos(bingos);
  pendingPurchases.delete(`${purchase.userId}-${purchase.createdAt}`);

  const embed = new EmbedBuilder()
    .setColor('#00FF00')
    .setTitle('✅ Pagamento Confirmado!')
    .setDescription('Suas cartelas foram adicionadas com sucesso!')
    .addFields(
      { name: '🎫 Cartelas Adquiridas', value: purchase.cardNumbers.join(', '), inline: false },
      { name: '📋 Como Visualizar', value: `Use \`/visualizar-cartela numero:[NÚMERO]\` para ver cada cartela.\n\nExemplo: \`/visualizar-cartela numero:${purchase.cardNumbers[0]}\``, inline: false }
    )
    .setFooter({ text: 'Boa sorte no bingo!' })
    .setTimestamp();

  await interaction.editReply({
    content: null,
    embeds: [embed],
    components: [],
    ephemeral: true
  });

  try {
    const user = await interaction.client.users.fetch(purchase.userId);
    await user.send({ embeds: [embed] });
  } catch (error) {
    console.error('Não foi possível enviar DM para o usuário:', error);
  }
}

function startPaymentPolling(purchaseId, interaction) {
  let attempts = 0;
  const maxAttempts = 60;

  const interval = setInterval(async () => {
    attempts++;

    const purchase = pendingPurchases.get(purchaseId);
    if (!purchase || !purchase.paymentId || attempts >= maxAttempts) {
      clearInterval(interval);
      return;
    }

    try {
      const paymentStatus = await mercadoPago.getPaymentStatus(purchase.paymentId);

      if (mercadoPago.isPaymentApproved(paymentStatus.status)) {
        clearInterval(interval);
        await confirmPayment(interaction, purchase);
      } else if (mercadoPago.isPaymentRejected(paymentStatus.status)) {
        clearInterval(interval);
      }
    } catch (error) {
      console.error('Erro no polling de pagamento:', error);
    }
  }, 5000);
}

module.exports.handleInteraction = async function(interaction) {
  if (interaction.isStringSelectMenu() && interaction.customId === 'select_bingo') {
    const bingoId = interaction.values[0];
    await showPurchaseForm(interaction, bingoId);
    return;
  }

  if (interaction.isModalSubmit() && interaction.customId.startsWith('purchase_form:')) {
    const bingoId = interaction.customId.split(':')[1];
    await handlePurchaseSubmit(interaction, bingoId);
    return;
  }

  if (interaction.isButton()) {
    const [action, ...params] = interaction.customId.split(':');

    switch (action) {
      case 'pay':
        await handlePayButton(interaction, params[0]);
        break;
      case 'edit':
        await handleEditButton(interaction, params[0], params[1]);
        break;
      case 'cancel':
        await handleCancelButton(interaction, params[0]);
        break;
      case 'check_payment':
        await handleCheckPayment(interaction, params[0]);
        break;
    }
  }
};
