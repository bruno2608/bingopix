# Discord Bingo Bot

## Visão Geral

Bot completo de gerenciamento de bingo para Discord desenvolvido em Node.js com Discord.js v14. O bot permite criar jogos de bingo com cartelas automáticas, gerenciar participantes, sortear números e detectar vencedores automaticamente.

## Estado Atual do Projeto

**Status:** ✅ MVP Funcional - Bot conectado e operacional

**Data da última atualização:** 27 de outubro de 2025

### Funcionalidades Implementadas

- ✅ Sistema de geração automática de cartelas 5x5 (números 1-75)
- ✅ Comando `/criar-bingo` - Criar novos jogos com nome, quantidade e valor
- ✅ Comando `/adicionar-participante` - Registrar participantes e cartelas
- ✅ Comando `/comprar-cartela` - **NOVO!** Compra de cartelas com pagamento PIX
- ✅ Comando `/sortear` - Sortear números com atualização de embed em tempo real
- ✅ Comando `/status` - Visualizar status completo do jogo
- ✅ Comando `/visualizar-cartela` - Ver cartela com números marcados (Canvas)
- ✅ Comando `/editar-valor` - Alterar valor das cartelas
- ✅ Comando `/historico` - Listar jogos finalizados
- ✅ Comando `/detalhes-bingo` - Ver detalhes completos de um jogo
- ✅ Comando `/gerenciar-bot` - Configurações administrativas
- ✅ Detecção automática de cartela cheia vencedora
- ✅ Sistema de persistência em JSON
- ✅ Geração visual de cartelas com Canvas
- ✅ **Integração completa com Mercado Pago**
- ✅ **Geração de QR Code PIX automático**
- ✅ **Webhook para notificações de pagamento**
- ✅ **Verificação automática de status de pagamento**
- ✅ **Confirmação automática após pagamento aprovado**

### Em Desenvolvimento / Próximas Etapas

- 🔄 Múltiplos jogos simultâneos em diferentes canais
- 🔄 Diferentes padrões de vitória (linha, coluna, diagonal)
- 🔄 Exportação de relatórios em PDF
- 🔄 Sistema de notificações de lembrete antes do sorteio
- 🔄 Painel administrativo web para gestão

## Arquitetura do Projeto

```
.
├── src/
│   ├── index.js                 # Entrada principal (Bot + Servidor Express)
│   ├── config.json             # Configurações do sistema
│   ├── deploy-commands.js      # Registro de comandos slash
│   ├── commands/               # Comandos do bot
│   │   ├── criar-bingo.js
│   │   ├── adicionar-participante.js
│   │   ├── comprar-cartela.js  # NOVO! Compra com PIX
│   │   ├── sortear.js
│   │   ├── status.js
│   │   ├── visualizar-cartela.js
│   │   ├── editar-valor.js
│   │   ├── historico.js
│   │   ├── detalhes-bingo.js
│   │   └── gerenciar-bot.js
│   ├── services/               # Serviços externos
│   │   └── mercadoPago.js      # NOVO! Integração Mercado Pago
│   ├── utils/                  # Utilitários
│   │   ├── dataManager.js      # Gerenciamento de dados JSON
│   │   ├── bingoCard.js        # Lógica de cartelas e vitórias
│   │   └── canvasGenerator.js  # Geração de imagens de cartelas
│   └── webhooks/               # Endpoints de webhook
│       └── pix-webhook.js      # ATUALIZADO! Webhook Mercado Pago
├── data/                       # Dados persistidos (JSON)
│   ├── bingos.json            # Jogos ativos
│   ├── history.json           # Histórico de jogos
│   └── settings.json          # Configurações por servidor
├── package.json
└── README.md
```

## Tecnologias Utilizadas

