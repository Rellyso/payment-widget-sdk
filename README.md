# 💳 Cartão Simples - Payment Widget White-Label

Um widget de pagamento white-label completo para o **Cartão Simples**, que pode ser integrado em qualquer site via **CDN** ou usado como **SDK npm**. Suporta Shadow DOM, acessibilidade completa, e configuração de tema customizada.

## 🚀 Características

- ✅ **Widget White-Label** com temas customizáveis
- ✅ **Bootstrap leve** (1.8KB gzipped) com carregamento assíncrono
- ✅ **Shadow DOM** com fallback para iframe sandbox
- ✅ **Múltiplos formatos**: SDK npm + CDN
- ✅ **Acessibilidade completa** (ARIA, foco, teclado)
- ✅ **Validações robustas** com Zod + React Hook Form
- ✅ **TypeScript** com tipagem completa
- ✅ **Animações suaves** com Framer Motion
- ✅ **Responsivo** e otimizado para mobile

## 📦 Instalação e Uso

### 1. Uso via CDN (Mais simples)

Adicione o snippet no seu HTML:

```html
<script
  src="https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js"
  data-merchant-id="seu-merchant-123"
  data-primary="#FF6600"
  data-secondary="#0A0A0A"
  data-logo="https://seusite.com/logo.png"
  data-border-radius="12px"
  data-env="production"
  async
></script>
```

Ou usando configuração via JavaScript:

```html
<script
  src="https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js"
  async
></script>
<script>
  window.PaymentWidgetInit = {
    orderId: "seu-merchant-123",
    primaryColor: "#FF6600",
    logoUrl: "https://seusite.com/logo.png",
    apiBaseUrl: "https://api.cartaosimples.com",
    onSuccess: (data) => {
      console.log("Pagamento realizado:", data);
    },
    onError: (error) => {
      console.error("Erro:", error);
    },
  };
</script>
```

### 2. Uso como SDK npm

```bash
npm install cartao-simples-widget
```

**Para React:**

```tsx
import { PaymentWidget } from "cartao-simples-widget";

function App() {
  return (
    <PaymentWidget
      config={{
        orderId: "seu-merchant-123",
        primaryColor: "#FF6600",
        onSuccess: (data) => console.log("Sucesso:", data),
        onError: (error) => console.error("Erro:", error),
      }}
    />
  );
}
```

**Para Vanilla JS:**

```javascript
import { mount } from "cartao-simples-widget";

const widget = mount(document.getElementById("widget-container"), {
  orderId: "seu-merchant-123",
  primaryColor: "#FF6600",
  onSuccess: (data) => console.log("Sucesso:", data),
});

// Controle programático
widget.open();
widget.close();
```

### 3. API de Controle

```javascript
// Via CDN
window.PaymentWidget.init({
  orderId: "merchant-123",
  autoOpen: false,
});

window.PaymentWidget.open();
window.PaymentWidget.close();
window.PaymentWidget.destroy();
```

## 🎨 Configuração White-Label

### Opções de Configuração

| Propriedade      | Tipo      | Padrão    | Descrição                              |
| ---------------- | --------- | --------- | -------------------------------------- |
| `orderId`     | `string`  | -         | **Obrigatório** - ID único do parceiro |
| `primaryColor`   | `string`  | `#ff6600` | Cor primária (hex)                     |
| `secondaryColor` | `string`  | `#0a0a0a` | Cor secundária (hex)                   |
| `logoUrl`        | `string`  | -         | URL do logo do parceiro                |
| `borderRadius`   | `string`  | `md`      | `sm\|md\|lg\|full\|{valor}px`          |
| `environment`    | `string`  | `staging` | `staging\|production`                  |
| `apiBaseUrl`     | `string`  | -         | URL da API personalizada               |
| `autoOpen`       | `boolean` | `false`   | Abrir automaticamente após init        |

### Callbacks

```typescript
{
  onSuccess: (data: PaymentSuccessData) => void;
  onError: (error: PaymentError) => void;
  onOpen: () => void;
  onClose: () => void;
}
```

### Exemplo de Dados de Sucesso

