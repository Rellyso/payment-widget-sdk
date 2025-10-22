# 🚀 Guia de Uso - Payment Widget SDK

> **Para Desenvolvedores**: Como integrar o Payment Widget no seu projeto React

---

## 📋 Índice

- [⚡ Quick Start](#-quick-start)
- [📦 Instalação](#-instalação)
- [🎯 Uso Básico](#-uso-básico)
- [⚙️ Configuração Avançada](#️-configuração-avançada)
- [🎨 Personalização](#-personalização)
- [📱 Exemplos Práticos](#-exemplos-práticos)
- [🔧 API Reference](#-api-reference)
- [❓ FAQ](#-faq)
- [🐛 Troubleshooting](#-troubleshooting)

---

## ⚡ Quick Start

### 🏃‍♂️ Em 5 minutos:

```bash
# 1. Instalar
npm install payment-widget-sdk

# 2. Usar
```

```jsx
// App.jsx
import { PaymentWidget } from 'payment-widget-sdk';

function App() {
  return (
    <PaymentWidget 
      config={{
        orderId: "pedido-123",
        onSuccess: (data) => alert(`Pagamento aprovado! ID: ${data.transactionId}`)
      }}
    />
  );
}
```

🎉 **Pronto!** O widget já está funcionando no seu projeto.

---

## 📦 Instalação

### 💻 Requisitos

| Tecnologia | Versão Mínima | Status |
|------------|---------------|--------|
| **React** | 18.0.0+ | ✅ Obrigatório |
| **Node.js** | 16.0.0+ | ✅ Obrigatório |
| **TypeScript** | 4.9.0+ | 💡 Recomendado |

### 📥 Instalar o Pacote

```bash
# NPM
npm install payment-widget-sdk

# Yarn
yarn add payment-widget-sdk

# PNPM  
pnpm add payment-widget-sdk
```

### 🔍 Verificar Instalação

```jsx
// test.jsx
import { PaymentWidget } from 'payment-widget-sdk';
console.log('✅ SDK importado com sucesso!', PaymentWidget);
```

---

## 🎯 Uso Básico

### 📝 Configuração Mínima

```jsx
import { PaymentWidget } from 'payment-widget-sdk';

function CheckoutPage() {
  return (
    <div>
      <h1>Finalizar Compra</h1>
      
      {/* Widget com configuração mínima */}
      <PaymentWidget 
        config={{
          orderId: "pedido-123"  // ← Único campo obrigatório
        }}
      />
    </div>
  );
}
```

### 🎛️ Com Callbacks

```jsx
function CheckoutPage() {
  const handleSuccess = (data) => {
    console.log('🎉 Pagamento aprovado!', data);
    // Redirecionar para página de sucesso
    window.location.href = `/sucesso?transactionId=${data.transactionId}`;
  };

  const handleError = (error) => {
    console.error('❌ Erro no pagamento:', error);
    alert(`Erro: ${error.message}`);
  };

  return (
    <PaymentWidget 
      config={{
        orderId: "pedido-456",
        onSuccess: handleSuccess,
        onError: handleError,
        onOpen: () => console.log('Modal aberto'),
        onClose: () => console.log('Modal fechado')
      }}
    />
  );
}
```

### 🎨 Com Tema Personalizado

```jsx
function CheckoutPage() {
  return (
    <PaymentWidget 
      config={{
        orderId: "pedido-789",
        
        // 🎨 Personalização visual
        theme: {
          primaryColor: "#10B981",      // Verde
          secondaryColor: "#F3F4F6",    // Cinza claro
          borderRadius: "lg"            // Bordas arredondadas
        },
        
        // 🖼️ Logo da sua empresa
        logoUrl: "https://sua-empresa.com/logo.png"
      }}
    />
  );
}
```

---

## ⚙️ Configuração Avançada

### 🔧 Todas as Opções

```typescript
interface WidgetConfig {
  // 📋 Obrigatório
  orderId: string;                    // ID único do pedido
  
  // 🔑 Autenticação
  apiKey?: string;                    // Chave da API (se necessário)
  environment?: "staging" | "production"; // Ambiente (padrão: production)
  apiBaseUrl?: string;                // URL customizada da API
  
  // 🎨 Personalização
  theme?: {
    primaryColor?: string;            // Cor primária (hex)
    secondaryColor?: string;          // Cor secundária (hex)  
    borderRadius?: "sm" | "md" | "lg" | "full" | string;
  };
  logoUrl?: string;                   // URL do logo
  locale?: "pt-BR";                   // Idioma (padrão: pt-BR)
  
  // 🎛️ Comportamento
  autoOpen?: boolean;                 // Abrir automaticamente (padrão: false)
  
  // 📞 Callbacks
  onSuccess?: (data: PaymentSuccessData) => void;
  onError?: (error: PaymentError) => void;
  onOpen?: () => void;
  onClose?: () => void;
}
```

### 🌐 Ambientes

```jsx
// 🧪 Staging (testes)
<PaymentWidget 
  config={{
    orderId: "test-123",
    environment: "staging",
    apiKey: "test_key_123"
  }}
/>

// 🚀 Production
<PaymentWidget 
  config={{
    orderId: "prod-456", 
    environment: "production",
    apiKey: "live_key_456"
  }}
/>
```

### 🎯 Auto-abertura

```jsx
// Abrir widget automaticamente quando componente montar
<PaymentWidget 
  config={{
    orderId: "pedido-123",
    autoOpen: true  // ← Widget abre sozinho
  }}
/>
```

---

## 🎨 Personalização

### 🌈 Temas Pré-definidos

```jsx
// 🔵 Tema Azul Corporativo
const temaAzul = {
  primaryColor: "#3B82F6",
  secondaryColor: "#EFF6FF", 
  borderRadius: "md"
};

// 🟢 Tema Verde Sucesso
const temaVerde = {
  primaryColor: "#10B981",
  secondaryColor: "#ECFDF5",
  borderRadius: "lg"
};

// 🟣 Tema Roxo Moderno
const temaRoxo = {
  primaryColor: "#8B5CF6", 
  secondaryColor: "#F5F3FF",
  borderRadius: "full"
};

function CheckoutPage() {
  return (
    <PaymentWidget 
      config={{
        orderId: "pedido-123",
        theme: temaVerde  // ← Usar tema
      }}
    />
  );
}
```

### 🏢 Branding Personalizado

```jsx
function CheckoutPage() {
  return (
    <PaymentWidget 
      config={{
        orderId: "pedido-123",
        
        // 🖼️ Logo da empresa
        logoUrl: "https://cdn.suaempresa.com/logo-checkout.png",
        
        // 🎨 Cores da marca
        theme: {
          primaryColor: "#FF6B35",      // Laranja da marca
          secondaryColor: "#FFF5F1",    // Fundo suave
          borderRadius: "sm"            // Bordas retas
        }
      }}
    />
  );
}
```

### 📱 Responsividade

O widget é **100% responsivo** por padrão:

- 📱 **Mobile**: Modal ocupa tela inteira
- 💻 **Desktop**: Modal centralizado (max-width: 500px)
- 🖥️ **Tablet**: Adapta-se automaticamente

---

## 📱 Exemplos Práticos

### 🛒 E-commerce Simples

```jsx
// pages/checkout.jsx
import { PaymentWidget } from 'payment-widget-sdk';
import { useState } from 'react';

function CheckoutPage() {
  const [order, setOrder] = useState({
    id: "pedido-789",
    total: 299.90,
    items: ["Camiseta", "Calça Jeans"]
  });

  const handlePaymentSuccess = (data) => {
    // Salvar dados do pagamento
    localStorage.setItem('paymentData', JSON.stringify(data));
    
    // Redirecionar
    window.location.href = `/sucesso?orderId=${order.id}`;
  };

  return (
    <div className="checkout-container">
      {/* Resumo do pedido */}
      <div className="order-summary">
        <h2>Resumo do Pedido</h2>
        <p>Itens: {order.items.join(', ')}</p>
        <p>Total: R$ {order.total}</p>
      </div>

      {/* Widget de pagamento */}
      <PaymentWidget 
        config={{
          orderId: order.id,
          onSuccess: handlePaymentSuccess,
          onError: (error) => {
            alert(`Erro no pagamento: ${error.message}`);
          },
          theme: {
            primaryColor: "#2563EB",
            borderRadius: "lg"
          }
        }}
      />
    </div>
  );
}
```

### 🎫 Sistema de Assinatura

```jsx
// components/SubscriptionCheckout.jsx
import { PaymentWidget } from 'payment-widget-sdk';

function SubscriptionCheckout({ planId, userId }) {
  const plans = {
    basic: { name: "Básico", price: 29.90 },
    premium: { name: "Premium", price: 59.90 },
    enterprise: { name: "Enterprise", price: 99.90 }
  };

  const selectedPlan = plans[planId];

  const handleSubscriptionSuccess = async (paymentData) => {
    try {
      // Ativar assinatura no backend
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          planId,
          transactionId: paymentData.transactionId
        })
      });

      if (response.ok) {
        alert('🎉 Assinatura ativada com sucesso!');
      }
    } catch (error) {
      console.error('Erro ao ativar assinatura:', error);
    }
  };

  return (
    <div className="subscription-checkout">
      <h2>Assinar Plano {selectedPlan.name}</h2>
      <p>R$ {selectedPlan.price}/mês</p>
      
      <PaymentWidget 
        config={{
          orderId: `subscription-${userId}-${planId}-${Date.now()}`,
          onSuccess: handleSubscriptionSuccess,
          theme: {
            primaryColor: "#7C3AED",
            secondaryColor: "#F3E8FF",
            borderRadius: "md"
          },
          logoUrl: "/logo-assinatura.png"
        }}
      />
    </div>
  );
}
```

### 💰 Marketplace Multi-vendor

```jsx
// components/MarketplaceCheckout.jsx
import { PaymentWidget } from 'payment-widget-sdk';

function MarketplaceCheckout({ cart, vendorId }) {
  const orderId = `marketplace-${vendorId}-${Date.now()}`;
  
  const handleMarketplaceSuccess = async (paymentData) => {
    // Notificar vendor e marketplace
    await Promise.all([
      // Notificar vendor
      fetch(`/api/vendors/${vendorId}/orders`, {
        method: 'POST',
        body: JSON.stringify({ 
          orderId, 
          transactionId: paymentData.transactionId,
          items: cart 
        })
      }),
      
      // Atualizar marketplace
      fetch('/api/marketplace/orders', {
        method: 'POST', 
        body: JSON.stringify({
          orderId,
          vendorId,
          paymentData
        })
      })
    ]);

    alert('✅ Pedido confirmado! O vendedor foi notificado.');
  };

  return (
    <PaymentWidget 
      config={{
        orderId,
        onSuccess: handleMarketplaceSuccess,
        environment: "production",
        theme: {
          primaryColor: "#F59E0B",  // Amarelo marketplace
          borderRadius: "lg"
        }
      }}
    />
  );
}
```

---

## 🔧 API Reference

### 📦 Componentes Exportados

```typescript
// Componente principal
export function PaymentWidget(props: PaymentWidgetProps): JSX.Element;

// Modal independente
export function PaymentModal(props: PaymentModalProps): JSX.Element;

// Provider de tema  
export function ThemeProvider(props: ThemeProviderProps): JSX.Element;

// Hook de tema
export function useTheme(): ThemeContext;
```

### 📋 Tipos TypeScript

```typescript
interface PaymentSuccessData {
  transactionId: string;        // ID da transação
  token: string;               // Token do pagamento
  orderId: string;             // ID do pedido
  amount?: number;             // Valor pago
  installments?: number;       // Número de parcelas
  timestamp: string;           // Data/hora do pagamento
}

interface PaymentError {
  code: string;                // Código do erro
  message: string;             // Mensagem legível
  details?: Record<string, unknown>; // Detalhes adicionais
}

type WidgetStep = 
  | "credit-analysis"
  | "token-validation" 
  | "authorization"
  | "address-form"
  | "payment-form"
  | "confirmation";

interface WidgetState {
  isOpen: boolean;             // Modal aberto/fechado
  isLoaded: boolean;           // Widget carregado
  currentStep: WidgetStep;     // Etapa atual
  isLoading: boolean;          // Estado de carregamento
  error?: PaymentError;        // Último erro
}
```

### 🎛️ Métodos Avançados

```typescript
// Para controle programático (uso avançado)
interface WidgetAPI {
  init(config: WidgetConfig): Promise<void>;
  open(): void;
  close(): void; 
  destroy(): void;
  getState(): WidgetState;
}
```

---

## ❓ FAQ

### ❓ **Posso usar sem React?**
Não diretamente. O SDK é específico para React. Para vanilla JS, use a versão CDN:

```html
<script src="https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js"></script>
```

### ❓ **Funciona com Next.js?**
✅ Sim! Funciona perfeitamente:

```jsx
// pages/checkout.js ou app/checkout/page.js
import { PaymentWidget } from 'payment-widget-sdk';

export default function CheckoutPage() {
  return <PaymentWidget config={{ orderId: "next-123" }} />;
}
```

### ❓ **E com Remix?**
✅ Sim! 

```jsx
// app/routes/checkout.tsx
import { PaymentWidget } from 'payment-widget-sdk';

export default function CheckoutRoute() {
  return <PaymentWidget config={{ orderId: "remix-123" }} />;
}
```

### ❓ **Posso customizar completamente o CSS?**
O widget usa Shadow DOM para isolamento. Personalize via props `theme`:

```jsx
<PaymentWidget 
  config={{
    orderId: "123",
    theme: {
      primaryColor: "#custom",      // Cor primária
      secondaryColor: "#custom",    // Cor secundária  
      borderRadius: "4px"          // Border radius customizado
    }
  }}
/>
```

### ❓ **Como debugar problemas?**
1. Abra DevTools (F12)
2. Verifique Console por erros
3. Veja Network para requests falhando
4. Use callbacks `onError` para capturar erros

### ❓ **Suporta TypeScript?**
✅ Sim! Tipos completos incluídos:

```typescript
import type { WidgetConfig, PaymentSuccessData } from 'payment-widget-sdk';

const config: WidgetConfig = {
  orderId: "typed-123",
  onSuccess: (data: PaymentSuccessData) => {
    // Auto-complete funcionando! 🎉
    console.log(data.transactionId);
  }
};
```

---

## 🐛 Troubleshooting

### ❌ **"Module not found: payment-widget-sdk"**

```bash
# Verificar se foi instalado
npm list payment-widget-sdk

# Reinstalar se necessário
npm install payment-widget-sdk
```

### ❌ **"React hooks error"**

Problema: Múltiplas versões do React.

```bash
# Verificar versões
npm ls react

# Garantir versão única
npm dedupe
```

### ❌ **Widget não abre**

1. **Verificar console** por erros JavaScript
2. **Verificar orderId** está sendo passado
3. **Testar callback onError**:

```jsx
<PaymentWidget 
  config={{
    orderId: "debug-123",
    onError: (error) => {
      console.error('🐛 Erro capturado:', error);
      alert(`Debug: ${error.message}`);
    }
  }}
/>
```

### ❌ **Estilos quebrados**

O widget é isolado via Shadow DOM. Se estilos não aparecem:

1. **Verificar importação** do CSS (automática no SDK)
2. **Limpar cache** do navegador
3. **Verificar tema** está sendo aplicado

### ❌ **Callbacks não funcionam**

```jsx
// ❌ Erro comum: função inline que recria a cada render
<PaymentWidget 
  config={{
    orderId: "123",
    onSuccess: (data) => console.log(data)  // ← Recria sempre
  }}
/>

// ✅ Correto: função estável
const handleSuccess = useCallback((data) => {
  console.log(data);
}, []);

<PaymentWidget 
  config={{
    orderId: "123", 
    onSuccess: handleSuccess  // ← Função estável
  }}
/>
```

### 🔍 **Debug Mode**

Para desenvolvedores:

```jsx
<PaymentWidget 
  config={{
    orderId: "debug-123",
    environment: "staging",  // ← Usar staging para testes
    onOpen: () => console.log('🔓 Modal aberto'),
    onClose: () => console.log('🔒 Modal fechado'),
    onSuccess: (data) => console.log('✅ Sucesso:', data),
    onError: (error) => console.error('❌ Erro:', error)
  }}
/>
```

---

## 📞 Suporte

### 🆘 Precisa de Ajuda?

- **📖 Documentação**: Este guia
- **🐛 Issues**: https://github.com/usuario/payment-widget/issues
- **📧 Email**: suporte@cartaosimples.com
- **💬 Discord**: https://discord.gg/cartaosimples

### 📝 Reportar Bug

Ao reportar problemas, inclua:

1. **Versão** do SDK (`npm list payment-widget-sdk`)
2. **Versão** do React (`npm list react`)
3. **Código** que reproduz o problema
4. **Console errors** (screenshot ou texto)
5. **Browser** e versão

### 💡 Sugerir Feature

Abra uma issue com:
- **Descrição** clara da funcionalidade
- **Use case** (por que é útil)
- **Mockup** ou exemplo (se visual)

---

## 🚀 Próximos Passos

1. **🧪 Teste** os exemplos acima
2. **🎨 Customize** o tema para sua marca  
3. **📱 Teste** em diferentes dispositivos
4. **🚀 Deploy** em staging primeiro
5. **📊 Monitor** logs e erros
6. **🔄 Itere** baseado no feedback dos usuários

### 🎯 Recursos Avançados

- **Multiple Widgets**: Vários widgets na mesma página
- **State Management**: Integração com Redux/Zustand
- **Analytics**: Tracking de conversão
- **A/B Testing**: Diferentes configurações

---

*💳 Payment Widget SDK - Pagamentos simples para desenvolvedores*