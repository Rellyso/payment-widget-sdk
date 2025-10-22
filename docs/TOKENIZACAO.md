# 🎫 Tokenização de Cartão - Payment Widget

## O Que é Tokenização?

**Tokenização** é o processo de converter dados sensíveis do cartão de crédito em um **token único** que pode ser usado apenas uma vez (ou por tempo limitado).

### Por Que Tokenizar?

✅ **Segurança**: Dados do cartão nunca trafegam para seu backend
✅ **PCI DSS**: Reduz escopo de compliance (você não armazena dados de cartão)
✅ **Proteção**: Token inútil se interceptado (expira rapidamente)
✅ **Reutilização**: Token pode ser usado para processar pagamento

---

## 🏗️ Arquiteturas de Tokenização

### Opção 1: Tokenização no Seu Backend ✅ RECOMENDADO

```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUXO COMPLETO                               │
└─────────────────────────────────────────────────────────────────┘

1. Widget (Frontend)
   └─> Coleta dados do cartão
       • Número: 1234 5678 9012 3456
       • CVV: 123
       • Validade: 12/25
       • Nome: João Silva

2. Widget → Seu Backend (HTTPS POST)
   └─> Envia dados criptografados
       POST /api/tokenize
       {
         "cardNumber": "1234567890123456",
         "cvv": "123",
         "expiryMonth": "12",
         "expiryYear": "25",
         "cardholderName": "João Silva"
       }

3. Seu Backend → API de Pagamento
   └─> Gera token via API
       POST https://api-pagamento.com/v1/tokens
       Authorization: Bearer sk_live_abc123...
       {
         "card": { ... }
       }

4. API de Pagamento → Seu Backend
   └─> Retorna token
       {
         "token": "tok_1234567890abcdef",
         "last4": "3456",
         "brand": "visa",
         "expiresAt": "2025-10-06T12:00:00Z"
       }

5. Seu Backend → Widget
   └─> Retorna token (sem dados do cartão)
       {
         "token": "tok_1234567890abcdef",
         "last4": "3456"
       }

6. Widget → Seu Backend
   └─> Envia token para processar pagamento
       POST /api/process-payment
       {
         "token": "tok_1234567890abcdef",
         "amount": 10000,
         "installments": 1
       }

7. Seu Backend → API de Pagamento
   └─> Processa cobrança com token
       POST https://api-pagamento.com/v1/charges
       Authorization: Bearer sk_live_abc123...
       {
         "token": "tok_1234567890abcdef",
         "amount": 10000
       }

8. Sucesso! ✅
```

**Vantagens:**

- ✅ Você controla todo o fluxo
- ✅ Pode adicionar validações extras
- ✅ Logs completos no seu servidor
- ✅ Dados do cartão nunca ficam no frontend

**Desvantagens:**

- ⚠️ Requer HTTPS obrigatório
- ⚠️ Responsabilidade pela segurança dos dados em trânsito

---

### Opção 2: Tokenização via API Pública (JavaScript SDK)

```
┌─────────────────────────────────────────────────────────────────┐
│             FLUXO COM API PÚBLICA (Stripe-like)                 │
└─────────────────────────────────────────────────────────────────┘

1. Widget (Frontend)
   └─> Coleta dados do cartão
       • Formulário validado
       • PCI DSS: Nunca toca no servidor do merchant

2. Widget → API Pública de Tokenização (direto via JS)
   └─> Chama API com Public Key
       POST https://api-pagamento.com/v1/tokens
       Authorization: Bearer pk_live_xyz...  ← Public Key (OK expor)
       {
         "card": {
           "number": "1234567890123456",
           "cvv": "123",
           "exp_month": 12,
           "exp_year": 2025
         }
       }

3. API Pública → Widget
   └─> Retorna token
       {
         "token": "tok_1234567890abcdef",
         "card": {
           "last4": "3456",
           "brand": "visa"
         }
       }

4. Widget → Seu Backend
   └─> Envia APENAS o token (sem dados de cartão)
       POST /api/process-payment
       {
         "token": "tok_1234567890abcdef",
         "amount": 10000
       }

5. Seu Backend → API de Pagamento
   └─> Processa com Secret Key
       POST https://api-pagamento.com/v1/charges
       Authorization: Bearer sk_live_abc123...  ← Secret Key
       {
         "token": "tok_1234567890abcdef",
         "amount": 10000
       }

6. Sucesso! ✅
```

