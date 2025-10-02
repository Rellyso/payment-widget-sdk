# Bootstrap Loader - Explicação Técnica

## 🎯 O que é o Bootstrap?

O `src/bootstrap/index.ts` é o **Bootstrap Loader** do Payment Widget - um script JavaScript **leve (~5KB gzipped)** que age como um "carregador inteligente" do widget completo.

### Arquitetura de 3 Camadas

```
┌─────────────────────────────────────────┐
│  1. Bootstrap (Este arquivo) - ~5KB     │  ← Carrega primeiro
│     - Inicialização rápida              │
│     - Gerencia configuração             │
│     - Carrega o bundle principal        │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  2. CDN Bundle - ~400KB                 │  ← Carrega sob demanda
│     - React + ReactDOM                  │
│     - Componentes do Widget             │
│     - Toda a UI                         │
└─────────────────────────────────────────┘
                   ↓
┌─────────────────────────────────────────┐
│  3. Widget UI Renderizado               │  ← Aparece na página
│     - Modal de pagamento                │
│     - Formulários                       │
│     - Fluxo de análise de crédito       │
└─────────────────────────────────────────┘
```

---

## 📅 Quando é Executado?

### **1. No Carregamento da Página** (`DOMContentLoaded`)

O bootstrap se auto-inicializa quando o DOM está pronto:

```javascript
document.addEventListener("DOMContentLoaded", () => {
  // Método 1: Lê atributos data-* do próprio script
  const currentScript = document.currentScript;
  if (currentScript) {
    const config = extractConfigFromDataAttributes(currentScript);
    if (config.merchantId) {
      bootstrap.init(config);
    }
  }

  // Método 2: Lê configuração de window.PaymentWidgetInit
  if (window.PaymentWidgetInit) {
    bootstrap.init(window.PaymentWidgetInit);
  }
});
```

**Exemplo de uso com data-attributes:**

```html
<script
  src="https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js"
  data-merchant-id="merchant_123"
  data-primary-color="#FF6B6B"
  data-auto-open="true"
></script>
```

**Exemplo com configuração via window:**

```html
<script>
  window.PaymentWidgetInit = {
    merchantId: "merchant_123",
    theme: {
      primaryColor: "#FF6B6B",
    },
    autoOpen: true,
  };
</script>
<script src="https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js"></script>
```

### **2. Via API Programática**

O desenvolvedor pode chamar manualmente após carregar o script:

```javascript
// Aguarda o script estar carregado
await window.PaymentWidget.init({
  merchantId: "merchant_123",
  theme: {
    primaryColor: "#FF6B6B",
    secondaryColor: "#4ECDC4",
    borderRadius: "lg",
  },
  logoUrl: "https://minha-empresa.com/logo.png",
  environment: "production",
});

// Abre o widget quando necessário
window.PaymentWidget.open();
```

---

## 🔧 Funcionamento Detalhado

### **Classe Principal: `PaymentWidgetBootstrap`**

```typescript
class PaymentWidgetBootstrap {
  private readonly state: BootstrapState = {
    instances: Map<string, InternalWidgetInstance>, // Múltiplas instâncias
    isLoaded: boolean, // Bundle carregado?
    loadPromise: Promise<void> | null, // Promise de carregamento
  };
}
```

#### **Estado Interno**

- **`instances`**: Map que armazena múltiplas instâncias do widget (suporta multi-merchant)
- **`isLoaded`**: Flag que indica se o bundle principal (React) já foi carregado
- **`loadPromise`**: Promise compartilhada para evitar múltiplos carregamentos simultâneos

### **Fluxo de Inicialização (`init()`)**