- **Node.js 20** - Runtime JavaScript
- **Discord.js v14** - Biblioteca para interação com Discord
- **Canvas** - Geração de imagens de cartelas
- **Express** - Servidor para webhooks PIX
- **Axios** - Cliente HTTP para API do Mercado Pago
- **Mercado Pago API** - Processamento de pagamentos PIX
- **dotenv** - Gerenciamento de variáveis de ambiente
- **JSON** - Persistência de dados local

## Variáveis de Ambiente

```
DISCORD_TOKEN=<token_do_bot>
DISCORD_CLIENT_ID=<id_da_aplicacao>
MERCADO_PAGO_ACCESS_TOKEN=<access_token_mercado_pago>
PORT=5000 (porta do servidor webhook)
WEBHOOK_URL=<url_publica_para_webhook> (opcional)
```

## Como Usar

### 1. Criar um Bingo
```
/criar-bingo nome:"Bingo do Domingo" quantidade:100 valor:1.00
```

### 2. Comprar Cartelas (Com PIX)
```
/comprar-cartela
```
Siga o fluxo interativo:
1. Selecione o bingo ativo
2. Preencha seu nome e números de cartelas desejadas
3. Revise o resumo da compra
4. Clique em "Pagar com PIX" para gerar o QR Code
5. Pague e aguarde a confirmação automática

### 3. Adicionar Participantes (Manual)
```
/adicionar-participante nome:"João Silva" cartelas:"1,5,10"
```

### 4. Sortear Números
```
/sortear
```
Continue sorteando até detectar um vencedor automaticamente!

### 5. Verificar Status
```
/status
```

### 6. Visualizar Cartela
```
/visualizar-cartela numero:5
```

## Formato das Cartelas

- Grid 5x5 tradicional de bingo
- Números distribuídos por coluna:
  - **B:** 1-15
  - **I:** 16-30
  - **N:** 31-45 (com "FREE" no centro)
  - **G:** 46-60
  - **O:** 61-75
- Cada cartela é única e gerada aleatoriamente

## Persistência de Dados

Todos os dados são armazenados em arquivos JSON na pasta `data/`:

- **bingos.json** - Jogos ativos atualmente
- **history.json** - Histórico dos últimos 50 jogos finalizados
- **settings.json** - Configurações por servidor Discord

## Decisões Arquiteturais

### Por que JSON ao invés de Banco de Dados?

Para o MVP, JSON oferece:
- Simplicidade de implementação
- Zero dependências externas
- Backup e rollback integrados ao Replit
- Suficiente para volumes pequenos/médios

**Migração futura:** Para produção em larga escala, considerar PostgreSQL do Replit.

### Geração de Cartelas

Implementado algoritmo que garante:
- Distribuição correta por colunas (ranges específicos)
- Randomização dentro de cada coluna
- Espaço "FREE" fixo no centro
- Números únicos por cartela

### Detecção de Vencedor

Atualmente implementado para **cartela cheia** (todos os 24 números + FREE marcados).

**Futuro:** Sistema modular para diferentes padrões (linha, coluna, diagonal, quatro cantos).

## Integração PIX com Mercado Pago

### Fluxo Completo Implementado

1. **Usuário executa `/comprar-cartela`**
   - Sistema lista bingos ativos
   - Modal interativo coleta nome e números de cartelas
   - Validação de disponibilidade em tempo real

2. **Revisão e Confirmação**
   - Embed mostra resumo completo da compra
   - Botões: "Pagar com PIX", "Editar Informações", "Cancelar"

3. **Geração do PIX**
   - API do Mercado Pago cria pagamento
   - QR Code gerado automaticamente (imagem base64)
   - Código PIX Copia e Cola fornecido
   - Polling automático a cada 5 segundos

4. **Confirmação Automática**
   - Webhook recebe notificação do Mercado Pago
   - Valida status do pagamento
   - Adiciona participante automaticamente
   - Envia confirmação via DM

### Endpoints da API

**Webhook PIX:** `POST /webhook/pix/notification`
- Recebe notificações do Mercado Pago
- Valida status do pagamento
- Adiciona participante ao bingo