**Vantagens:**

- ✅ Dados do cartão NUNCA passam pelo seu servidor
- ✅ PCI DSS Compliance simplificado
- ✅ Menos responsabilidade com segurança
- ✅ Padrão usado por Stripe, Adyen, etc

**Desvantagens:**

- ⚠️ Dependência da API estar disponível
- ⚠️ Menos controle sobre o processo

---

## 🔧 Implementação - Opção 1 (Backend Tokenization)

### 1. Criar Serviço de Tokenização

```typescript
// src/services/tokenization.ts
import crypto from "crypto";

export class CardTokenizer {
  private apiUrl: string;
  private secretKey: string;

  constructor() {
    this.apiUrl = process.env.PAYMENT_API_URL!;
    this.secretKey = process.env.PAYMENT_API_SECRET_KEY!;
  }

  /**
   * Tokeniza dados do cartão via API externa
   */
  async tokenizeCard(cardData: {
    cardNumber: string;
    cvv: string;
    expiryMonth: string;
    expiryYear: string;
    cardholderName: string;
  }): Promise<{
    token: string;
    last4: string;
    brand: string;
    expiresAt: string;
  }> {
    // 1. Validar dados do cartão
    this.validateCardData(cardData);

    // 2. Fazer request para API de tokenização
    const response = await fetch(`${this.apiUrl}/v1/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.secretKey}`,
      },
      body: JSON.stringify({
        card: {
          number: cardData.cardNumber.replace(/\s/g, ""),
          cvc: cardData.cvv,
          exp_month: cardData.expiryMonth,
          exp_year: cardData.expiryYear,
          name: cardData.cardholderName,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao tokenizar cartão");
    }

    const result = await response.json();

    return {
      token: result.id,
      last4: result.card.last4,
      brand: result.card.brand,
      expiresAt: result.expires_at,
    };
  }

  /**
   * Valida dados do cartão (Luhn, formato, etc)
   */
  private validateCardData(cardData: any): void {
    // Validar número do cartão (Algoritmo de Luhn)
    if (!this.isValidCardNumber(cardData.cardNumber)) {
      throw new Error("Número de cartão inválido");
    }

    // Validar CVV (3-4 dígitos)
    if (!/^\d{3,4}$/.test(cardData.cvv)) {
      throw new Error("CVV inválido");
    }

    // Validar data de validade
    const month = parseInt(cardData.expiryMonth);
    const year = parseInt(cardData.expiryYear);
    const now = new Date();
    const expiryDate = new Date(2000 + year, month - 1);

    if (expiryDate < now) {
      throw new Error("Cartão expirado");
    }
  }

  /**
   * Algoritmo de Luhn (validação de cartão)
   */
  private isValidCardNumber(cardNumber: string): boolean {
    const digits = cardNumber.replace(/\s/g, "").split("").map(Number);
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = digits[i];

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }
}

export const cardTokenizer = new CardTokenizer();
```

### 2. Criar API Route de Tokenização (Next.js)

```typescript
// app/api/tokenize/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { cardTokenizer } from "@/services/tokenization";

const TokenizeRequestSchema = z.object({
  cardNumber: z.string().regex(/^\d{13,19}$/),
  cvv: z.string().regex(/^\d{3,4}$/),
  expiryMonth: z.string().regex(/^(0[1-9]|1[0-2])$/),
  expiryYear: z.string().regex(/^\d{2}$/),
  cardholderName: z.string().min(3).max(100),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Validar request
    const body = await request.json();
    const cardData = TokenizeRequestSchema.parse(body);

    // 2. Tokenizar cartão
    const tokenResult = await cardTokenizer.tokenizeCard(cardData);

    // 3. Retornar token (SEM dados do cartão)
    return NextResponse.json({
      success: true,
      token: tokenResult.token,
      card: {
        last4: tokenResult.last4,
        brand: tokenResult.brand,
      },
      expiresAt: tokenResult.expiresAt,
    });
  } catch (error) {
    console.error("[Tokenization] Erro:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: "Dados do cartão inválidos" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Erro ao tokenizar cartão",
      },
      { status: 500 }
    );
  }
}
```

