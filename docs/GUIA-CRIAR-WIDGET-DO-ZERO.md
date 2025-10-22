# Guia Completo: Criando um Payment Widget do Zero

## 📋 Índice

1. [Introdução e Conceitos](#introdução-e-conceitos)
2. [Arquitetura e Decisões Técnicas](#arquitetura-e-decisões-técnicas)
3. [Configuração Inicial do Projeto](#configuração-inicial-do-projeto)
4. [Estrutura de Build: SDK vs CDN](#estrutura-de-build-sdk-vs-cdn)
5. [Implementação do Widget](#implementação-do-widget)
6. [Shadow DOM e Isolamento de Estilos](#shadow-dom-e-isolamento-de-estilos)
7. [Sistema de Build Múltiplo](#sistema-de-build-múltiplo)
8. [Deploy e Distribuição](#deploy-e-distribuição)
9. [Segurança e Boas Práticas](#segurança-e-boas-práticas)
10. [Testes e Validação](#testes-e-validação)

---

## 1. Introdução e Conceitos

### O que é um Payment Widget?

Um Payment Widget é um componente embarcável que permite processar pagamentos em websites de terceiros. Ele precisa ser:

- **Isolado**: Não interferir com o CSS/JS do site hospedeiro
- **Seguro**: Proteger dados sensíveis de pagamento
- **Flexível**: Funcionar em diferentes ambientes (React, Vue, HTML puro)
- **Leve**: Carregar rapidamente sem impactar a performance

### Por que SDK + CDN?

Você precisa oferecer **duas formas de distribuição**:

#### **SDK (NPM Package)**

- ✅ Para projetos React/Vue/Angular modernos
- ✅ Melhor DX com TypeScript
- ✅ Tree-shaking e otimização automática
- ✅ Versionamento via package.json

#### **CDN (Script Tag)**

- ✅ Para sites HTML puro
- ✅ Não requer build step
- ✅ Atualização instantânea
- ✅ Funciona em qualquer plataforma

### Por que Bootstrap Loader?

Um **bootstrap loader** é um script minúsculo (~5KB) que carrega o widget principal (~400KB) sob demanda:

```
Bootstrap (5KB) → Carrega → Widget (400KB) apenas quando necessário
```

**Vantagens:**

- 🚀 Página inicial mais rápida
- 💰 Menos banda consumida
- ⚡ Widget só carrega quando o usuário interage

---

## 2. Arquitetura e Decisões Técnicas

### Stack Recomendada

```
React 18          → UI components
TypeScript        → Type safety
Vite              → Build tool (ultra-rápido)
Shadow DOM        → Isolamento de estilos
Tailwind CSS      → Styling (com prefixo)
Biome             → Linting/Formatting
```

### Por que React?

- ✅ Ecossistema maduro
- ✅ Fácil criar componentes isolados
- ✅ Hooks para gerenciamento de estado
- ✅ Pode ser compilado em bundle standalone

### Por que Vite?

- ⚡ Build 10-100x mais rápido que Webpack
- 🎯 Múltiplos entry points nativamente
- 📦 Tree-shaking automático
- 🔧 Configuração simples

### Por que Shadow DOM?

```javascript
// SEM Shadow DOM: CSS vaza para o site hospedeiro
<style>.button { color: red }</style> // 💥 Afeta TODOS os botões

// COM Shadow DOM: CSS isolado
shadowRoot.innerHTML = `
  <style>.button { color: red }</style>
  <button class="button">Pay</button>
` // ✅ Só afeta o widget
```

---

## 3. Configuração Inicial do Projeto

### Passo 1: Criar Projeto Base

```bash
# Criar projeto Vite + React + TypeScript
npm create vite@latest payment-widget -- --template react-ts

cd payment-widget
npm install
```

### Passo 2: Instalar Dependências

```bash
# Build & Dev
npm install -D vite @vitejs/plugin-react

# TypeScript
npm install -D typescript @types/react @types/react-dom

# Styling (opcional)
npm install -D tailwindcss postcss autoprefixer
npm install clsx tailwind-merge

# Linting (opcional mas recomendado)
npm install -D @biomejs/biome

# React (peer dependencies)
npm install react react-dom
```

### Passo 3: Estrutura de Pastas

```
payment-widget/
├── src/
│   ├── components/        # Componentes React
│   │   ├── PaymentWidget.tsx
│   │   ├── PaymentModal.tsx
│   │   └── steps/         # Passos do fluxo
│   ├── sdk/               # Entry point para NPM
│   │   └── index.ts
│   ├── cdn/               # Entry point para CDN
│   │   └── index.ts
│   ├── bootstrap/         # Entry point para Bootstrap
│   │   └── index.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   ├── styles/            # CSS files
│   │   ├── widget.css
│   │   └── widget-native.css
│   └── utils/             # Helpers
├── public/
│   └── examples/          # Exemplos de uso
├── dist/                  # Build output
│   ├── sdk/              # NPM package
│   ├── cdn/              # CDN bundle
│   └── bootstrap/        # Bootstrap loader
├── vite.config.sdk.ts    # Config para SDK
├── vite.config.cdn.ts    # Config para CDN
├── vite.config.bootstrap.ts  # Config para Bootstrap
└── package.json
```

---

## 4. Estrutura de Build: SDK vs CDN

### SDK Build (NPM Package)

**Objetivo:** Bundle otimizado para projetos modernos

```typescript
// vite.config.sdk.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/sdk",
    lib: {
      entry: resolve(__dirname, "src/sdk/index.ts"),
      name: "PaymentWidget",
      formats: ["es", "cjs"], // ESM + CommonJS
      fileName: (format) => `payment-widget.${format}.js`,
    },
    rollupOptions: {
      // React como peer dependency (não incluir no bundle)
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
});
```

**Por quê?**

- ✅ Não duplica React no bundle (peer dependency)
- ✅ Tree-shaking preservado
- ✅ Menor tamanho final no projeto do cliente

### CDN Build (Standalone Bundle)

**Objetivo:** Bundle completo que funciona sozinho

```typescript
// vite.config.cdn.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist/cdn",
    lib: {
      entry: resolve(__dirname, "src/cdn/index.ts"),
      name: "CartaoSimplesWidget", // Global window object
      formats: ["umd"], // Universal Module Definition
      fileName: () => "widget.v1.min.js", // Nome fixo versionado
    },
    rollupOptions: {
      // INCLUIR React no bundle
      external: [],
      output: {
        inlineDynamicImports: true, // Tudo em um arquivo
      },
    },
    cssCodeSplit: false, // CSS em arquivo separado
  },
});
```

**Por quê?**

- ✅ React incluído (~130KB) - funciona em qualquer site
- ✅ UMD permite uso via `<script>` tag
- ✅ Versionamento no nome do arquivo (cache control)

### Bootstrap Build (Lazy Loader)

**Objetivo:** Script mínimo que carrega o widget sob demanda

```typescript
// vite.config.bootstrap.ts
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "dist/bootstrap",
    lib: {
      entry: resolve(__dirname, "src/bootstrap/index.ts"),
      name: "PaymentWidget",
      formats: ["umd"],
      fileName: () => "widget-bootstrap.v1.min.js",
    },
    rollupOptions: {
      external: [], // Sem dependências externas
      output: {
        inlineDynamicImports: true,
      },
    },
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log
        drop_debugger: true,
      },
    },
  },
});
```

**Por quê?**

- ✅ ~5KB vs ~400KB do bundle completo
- ✅ Carrega widget apenas quando necessário
- ✅ Melhor performance inicial da página

---

## 5. Implementação do Widget

### 5.1 Tipos TypeScript

```typescript
// src/types/index.ts
export interface WidgetConfig {
  orderId: string;
  publicKey: string;
  environment?: "sandbox" | "production";
  theme?: {
    primaryColor?: string;
    borderRadius?: string;
  };
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: Error) => void;
  onClose?: () => void;
}

export interface PaymentResult {
  transactionId: string;
  status: "approved" | "pending" | "rejected";
  amount: number;
}

export interface WidgetInstance {
  open: () => void;
  close: () => void;
  destroy: () => void;
  getState: () => { isOpen: boolean };
}
```

**Por quê?**

- ✅ IntelliSense no VS Code
- ✅ Type safety
- ✅ Documentação auto-gerada

### 5.2 Componente Principal com Shadow DOM

```typescript
// src/components/PaymentWidget.tsx
import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import type { WidgetConfig } from "../types";

export function PaymentWidget({ config }: { config: WidgetConfig }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Criar Shadow DOM
    const shadow = containerRef.current.attachShadow({ mode: "open" });

    // Injetar CSS isolado
    const style = document.createElement("style");
    style.textContent = `
      /* Estilos isolados aqui */
      .widget-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background: rgba(0, 0, 0, 0.5);
        z-index: 999999;
      }
    `;
    shadow.appendChild(style);

    // Container para React
    const container = document.createElement("div");
    shadow.appendChild(container);

    // Renderizar componentes React dentro do Shadow DOM
    const root = createRoot(container);
    root.render(<PaymentModal config={config} />);

    return () => root.unmount();
  }, [config]);

  return <div ref={containerRef} />;
}
```

**Por quê Shadow DOM?**

- ✅ CSS do widget não afeta o site hospedeiro
- ✅ CSS do site não quebra o widget
- ✅ Isolamento total de estilos

### 5.3 SDK Entry Point

```typescript
// src/sdk/index.ts
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { PaymentWidget } from "../components/PaymentWidget";
import type { WidgetConfig, WidgetInstance } from "../types";

export function mount(
  container: HTMLElement,
  config: WidgetConfig
): WidgetInstance {
  let isOpen = false;

  // Renderizar React no container
  const root = createRoot(container);

  const instance: WidgetInstance = {
    open: () => {
      isOpen = true;
      root.render(createElement(PaymentWidget, { config }));
    },
    close: () => {
      isOpen = false;
      root.unmount();
    },
    destroy: () => {
      root.unmount();
    },
    getState: () => ({ isOpen }),
  };

  return instance;
}

// Export types para TypeScript users
export type { WidgetConfig, WidgetInstance, PaymentResult } from "../types";
```

**Uso no projeto cliente:**

```typescript
// Cliente React/Next.js
import { mount } from "@seu-pacote/payment-widget";

const widget = mount(document.getElementById("widget"), {
  orderId: "merchant_123",
  publicKey: "pk_live_...",
});

widget.open();
```

### 5.4 CDN Entry Point

```typescript
// src/cdn/index.ts
import { createElement } from "react";
import { createRoot } from "react-dom/client";
import { PaymentWidget } from "../components/PaymentWidget";
import type { WidgetConfig, WidgetInstance } from "../types";
import "../styles/widget.css"; // Incluir CSS

// Expor no window object
declare global {
  interface Window {
    CartaoSimplesWidget: {
      mount: (container: HTMLElement, config: WidgetConfig) => WidgetInstance;
    };
  }
}

function mount(container: HTMLElement, config: WidgetConfig): WidgetInstance {
  const root = createRoot(container);
  let isOpen = false;

  const instance: WidgetInstance = {
    open: () => {
      isOpen = true;
      root.render(createElement(PaymentWidget, { config }));
    },
    close: () => {
      isOpen = false;
      root.unmount();
    },
    destroy: () => {
      root.unmount();
    },
    getState: () => ({ isOpen }),
  };

  return instance;
}

// Exportar globalmente
window.CartaoSimplesWidget = { mount };
```

**Uso no HTML puro:**

```html
<script src="https://cdn.seu-site.com/widget.v1.min.js"></script>
<link rel="stylesheet" href="https://cdn.seu-site.com/widget.v1.min.css" />

<div id="payment-widget"></div>

<script>
  const widget = window.CartaoSimplesWidget.mount(
    document.getElementById("payment-widget"),
    {
      orderId: "merchant_123",
      publicKey: "pk_live_...",
    }
  );

  widget.open();
</script>
```

### 5.5 Bootstrap Entry Point

```typescript
// src/bootstrap/index.ts
const CDN_BASE_URL = "https://d2x7cg3k3on9lk.cloudfront.net";
const WIDGET_VERSION = "v1";

interface BootstrapConfig {
  orderId: string;
  publicKey: string;
  autoOpen?: boolean;
  [key: string]: any;
}

class PaymentWidgetBootstrap {
  private loadPromise: Promise<void> | null = null;
  private isLoaded = false;
  private widgetInstance: any = null;

  async init(config: BootstrapConfig): Promise<void> {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this.loadAssets().then(() => {
      this.isLoaded = true;

      // Widget agora está disponível em window
      const container = document.createElement("div");
      document.body.appendChild(container);

      this.widgetInstance = (window as any).CartaoSimplesWidget.mount(
        container,
        config
      );

      if (config.autoOpen) {
        this.widgetInstance.open();
      }
    });

    return this.loadPromise;
  }

  private async loadAssets(): Promise<void> {
    // Carregar CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = `${CDN_BASE_URL}/widget.${WIDGET_VERSION}.min.css`;
    document.head.appendChild(link);

    // Carregar JS
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = `${CDN_BASE_URL}/widget.${WIDGET_VERSION}.min.js`;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("Failed to load widget"));
      document.head.appendChild(script);
    });
  }

  open(): void {
    if (!this.isLoaded) {
      console.warn("Widget not loaded yet. Call init() first.");
      return;
    }
    this.widgetInstance?.open();
  }

  close(): void {
    this.widgetInstance?.close();
  }

  destroy(): void {
    this.widgetInstance?.destroy();
    this.isLoaded = false;
    this.loadPromise = null;
  }

  getState(): { isLoaded: boolean } {
    return { isLoaded: this.isLoaded };
  }
}

// Expor globalmente
(window as any).PaymentWidget = new PaymentWidgetBootstrap();
```

**Uso:**

```html
<script src="https://cdn.seu-site.com/widget-bootstrap.v1.min.js"></script>

<script>
  // Bootstrap carrega o widget sob demanda
  window.PaymentWidget.init({
    orderId: "merchant_123",
    publicKey: "pk_live_...",
    autoOpen: true,
  });
</script>
```

---

## 6. Shadow DOM e Isolamento de Estilos

### Problema: CSS Conflict

```html
<!-- Site hospedeiro -->
<style>
  .button {
    background: red;
  }
</style>

<!-- Seu widget (sem Shadow DOM) -->
<button class="button">Pay</button>
<!-- 💥 Fica vermelho! -->
```

### Solução: Shadow DOM

```typescript
// Criar Shadow Root
const shadow = container.attachShadow({ mode: "open" });

// CSS só afeta o Shadow DOM
const style = document.createElement("style");
style.textContent = `
  .button { background: blue; } /* ✅ Isolado! */
`;
shadow.appendChild(style);
```

### Tailwind CSS com Prefixo

Para evitar conflitos mesmo dentro do Shadow DOM:

```javascript
// tailwind.config.js
module.exports = {
  prefix: "tw-", // Prefixar todas as classes
  content: ["./src/**/*.{ts,tsx}"],
  corePlugins: {
    preflight: false, // Desabilitar reset global
  },
};
```

Uso:

```tsx
<button className="tw-bg-blue-500 tw-text-white">Pay</button>
```

### CSS Extraction Strategies

**Inline CSS (menor):**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        assetFileNames: "widget.css",
      },
    },
  },
});
```

**Injeção Automática:**

```typescript
// Injetar CSS no Shadow DOM
const style = document.createElement("style");
style.textContent = widgetCSS; // Importar CSS como string
shadowRoot.appendChild(style);
```

---

## 7. Sistema de Build Múltiplo

### Package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build:sdk": "vite build --config vite.config.sdk.ts",
    "build:cdn": "vite build --config vite.config.cdn.ts",
    "build:bootstrap": "vite build --config vite.config.bootstrap.ts",
    "build": "npm run build:sdk && npm run build:cdn && npm run build:bootstrap",
    "preview": "vite preview"
  }
}
```

### Build Sequencial vs Paralelo

**Sequencial (mais seguro):**

```bash
npm run build:sdk && npm run build:cdn && npm run build:bootstrap
```

**Paralelo (mais rápido):**

```bash
npm run build:sdk & npm run build:cdn & npm run build:bootstrap & wait
```

### Validação de Build

Criar script para validar builds:

```typescript
// scripts/validate-build.ts
import { existsSync, statSync } from "fs";
import { resolve } from "path";

const builds = [
  { name: "SDK", path: "dist/sdk/payment-widget.es.js" },
  { name: "CDN JS", path: "dist/cdn/widget.v1.min.js" },
  { name: "CDN CSS", path: "dist/cdn/widget.v1.min.css" },
  { name: "Bootstrap", path: "dist/bootstrap/widget-bootstrap.v1.min.js" },
];

console.log("🔍 Validating builds...\n");

let hasErrors = false;

for (const build of builds) {
  const fullPath = resolve(build.path);

  if (!existsSync(fullPath)) {
    console.error(`❌ ${build.name}: NOT FOUND`);
    hasErrors = true;
    continue;
  }

  const stats = statSync(fullPath);
  const sizeKB = (stats.size / 1024).toFixed(2);

  console.log(`✅ ${build.name}: ${sizeKB} KB`);
}

if (hasErrors) {
  process.exit(1);
}

console.log("\n✨ All builds valid!");
```

Adicionar ao package.json:

```json
{
  "scripts": {
    "build": "npm run build:all && npm run validate",
    "build:all": "npm run build:sdk && npm run build:cdn && npm run build:bootstrap",
    "validate": "tsx scripts/validate-build.ts"
  }
}
```

---

## 8. Deploy e Distribuição

### 8.1 NPM Package (SDK)

**Preparar package.json:**

```json
{
  "name": "@seu-pacote/payment-widget",
  "version": "1.0.0",
  "type": "module",
  "main": "./dist/sdk/payment-widget.cjs.js",
  "module": "./dist/sdk/payment-widget.es.js",
  "types": "./dist/sdk/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/sdk/payment-widget.es.js",
      "require": "./dist/sdk/payment-widget.cjs.js",
      "types": "./dist/sdk/index.d.ts"
    },
    "./style.css": "./dist/sdk/style.css"
  },
  "files": ["dist/sdk"],
  "peerDependencies": {
    "react": ">=18.0.0",
    "react-dom": ">=18.0.0"
  }
}
```

**Publicar:**

```bash
npm run build:sdk
npm publish --access public
```

### 8.2 CDN (S3 + CloudFront)

**Estrutura S3:**

```
s3://seu-bucket/
├── widget.v1.min.js         # Bundle principal
├── widget.v1.min.css        # Estilos
└── widget-bootstrap.v1.min.js  # Bootstrap loader
```

**Script de Deploy:**

```bash
#!/bin/bash
# deploy.sh

set -e

ENV=${1:-staging}
BUCKET_NAME="seu-bucket-${ENV}"
DISTRIBUTION_ID="EXXXXXXXXXXXXX"

echo "🚀 Deploying to ${ENV}..."

# Build
npm run build

# Validar
npm run validate

# Upload S3 com headers corretos
aws s3 cp dist/cdn/ s3://${BUCKET_NAME}/ \
  --recursive \
  --cache-control "public, max-age=31536000, immutable" \
  --content-type "application/javascript" \
  --exclude "*.css"

aws s3 cp dist/cdn/ s3://${BUCKET_NAME}/ \
  --recursive \
  --cache-control "public, max-age=31536000, immutable" \
  --content-type "text/css" \
  --exclude "*.js"

# Bootstrap com cache curto (5 minutos)
aws s3 cp dist/bootstrap/ s3://${BUCKET_NAME}/ \
  --recursive \
  --cache-control "public, max-age=300"

# Invalidar CloudFront
aws cloudfront create-invalidation \
  --distribution-id ${DISTRIBUTION_ID} \
  --paths "/*"

echo "✅ Deploy complete!"
echo "📦 URLs:"
echo "   JS:  https://cdn.seu-site.com/widget.v1.min.js"
echo "   CSS: https://cdn.seu-site.com/widget.v1.min.css"
echo "   Bootstrap: https://cdn.seu-site.com/widget-bootstrap.v1.min.js"
```

**CORS Configuration (CRÍTICO):**

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": ["*"],
      "ExposeHeaders": ["ETag", "Content-Length"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

Aplicar CORS:

```bash
aws s3api put-bucket-cors \
  --bucket seu-bucket \
  --cors-configuration file://cors-config.json
```

### 8.3 CloudFront Setup

**Criar distribuição:**

```bash
aws cloudfront create-distribution \
  --distribution-config file://cloudfront.json
```

**cloudfront.json:**

```json
{
  "Origins": [
    {
      "Id": "S3-payment-widget",
      "DomainName": "seu-bucket.s3.amazonaws.com",
      "S3OriginConfig": {
        "OriginAccessIdentity": ""
      }
    }
  ],
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3-payment-widget",
    "ViewerProtocolPolicy": "redirect-to-https",
    "AllowedMethods": ["GET", "HEAD", "OPTIONS"],
    "CachedMethods": ["GET", "HEAD"],
    "Compress": true,
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "Enabled": true,
  "Comment": "Payment Widget CDN"
}
```

### 8.4 SRI (Subresource Integrity)

Gerar hashes SRI para segurança:

```typescript
// scripts/generate-sri.ts
import { createHash } from "crypto";
import { readFileSync } from "fs";

const files = ["dist/cdn/widget.v1.min.js", "dist/cdn/widget.v1.min.css"];

console.log("🔐 SRI Hashes:\n");

for (const file of files) {
  const content = readFileSync(file);
  const hash = createHash("sha384").update(content).digest("base64");
  console.log(`File: ${file}`);
  console.log(`Integrity: sha384-${hash}\n`);
}
```

**Uso:**

```html
<script
  src="https://cdn.seu-site.com/widget.v1.min.js"
  integrity="sha384-HASH_AQUI"
  crossorigin="anonymous"
></script>
```

---

## 9. Segurança e Boas Práticas

### 9.1 Tokenização de Dados Sensíveis

**NUNCA** processar cartões no widget. Use tokenização:

```typescript
// src/services/tokenization.ts
export async function tokenizeCard(cardData: CardData): Promise<string> {
  const response = await fetch("https://api.seu-backend.com/tokenize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Public-Key": config.publicKey,
    },
    body: JSON.stringify(cardData),
  });

  const { token } = await response.json();
  return token; // Token seguro, não os dados reais
}
```

**Fluxo:**

```
Widget → Tokeniza Cartão → Backend Processa Token → Resposta
```

### 9.2 Validação de Merchant

```typescript
export async function validateMerchant(orderId: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.seu-backend.com/merchants/${orderId}/validate`,
      {
        headers: {
          "X-Public-Key": config.publicKey,
        },
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Merchant validation failed:", error);
    return false;
  }
}
```

### 9.3 Content Security Policy (CSP)

Documentar para os clientes:

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self';
  script-src 'self' https://cdn.seu-site.com;
  style-src 'self' https://cdn.seu-site.com;
  connect-src https://api.seu-backend.com;
  img-src 'self' data:;
"
/>
```

### 9.4 Rate Limiting

Implementar no widget:

```typescript
class RateLimiter {
  private attempts = 0;
  private resetTime = Date.now();

  canProceed(): boolean {
    const now = Date.now();

    // Reset a cada minuto
    if (now > this.resetTime + 60000) {
      this.attempts = 0;
      this.resetTime = now;
    }

    // Máximo 5 tentativas por minuto
    if (this.attempts >= 5) {
      return false;
    }

    this.attempts++;
    return true;
  }
}
```

### 9.5 Input Sanitization

```typescript
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove HTML tags
    .replace(/javascript:/gi, "") // Remove JS protocol
    .trim()
    .slice(0, 100); // Limite de caracteres
}
```

---

## 10. Testes e Validação

### 10.1 Testes Locais

**Estrutura de testes:**

```
public/examples/
├── test-sdk.html           # Testar SDK localmente
├── test-cdn.html           # Testar CDN bundle
├── test-bootstrap.html     # Testar bootstrap loader
└── test-staging.html       # Testar staging CDN
```

**test-cdn.html:**

```html
<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <title>Test CDN Widget</title>
    <link
      rel="stylesheet"
      href="http://localhost:5173/dist/cdn/widget.v1.min.css"
    />
  </head>
  <body>
    <h1>CDN Widget Test</h1>
    <div id="payment-widget"></div>

    <script src="http://localhost:5173/dist/cdn/widget.v1.min.js"></script>
    <script>
      const widget = window.CartaoSimplesWidget.mount(
        document.getElementById("payment-widget"),
        {
          orderId: "test_merchant",
          publicKey: "pk_test_123",
          environment: "sandbox",
        }
      );

      widget.open();
    </script>
  </body>
</html>
```

### 10.2 Servidor de Testes

```bash
# Terminal 1: Build em watch mode
npm run dev

# Terminal 2: Servidor de exemplos
npx serve public -p 3000
```

Acessar: `http://localhost:3000/examples/test-cdn.html`

### 10.3 Testes Automatizados

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**Exemplo:**

```typescript
// src/components/__tests__/PaymentWidget.test.tsx
import { render, screen } from "@testing-library/react";
import { PaymentWidget } from "../PaymentWidget";

describe("PaymentWidget", () => {
  it("should render with config", () => {
    render(
      <PaymentWidget
        config={{
          orderId: "test",
          publicKey: "pk_test",
        }}
      />
    );

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
```

### 10.4 Checklist de Deploy

Antes de fazer deploy para produção:

```
✅ Build todos os targets (SDK, CDN, Bootstrap)
✅ Validar tamanho dos bundles (<500KB)
✅ Testar em HTML puro
✅ Testar em React/Next.js
✅ Verificar Shadow DOM funciona
✅ Testar em diferentes navegadores
✅ Validar CORS configurado
✅ Gerar SRI hashes
✅ Documentar breaking changes
✅ Atualizar CHANGELOG.md
✅ Tag de versão no Git
✅ Deploy staging → testar → produção
```

---

## 📚 Resumo dos Comandos

```bash
# Setup inicial
npm create vite@latest payment-widget -- --template react-ts
cd payment-widget
npm install

# Desenvolvimento
npm run dev                 # Dev server
npm run build              # Build all targets
npm run build:sdk          # Build SDK only
npm run build:cdn          # Build CDN only
npm run build:bootstrap    # Build bootstrap only

# Deploy
./deploy.sh staging        # Deploy para staging
./deploy.sh production     # Deploy para produção

# Testes
npm run test               # Run tests
npm run validate           # Validate builds
npx serve public -p 3000   # Test server
```

---

## 🎯 Melhores Práticas

### ✅ FAZER

1. **Versionar URLs do CDN** (`widget.v1.min.js`)
2. **Usar Shadow DOM** para isolamento
3. **Incluir SRI hashes** para segurança
4. **Documentar APIs** com TypeScript
5. **Testar em múltiplos ambientes**
6. **Monitorar tamanho dos bundles**
7. **Implementar error boundaries**
8. **Usar HTTPS sempre**
9. **Configurar CORS corretamente**
10. **Fazer deploys graduais** (staging → production)

### ❌ NÃO FAZER

1. ~~Processar cartões no frontend~~
2. ~~Hardcodar secrets no código~~
3. ~~Esquecer de configurar CORS~~
4. ~~Usar `eval()` ou `innerHTML` com dados não sanitizados~~
5. ~~Fazer deploy direto para produção~~
6. ~~Ignorar compatibilidade de navegadores~~
7. ~~Criar bundles >1MB~~
8. ~~Esquecer de invalidar cache do CDN~~
9. ~~Usar HTTP em produção~~
10. ~~Expor dados sensíveis em logs~~

---

## 📖 Próximos Passos

1. **Implementar Analytics**: Track eventos do widget
2. **A/B Testing**: Testar variações de UI
3. **Internacionalização**: Suporte multi-idioma
4. **Acessibilidade**: WCAG 2.1 Level AA
5. **Performance**: Lazy loading de assets
6. **Monitoring**: Sentry/DataDog integration
7. **Documentation**: API reference completa
8. **SDK Examples**: React, Vue, Angular, Svelte

---

## 🔗 Referências

- [Vite Documentation](https://vitejs.dev/)
- [Shadow DOM MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [Subresource Integrity](https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity)
- [AWS CloudFront](https://aws.amazon.com/cloudfront/)
- [PCI DSS Compliance](https://www.pcisecuritystandards.org/)

---

**Criado com ❤️ para desenvolvedores que querem criar widgets embarcáveis de qualidade.**
