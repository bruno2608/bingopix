# 🎰 Bot de Bingo para Discord

Bot completo de gerenciamento de bingo para Discord com cartelas automáticas, sorteio de números e sistema administrativo avançado.

## 🎯 Funcionalidades

### Comandos Principais

- **`/criar-bingo`** - Cria um novo jogo de bingo
  - Define nome, quantidade de cartelas e valor por cartela
  - Gera cartelas automaticamente no formato 5x5 (1-75)

- **`/comprar-cartela`** - 🆕 Compra de cartelas com PIX
  - Fluxo interativo de compra
  - Geração automática de QR Code PIX
  - Confirmação automática de pagamento

- **`/adicionar-participante`** - Registra participantes manualmente
  - Adiciona nome e números das cartelas escolhidas
  - Valida disponibilidade das cartelas

- **`/sortear`** - Sorteia números do bingo
  - Atualiza embed em tempo real
  - Detecta vencedor automaticamente (cartela cheia)

- **`/status`** - Mostra status do bingo ativo
  - Participantes, cartelas vendidas, arrecadação
  - Números já sorteados

- **`/visualizar-cartela`** - Exibe cartela com números marcados
  - Geração visual usando Canvas
  - Mostra progresso da cartela

- **`/editar-valor`** - Altera valor das cartelas
  - Atualiza todos os participantes automaticamente

- **`/historico`** - Lista bingos finalizados
  - Paginação (10 por página)
  - Informações de vencedores e arrecadação

- **`/detalhes-bingo`** - Detalhes completos de um bingo
  - Participantes, cartelas, valores
  - Status e histórico

- **`/gerenciar-bot`** - Configurações administrativas
  - Define canal de sorteio
  - Gerencia cargos autorizados

## 🚀 Configuração

### 1. Pré-requisitos

- Node.js 20+
- Token de bot do Discord
- Client ID do bot

### 2. Instalação

```bash
npm install
```

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
DISCORD_TOKEN=seu_token_aqui
DISCORD_CLIENT_ID=seu_client_id_aqui
MERCADO_PAGO_ACCESS_TOKEN=seu_access_token_aqui
PORT=5000
```

### 4. Registrar Comandos Slash

```bash
node src/deploy-commands.js
```

### 5. Iniciar o Bot

```bash
node src/index.js
```

## 📋 Como Usar

1. **Criar um Bingo**
   ```
   /criar-bingo nome:"Bingo do Domingo" quantidade:100 valor:1.00
   ```

2. **Comprar Cartelas (Com PIX)**
   ```
   /comprar-cartela
   ```
   - Siga o fluxo interativo
   - Pague o QR Code PIX gerado
   - Aguarde confirmação automática

3. **Sortear Números**
   ```
   /sortear
   ```
   - Continue sorteando até aparecer um vencedor!

4. **Ver Status**
   ```
   /status
   ```

5. **Visualizar Cartela**
   ```
   /visualizar-cartela numero:1
   ```

## 🎨 Formato das Cartelas

- Grid 5x5 tradicional
- Números de 1-75 distribuídos por colunas:
  - B: 1-15
  - I: 16-30
  - N: 31-45 (com espaço FREE no centro)
  - G: 46-60
  - O: 61-75

## 💾 Persistência de Dados

Todos os dados são salvos em JSON:
- `data/bingos.json` - Jogos ativos
- `data/history.json` - Histórico (últimos 50 jogos)
- `data/settings.json` - Configurações por servidor

## 🔮 Próximas Funcionalidades

- [x] ~~Integração PIX para pagamentos automáticos~~ ✅ **Implementado!**
- [x] ~~Webhook para validação de pagamentos~~ ✅ **Implementado!**
- [ ] Múltiplos jogos simultâneos
- [ ] Relatórios em PDF
- [ ] Diferentes padrões de vitória (linha, coluna, diagonal)

## 🛠️ Tecnologias

- Discord.js v14
- Node.js 20
- Express (servidor webhook)
- Canvas (geração de imagens)
- Axios (cliente HTTP)
- Mercado Pago API (pagamentos PIX)
- JSON (persistência de dados)

## 📝 Licença

Este projeto foi criado para uso pessoal e comunitário.
