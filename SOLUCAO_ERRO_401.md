# 🔧 Solução para o Erro 401 - "Unauthorized use of live credentials"

## ❌ Problema Identificado

O erro ocorre porque o **Access Token** fornecido é de **PRODUÇÃO não-ativada**, não de TESTE.

```
Error: "Unauthorized use of live credentials"
Status: 401
```

## ✅ Solução

Você precisa usar as **credenciais de TESTE** corretas do Mercado Pago:

### Passo 1: Acesse o Dashboard do Mercado Pago
1. Vá para: https://www.mercadopago.com.br/developers/panel
2. Faça login na sua conta

### Passo 2: Selecione sua Aplicação
1. Clique em "Suas integrações"
2. Selecione a aplicação "BingoPix"

### Passo 3: Acesse as Credenciais de TESTE
**⚠️ MUITO IMPORTANTE:**
- No menu lateral esquerdo, procure pela seção **"TESTES"** (não "PRODUÇÃO")
- Clique em **"Credenciais de teste"**

### Passo 4: Copie as Credenciais Corretas
Você verá duas credenciais diferentes:

#### 📋 Public Key (Teste)
- Formato: `APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
- Esta é usada no frontend

#### 🔑 Access Token (Teste)  
- Formato: `APP_USR-xxxxxxxxxxxxxxx-xxxxxx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-xxxxxxxxx`
- **Esta é a que você precisa!**
- Tamanho: aproximadamente 75 caracteres

### Passo 5: Atualize a Secret no Replit
1. No Replit, vá em "Secrets" (ícone de cadeado no menu lateral)
2. Encontre `MERCADO_PAGO_ACCESS_TOKEN`
3. Clique em "Edit"
4. Cole o **Access Token de TESTE** (da seção TESTES)
5. Clique em "Save"

### Passo 6: Reinicie o Bot
Após atualizar a secret, reinicie o bot para aplicar as mudanças.

## 🎯 Como Diferenciar Teste vs Produção

| Aspecto | Teste | Produção |
|---------|-------|----------|
| **Localização** | Menu "TESTES" > "Credenciais de teste" | Menu "PRODUÇÃO" > "Credenciais de produção" |
| **Ativação** | Não requer ativação | **Requer ativação** com dados comerciais |
| **Pagamentos** | Simulados (não são reais) | Pagamentos reais com dinheiro real |
| **Erro 401** | ✅ Não ocorre | ❌ Ocorre se não ativada |

## 📸 Referência Visual

Na imagem que você mostrou, você estava na seção correta ("Credenciais de teste"), mas pode ter copiado o token errado ou ele pode ter expirado. Certifique-se de:

1. Estar logado com a conta correta
2. Selecionar a aplicação BingoPix
3. Ir em **TESTES** (menu lateral esquerdo)
4. Copiar o **Access Token** completo

## 🔍 Verificação

Após atualizar o token, execute:
```bash
node test-pix.js
```

Se o token estiver correto, você verá:
```
✅ SUCESSO! Pagamento PIX gerado com sucesso!
📋 Detalhes do pagamento:
  ID: xxxxx
  Status: pending
  ...
```

## 💡 Dica Importante

Credenciais de TESTE e PRODUÇÃO usam o mesmo formato (`APP_USR-...`). A diferença está em:
- **Onde você as obtém** (seção TESTES vs PRODUÇÃO)
- **Se precisam de ativação** (TESTE não precisa, PRODUÇÃO precisa)

---

## ❓ Ainda com erro?

Se após seguir todos os passos você ainda receber o erro 401, verifique:

1. ✅ Você copiou o token da seção **"TESTES"** (não "PRODUÇÃO")?
2. ✅ Você copiou o **Access Token** completo (não a Public Key)?
3. ✅ O token não tem espaços extras no início ou fim?
4. ✅ Você salvou a secret no Replit e reiniciou o bot?

Se tudo estiver correto e o erro persistir, pode ser necessário criar uma nova aplicação no dashboard do Mercado Pago e usar suas credenciais de teste.