```typescript
{
  transactionId: "txn_123456789",
  token: "tok_abcdef123",
  orderId: "merchant_001",
  amount?: 1500.00,
  installments?: 12,
  timestamp: "2024-01-15T10:30:00Z"
}
```

## 🛡️ Segurança

- **Shadow DOM** para isolamento completo de CSS/JS
- **Iframe sandbox** como fallback com permissões mínimas
- **HTTPS obrigatório** em produção
- **Validação de origins** com `postMessage`
- **Sanitização** de dados com Zod schemas
- **Sem `eval()`** - código totalmente seguro
- **Conformidade LGPD** - dados criptografados

## ♿ Acessibilidade

- ✅ **ARIA completo** - `role="dialog"`, `aria-modal="true"`
- ✅ **Trap de foco** dentro do modal
- ✅ **Navegação por teclado** - Tab, Shift+Tab, ESC
- ✅ **Screen readers** - labels e descrições adequadas
- ✅ **Alto contraste** - cores acessíveis
- ✅ **Responsive** - funciona em qualquer dispositivo

## 🎯 Fluxo de UX

1. **Autorização** → Checkbox de consentimento para análise
2. **Análise de Crédito** → Formulário com dados pessoais
3. **Resultado** → Aprovação/reprovação instantânea
4. **Endereço** → Confirmação de dados de entrega
5. **Pagamento** → Dados do cartão + parcelas
6. **Confirmação** → Sucesso e próximos passos

## 🔧 Desenvolvimento Local

```bash
# Clonar repositório
git clone <repo>
cd cartao-simples-widget

# Instalar dependências
npm install

# Desenvolvimento
npm run dev

# Builds
npm run build          # Todos os builds
npm run build:sdk      # SDK para npm
npm run build:cdn      # CDN bundle
npm run build:bootstrap # Bootstrap leve

# Linting e type-check
npm run lint
npm run lint:fix
npm run type-check
```

### Estrutura do Projeto

```
src/
├── bootstrap/          # Loader leve (CDN entry)
├── cdn/               # Bundle completo (CDN)
├── sdk/               # Exportações SDK (npm)
├── components/        # Componentes React
│   ├── steps/        # Steps do formulário
│   ├── PaymentWidget.tsx
│   ├── PaymentModal.tsx
│   └── ThemeProvider.tsx
├── types/             # Definições TypeScript
├── utils/             # Utilitários (masks, logger)
├── schemas/           # Validações Zod
└── styles/            # CSS customizado
```

## ☁️ Deploy AWS

### 1. Configurar S3 + CloudFront

```bash
# Criar bucket
aws s3 mb s3://cartao-simples-widget

# Upload dos arquivos
aws s3 sync dist/ s3://cartao-simples-widget/ --public-read

# Criar distribuição CloudFront
aws cloudfront create-distribution --distribution-config file://cloudfront.json
```

### 2. Configurar CORS

```json
{
  "CORSRules": [
    {
      "AllowedHeaders": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedOrigins": ["*"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

### 3. URLs de Produção

```
https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js  (1.8KB)
https://cdn.cartaosimples.com/widget.v1.min.js           (122KB)
```

### 4. Subresource Integrity (SRI)

```html
<script
  src="https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js"
  integrity="sha384-HASH_AQUI"
  crossorigin="anonymous"
  async
></script>
```

## 📱 Exemplos de Integração

### E-commerce Simples

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Minha Loja</title>
  </head>
  <body>
    <button id="payment-btn">
      Parcele suas compras sem comprometer o limite do cartão
    </button>

    <script
      src="https://cdn.cartaosimles.com/widget-bootstrap.v1.min.js"
      async
    ></script>
    <script>
      document.getElementById("payment-btn").addEventListener("click", () => {
        window.PaymentWidget.init({
          orderId: "loja-123",
          primaryColor: "#FF6600",
          onSuccess: (data) => {
            // Redirecionar para página de sucesso
            window.location.href = `/success?token=${data.token}`;
          },
        });
      });
    </script>
  </body>
</html>
```

### WordPress Plugin

