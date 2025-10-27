const axios = require('axios');

class MercadoPagoService {
  constructor() {
    this.accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;
    this.baseUrl = 'https://api.mercadopago.com/v1';
    
    if (!this.accessToken) {
      throw new Error('MERCADO_PAGO_ACCESS_TOKEN não configurado');
    }

    console.log('🔑 Mercado Pago inicializado com sucesso');
    console.log('💡 Nota: Certifique-se de usar credenciais de TESTE para desenvolvimento');
  }

  async createPixPayment({ amount, description, payerEmail, metadata }) {
    try {
      const payload = {
        transaction_amount: parseFloat(amount),
        description: description || 'Compra de cartelas de bingo',
        payment_method_id: 'pix',
        payer: {
          email: payerEmail || 'test@test.com',
          first_name: 'Test',
          last_name: 'User'
        },
        notification_url: process.env.WEBHOOK_URL,
        metadata: metadata || {}
      };

      console.log(`💳 Criando pagamento PIX - Valor: R$ ${amount}`);

      const response = await axios.post(
        `${this.baseUrl}/payments`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json',
            'X-Idempotency-Key': `${Date.now()}-${Math.random().toString(36).substring(7)}`
          }
        }
      );

      const payment = response.data;

      console.log(`✅ Pagamento PIX criado - ID: ${payment.id}, Status: ${payment.status}`);

      return {
        id: payment.id,
        status: payment.status,
        qrCode: payment.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: payment.point_of_interaction?.transaction_data?.qr_code_base64,
        ticketUrl: payment.point_of_interaction?.transaction_data?.ticket_url,
        amount: payment.transaction_amount,
        expirationDate: payment.date_of_expiration,
        createdAt: payment.date_created
      };
    } catch (error) {
      console.error('❌ Erro detalhado ao criar pagamento PIX:');
      console.error('Status:', error.response?.status);
      console.error('Data:', JSON.stringify(error.response?.data, null, 2));
      console.error('Message:', error.message);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          error.message;
      
      throw new Error(`Falha ao gerar PIX: ${errorMessage}`);
    }
  }

  async getPaymentStatus(paymentId) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/payments/${paymentId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`
          }
        }
      );

      return {
        id: response.data.id,
        status: response.data.status,
        statusDetail: response.data.status_detail,
        amount: response.data.transaction_amount,
        payerEmail: response.data.payer?.email,
        metadata: response.data.metadata
      };
    } catch (error) {
      console.error('Erro ao verificar status do pagamento:', error.response?.data || error.message);
      throw new Error(`Falha ao verificar status: ${error.response?.data?.message || error.message}`);
    }
  }

  async cancelPayment(paymentId) {
    try {
      const response = await axios.put(
        `${this.baseUrl}/payments/${paymentId}`,
        { status: 'cancelled' },
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      return {
        id: response.data.id,
        status: response.data.status
      };
    } catch (error) {
      console.error('Erro ao cancelar pagamento:', error.response?.data || error.message);
      throw new Error(`Falha ao cancelar pagamento: ${error.response?.data?.message || error.message}`);
    }
  }

  isPaymentApproved(status) {
    return status === 'approved';
  }

  isPaymentPending(status) {
    return status === 'pending' || status === 'in_process';
  }

  isPaymentRejected(status) {
    return status === 'rejected' || status === 'cancelled';
  }
}

module.exports = new MercadoPagoService();
