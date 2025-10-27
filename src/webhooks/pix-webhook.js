const express = require('express');
const router = express.Router();
const { getBingos, saveBingos } = require('../utils/dataManager');
const mercadoPago = require('../services/mercadoPago');

router.post('/pix/notification', express.json(), async (req, res) => {
  try {
    console.log('📩 Webhook Mercado Pago recebido:', JSON.stringify(req.body, null, 2));

    const { id, type, data } = req.body;

    if (type !== 'payment') {
      console.log('⚠️ Tipo de notificação ignorado:', type);
      return res.status(200).json({ message: 'Tipo de notificação não processado' });
    }

    const paymentId = data?.id || id;
    
    if (!paymentId) {
      console.error('❌ ID do pagamento não encontrado na notificação');
      return res.status(400).json({ error: 'ID do pagamento não encontrado' });
    }

    const paymentStatus = await mercadoPago.getPaymentStatus(paymentId);

    if (!mercadoPago.isPaymentApproved(paymentStatus.status)) {
      console.log(`⏳ Pagamento ${paymentId} com status: ${paymentStatus.status}`);
      return res.status(200).json({ message: 'Pagamento não aprovado ainda' });
    }

    const metadata = paymentStatus.metadata;
    const { bingoId, cardNumbers, playerName, userId } = metadata;
    
    if (!bingoId || !cardNumbers) {
      console.error('❌ Metadata incompleto:', metadata);
      return res.status(400).json({ error: 'Metadata incompleto no pagamento' });
    }
    
    const bingos = getBingos();
    const bingo = bingos[bingoId];

    if (!bingo) {
      console.error('❌ Bingo não encontrado:', bingoId);
      return res.status(404).json({ error: 'Bingo não encontrado' });
    }

    if (bingo.status !== 'ativo') {
      console.log('⚠️ Bingo não está ativo:', bingoId);
      return res.status(400).json({ error: 'Bingo não está ativo' });
    }

    const cardNumbersArray = cardNumbers
      .split(',')
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n));

    if (cardNumbersArray.length === 0) {
      return res.status(400).json({ error: 'Nenhum número de cartela válido fornecido' });
    }

    const uniqueCards = [...new Set(cardNumbersArray)];

    const takenCards = bingo.participants.flatMap(p => p.cards);
    const alreadyTaken = uniqueCards.filter(n => takenCards.includes(n));
    
    if (alreadyTaken.length > 0) {
      console.log('⚠️ Cartelas já escolhidas:', alreadyTaken);
      return res.status(400).json({ error: 'Cartelas já escolhidas', taken: alreadyTaken });
    }

    const participantExists = bingo.participants.some(p => p.paymentId === paymentId);
    if (participantExists) {
      console.log('⚠️ Pagamento já processado:', paymentId);
      return res.status(200).json({ message: 'Pagamento já processado anteriormente' });
    }

    bingo.participants.push({
      nome: playerName,
      userId: userId || null,
      cards: uniqueCards,
      totalPaid: paymentStatus.amount,
      addedAt: new Date().toISOString(),
      addedBy: 'webhook',
      paymentId: paymentId,
      paymentMethod: 'pix'
    });

    saveBingos(bingos);

    console.log('✅ Participante adicionado via webhook:', playerName, uniqueCards);

    res.status(200).json({
      success: true,
      message: 'Participante adicionado com sucesso',
      participant: playerName,
      cards: uniqueCards
    });

  } catch (error) {
    console.error('Erro no webhook PIX:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

router.get('/pix/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = router;