```
┌─────────────────────────────────────┐
│ 1. Validação ✓                      │
│    └─> Verifica merchantId          │
│    └─> Verifica duplicação          │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 2. Criação do Container 📦          │
│    └─> Cria <div> no DOM            │
│    └─> ID: __payment_widget_root__  │
│    └─> position: fixed              │
│    └─> z-index: 999999              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 3. Isolamento com Shadow DOM 🛡️     │
│    └─> attachShadow({ mode: open }) │
│    └─> Fallback: iframe sandbox     │
│    └─> Proteção contra conflitos    │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 4. Carregamento do Bundle 📥        │
│    └─> Cria <script> tag            │
│    └─> src: widget.v1.min.js        │
│    └─> Aguarda CartaoSimplesWidget  │
│    └─> Retry com timeout (50x)      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 5. Montagem do React ⚛️              │
│    └─> CartaoSimplesWidget.mount()  │
│    └─> Aplica tema (CSS vars)       │
│    └─> Retorna API da instância     │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ 6. Auto-open (opcional) 🚀          │
│    └─> Se config.autoOpen = true    │
│    └─> Chama instance.api.open()    │
└─────────────────────────────────────┘
```

---

## 🎨 Recursos Principais

### **1. Multi-instância**

Suporta múltiplos widgets na mesma página (útil para marketplaces):

```javascript
// Inicializa múltiplos merchants
await PaymentWidget.init({ merchantId: "merchant_1" });
await PaymentWidget.init({ merchantId: "merchant_2" });

// Controla cada um independentemente
PaymentWidget.open("merchant_1"); // Abre o primeiro
PaymentWidget.close("merchant_1"); // Fecha o primeiro
PaymentWidget.open("merchant_2"); // Abre o segundo
```

### **2. Shadow DOM (Isolamento de Estilos)**

```javascript
private createShadowDOM(container: HTMLElement): ShadowRoot | null {
  try {
    if (container.attachShadow) {
      const shadowRoot = container.attachShadow({ mode: "open" });

      // Cria elemento root dentro do shadow
      const rootDiv = document.createElement("div");
      rootDiv.id = "pw-root";
      rootDiv.className = "pw-root payment-widget";
      shadowRoot.appendChild(rootDiv);

      return shadowRoot;
    }
  } catch (error) {
    // Fallback para iframe se Shadow DOM não suportado
    this.createIframeFallback(container);
    return null;
  }
}
```

**Por que Shadow DOM?**

- ✅ Estilos da página **não afetam** o widget
- ✅ Estilos do widget **não afetam** a página
- ✅ Evita conflitos de classes CSS (ex: `.button`, `.modal`)
- ✅ Segurança adicional (isolamento de escopo)
- ✅ Suporta fallback para iframe em navegadores antigos

### **3. Lazy Loading (Carregamento Sob Demanda)**

```javascript
private loadUIBundle(): Promise<void> {
  // Já carregado? Retorna imediatamente
  if (this.state.isLoaded) {
    return Promise.resolve();
  }

  // Carregamento já em andamento? Retorna a mesma promise
  if (this.state.loadPromise) {
    return this.state.loadPromise;
  }

  // Inicia novo carregamento
  this.state.loadPromise = new Promise((resolve, reject) => {
    // Verifica se já foi carregado por outro script
    if (window.CartaoSimplesWidget) {
      this.state.isLoaded = true;
      resolve();
      return;
    }

    // Cria script tag dinamicamente
    const script = document.createElement("script");
    script.src = WIDGET_BUNDLE_URL;
    script.async = true;
    script.crossOrigin = "anonymous";

    script.onload = () => {
      this.state.isLoaded = true;
      resolve();
    };

    script.onerror = () => {
      reject(new Error("Falha ao carregar widget bundle"));
    };

    document.head.appendChild(script);
  });

  return this.state.loadPromise;
}
```

**Vantagens do Lazy Loading:**

- 📉 **Reduz tempo de carregamento inicial** da página (5KB vs 400KB)
- 🚀 Bootstrap carrega primeiro, bundle pesado depois
- 💾 Aproveita cache do CloudFront para o bundle principal
- 🔄 Evita múltiplos downloads simultâneos (promise compartilhada)

### **4. Tema White-Label**

Permite personalização visual **sem rebuild do código**:

```javascript
private applyTheme(element: HTMLElement, config: WidgetConfig): void {
  const style = element.style || document.documentElement.style;

  // Cores primária e secundária
  if (config.theme?.primaryColor) {
    style.setProperty("--pw-primary", config.theme.primaryColor);
  }
  if (config.theme?.secondaryColor) {
    style.setProperty("--pw-secondary", config.theme.secondaryColor);
  }

  // Logo customizado
  if (config.logoUrl) {
    style.setProperty("--pw-logo-url", `url(${config.logoUrl})`);
  }

  // Border radius
  if (config.theme?.borderRadius) {
    const borderRadius = this.parseBorderRadius(config.theme.borderRadius);
    style.setProperty("--pw-border-radius", borderRadius);
  }
}
```

