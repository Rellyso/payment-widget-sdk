# 💳 Payment Widget SDK

> **Embeddable payment widget for React applications** - Transform any checkout into a seamless payment experience

[![npm version](https://badge.fury.io/js/payment-widget-sdk.svg)](https://badge.fury.io/js/payment-widget-sdk)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

---

## 🚀 Quick Start

```bash
npm install payment-widget-sdk
```

```jsx
import { PaymentWidget } from 'payment-widget-sdk';

function App() {
  return (
    <PaymentWidget 
      config={{
        orderId: "order-123",
        onSuccess: (data) => console.log('Payment approved!', data)
      }}
    />
  );
}
```

**🎉 That's it!** Your payment widget is ready.

---

## ✨ Features

| Feature | Description | Status |
|---------|-------------|---------|
| 🎨 **Themeable** | Customize colors, borders, and branding | ✅ |
| 📱 **Responsive** | Works on mobile, tablet, and desktop | ✅ |
| 🔒 **Secure** | PCI-compliant with tokenization | ✅ |
| ⚡ **Fast** | Lazy-loaded, optimized bundle | ✅ |
| 🎯 **TypeScript** | Full type safety and IntelliSense | ✅ |
| ♿ **Accessible** | WCAG 2.1 AA compliant | ✅ |
| 🌐 **i18n Ready** | Multi-language support | 🔄 |
| 📊 **Analytics** | Built-in conversion tracking | 🔄 |

---

## 📖 Examples

### 🛍️ E-commerce Checkout

```jsx
import { PaymentWidget } from 'payment-widget-sdk';

function CheckoutPage() {
  const handlePaymentSuccess = (data) => {
    // Redirect to success page
    window.location.href = `/success?id=${data.transactionId}`;
  };

  return (
    <div className="checkout">
      <h2>Complete Your Purchase</h2>
      
      <PaymentWidget 
        config={{
          orderId: "order-456",
          onSuccess: handlePaymentSuccess,
          onError: (error) => alert(error.message),
          
          // Custom branding
          theme: {
            primaryColor: "#2563EB",
            borderRadius: "lg"
          },
          logoUrl: "https://yourstore.com/logo.png"
        }}
      />
    </div>
  );
}
```

### 💰 Subscription Service

```jsx
function SubscriptionCheckout({ planId }) {
  return (
    <PaymentWidget 
      config={{
        orderId: `subscription-${planId}-${Date.now()}`,
        
        // Auto-open for better UX
        autoOpen: true,
        
        // Subscription-specific styling
        theme: {
          primaryColor: "#10B981",
          secondaryColor: "#ECFDF5"
        },
        
        onSuccess: async (data) => {
          await activateSubscription(planId, data.transactionId);
          showSuccessMessage("Subscription activated!");
        }
      }}
    />
  );
}
```

### 🎫 Event Ticketing

```jsx
function TicketCheckout({ eventId, tickets }) {
  return (
    <PaymentWidget 
      config={{
        orderId: `event-${eventId}-${Date.now()}`,
        
        // Event branding
        theme: {
          primaryColor: "#7C3AED",
          borderRadius: "md"
        },
        
        onSuccess: (data) => {
          sendTicketsByEmail(tickets, data);
          redirectToTickets();
        }
      }}
    />
  );
}
```

---

## ⚙️ Configuration

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `orderId` | `string` | Unique order identifier |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apiKey` | `string` | - | API authentication key |
| `environment` | `"staging" \| "production"` | `"production"` | Environment to use |
| `autoOpen` | `boolean` | `false` | Open widget automatically |
| `theme` | `ThemeConfig` | - | Visual customization |
| `logoUrl` | `string` | - | Your company logo URL |
| `locale` | `string` | `"pt-BR"` | Language/region |

### Theme Configuration

```typescript
interface ThemeConfig {
  primaryColor?: string;      // Main color (hex)
  secondaryColor?: string;    // Background color (hex)  
  borderRadius?: "sm" | "md" | "lg" | "full" | string;
}
```

### Callbacks

| Callback | Type | Description |
|----------|------|-------------|
| `onSuccess` | `(data: PaymentSuccessData) => void` | Payment approved |
| `onError` | `(error: PaymentError) => void` | Payment failed |
| `onOpen` | `() => void` | Widget opened |
| `onClose` | `() => void` | Widget closed |

---

## 🎨 Theming

### Predefined Themes

```jsx
// Blue Corporate
const blueTheme = {
  primaryColor: "#3B82F6",
  secondaryColor: "#EFF6FF",
  borderRadius: "md"
};

// Green Success
const greenTheme = {
  primaryColor: "#10B981", 
  secondaryColor: "#ECFDF5",
  borderRadius: "lg"
};

// Purple Modern
const purpleTheme = {
  primaryColor: "#8B5CF6",
  secondaryColor: "#F5F3FF", 
  borderRadius: "full"
};
```

### Custom Branding

```jsx
<PaymentWidget 
  config={{
    orderId: "branded-order",
    
    // Your brand colors
    theme: {
      primaryColor: "#FF6B35",     // Your primary color
      secondaryColor: "#FFF5F1",   // Light background
      borderRadius: "4px"          // Custom radius
    },
    
    // Your logo
    logoUrl: "https://cdn.yourdomain.com/checkout-logo.svg"
  }}
/>
```

---

## 🔧 Advanced Usage

### Multiple Environments

```jsx
const config = {
  orderId: "order-123",
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'staging',
  apiKey: process.env.REACT_APP_PAYMENT_API_KEY
};

<PaymentWidget config={config} />
```

### State Management Integration

```jsx
// With Redux
import { useDispatch } from 'react-redux';

function CheckoutWidget() {
  const dispatch = useDispatch();
  
  return (
    <PaymentWidget 
      config={{
        orderId: "redux-order",
        onSuccess: (data) => {
          dispatch(paymentSucceeded(data));
        },
        onError: (error) => {
          dispatch(paymentFailed(error));
        }
      }}
    />
  );
}
```

### Error Handling

```jsx
function RobustCheckout() {
  const [error, setError] = useState(null);
  
  return (
    <div>
      {error && (
        <div className="error-banner">
          Error: {error.message}
          <button onClick={() => setError(null)}>Retry</button>
        </div>
      )}
      
      <PaymentWidget 
        config={{
          orderId: "robust-order",
          onError: (error) => {
            setError(error);
            // Log to monitoring service
            console.error('Payment error:', error);
          }
        }}
      />
    </div>
  );
}
```

---

## 📱 Framework Support

### ✅ Supported

- **React** 18+ (Primary)
- **Next.js** 13+ (App Router & Pages Router)
- **Remix** 2+
- **Vite** + React
- **Create React App**

### 🚧 Coming Soon

- **Vue.js** (via wrapper)
- **Angular** (via wrapper)
- **Svelte** (via wrapper)

---

## 🔍 TypeScript Support

Full TypeScript support included:

```typescript
import type { WidgetConfig, PaymentSuccessData, PaymentError } from 'payment-widget-sdk';

const config: WidgetConfig = {
  orderId: "typed-order",
  theme: {
    primaryColor: "#3B82F6",  // ✅ Type-safe
    borderRadius: "lg"        // ✅ Auto-complete
  },
  onSuccess: (data: PaymentSuccessData) => {
    // ✅ Full IntelliSense
    console.log(data.transactionId);
    console.log(data.amount);
  }
};
```

---

## 🧪 Testing

### Unit Tests

```jsx
import { render, fireEvent } from '@testing-library/react';
import { PaymentWidget } from 'payment-widget-sdk';

test('calls onSuccess when payment completes', () => {
  const mockOnSuccess = jest.fn();
  
  render(
    <PaymentWidget 
      config={{
        orderId: "test-order",
        onSuccess: mockOnSuccess
      }}
    />
  );
  
  // Simulate payment completion
  // ... test implementation
  
  expect(mockOnSuccess).toHaveBeenCalledWith({
    transactionId: expect.any(String),
    orderId: "test-order"
  });
});
```

### E2E Tests

```javascript
// cypress/e2e/payment.cy.js
describe('Payment Widget', () => {
  it('completes payment flow', () => {
    cy.visit('/checkout');
    cy.get('[data-testid="payment-widget"]').should('be.visible');
    
    // Fill payment form
    cy.get('[data-testid="card-number"]').type('4111111111111111');
    cy.get('[data-testid="submit-payment"]').click();
    
    // Assert success
    cy.url().should('include', '/success');
  });
});
```

---

## 📚 Documentation

- **📖 [Complete Guide](GUIA-USO-CLIENTE.md)** - Detailed usage examples
- **🔧 [API Reference](docs/api-reference.md)** - Full API documentation  
- **🎨 [Theming Guide](docs/theming.md)** - Customization options
- **🐛 [Troubleshooting](docs/troubleshooting.md)** - Common issues
- **📦 [Migration Guide](docs/migration.md)** - Version updates

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md).

### Development Setup

```bash
# Clone repository
git clone https://github.com/your-org/payment-widget-sdk
cd payment-widget-sdk

# Install dependencies
npm ci

# Start development server
npm run dev

# Build SDK
npm run build:sdk

# Run tests
npm test
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 📞 Support

- **📖 Documentation**: [Full Guide](GUIA-USO-CLIENTE.md)
- **🐛 Issues**: [GitHub Issues](https://github.com/your-org/payment-widget-sdk/issues)
- **💬 Discord**: [Join Community](https://discord.gg/payment-widget)
- **📧 Email**: support@yourdomain.com

---

## 🚀 Roadmap

- [ ] Vue.js wrapper
- [ ] Angular wrapper  
- [ ] Vanilla JS version improvements
- [ ] Advanced analytics dashboard
- [ ] A/B testing capabilities
- [ ] Multi-currency support
- [ ] Recurring payments UI
- [ ] Split payments

---

*Made with ❤️ by the Payment Widget team*