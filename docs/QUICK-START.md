# ⚡ Quick Start - Widget Cartão Simples

Este guia te leva de zero a widget funcionando em **menos de 5 minutos**.

## 🎯 Opção 1: HTML Puro (Mais Rápido)

Crie um arquivo `teste.html`:

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Teste Widget Cartão Simples</title>
    <style>
      body {
        font-family: system-ui, -apple-system, sans-serif;
        padding: 2rem;
        max-width: 800px;
        margin: 0 auto;
      }

      .btn-payment {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 1rem 2rem;
        font-size: 1.1rem;
        border-radius: 8px;
        cursor: pointer;
        transition: transform 0.2s;
      }

      .btn-payment:hover {
        transform: translateY(-2px);
      }
    </style>
  </head>
  <body>
    <h1>🚀 Teste do Widget</h1>
    <p>Clique no botão abaixo para abrir o widget de pagamento:</p>

    <button class="btn-payment" onclick="abrirWidget()">
      💳 Parcele sem comprometer seu limite
    </button>

    <!-- Widget Bootstrap -->
    <script
      src="https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js"
      async
    ></script>

    <script>
      function abrirWidget() {
        // Verificar se o widget carregou
        if (typeof window.PaymentWidget === "undefined") {
          alert(
            "Widget ainda está carregando... Tente novamente em 1 segundo."
          );
          return;
        }

        // Configurar e abrir o widget
        window.PaymentWidget.init({
          orderId: "test-merchant-123",
          primaryColor: "#667eea",
          secondaryColor: "#764ba2",
          logoUrl:
            "https://via.placeholder.com/150x50/667eea/ffffff?text=Sua+Loja",
          environment: "staging",
          autoOpen: true,

          // Callbacks
          onSuccess: function (data) {
            console.log("✅ Pagamento realizado com sucesso!", data);
            alert("Pagamento aprovado! ID: " + data.transactionId);
          },

          onError: function (error) {
            console.error("❌ Erro no pagamento:", error);
            alert("Erro: " + error.message);
          },

          onClose: function () {
            console.log("Widget fechado pelo usuário");
          },
        });
      }
    </script>
  </body>
</html>
```

**Abra o arquivo no navegador e teste!**

---

## 🎯 Opção 2: React (Projeto Vite)

### 1. Criar projeto React

```bash
npm create vite@latest meu-checkout -- --template react-ts
cd meu-checkout
npm install
```

### 2. Instalar o widget

```bash
npm install cartao-simples-widget
```

### 3. Usar no componente

Edite `src/App.tsx`:

```tsx
import { useState } from "react";
import { PaymentWidget } from "cartao-simples-widget";

function App() {
  const [showWidget, setShowWidget] = useState(false);

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1>🚀 Checkout com Cartão Simples</h1>

      <button
        onClick={() => setShowWidget(true)}
        style={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
          padding: "1rem 2rem",
          fontSize: "1.1rem",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        💳 Parcele sem comprometer o limite
      </button>

      {showWidget && (
        <PaymentWidget
          config={{
            orderId: "test-merchant-123",
            primaryColor: "#667eea",
            environment: "staging",
            onSuccess: (data) => {
              console.log("✅ Sucesso!", data);
              alert(`Pagamento aprovado! ID: ${data.transactionId}`);
              setShowWidget(false);
            },
            onError: (error) => {
              console.error("❌ Erro:", error);
              alert(`Erro: ${error.message}`);
            },
            onClose: () => {
              setShowWidget(false);
            },
          }}
        />
      )}
    </div>
  );
}

export default App;
```

### 4. Rodar o projeto

```bash
npm run dev
```

Abra http://localhost:5173

---

## 🎯 Opção 3: Vue.js

### 1. Criar projeto Vue

```bash
npm create vue@latest meu-checkout
cd meu-checkout
npm install
```

### 2. Adicionar script no `index.html`

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Checkout</title>
    <script
      src="https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js"
      async
    ></script>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>
```

### 3. Usar no componente Vue

