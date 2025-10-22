# 🔒 Segurança e Gerenciamento de Secrets

## ⚠️ REGRA DE OURO

> **NUNCA coloque secrets/API keys no frontend!**
>
> Qualquer coisa no navegador pode ser inspecionada pelo usuário.

---

## 🏗️ Arquitetura Segura Recomendada

### Fluxo Correto: Widget → Backend do Cliente → API de Pagamento

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Navegador)                     │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Payment Widget                                       │  │
│  │  • Coleta dados do usuário                           │  │
│  │  • NÃO tem API keys                                  │  │
│  │  • NÃO tem secrets                                   │  │
│  │  • Envia dados via callbacks                         │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│                     │ Dados do formulário                   │
│                     │ (via onSuccess callback)              │
│                     ▼                                       │
└─────────────────────────────────────────────────────────────┘
                      │
                      │ HTTPS
                      │
┌─────────────────────▼───────────────────────────────────────┐
│              BACKEND DO CLIENTE (Seguro)                    │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Servidor do E-commerce                              │  │
│  │  • Recebe dados do widget                            │  │
│  │  • TEM as API keys (server-side)                     │  │
│  │  • TEM os secrets                                    │  │
│  │  • Valida orderId                                 │  │
│  │  • Faz requests para API de pagamento               │  │
│  └──────────────────┬───────────────────────────────────┘  │
│                     │                                       │
│                     │ Request com API Key                   │
│                     │ (Authorization: Bearer xxx)           │
│                     ▼                                       │
└─────────────────────────────────────────────────────────────┘
                      │
                      │ HTTPS + API Key
                      │
┌─────────────────────▼───────────────────────────────────────┐
│           API de Pagamento / Cartão Simples                 │
│                                                             │
│  • Processa transação                                       │
│  • Valida API Key                                          │
│  • Retorna resultado                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ O Que PODE Ficar no Frontend

### 1. Identificadores Públicos

```typescript
// ✅ SEGURO - Pode ficar no frontend
window.PaymentWidget.init({
  orderId: "merchant-123", // ✅ ID público
  environment: "production", // ✅ Config pública
  logoUrl: "https://...", // ✅ URL pública
  apiBaseUrl: "https://seu-backend.com", // ✅ SEU backend, não a API de pagamento
});
```

### 2. Dados de Configuração Visual

```typescript
// ✅ SEGURO - Tema e UI
theme: {
  primaryColor: "#FF6600",
  secondaryColor: "#0A0A0A",
  borderRadius: "md",
}
```

### 3. Callbacks para Enviar Dados

```typescript
// ✅ SEGURO - Callbacks enviam dados para SEU backend
onSuccess: async (data) => {
  // Widget coletou os dados, agora envia para SEU backend
  const response = await fetch("https://seu-backend.com/api/process-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId: data.orderId,
      token: data.token,  // Token temporário do widget
      // Seu backend que terá a API key real
    }),
  });

  // SEU backend processa com a API key segura
},
```

---

## ❌ O Que NUNCA Pode Ficar no Frontend

### 1. API Keys / Secrets

```typescript
// ❌ NUNCA FAÇA ISSO!
window.PaymentWidget.init({
  apiKey: "sk_live_abc123def456...", // ❌ EXPOSTO NO NAVEGADOR!
  secretKey: "secret_xyz...", // ❌ QUALQUER UM VÊ!
});
```

**Por quê?**

- Qualquer pessoa pode abrir DevTools (F12)
- Ver o código-fonte da página
- Copiar suas API keys
- Fazer requests em seu nome
- Gerar cobranças fraudulentas

### 2. Requests Diretos para API de Pagamento

```typescript
// ❌ NUNCA FAÇA ISSO!
const processPayment = async (cardData) => {
  const response = await fetch("https://api-pagamento.com/charge", {
    method: "POST",
    headers: {
      Authorization: "Bearer sk_live_abc123...", // ❌ EXPOSTO!
    },
    body: JSON.stringify(cardData),
  });
};
```

### 3. Dados Sensíveis de Configuração

```typescript
// ❌ NUNCA FAÇA ISSO!
const config = {
  stripeSecretKey: "sk_...", // ❌
  databasePassword: "pass123", // ❌
  jwtSecret: "secret...", // ❌
  encryptionKey: "key...", // ❌
};
```

---

## 🎯 Implementação Correta - Passo a Passo

### Passo 1: Widget Coleta Dados (Frontend)