### 3. Atualizar PaymentFormStep no Widget

```tsx
// src/components/steps/PaymentFormStep.tsx
import { useState } from "react";
import { Input } from "../Input";
import type { StepProps } from "./types";

export function PaymentFormStep({
  onNext,
  onPrev,
  formData,
  setFormData,
}: StepProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 1. Tokenizar cartão via seu backend
      const response = await fetch("/api/tokenize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardNumber: formData.payment.cardNumber,
          cvv: formData.payment.cvv,
          expiryMonth: formData.payment.expiryDate.split("/")[0],
          expiryYear: formData.payment.expiryDate.split("/")[1],
          cardholderName: formData.payment.cardholderName,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.message);
      }

      // 2. Salvar token (não os dados do cartão)
      setFormData({
        ...formData,
        cardToken: result.token,
        cardLast4: result.card.last4,
        cardBrand: result.card.brand,
      });

      // 3. Avançar para confirmação
      onNext("confirmation");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao processar cartão");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Formulário de cartão */}
      <Input
        label="Número do Cartão"
        value={formData.payment.cardNumber}
        onChange={(e) =>
          setFormData({
            ...formData,
            payment: { ...formData.payment, cardNumber: e.target.value },
          })
        }
        placeholder="1234 5678 9012 3456"
        required
      />

      {/* CVV, Validade, Nome */}

      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <button type="button" onClick={onPrev}>
          Voltar
        </button>
        <button type="submit" disabled={isLoading}>
          {isLoading ? "Processando..." : "Continuar"}
        </button>
      </div>
    </form>
  );
}
```

---

## 🔧 Implementação - Opção 2 (API Pública JavaScript)

### 1. Criar SDK de Tokenização

```typescript
// src/services/payment-sdk.ts

export class PaymentSDK {
  private publicKey: string;
  private apiUrl: string;

  constructor(
    publicKey: string,
    environment: "staging" | "production" = "production"
  ) {
    this.publicKey = publicKey;
    this.apiUrl =
      environment === "production"
        ? "https://api-pagamento.com"
        : "https://api-staging.pagamento.com";
  }

  /**
   * Tokeniza cartão direto na API (sem passar pelo backend do merchant)
   */
  async createToken(cardData: {
    cardNumber: string;
    cvv: string;
    expiryMonth: string;
    expiryYear: string;
    cardholderName: string;
  }): Promise<{
    token: string;
    last4: string;
    brand: string;
  }> {
    const response = await fetch(`${this.apiUrl}/v1/tokens`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.publicKey}`, // Public Key - OK expor
      },
      body: JSON.stringify({
        card: {
          number: cardData.cardNumber.replace(/\s/g, ""),
          cvc: cardData.cvv,
          exp_month: Number.parseInt(cardData.expiryMonth),
          exp_year: 2000 + Number.parseInt(cardData.expiryYear),
          name: cardData.cardholderName,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao tokenizar cartão");
    }

    const result = await response.json();

    return {
      token: result.id,
      last4: result.card.last4,
      brand: result.card.brand,
    };
  }
}
```

### 2. Usar no Widget

```tsx
// src/components/steps/PaymentFormStep.tsx
import { PaymentSDK } from "@/services/payment-sdk";

