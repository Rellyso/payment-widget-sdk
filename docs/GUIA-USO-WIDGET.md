# 🎯 Guia de Uso do Widget via CDN

## 📦 Duas Formas de Usar o Widget

### Opção 1: Via Bootstrap (Recomendado para produção)

O **bootstrap** é um script leve (~5KB) que gerencia o carregamento dinâmico do widget.

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- CSS do Widget -->
    <link
      rel="stylesheet"
      href="https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.css"
    />
  </head>
  <body>
    <!-- Seu conteúdo -->

    <!-- Bootstrap loader -->
    <script
      src="https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js"
      data-merchant-id="seu-merchant-id"
      data-primary-color="#667eea"
      data-env="production"
    ></script>

    <!-- Ou via JavaScript -->
    <script>
      // Após o bootstrap carregar
      window.PaymentWidget.init({
        orderId: "seu-merchant-id",
        primaryColor: "#667eea",
        environment: "production",
        autoOpen: false,
        onOpen: () => console.log("Widget aberto"),
        onClose: () => console.log("Widget fechado"),
        onError: (error) => console.error("Erro:", error),
      });

      // Controlar o widget
      window.PaymentWidget.open(); // Abrir
      window.PaymentWidget.close(); // Fechar
    </script>
  </body>
</html>
```

**API do Bootstrap:**

- `window.PaymentWidget.init(config)` - Inicializa o widget
- `window.PaymentWidget.open()` - Abre o modal
- `window.PaymentWidget.close()` - Fecha o modal
- `window.PaymentWidget.destroy()` - Remove o widget
- `window.PaymentWidget.getState()` - Retorna estado atual

### Opção 2: Bundle CDN Direto (Para desenvolvimento/testes)

O **bundle CDN** inclui React e toda a UI (~400KB).

```html
<!DOCTYPE html>
<html>
  <head>
    <!-- CSS do Widget -->
    <link
      rel="stylesheet"
      href="https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.css"
    />
  </head>
  <body>
    <!-- Container onde o widget será montado -->
    <div id="widget-root"></div>

    <!-- Bundle CDN completo -->
    <script src="https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.js"></script>

    <script>
      const container = document.getElementById("widget-root");

      const widgetInstance = window.CartaoSimplesWidget.mount(container, {
        orderId: "seu-merchant-id",
        primaryColor: "#667eea",
        environment: "production",
        onClose: () => console.log("Widget fechado"),
        onError: (error) => console.error("Erro:", error),
      });

      // Controlar o widget
      widgetInstance.open(); // Abrir modal
      widgetInstance.close(); // Fechar modal
      widgetInstance.destroy(); // Destruir instância
      widgetInstance.getState(); // Estado atual
    </script>
  </body>
</html>
```

**API do Bundle CDN:**

- `window.CartaoSimplesWidget.mount(container, config)` - Monta o widget e retorna instância
- `instance.open()` - Abre o modal
- `instance.close()` - Fecha o modal
- `instance.destroy()` - Destroi a instância
- `instance.getState()` - Retorna `{ isOpen: boolean }`

## 🔧 Configuração Completa

```typescript
interface WidgetConfig {
  // Obrigatório
  orderId: string; // ID do merchant

  // Aparência (opcional)
  primaryColor?: string; // Cor primária (ex: "#667eea")
  secondaryColor?: string; // Cor secundária
  logoUrl?: string; // URL do logo
  borderRadius?: "sm" | "md" | "lg" | "full" | string;

  // Ambiente (opcional)
  environment?: "staging" | "production"; // Padrão: production
  apiBaseUrl?: string; // URL customizada da API

  // Comportamento (opcional)
  autoOpen?: boolean; // Abre automaticamente (padrão: false)

  // Callbacks (opcional)
  onOpen?: () => void; // Quando o widget abre
  onClose?: () => void; // Quando o widget fecha
  onSuccess?: (data: any) => void; // Pagamento bem-sucedido
  onError?: (error: { code: string; message: string }) => void;
}
```

## 📊 Comparação: Bootstrap vs Bundle Direto

| Característica      | Bootstrap          | Bundle Direto         |
| ------------------- | ------------------ | --------------------- |
| **Tamanho inicial** | ~5KB               | ~400KB                |
| **Carregamento**    | Lazy (sob demanda) | Imediato              |
| **Isolamento**      | Shadow DOM         | Container DIV         |
| **API Global**      | `PaymentWidget`    | `CartaoSimplesWidget` |
| **Melhor para**     | Produção           | Desenvolvimento       |
| **Cache**           | Agressivo          | Agressivo             |

## 🎨 Exemplos de Uso

### Exemplo 1: Auto-open ao Clicar em Botão

```html
<button id="checkout-btn">Finalizar Compra</button>