**Health Check:** `GET /health`
- Verifica status do bot e servidor

**Info API:** `GET /`
- Informações gerais da API

### Configuração do Webhook no Mercado Pago

Para receber notificações automáticas de pagamento, configure a URL do webhook no painel do Mercado Pago:

```
https://seu-dominio.replit.app/webhook/pix/notification
```

**Nota:** O sistema também verifica pagamentos via polling (a cada 5s) como fallback.

## Preferências do Usuário

- **Idioma:** Português (Brasil)
- **Formato de moeda:** Real brasileiro (R$)
- **Padrão de vitória inicial:** Cartela cheia
- **Valor padrão:** R$ 1,00 por cartela
- **Quantidade padrão:** 100 cartelas

## Comandos de Desenvolvimento

```bash
# Registrar comandos no Discord
npm run deploy

# Iniciar o bot
npm start

# Modo desenvolvimento
npm run dev
```

## Notas Importantes

- O bot requer permissões de "applications.commands" no servidor Discord
- Comandos slash levam até 1 hora para propagar globalmente
- Para testes imediatos, use comandos de guild (servidor específico)
- Canvas requer dependências do sistema (libuuid) - já configurado no Replit

## Mudanças Recentes

**27/10/2025 - Bot em PRODUÇÃO 🚀:**
- ✅ **Credenciais de PRODUÇÃO do Mercado Pago configuradas**
- ✅ **Bot rodando em modo produção (BingoPix#0870)**
- ✅ Dependência libuuid instalada para Canvas
- ✅ 10 comandos slash registrados e operacionais
- ✅ Servidor webhook rodando na porta 5000
- ✅ Webhook URL dinâmico configurado automaticamente
- ✅ Logs atualizados para indicar modo PRODUÇÃO
- 📋 **Próximos passos recomendados:**
  1. Registrar webhook URL no dashboard do Mercado Pago
  2. Realizar teste end-to-end de pagamento PIX
  3. Monitorar logs após testes de produção

**27/10/2025 - Correção do Erro 401 Mercado Pago:**
- ✅ Melhorias no serviço MercadoPago com logs detalhados de erro
- ✅ Configuração automática da WEBHOOK_URL usando REPLIT_DOMAINS
- ✅ Adicionada validação de ambiente e tratamento de erros específicos
- ✅ Instalação da dependência libuuid para Canvas
- ✅ Criados scripts de teste (test-pix.js, verify-credentials.js)
- ✅ Documentação completa de solução (SOLUCAO_ERRO_401.md)

**27/10/2025 - Atualização 2:**
- ✅ **Integração completa com Mercado Pago implementada**
- ✅ Comando `/comprar-cartela` com fluxo interativo completo
- ✅ Geração automática de QR Code PIX
- ✅ Sistema de verificação de pagamento (polling + webhook)
- ✅ Confirmação automática após pagamento aprovado
- ✅ Servidor Express integrado ao bot (porta 5000)
- ✅ Webhook PIX atualizado para formato Mercado Pago
- ✅ 10 comandos slash registrados e operacionais
- ✅ Bot conectado e operacional (BingoPix#0870)

**27/10/2025 - Atualização 1:**
- ✅ Implementação completa do MVP
- ✅ Todos os 9 comandos slash funcionais
- ✅ Sistema de cartelas com visualização gráfica
- ✅ Detecção automática de vencedores
- ✅ Estrutura de webhook PIX preparada

## Modo de Operação

**Status:** 🚀 **PRODUÇÃO ATIVA**

O bot está configurado com credenciais reais do Mercado Pago e Discord. Todos os pagamentos PIX processados serão transações reais.

### Webhook URL Atual

```
https://e008534e-f3ea-4725-a0f3-4a58f33c738c-00-ptntfwdyfavg.spock.replit.dev/webhook/pix/notification
```

**Importante:** Registre esta URL no dashboard do Mercado Pago para receber notificações automáticas de pagamento.