export function PaymentFormStep({ config, onNext }: StepProps) {
  const sdk = new PaymentSDK(
    config.publicKey, // ← Public Key (OK expor no frontend)
    config.environment
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Tokenizar DIRETO na API (não passa pelo seu backend)
      const tokenResult = await sdk.createToken({
        cardNumber: formData.cardNumber,
        cvv: formData.cvv,
        expiryMonth: "12",
        expiryYear: "25",
        cardholderName: formData.cardholderName,
      });

      // Enviar APENAS token para seu backend
      await fetch("/api/process-payment", {
        method: "POST",
        body: JSON.stringify({
          token: tokenResult.token, // ← Só o token!
          amount: 10000,
        }),
      });

      onNext("confirmation");
    } catch (error) {
      console.error("Erro:", error);
    }
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## 📊 Comparação das Abordagens

| Aspecto                             | Opção 1 (Backend)      | Opção 2 (API Pública)    |
| ----------------------------------- | ---------------------- | ------------------------ |
| **Dados passam pelo seu servidor?** | ✅ Sim (criptografado) | ❌ Não (direto para API) |
| **PCI DSS Compliance**              | ⚠️ Mais complexo       | ✅ Simplificado          |
| **Controle do fluxo**               | ✅ Total               | ⚠️ Limitado              |
| **Latência**                        | ⚠️ 2 requests          | ✅ 1 request             |
| **Logs completos**                  | ✅ Sim                 | ⚠️ Parcial               |
| **Fallback/Retry**                  | ✅ Fácil               | ⚠️ Mais difícil          |
| **Requer HTTPS**                    | ✅ Obrigatório         | ✅ Obrigatório           |
| **Complexidade**                    | ⚠️ Média               | ✅ Simples               |

---

## 🎯 Recomendação

### Use **Opção 2 (API Pública)** se:

- Quer simplificar PCI DSS compliance
- Usa gateway como Stripe, Adyen, Braintree
- Quer menos responsabilidade com segurança
- Precisa de setup rápido

### Use **Opção 1 (Backend)** se:

- Precisa de controle total do fluxo
- Quer adicionar validações customizadas
- Já tem infraestrutura PCI DSS
- Precisa de logs detalhados

---

## 🔐 Segurança do Token

### Características do Token:

```typescript
{
  "token": "tok_1234567890abcdef",  // Token único
  "expiresAt": "2025-10-06T12:00:00Z",  // Expira em minutos
  "singleUse": true,  // Uso único
  "card": {
    "last4": "3456",  // Últimos 4 dígitos (OK expor)
    "brand": "visa"    // Bandeira (OK expor)
  }
}
```

✅ **Seguro porque:**

- Expira rapidamente (15-30 minutos)
- Uso único (não pode ser reutilizado)
- Não contém dados do cartão
- Inútil se interceptado após uso

---

## 📝 Exemplo Completo no Callback

```typescript
// Frontend - Widget configurado
window.PaymentWidget.init({
  orderId: "merchant-123",
  publicKey: "pk_live_xyz...", // ← Public Key (se usar Opção 2)

  onSuccess: async (data) => {
    // data.token já está disponível!
    console.log("Token gerado:", data.token);
    console.log("Últimos 4 dígitos:", data.last4);

    // Enviar para SEU backend processar
    const response = await fetch("/api/process-payment", {
      method: "POST",
      body: JSON.stringify({
        token: data.token,
        orderId: data.orderId,
        amount: 10000,
        installments: data.installments,
      }),
    });

    const result = await response.json();

    if (result.success) {
      window.location.href = "/success";
    }
  },
});
```

---

## 🚀 Próximos Passos

1. **Decidir qual opção** usar (Backend vs API Pública)
2. **Implementar tokenização** no PaymentFormStep
3. **Testar com cartões de teste** (ambiente staging)
4. **Validar fluxo completo** end-to-end
5. **Adicionar error handling** robusto
6. **Passar por auditoria PCI DSS** (se necessário)

---

## 📚 Referências

- [PCI DSS Tokenization Guidelines](https://www.pcisecuritystandards.org/)
- [Stripe Tokenization](https://stripe.com/docs/js/tokens)
- [Algoritmo de Luhn](https://en.wikipedia.org/wiki/Luhn_algorithm)

---

**Última atualização**: 6 de outubro de 2025
