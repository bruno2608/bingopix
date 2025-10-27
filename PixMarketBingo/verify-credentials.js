require('dotenv').config();
const axios = require('axios');

async function verifyCredentials() {
  const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  
  console.log('🔍 Verificando credenciais do Mercado Pago...\n');
  
  if (!token) {
    console.error('❌ MERCADO_PAGO_ACCESS_TOKEN não configurado!');
    console.log('\n💡 Configure a secret no Replit antes de testar.');
    return;
  }
  
  console.log('Token (primeiros 20 caracteres):', token.substring(0, 20) + '...');
  console.log('Tamanho do token:', token.length);
  
  try {
    const response = await axios.get('https://api.mercadopago.com/v1/payment_methods', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('\n✅ Token válido! A API respondeu com sucesso.');
    console.log('Métodos de pagamento disponíveis:', response.data.length);
    
    const pixMethod = response.data.find(m => m.id === 'pix');
    if (pixMethod) {
      console.log('\n💰 PIX está disponível!');
      console.log('Status:', pixMethod.status);
      console.log('Modo de teste:', pixMethod.settings?.test_mode);
    }
    
  } catch (error) {
    console.error('\n❌ Erro ao verificar credenciais:');
    console.error('Status:', error.response?.status);
    console.error('Erro:', error.response?.data?.error);
    console.error('Mensagem:', error.response?.data?.message);
    
    if (error.response?.data?.cause) {
      console.error('Causa:', error.response.data.cause);
    }
  }
  
  console.log('\n💡 SOLUÇÃO:');
  console.log('1. Acesse: https://www.mercadopago.com.br/developers/panel');
  console.log('2. Vá em "Suas integrações" → Selecione sua aplicação');
  console.log('3. No menu lateral, vá em: TESTES > Credenciais de teste');
  console.log('4. Copie o "Access Token" de TESTE (não de produção)');
  console.log('5. Certifique-se de que está na seção TESTES, não PRODUÇÃO');
  console.log('\n⚠️  IMPORTANTE: O token de TESTE deve vir da seção "TESTES", não "PRODUÇÃO"');
}

verifyCredentials();