**Exemplo de personalização:**

```javascript
PaymentWidget.init({
  merchantId: "merchant_123",
  logoUrl: "https://minha-empresa.com/logo.png",
  theme: {
    primaryColor: "#FF6B6B", // Vermelho coral
    secondaryColor: "#4ECDC4", // Verde água
    borderRadius: "lg", // Bordas grandes (12px)
  },
});
```

**Presets de Border Radius:**

```typescript
const presets = {
  sm: "4px", // Pequeno
  md: "8px", // Médio
  lg: "12px", // Grande
  full: "9999px", // Totalmente arredondado
};
```

### **5. Configuração via Data Attributes**

Extrai configuração diretamente dos atributos do script:

```javascript
function extractConfigFromDataAttributes(
  script: HTMLScriptElement
): WidgetConfig {
  const dataset = script.dataset;

  return {
    merchantId: dataset.merchantId || "",
    theme: {
      primaryColor: dataset.primary || dataset.primaryColor,
      secondaryColor: dataset.secondary || dataset.secondaryColor,
      borderRadius: dataset.borderRadius,
    },
    logoUrl: dataset.logo || dataset.logoUrl,
    environment: dataset.env || dataset.environment,
    apiBaseUrl: dataset.apiBaseUrl,
    autoOpen: dataset.autoOpen === "true",
  };
}
```

**Uso no HTML:**

```html
<script
  src="https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js"
  data-merchant-id="merchant_123"
  data-primary-color="#FF6B6B"
  data-secondary-color="#4ECDC4"
  data-logo="https://example.com/logo.png"
  data-border-radius="lg"
  data-environment="production"
  data-auto-open="true"
></script>
```

---

## 🌐 API Pública Exposta

### **`window.PaymentWidget`**

```typescript
window.PaymentWidget = {
  // Inicializa o widget com configuração
  init: (config: WidgetConfig) => Promise<void>,

  // Abre o modal do widget
  open: (merchantId?: string) => void,

  // Fecha o modal do widget
  close: (merchantId?: string) => void,

  // Remove completamente o widget do DOM
  destroy: (merchantId?: string) => void,

  // Retorna o estado atual do widget
  getState: () => WidgetState
};
```

### **Exemplo de Uso Completo**

```javascript
// 1. Inicializar o widget
await window.PaymentWidget.init({
  merchantId: "merchant_123",
  environment: "production",
  theme: {
    primaryColor: "#FF6B6B",
    secondaryColor: "#4ECDC4",
  },

  // Callbacks
  onSuccess: (data) => {
    console.log("Pagamento aprovado!", data);
    // { transactionId, token, merchantId, amount, ... }
  },
  onError: (error) => {
    console.error("Erro no pagamento:", error);
    // { code, message, details }
  },
  onOpen: () => {
    console.log("Widget aberto");
  },
  onClose: () => {
    console.log("Widget fechado");
  },
});

// 2. Abrir o widget quando o usuário clicar em um botão
document.getElementById("pay-button").addEventListener("click", () => {
  window.PaymentWidget.open();
});

// 3. Verificar o estado atual
const state = window.PaymentWidget.getState();
console.log("Widget está aberto?", state.isOpen);
console.log("Bundle carregado?", state.isLoaded);

// 4. Fechar programaticamente
window.PaymentWidget.close();

// 5. Destruir quando não for mais necessário
window.PaymentWidget.destroy();
```

---

## 🔄 Ciclo de Vida Completo

