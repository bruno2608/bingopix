# 🎰 Guia Rápido - Bot de Bingo Discord

## 🚀 Como Começar

### 1. Comandos Essenciais

#### Criar um Novo Bingo
```
/criar-bingo nome:"Bingo do Domingo" quantidade:100 valor:1.00
```
- **nome**: Nome do evento
- **quantidade**: Número total de cartelas disponíveis (1-500)
- **valor**: Preço de cada cartela em R$

#### Adicionar Participantes
```
/adicionar-participante nome:"João Silva" cartelas:"1,5,10,25"
```
- **nome**: Nome do participante
- **cartelas**: Números das cartelas separados por vírgula
- ⚠️ Não pode repetir números!

#### Sortear Números
```
/sortear
```
- Sorteia um número aleatório de 1 a 75
- Atualiza o embed automaticamente
- Detecta vencedor quando alguém completar a cartela
- Continue sorteando até aparecer o vencedor!

### 2. Comandos de Consulta

#### Ver Status do Jogo
```
/status
```
Mostra:
- Participantes registrados
- Cartelas vendidas
- Números já sorteados
- Arrecadação total

#### Visualizar uma Cartela
```
/visualizar-cartela numero:5
```
- Gera imagem da cartela
- Mostra números já marcados em verde
- Exibe progresso (quantos números faltam)

#### Ver Histórico
```
/historico
```
- Lista últimos jogos finalizados
- Mostra vencedores e arrecadação

### 3. Comandos Administrativos

#### Alterar Valor da Cartela
```
/editar-valor novo-valor:2.00
```
- Altera o preço das cartelas do bingo ativo
- Recalcula o total de todos os participantes

#### Gerenciar Configurações
```
/gerenciar-bot canal-sorteio #canal
/gerenciar-bot adicionar-cargo @Moderador
/gerenciar-bot ver-config
```

#### Ver Detalhes de um Bingo
```
/detalhes-bingo id:<id_do_bingo>
```

## 📋 Fluxo Completo de um Jogo

1. **Criar o Bingo**
   ```
   /criar-bingo nome:"Bingo da Sexta" quantidade:100 valor:1.50
   ```

2. **Adicionar Participantes** (repita para cada um)
   ```
   /adicionar-participante nome:"Maria" cartelas:"1,2,3"
   /adicionar-participante nome:"Pedro" cartelas:"5,10"
   ```

3. **Verificar Status**
   ```
   /status
   ```

4. **Iniciar Sorteio** (continue até ter vencedor)
   ```
   /sortear
   /sortear
   /sortear
   ...
   ```

5. **Bot Anuncia o Vencedor Automaticamente!** 🎊

## 🎯 Formato das Cartelas

As cartelas seguem o formato tradicional 5x5:

```
B    I    N    G    O
1-15 16-30 31-45 46-60 61-75
```

- Centro da cartela sempre tem "FREE" (casa grátis)
- Cada coluna tem números de um range específico
- Para ganhar: completar TODOS os 24 números + FREE (cartela cheia)

## 💰 Sistema de Pagamento PIX (Em Desenvolvimento)

Estrutura preparada em `/webhook/pix/notification` para:
- Receber notificações de pagamento
- Validar valores automaticamente
- Liberar cartelas após confirmação
- Prevenir fraudes e duplicatas

**Próximos passos:** Integração com Mercado Pago ou Asaas

## ⚙️ Informações Técnicas

- **Persistência**: Dados salvos em JSON na pasta `data/`
- **Comandos Registrados**: 9 comandos slash disponíveis
- **Geração Visual**: Canvas API para imagens das cartelas
- **Histórico**: Últimos 50 jogos são mantidos

## 🔒 Permissões Necessárias

- **Administradores**: Acesso completo a todos os comandos
- **Cargos Autorizados**: Configure com `/gerenciar-bot`
- **Usuários**: Podem visualizar cartelas e status

## 📞 Suporte

- Todos os dados são salvos automaticamente
- Backup integrado ao Replit
- Em caso de problemas, verifique os logs do workflow

## 🎨 Dicas

1. **Organize o sorteio**: Configure um canal específico com `/gerenciar-bot canal-sorteio`
2. **Valide participantes**: Use `/status` antes de começar
3. **Visualize cartelas**: Use `/visualizar-cartela` para conferir os números
4. **Mantenha registro**: Use `/historico` para consultar jogos passados

---

✅ **Bot Pronto para Uso!** Aproveite seu bingo! 🎰
