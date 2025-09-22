# 📋 Changelog

Todas as mudanças notáveis do **Cartão Simples Payment Widget** serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/spec/v2.0.0.html).

## [Unreleased]

### ✨ Adicionado
- Documentação completa de publicação em `PUBLISHING.md`
- Scripts de automação em `scripts.sh`
- GitHub Actions para CI/CD
- Configuração de ambientes `.env.example`
- Geração automática de hashes SRI

### 🔧 Alterado
- Melhorada estrutura de build com três configurações Vite separadas
- Otimizado bundle size do bootstrap para <2KB gzipped
- Aprimorada tipagem TypeScript para melhor DX

### 🐛 Corrigido
- Compatibilidade com diferentes versões do React
- Problemas de Shadow DOM em alguns navegadores
- Vazamentos de memória em unmount do componente

## [1.0.0] - 2025-09-18

### ✨ Adicionado - Release Inicial

#### 🏗️ **Arquitetura e Build**
- **Vite 7.1.6** como build tool principal
- **3 formatos de build**: SDK npm, CDN bundle, Bootstrap loader
- **TypeScript** com tipagem completa e strict mode
- **Biome** para linting e formatting ultrarrápido
- **TailwindCSS v4** com CSS-in-JS para isolamento

#### 🎨 **UI/UX e Componentes**
- **PaymentWidget** - componente principal React
- **PaymentModal** - modal acessível com backdrop
- **ThemeProvider** - sistema de temas com CSS variables
- **Multi-step form** - 6 etapas do consentimento ao pagamento
- **Responsivo** - funciona perfeitamente em mobile e desktop
- **Animações suaves** com Framer Motion

#### 🔒 **Shadow DOM e Isolamento**
- **Shadow DOM** para isolamento completo de CSS/JS
- **Iframe sandbox** como fallback com permissões mínimas
- **CSS Isolation** - sem conflitos com site hospedeiro
- **Múltiplas instâncias** - suporte a vários widgets por página

#### 📱 **White-Label e Customização**
- **Cores customizáveis** - primary, secondary via props
- **Logo personalizado** - URL ou base64 inline
- **Border radius** - predefinidos ou valores custom
- **CSS Variables** - customização profunda via :root
- **Tema dark/light** - suporte automático

#### ✅ **Validações e Formulários**
- **React Hook Form 7.62** para performance
- **Zod 3.25** para validação robusta
- **CPF validation** - algoritmo brasileiro completo
- **Phone masking** - (11) 99999-9999 automático
- **CEP integration** - busca de endereço via API
- **Card validation** - algoritmo de Luhn
- **Age verification** - +18 anos obrigatório

#### ♿ **Acessibilidade (WCAG 2.1 AA)**
- **role="dialog"** e **aria-modal="true"**
- **Focus trap** - foco permanece no modal
- **Keyboard navigation** - Tab, Shift+Tab, ESC
- **Screen reader** - labels e descriptions completas
- **Color contrast** - ratios acessíveis
- **Reduced motion** - respeita preferências do usuário

#### 🚀 **Integração e API**
- **Bootstrap loader** - 1.87KB gzipped
- **Data attributes** - configuração via HTML
- **JavaScript API** - controle programático completo
- **Event callbacks** - onSuccess, onError, onOpen, onClose
- **Multiple environments** - staging, production

#### 📦 **Distribuição**
```bash
# SDK npm (para React apps)
npm install cartao-simples-widget

# CDN (para qualquer site)
<script src="https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js"></script>
```

#### 🛡️ **Segurança**
- **HTTPS obrigatório** em produção
- **CSP compliance** - sem eval() ou inline scripts perigosos
- **XSS protection** - sanitização via Zod schemas
- **PostMessage** - comunicação segura entre contextos
- **Origin validation** - whitelist de domínios permitidos

#### 🌍 **Internacionalização**
- **Português brasileiro** como idioma padrão
- **Formatação de moeda** - Real (BRL)
- **Validações locais** - CPF, telefone, CEP brasileiros
- **Timezone** - São Paulo (America/Sao_Paulo)

#### 📊 **Performance**
- **Code splitting** - carregamento sob demanda
- **Tree shaking** - apenas código usado
- **Lazy loading** - componentes assíncronos
- **Memoization** - React.memo e useMemo otimizados
- **Bundle analysis** - relatórios automáticos de tamanho

#### 🔧 **Developer Experience**
- **Hot reload** - desenvolvimento instantâneo
- **TypeScript IntelliSense** - autocompletar completo
- **Storybook ready** - componentes isolados
- **Jest/Testing Library** - testes unitários
- **ESLint + Prettier** - código consistente

### 📏 **Métricas de Performance**
- **Bootstrap**: 4.60 KB → **1.87 KB gzipped** ✅ (< 3KB)
- **SDK**: 309.32 KB → **80.97 KB gzipped** 
- **CDN**: 400.01 KB → **122.24 KB gzipped**
- **First Paint**: < 200ms
- **Time to Interactive**: < 500ms

### 🎯 **Casos de Uso Suportados**
- E-commerce checkout personalizado
- Landing pages de conversão
- Aplicativos mobile via WebView
- Plataformas white-label
- Marketplaces e multi-tenants
- WordPress/Shopify plugins
- React/Next.js applications

### 🧪 **Compatibilidade Testada**
- **Browsers**: Chrome 88+, Firefox 78+, Safari 14+, Edge 88+
- **React**: 18.0+ (peer dependency)
- **Node.js**: 18+ para development
- **Bundlers**: Webpack, Vite, Parcel, Rollup
- **Frameworks**: Next.js, Gatsby, CRA, Vite

### 📱 **Dispositivos Suportados**
- Desktop (1920×1080+)
- Laptop (1366×768+)
- Tablet (768×1024+)
- Mobile (375×667+)
- iPhone SE (320×568) como mínimo

---

## 🏷️ **Tags e Releases**

### Semantic Versioning Strategy

```
MAJOR.MINOR.PATCH-prerelease

MAJOR: Breaking changes (v1.0.0 → v2.0.0)
MINOR: New features (v1.0.0 → v1.1.0)  
PATCH: Bug fixes (v1.0.0 → v1.0.1)
```

### Release Types

- **🚀 Major** - Quebra de compatibilidade, refatoração de API
- **✨ Minor** - Novas funcionalidades, componentes, integrações
- **🐛 Patch** - Bug fixes, otimizações, ajustes de UX
- **🔧 Pre-release** - Beta, RC, Alpha para testes

### Exemplo de Workflow

```bash
# Feature release
v1.1.0 - Adiciona novo método de pagamento PIX
v1.2.0 - Integração com WhatsApp Business
v1.3.0 - Dashboard de analytics

# Bug fix
v1.0.1 - Fix validation no Safari mobile
v1.0.2 - Corrige memory leak no unmount

# Major release  
v2.0.0 - Nova API, React 19 support, redesign completo
```

---

## 📞 **Contato e Suporte**

- **🐛 Bug reports**: [GitHub Issues](https://github.com/cartao-simples/widget/issues)
- **💬 Discussions**: [GitHub Discussions](https://github.com/cartao-simples/widget/discussions)  
- **📧 Email**: dev@cartaosimples.com
- **📖 Docs**: https://docs.cartaosimples.com/widget
- **🔗 Status**: https://status.cartaosimples.com

---

*Mantido com ❤️ pela equipe [Cartão Simples](https://cartaosimples.com)*