```php
function add_cartao_simples_widget() {
  wp_enqueue_script(
    'cartao-simples-widget',
    'https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js',
    [],
    '1.0.0',
    true
  );
}
add_action('wp_enqueue_scripts', 'add_cartao_simples_widget');
```

### Next.js

```tsx
import { PaymentWidget } from "cartao-simples-widget";
import { useState } from "react";

export default function CheckoutPage() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <button onClick={() => setIsOpen(true)}>
        Finalizar com Cartão Simples
      </button>

      <PaymentWidget
        config={{
          orderId: process.env.NEXT_PUBLIC_MERCHANT_ID!,
          primaryColor: "#FF6600",
          onSuccess: (data) => {
            // Processar pagamento
            router.push(`/success?token=${data.token}`);
          },
          onClose: () => setIsOpen(false),
        }}
        initialState={{ isOpen }}
      />
    </div>
  );
}
```

## 📚 Documentação Completa

Para informações detalhadas sobre deploy, configuração e troubleshooting, consulte a [documentação completa na pasta `docs/`](./docs/):

- **[📖 Índice de Documentação](./docs/DOCS-INDEX.md)** - Navegação por todas as documentações
- **[🚀 Quick Start](./docs/QUICK-START.md)** - Comece em 5 minutos
- **[📦 Guia de Deploy CDN](./docs/GUIA-DEPLOY-CDN.md)** - Deploy completo no CloudFront
- **[☁️ Configuração CloudFront](./docs/CLOUDFRONT-SETUP.md)** - **NOVO!** Setup automático e manual
- **[🎨 Guia de Uso do Widget](./docs/GUIA-USO-WIDGET.md)** - APIs e exemplos de integração
- **[🔧 Solução CORS](./docs/SOLUCAO-CORS.md)** - Configuração CORS e troubleshooting
- **[💻 Comandos Úteis](./docs/COMANDOS-UTEIS.md)** - Referência rápida de comandos
- **[📊 Resumo Visual](./docs/RESUMO-VISUAL.md)** - Status e métricas do projeto
- **[🌐 Servidor Local](./docs/SERVIDOR-LOCAL.md)** - Como testar localmente

## 🚀 Deploy Rápido

### Primeira Vez (Production)

```bash
# 1. Configure o CloudFront (apenas primeira vez)
./setup-cloudfront.sh production

# 2. Faça o deploy
./deploy.sh production
```

### Staging (Desenvolvimento)

```bash
# Deploy direto no S3 (sem CloudFront)
./deploy.sh staging
```

O script `setup-cloudfront.sh` automaticamente:

- ✅ Cria Origin Access Identity (OAI)
- ✅ Cria distribuição CloudFront
- ✅ Configura bucket S3
- ✅ Gera relatório com URLs e próximos passos

## �🔍 Troubleshooting

### Problemas Comuns

**❌ Widget não aparece**

- Verificar se o `orderId` está correto
- Conferir console por erros de CORS
- Verificar se o script carregou (`window.PaymentWidget` existe)

**❌ Erro "ERR_NAME_NOT_RESOLVED"**

- CDN URL incorreta - deve ser `https://d2x7cg3k3on9lk.cloudfront.net`
- Verificar configuração em `src/bootstrap/index.ts`

**❌ Erro CORS**

- Bucket S3 precisa ter CORS configurado
- Executar `./deploy.sh` para aplicar automaticamente
- Ver [documentação CORS](./docs/SOLUCAO-CORS.md)

**❌ Cache desatualizado**

- Invalidar cache do CloudFront: `aws cloudfront create-invalidation --distribution-id EOLJNTE5PW5O9 --paths "/*"`
- Aguardar 1-2 minutos para propagação

Para mais soluções, consulte o [Guia de Deploy CDN](./docs/GUIA-DEPLOY-CDN.md) completo.

## 🤝 Contribuição

1. Fork o repositório
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit: `git commit -m 'Adiciona nova funcionalidade'`
4. Push: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

MIT License - veja [LICENSE](LICENSE) para detalhes.

---

**💡 Dúvidas?** Entre em contato: dev@cartaosimples.com

**🔗 Documentação completa:** https://docs.cartaosimples.com/widget
