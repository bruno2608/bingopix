# 🎰 Configuração do Bot de Bingo PIX

## ✅ Melhorias Implementadas

### 1. **Cartelas Já Compradas**
- Agora o formulário de compra mostra todas as cartelas já compradas antes do usuário escolher
- Display inclui: total de cartelas, cartelas disponíveis e lista de cartelas já ocupadas

### 2. **Reedição Automática**
- Quando o usuário escolhe uma cartela já comprada, o sistema automaticamente reabre o formulário
- As cartelas válidas são mantidas no campo
- O usuário pode editar diretamente sem reiniciar o processo

### 3. **Correção de Credenciais do Mercado Pago**
- Configuração segura do Access Token via variáveis de ambiente
- Melhor tratamento de erros ao gerar pagamentos PIX
- Validação adequada das credenciais

### 4. **Participantes Adicionados Automaticamente**
- Após confirmação do pagamento PIX, o usuário é automaticamente adicionado como participante
- Sistema de polling verifica pagamento a cada 5 segundos
- Notificação via DM quando o pagamento é confirmado

## 🔧 Configuração das Credenciais

### 1. Token do Discord

1. Acesse https://discord.com/developers/applications
2. Selecione sua aplicação (ou crie uma nova)
3. Vá em **"Bot"** no menu lateral
4. Clique em **"Reset Token"** e copie o token gerado
5. **IMPORTANTE**: Ative as seguintes opções:
   - ✅ Presence Intent
   - ✅ Server Members Intent
   - ✅ Message Content Intent

### 2. Access Token do Mercado Pago

1. Acesse https://www.mercadopago.com.br/developers/panel
2. Vá em **"Suas credenciais"** ou **"Credentials"**
3. Escolha entre:
   - **Produção**: Para uso real (começa com `APP_USR-`)
   - **Teste**: Para testes (começa com `TEST-`)
4. Copie o **Access Token**

**⚠️ IMPORTANTE**: Se você está recebendo o erro "Unauthorized use of live credentials", certifique-se de:
- Usar o Access Token correto (não o Public Key)
- Ter a conta do Mercado Pago aprovada para produção
- Verificar se a conta tem permissões para gerar QR Codes PIX

### 3. URL do Webhook (Opcional)

Para receber notificações automáticas de pagamento do Mercado Pago:

1. Após iniciar o bot, copie a URL do seu Repl
2. Configure a variável `WEBHOOK_URL` com:
   ```
   https://SEU-REPL.replit.dev/webhook/pix/notification
   ```
3. Configure no painel do Mercado Pago em **Webhooks**

## 🚀 Como Usar

### Registrar Comandos Slash

Antes de usar o bot pela primeira vez, registre os comandos:

```bash
npm run deploy
```

### Iniciar o Bot

```bash
npm start
```

## 📋 Comandos Disponíveis

- `/criar-bingo` - Criar um novo jogo de bingo
- `/comprar-cartela` - Comprar cartelas com pagamento PIX
- `/visualizar-cartela` - Ver uma cartela específica
- `/sortear` - Sortear um número do bingo
- `/status` - Ver status do bingo atual
- `/detalhes-bingo` - Ver detalhes completos do bingo
- `/adicionar-participante` - Adicionar participante manualmente
- `/editar-valor` - Alterar valor da cartela
- `/historico` - Ver histórico de bingos
- `/gerenciar-bot` - Gerenciar configurações do bot

## 🔍 Solução de Problemas

### Erro: "An invalid token was provided"
- Verifique se o `DISCORD_TOKEN` está correto
- Gere um novo token no Discord Developer Portal
- Certifique-se de copiar o token completo

### Erro: "Unauthorized use of live credentials"
- Use o Access Token de **Produção** do Mercado Pago
- Certifique-se de que sua conta está aprovada
- Verifique se copiou o Access Token correto (não o Public Key)

### Cartelas não aparecem como compradas
- Verifique se o pagamento foi realmente aprovado
- Confira o status do pagamento no painel do Mercado Pago
- Use o botão "🔄 Verificar Pagamento" para checar manualmente

## 📊 Fluxo de Compra

1. Usuário usa `/comprar-cartela`
2. Sistema mostra cartelas disponíveis e já compradas
3. Usuário preenche nome e números das cartelas
4. Se cartela já estiver comprada, formulário reabre automaticamente
5. Usuário confirma e clica em "💳 Pagar com PIX"
6. QR Code PIX é gerado
7. Sistema verifica pagamento automaticamente
8. Após confirmação, usuário é adicionado como participante

## 🛡️ Segurança

- Tokens armazenados em variáveis de ambiente seguras
- Nunca compartilhe seu DISCORD_TOKEN ou MERCADO_PAGO_ACCESS_TOKEN
- Use tokens de teste durante desenvolvimento
- Use tokens de produção apenas em ambiente live