```vue
<template>
  <div class="checkout">
    <h1>🚀 Checkout com Cartão Simples</h1>
    <button @click="abrirWidget" class="btn-payment">
      💳 Parcele sem comprometer o limite
    </button>
  </div>
</template>

<script setup>
const abrirWidget = () => {
  if (typeof window.PaymentWidget === "undefined") {
    alert("Widget carregando...");
    return;
  }

  window.PaymentWidget.init({
    orderId: "test-merchant-123",
    primaryColor: "#667eea",
    environment: "staging",
    autoOpen: true,

    onSuccess: (data) => {
      console.log("✅ Sucesso!", data);
      alert(`Pagamento aprovado! ID: ${data.transactionId}`);
    },

    onError: (error) => {
      console.error("❌ Erro:", error);
    },
  });
};
</script>

<style scoped>
.checkout {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.btn-payment {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  border-radius: 8px;
  cursor: pointer;
}
</style>
```

---

## 🧪 Testar Localmente

### Opção A: Python HTTP Server

```bash
# Python 3
python3 -m http.server 8080

# Abrir no navegador
open http://localhost:8080/teste.html
```

### Opção B: Node.js HTTP Server

```bash
# Instalar
npm install -g http-server

# Rodar
http-server -p 8080

# Abrir
open http://localhost:8080/teste.html
```

### Opção C: VS Code Live Server

1. Instalar extensão "Live Server"
2. Clicar direito no arquivo `.html`
3. Selecionar "Open with Live Server"

---

## ✅ Checklist de Verificação

Após implementar, verifique:

- [ ] Widget abre ao clicar no botão
- [ ] Formulário aparece com os campos corretos
- [ ] Tema/cores aplicados corretamente
- [ ] Callbacks `onSuccess` e `onError` funcionam
- [ ] Widget fecha ao pressionar ESC
- [ ] Funciona em mobile (responsivo)
- [ ] Console sem erros

---

## 🔍 Debug Rápido

### Widget não aparece?

```javascript
// Verificar se carregou
console.log("Widget disponível?", typeof window.PaymentWidget !== "undefined");

// Verificar erro
window.addEventListener("error", (e) => {
  console.error("Erro global:", e);
});
```

### Estilos quebrados?

```javascript
// Verificar Shadow DOM
const container = document.querySelector("[data-payment-widget-root]");
console.log("Shadow DOM:", container?.shadowRoot);
```

### CORS Error?

- Certifique-se de usar HTTPS em produção
- Verifique se o domínio está na whitelist
- Teste em `localhost` primeiro

---

## 📊 URLs de Teste

### Staging

```
https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js
https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.js
https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.css
```

### Produção (futura)

```
https://cdn.cartaosimples.com.br/widget-bootstrap.v1.min.js
https://cdn.cartaosimples.com.br/widget.v1.min.js
https://cdn.cartaosimples.com.br/widget.v1.min.css
```

---

## 🎨 Customização Rápida

### Alterar cores

```javascript
window.PaymentWidget.init({
  orderId: "seu-id",
  primaryColor: "#FF6600", // Cor principal
  secondaryColor: "#0A0A0A", // Cor secundária
  logoUrl: "https://seusite.com/logo.png",
});
```

### Alterar bordas

```javascript
window.PaymentWidget.init({
  orderId: "seu-id",
  borderRadius: "16px", // ou 'sm', 'md', 'lg', 'full'
});
```

---

## 🆘 Precisa de Ajuda?

- 📚 **Documentação Completa**: [GUIA-DEPLOY-CDN.md](./GUIA-DEPLOY-CDN.md)
- 📖 **README**: [README.md](./README.md)
- 🔧 **Publishing Guide**: [PUBLISHING.md](./PUBLISHING.md)
- 📧 **Email**: dev@cartaosimples.com
- 🐛 **Issues**: https://github.com/Rellyso/payment-widget-poc/issues

---

## 🚀 Próximos Passos

Depois que o widget estiver funcionando:

1. **Personalize o tema** com suas cores/logo
2. **Integre com seu backend** usando os callbacks
3. **Teste fluxos completos** (aprovação/recusa)
4. **Configure ambiente de produção**
5. **Monitore transações** no dashboard

**Bom desenvolvimento! 🎉**