```html
<!-- index.html -->
<script src="https://cdn.cartaosimples.com/widget.v1.min.js"></script>
<script>
  window.PaymentWidget.init({
    // ✅ Apenas identificadores públicos
    orderId: "merchant-123",

    // ✅ Aponta para SEU backend (não a API de pagamento)
    apiBaseUrl: "https://seu-ecommerce.com/api",

    // ✅ Callback envia dados para SEU backend
    onSuccess: async (data) => {
      try {
        // Widget retorna um token temporário
        const response = await fetch("/api/process-payment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: data.token, // Token do widget
            orderId: data.orderId,
            amount: 10000, // R$ 100,00
            installments: data.installments,
          }),
        });

        const result = await response.json();

        if (result.success) {
          window.location.href = "/sucesso";
        } else {
          alert("Erro: " + result.message);
        }
      } catch (error) {
        console.error("Erro ao processar pagamento:", error);
      }
    },

    onError: (error) => {
      console.error("Erro no widget:", error);
    },
  });
</script>
```

### Passo 2: Backend Processa com API Key (Seguro)

```typescript
// backend/api/process-payment.ts
import express from "express";

const router = express.Router();

// ✅ API Key está no servidor (segura)
const PAYMENT_API_KEY = process.env.PAYMENT_API_SECRET_KEY;
const PAYMENT_API_URL = process.env.PAYMENT_API_URL;

router.post("/process-payment", async (req, res) => {
  try {
    const { token, orderId, amount, installments } = req.body;

    // 1. Validar orderId (verificar se é válido para este cliente)
    if (!isValidMerchant(orderId)) {
      return res.status(403).json({
        success: false,
        message: "Merchant inválido",
      });
    }

    // 2. Fazer request para API de pagamento COM a API key segura
    const response = await fetch(`${PAYMENT_API_URL}/charges`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PAYMENT_API_KEY}`, // ✅ Seguro no servidor
      },
      body: JSON.stringify({
        token,
        amount,
        installments,
        orderId,
        metadata: {
          source: "payment-widget",
          ip: req.ip,
          userAgent: req.headers["user-agent"],
        },
      }),
    });

    const result = await response.json();

    // 3. Retornar resultado (sem expor detalhes sensíveis)
    if (result.success) {
      res.json({
        success: true,
        transactionId: result.transactionId,
        message: "Pagamento processado com sucesso",
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.error.message,
      });
    }
  } catch (error) {
    console.error("Erro ao processar pagamento:", error);
    res.status(500).json({
      success: false,
      message: "Erro interno do servidor",
    });
  }
});

function isValidMerchant(orderId: string): boolean {
  // Validar contra seu banco de dados
  const validMerchants = process.env.VALID_MERCHANTS?.split(",") || [];
  return validMerchants.includes(orderId);
}

export default router;
```

### Passo 3: Variáveis de Ambiente (Backend)

```bash
# .env (SERVIDOR - nunca commitar!)
NODE_ENV=production

# API de Pagamento (SECRETA)
PAYMENT_API_SECRET_KEY=sk_live_abc123def456...
PAYMENT_API_URL=https://api-pagamento.cartaosimples.com

# Merchants Válidos
VALID_MERCHANTS=merchant-123,merchant-456,merchant-789

# Database
DATABASE_URL=postgresql://...

# Segurança
JWT_SECRET=your-jwt-secret-here
SESSION_SECRET=your-session-secret-here
```

---

## 🔐 Tipos de Tokens e Keys

### 1. Public Key / Merchant ID (Frontend)

```typescript
// ✅ PODE ficar no frontend
orderId: "merchant-123"; // Identificador público
publishableKey: "pk_live_xyz..."; // Key pública (se aplicável)
```

**Características:**

- Pode ser exposto publicamente
- Apenas identifica o merchant
- Não permite operações sensíveis

### 2. Secret Key / API Key (Backend ONLY)

```typescript
// ❌ NUNCA no frontend, APENAS no backend
secretKey: "sk_live_abc123..."; // Secret key
apiKey: "api_secret_xyz..."; // API key privada
```

**Características:**

- NUNCA pode ser exposta
- Permite operações críticas
- Deve estar em variáveis de ambiente
- Rotacionada periodicamente

### 3. Tokens Temporários (Trafegam com Segurança)

```typescript
// ✅ Token de uso único gerado pelo widget
token: "tok_1234567890abcdef";
```

**Características:**

- Uso único (não pode ser reutilizado)
- Expira rapidamente (15-30 minutos)
- Representa dados do cartão de forma segura
- Pode ser enviado do frontend para backend

---

## 🛡️ Camadas de Segurança

### 1. HTTPS Obrigatório

```typescript
// ✅ Sempre use HTTPS
apiBaseUrl: "https://seu-backend.com"; // ✅

// ❌ NUNCA use HTTP em produção
apiBaseUrl: "http://seu-backend.com"; // ❌ Inseguro!
```

### 2. CORS Restritivo (Backend)

```typescript
// backend/server.ts
import cors from "cors";

app.use(
  cors({
    origin: ["https://seu-site.com", "https://www.seu-site.com"],
    credentials: true,
  })
);
```

### 3. Rate Limiting

```typescript
// backend/middleware/rate-limit.ts
import rateLimit from "express-rate-limit";

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 requests por IP
  message: "Muitas tentativas. Tente novamente mais tarde.",
});