```
┌─────────────────────────────────────┐
│ Página HTML Carrega                 │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Bootstrap Script Carrega (~5KB)     │
│ <script src="...bootstrap.js">      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ DOMContentLoaded Event Dispara      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Lê Configuração                     │
│ - data-* attributes, ou             │
│ - window.PaymentWidgetInit, ou      │
│ - API programática                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ bootstrap.init(config) Chamado      │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Cria Container no DOM               │
│ <div id="__payment_widget_root__">  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Cria Shadow DOM (ou iframe)         │
│ - Isolamento de estilos             │
│ - Segurança adicional               │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Carrega Bundle Principal (~400KB)   │
│ <script src="...widget.v1.min.js">  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Aguarda React Estar Disponível      │
│ - window.CartaoSimplesWidget        │
│ - Retry 50x com 100ms delay         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Monta Componente React              │
│ - ReactDOM.createRoot()             │
│ - Renderiza <PaymentWidget>         │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Aplica Tema White-Label             │
│ - CSS variables (--pw-primary, etc) │
│ - Logo customizado                  │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Widget Pronto! ✓                    │
│ - API disponível                    │
│ - Aguardando user.open()            │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ [Auto-open se configurado]          │
│ config.autoOpen = true              │
└─────────────────────────────────────┘
              ↓
┌─────────────────────────────────────┐
│ Widget Renderizado e Visível ✓      │
│ - Modal aparece na tela             │
│ - Usuário interage                  │
└─────────────────────────────────────┘
```

---

## 🎯 Vantagens desta Arquitetura

### **1. Performance Otimizada** 🚀

- **Carregamento inicial rápido**: Página carrega apenas 5KB inicialmente
- **Lazy loading**: Bundle pesado (400KB) carrega assincronamente
- **Cache agressivo**: CloudFront cacheia o bundle por 1 ano
- **Promise compartilhada**: Evita múltiplos downloads simultâneos

### **2. Flexibilidade de Integração** 🔧

- **3 formas de inicializar**:
  - Data attributes no script
  - Objeto `window.PaymentWidgetInit`
  - API programática `window.PaymentWidget.init()`
- **Multi-instância**: Suporta múltiplos merchants na mesma página
- **Configuração dinâmica**: Sem necessidade de rebuild

### **3. Isolamento e Segurança** 🛡️

- **Shadow DOM**: Estilos completamente isolados
- **Fallback iframe**: Para navegadores sem Shadow DOM
- **Sandbox**: Restrições de segurança no iframe fallback
- **Escopo controlado**: Sem poluição do namespace global

### **4. White-Label Fácil** 🎨

- **CSS Variables**: Customização via `--pw-*` variables
- **Logo customizado**: URL configurável
- **Cores ajustáveis**: Primary, secondary, etc
- **Border radius**: Presets ou valores customizados

### **5. CDN-Friendly** 🌍

- **CloudFront cache**: 5 minutos para bootstrap, 1 ano para bundle
- **Versionamento de URLs**: `widget.v1.min.js` (cache-busting)
- **CORS habilitado**: Cross-origin requests permitidos
- **SRI hashes**: Subresource Integrity para segurança

---

## 🔍 Detalhes Técnicos Importantes

### **Constantes de Configuração**

```typescript
const CDN_BASE_URL = "https://d2x7cg3k3on9lk.cloudfront.net";
const WIDGET_BUNDLE_URL = `${CDN_BASE_URL}/widget.v1.min.js`;
const CONTAINER_ID_PREFIX = "__payment_widget_root__";
const ROOT_ELEMENT_ID = "pw-root";
const RETRY_DELAY_MS = 100;
const MAX_RETRIES = 50;
```

⚠️ **CRÍTICO**: O `CDN_BASE_URL` **DEVE** apontar para o CloudFront, não para domínio placeholder. Alterar isso causará 404 em produção.

### **Estrutura de Container**

```javascript
const container = document.createElement("div");
container.id = `${CONTAINER_ID_PREFIX}${merchantId}`;
container.style.cssText = `
  position: fixed;      /* Sempre visível mesmo com scroll */
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 999999;      /* Sempre no topo */
  display: none;        /* Oculto por padrão */
  pointer-events: none; /* Não bloqueia cliques quando fechado */
`;
```

### **Fallback de Iframe**

Quando Shadow DOM não é suportado (navegadores antigos):