<script src="https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js"></script>
<script>
  document.getElementById("checkout-btn").addEventListener("click", () => {
    window.PaymentWidget.init({
      orderId: "merchant-123",
      autoOpen: true,
      onSuccess: (data) => {
        alert("Pagamento realizado com sucesso!");
        console.log(data);
      },
    });
  });
</script>
```

### Exemplo 2: Widget Inline (sem modal)

```html
<div id="widget-inline" style="max-width: 500px; margin: 0 auto;"></div>

<script src="https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.js"></script>
<script>
  const container = document.getElementById("widget-inline");

  window.CartaoSimplesWidget.mount(container, {
    orderId: "merchant-123",
    primaryColor: "#10b981",
  });
</script>
```

### Exemplo 3: White-label Completo

```html
<script src="https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js"></script>
<script>
  window.PaymentWidget.init({
    orderId: "merchant-123",

    // Branding
    primaryColor: "#8b5cf6",
    secondaryColor: "#ec4899",
    logoUrl: "https://seusite.com/logo.png",
    borderRadius: "lg",

    // Ambiente
    environment: "production",

    // Callbacks
    onOpen: () => {
      console.log("Widget abriu");
      // Pode enviar analytics aqui
    },
    onClose: () => {
      console.log("Widget fechou");
    },
    onSuccess: (data) => {
      // Redirecionar para página de sucesso
      window.location.href = "/sucesso?id=" + data.transactionId;
    },
    onError: (error) => {
      alert("Erro: " + error.message);
    },
  });
</script>
```

## 🧪 Testes Disponíveis

Na pasta `public/examples/`:

1. **cloudfront-test.html** - Teste completo de CDN com logs
2. **teste-widget-direto.html** - Teste do bundle direto com debug
3. **teste-cdn-simples.html** - Teste simplificado
4. **exemplo-completo.html** - Demonstração interativa completa

Para testar localmente:

```bash
# Via Vite dev server
npm run dev
# Acesse: http://localhost:5173/examples/teste-widget-direto.html

# Ou via servidor de exemplos
npm run serve
# Acesse: http://localhost:3000/teste-widget-direto.html
```

## 🔍 Troubleshooting

### Widget não carrega

1. **Verifique se o CDN está acessível:**

   ```bash
   curl -I https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js
   ```

2. **Verifique o console do navegador (F12):**

   - Erros de CORS?
   - Arquivos 404?
   - JavaScript errors?

3. **Teste em ambiente HTTP (não file://):**
   ```bash
   npm run dev
   # ou
   python3 -m http.server 8080
   ```

### API não está disponível

**Bootstrap:**

```javascript
if (!window.PaymentWidget) {
  console.error("Bootstrap não carregado");
} else {
  console.log("API:", Object.keys(window.PaymentWidget));
}
```

**Bundle Direto:**

```javascript
if (!window.CartaoSimplesWidget) {
  console.error("Bundle CDN não carregado");
} else {
  console.log("API:", Object.keys(window.CartaoSimplesWidget));
}
```

### Widget não abre

```javascript
// Adicione callbacks para debug
window.PaymentWidget.init({
  orderId: "test",
  onOpen: () => console.log("✅ Abriu"),
  onClose: () => console.log("ℹ️ Fechou"),
  onError: (err) => console.error("❌ Erro:", err),
});

// Verifique o estado
console.log(window.PaymentWidget.getState());
```

## 📚 Recursos Adicionais

- **Documentação Completa:** `GUIA-DEPLOY-CDN.md`
- **Quick Start:** `QUICK-START.md`
- **Comandos Úteis:** `COMANDOS-UTEIS.md`
- **Problema CORS Resolvido:** `SOLUCAO-CORS.md`

---

**URLs do CDN:**

- Bootstrap: `https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js`
- Bundle: `https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.js`
- CSS: `https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.css`