app.use("/api/process-payment", paymentLimiter);
```

### 4. Validação de Origem

```typescript
// backend/middleware/validate-origin.ts
export function validateOrigin(req, res, next) {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];

  if (!allowedOrigins.includes(origin)) {
    return res.status(403).json({
      error: "Origem não autorizada",
    });
  }

  next();
}
```

### 5. Sanitização de Dados

```typescript
// backend/utils/sanitize.ts
import validator from "validator";

export function sanitizePaymentData(data: any) {
  return {
    orderId: validator.escape(data.orderId),
    amount: Number.parseInt(data.amount),
    installments: Number.parseInt(data.installments),
    token: validator.escape(data.token),
  };
}
```

---

## 📋 Checklist de Segurança

### Frontend (Widget)

- [ ] ✅ Apenas `orderId` público na configuração
- [ ] ✅ Sem API keys ou secrets no código
- [ ] ✅ HTTPS obrigatório em produção
- [ ] ✅ Callbacks enviam dados para SEU backend
- [ ] ✅ Shadow DOM para isolamento de estilos
- [ ] ✅ CSP (Content Security Policy) configurado
- [ ] ✅ SRI (Subresource Integrity) nos scripts CDN

### Backend (Seu Servidor)

- [ ] ✅ API keys em variáveis de ambiente (`.env`)
- [ ] ✅ Validação de orderId
- [ ] ✅ CORS configurado corretamente
- [ ] ✅ Rate limiting implementado
- [ ] ✅ Logs de todas as transações
- [ ] ✅ Validação de origem das requests
- [ ] ✅ Sanitização de inputs
- [ ] ✅ HTTPS com certificado válido
- [ ] ✅ Secrets nunca logados/expostos
- [ ] ✅ Rotação periódica de API keys

### Infraestrutura

- [ ] ✅ `.env` no `.gitignore`
- [ ] ✅ Secrets em vault/secret manager (AWS Secrets, Azure Key Vault)
- [ ] ✅ Backups regulares
- [ ] ✅ Monitoramento de acessos suspeitos
- [ ] ✅ Alertas para uso anômalo de API

---

## 🚨 O Que Fazer se API Key Vazar

### 1. Revogar Imediatamente

```bash
# Via CLI ou Dashboard
curl -X POST https://api-pagamento.com/keys/revoke \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d "key_id=sk_live_abc123"
```

### 2. Gerar Nova Key

```bash
curl -X POST https://api-pagamento.com/keys/create \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 3. Atualizar Backend

```bash
# .env
PAYMENT_API_SECRET_KEY=sk_live_NEW_KEY_HERE
```

### 4. Redeploy

```bash
# Fazer deploy com nova key
npm run deploy
```

### 5. Investigar Impacto

- Verificar logs de acesso suspeito
- Checar transações não autorizadas
- Notificar time de segurança

---

## 📚 Recursos e Ferramentas

### Análise de Secrets no Código

```bash
# Instalar git-secrets
brew install git-secrets

# Configurar
git secrets --install
git secrets --register-aws

# Escanear repositório
git secrets --scan
```

### Variáveis de Ambiente Seguras

```bash
# Usar secret manager (AWS)
aws secretsmanager create-secret \
  --name payment-api-key \
  --secret-string "sk_live_abc123..."

# Recuperar no runtime
const secret = await getSecret("payment-api-key");
```

### Auditoria de Dependências

```bash
# Verificar vulnerabilidades
npm audit
npm audit fix

# Usar Snyk
npx snyk test
```

---

## 🎓 Princípios de Segurança

### 1. Princípio do Menor Privilégio

Cada componente deve ter apenas as permissões necessárias:

- Widget: Coleta dados, sem API keys
- Backend: Processa pagamentos, tem API keys
- Database: Acesso restrito ao backend

### 2. Defesa em Profundidade

Múltiplas camadas de segurança:

- HTTPS (transporte)
- CORS (origem)
- Rate limiting (abuso)
- Validação (dados)
- Sanitização (XSS)

### 3. Nunca Confie no Cliente

Sempre validar no servidor:

```typescript
// ❌ Validação apenas no frontend não basta
if (amount > 0) {
  /* frontend */
}

// ✅ Validar também no backend
if (!amount || amount <= 0 || amount > MAX_AMOUNT) {
  return res.status(400).json({ error: "Valor inválido" });
}
```

---

## 📖 Exemplos Completos

### Exemplo 1: E-commerce com Next.js

Ver: `/examples/security/nextjs-integration.ts`

### Exemplo 2: E-commerce com Express

Ver: `/examples/security/express-backend.ts`

### Exemplo 3: Validação de Merchant

Ver: `/examples/security/merchant-validation.ts`

---

## 🔗 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PCI DSS Compliance](https://www.pcisecuritystandards.org/)
- [Stripe Security Best Practices](https://stripe.com/docs/security)
- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)

---

**Última atualização**: 6 de outubro de 2025
