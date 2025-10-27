require('dotenv').config();
const mercadoPago = require('./src/services/mercadoPago');

async function testPixPayment() {
  try {
    console.log('🧪 Testando geração de pagamento PIX...\n');
    
    const payment = await mercadoPago.createPixPayment({
      amount: 10.00,
      description: 'Teste - Compra de cartela de bingo',
      payerEmail: 'test@test.com',
      metadata: {
        bingoId: 'test123',
        cardNumbers: '1,2,3',
        playerName: 'Teste Usuario',
        userId: 'test-user-123'
      }
    });

    console.log('\n✅ SUCESSO! Pagamento PIX gerado com sucesso!\n');
    console.log('📋 Detalhes do pagamento:');
    console.log('  ID:', payment.id);
    console.log('  Status:', payment.status);
    console.log('  Valor:', `R$ ${payment.amount}`);
    console.log('  Criado em:', payment.createdAt);
    console.log('\n💰 QR Code PIX (Copia e Cola):');
    console.log(payment.qrCode);
    console.log('\n🎯 Resultado: O erro 401 foi RESOLVIDO!');
    
  } catch (error) {
    console.error('\n❌ ERRO ao gerar PIX:');
    console.error('Mensagem:', error.message);
    console.log('\n🎯 Resultado: O erro 401 AINDA EXISTE');
  }
}

testPixPayment();