```javascript
private createIframeFallback(container: HTMLElement): void {
  const iframe = document.createElement("iframe");
  iframe.id = ROOT_ELEMENT_ID;
  iframe.style.cssText = `
    width: 100%;
    height: 100%;
    border: none;
    background: transparent;
  `;

  // Sandbox com permissões mínimas necessárias
  iframe.sandbox.add(
    "allow-scripts",      // Permite JavaScript
    "allow-same-origin",  // Permite acesso ao DOM pai
    "allow-forms",        // Permite formulários
    "allow-popups"        // Permite abrir janelas (ex: 3DS)
  );

  container.appendChild(iframe);
}
```

### **Retry Logic para Bundle**

```javascript
private async initializeUI(instance: InternalWidgetInstance): Promise<CDNWidgetInstance> {
  let retries = 0;

  // Aguarda o bundle estar disponível (máx 5 segundos)
  while (!window.CartaoSimplesWidget && retries < MAX_RETRIES) {
    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    retries++;
  }

  if (!window.CartaoSimplesWidget) {
    throw new Error("Widget UI bundle não carregado");
  }

  // Monta o widget React
  return window.CartaoSimplesWidget.mount(rootElement, instance.config);
}
```

---

## 📦 Builds e Deploy

### **Build do Bootstrap**

```bash
npm run build:bootstrap
```

Gera: `dist/bootstrap/widget-bootstrap.v1.min.js` (~5KB)

### **Deploy para CDN**

```bash
./deploy.sh staging     # Deploy para staging
./deploy.sh production  # Deploy para produção
```

O script automaticamente:

1. Builda todos os targets (SDK, CDN, Bootstrap)
2. Valida integridade dos arquivos
3. Faz upload para S3 com CORS headers
4. Invalida cache do CloudFront
5. Gera SRI hashes
6. Testa deployment via HTTP

### **Cache Strategy**

- **Bootstrap**: Cache curto (5 minutos) - atualizado frequentemente
- **Bundle**: Cache longo (1 ano) - URLs versionadas
- **Invalidação**: CloudFront invalidation para atualizações urgentes

---

## 🐛 Troubleshooting

### **Problema: "Widget não carrega"**

```javascript
// Verificar se o bundle foi carregado
console.log("CartaoSimplesWidget disponível?", !!window.CartaoSimplesWidget);

// Verificar estado do bootstrap
const state = window.PaymentWidget?.getState();
console.log("Estado do widget:", state);
```

### **Problema: "CORS error"**

- Verificar se S3 bucket tem CORS configurado
- Script de deploy configura automaticamente
- Testar via HTTP server, não `file://`

### **Problema: "Estilos conflitando"**

- Shadow DOM deveria isolar estilos
- Verificar se Shadow DOM foi criado com sucesso
- Fallback para iframe se necessário

### **Problema: "Multiple instances não funcionam"**

```javascript
// Especificar merchantId ao abrir/fechar
PaymentWidget.open("merchant_1");
PaymentWidget.close("merchant_1");

// Sem merchantId, usa o primeiro encontrado
PaymentWidget.open(); // Abre primeiro merchant
```

---

## 📚 Recursos Relacionados

- [`GUIA-DEPLOY-CDN.md`](./GUIA-DEPLOY-CDN.md) - Guia completo de deploy
- [`GUIA-USO-WIDGET.md`](./GUIA-USO-WIDGET.md) - Guia de uso para desenvolvedores
- [`SOLUCAO-CORS.md`](./SOLUCAO-CORS.md) - Configuração e troubleshooting de CORS
- [`COMANDOS-UTEIS.md`](./COMANDOS-UTEIS.md) - Comandos úteis de desenvolvimento

---

## 🎓 Conclusão

O **Bootstrap Loader** é essencialmente o **"gerente de carga"** do widget:

✅ Carrega o widget pesado apenas quando necessário  
✅ Isola estilos para evitar conflitos  
✅ Aplica temas personalizados dinamicamente  
✅ Expõe API simples para desenvolvedores  
✅ Suporta múltiplas instâncias  
✅ Otimizado para performance e cache

Esta arquitetura permite que o widget seja **leve, rápido e flexível**, mantendo uma **excelente experiência de desenvolvedor (DX)** e **performance para o usuário final (UX)**.
