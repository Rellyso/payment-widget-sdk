# 📦 Guia de Publicação - Cartão Simples Widget

Este guia explica como instalar, configurar e publicar o **Cartão Simples Payment Widget** em diferentes formatos: **SDK npm**, **CDN**, e **Bootstrap Loader**.

## 📋 Índice

1. [Pré-requisitos](#pré-requisitos)
2. [Configuração do Ambiente](#configuração-do-ambiente)
3. [Build e Desenvolvimento](#build-e-desenvolvimento)
4. [Publicação SDK npm](#publicação-sdk-npm)
5. [Deploy CDN](#deploy-cdn)
6. [Configuração Bootstrap](#configuração-bootstrap)
7. [Versionamento](#versionamento)
8. [Troubleshooting](#troubleshooting)

---

## 🛠️ Pré-requisitos

### Ferramentas Necessárias

- **Node.js** 18+ e **npm** 8+
- **Git** para controle de versão
- **AWS CLI** (para deploy CDN)
- **Conta npm** (para publicação SDK)

### Verificar Instalação

```bash
# Verificar versões
node --version    # >=18.0.0
npm --version     # >=8.0.0
git --version     # >=2.0.0
aws --version     # >=2.0.0 (opcional)

# Verificar login npm
npm whoami        # Deve mostrar seu username
```

---

## ⚙️ Configuração do Ambiente

### 1. Clone do Repositório

```bash
# Clonar projeto
git clone https://github.com/cartao-simples/widget.git
cd widget

# Instalar dependências
npm ci

# Verificar se tudo está funcionando
npm run type-check
npm run lint
```

### 2. Configuração de Variáveis

Crie um arquivo `.env.local`:

```bash
# .env.local
VITE_MERCHANT_ID=seu-merchant-id
VITE_API_BASE_URL=https://api.cartaosimples.com
VITE_CDN_BASE_URL=https://cdn.cartaosimples.com
VITE_ENVIRONMENT=development
```

### 3. Teste Local

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Verificar em: http://localhost:5173
```

---

## 🏗️ Build e Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev                 # Servidor dev local
npm run preview            # Preview do build de produção

# Build completo
npm run build              # SDK + CDN
npm run build:sdk          # Apenas SDK (npm)
npm run build:cdn          # Apenas CDN bundle  
npm run build:bootstrap    # Apenas bootstrap loader

# Qualidade
npm run lint               # Verificar código
npm run lint:fix           # Corrigir automaticamente
npm run type-check         # Verificar tipos TypeScript
```

### Estrutura dos Builds

```
dist/
├── sdk/                   # Para npm publish
│   ├── index.js          # CommonJS
│   ├── index.es.js       # ES Modules
│   └── index.d.ts        # TypeScript definitions
├── cdn/                   # Para CDN deploy
│   ├── widget.v1.min.css       # Styles
│   └── widget.v1.min.umd.cjs   # Bundle completo
└── bootstrap/             # Loader leve
    └── widget-bootstrap.v1.min.umd.cjs  # 1.8KB gzipped
```

### Verificar Builds

```bash
# Build completo
npm run build

# Verificar tamanhos
ls -lah dist/sdk/
ls -lah dist/cdn/
ls -lah dist/bootstrap/

# Verificar se JS é válido
node -c dist/sdk/index.js
node -c dist/cdn/widget.v1.min.umd.cjs
node -c dist/bootstrap/widget-bootstrap.v1.min.umd.cjs
```

---

## 📦 Publicação SDK npm

### 1. Preparação

```bash
# Limpar e rebuild
rm -rf dist/ node_modules/
npm ci
npm run build:sdk

# Verificar conteúdo do pacote
npm pack --dry-run

# Visualizar arquivos que serão publicados
tar -tzf cartao-simples-widget-1.0.0.tgz
```

### 2. Testes Locais

```bash
# Testar instalação local
npm pack
cd /tmp
mkdir test-widget && cd test-widget
npm init -y
npm install /caminho/para/cartao-simples-widget-1.0.0.tgz

# Testar importação
node -e "console.log(require('cartao-simples-widget'))"
```

### 3. Publicação

```bash
# Login npm (se necessário)
npm login

# Verificar configuração
npm config get registry  # Deve ser https://registry.npmjs.org/

# Publicação (primeira vez)
npm publish

# Publicação de novas versões
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.1 → 1.1.0  
npm version major  # 1.1.0 → 2.0.0

npm publish
```

### 4. Verificar Publicação

```bash
# Verificar no npm
npm view cartao-simples-widget
npm view cartao-simples-widget versions --json

# Instalar de verdade
npm install cartao-simples-widget
```

### 5. Tags e Distribuição

```bash
# Publicar versão beta
npm version prerelease --preid=beta  # 1.0.0-beta.1
npm publish --tag beta

# Publicar versão estável
npm publish --tag latest

# Gerenciar tags
npm dist-tag add cartao-simples-widget@1.0.0-beta.1 beta
npm dist-tag add cartao-simples-widget@1.0.0 latest
```

---

## ☁️ Deploy CDN

### 1. Configuração AWS

```bash
# Configurar credenciais (primeira vez)
aws configure
# AWS Access Key ID: [sua-key]
# AWS Secret Access Key: [sua-secret]  
# Default region: us-east-1
# Default output format: json

# Verificar configuração
aws sts get-caller-identity
```

### 2. Build CDN

```bash
# Gerar builds CDN
npm run build:cdn
npm run build:bootstrap

# Verificar arquivos gerados
ls -la dist/cdn/
ls -la dist/bootstrap/
```

### 3. Deploy Automático

```bash
# Dar permissão ao script
chmod +x deploy.sh

# Deploy para staging
./deploy.sh staging

# Deploy para production
./deploy.sh production
```

### 4. Deploy Manual S3

```bash
# Criar bucket (se não existir)
aws s3 mb s3://cartao-simples-widget-production --region us-east-1

# Upload bootstrap (cache curto - 5min)
aws s3 cp dist/bootstrap/widget-bootstrap.v1.min.umd.cjs \
  s3://cartao-simples-widget-production/widget-bootstrap.v1.min.js \
  --content-type "application/javascript" \
  --cache-control "public, max-age=300" \
  --metadata-directive REPLACE

# Upload CDN bundle (cache longo - 1 ano)  
aws s3 cp dist/cdn/widget.v1.min.umd.cjs \
  s3://cartao-simples-widget-production/widget.v1.min.js \
  --content-type "application/javascript" \
  --cache-control "public, max-age=31536000" \
  --metadata-directive REPLACE

# Upload CSS
aws s3 cp dist/cdn/widget.v1.min.css \
  s3://cartao-simples-widget-production/widget.v1.min.css \
  --content-type "text/css" \
  --cache-control "public, max-age=31536000" \
  --metadata-directive REPLACE
```

### 5. CloudFront Setup

```bash
# Criar distribuição CloudFront
aws cloudfront create-distribution --distribution-config file://cloudfront.json

# Obter ID da distribuição  
aws cloudfront list-distributions --query 'DistributionList.Items[0].Id' --output text

# Invalidar cache após deploy
aws cloudfront create-invalidation \
  --distribution-id E1ABCDEFGHIJKL \
  --paths "/*"
```

### 6. Configurar DNS

```bash
# Exemplo com Route 53
aws route53 change-resource-record-sets \
  --hosted-zone-id Z123456789 \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE", 
      "ResourceRecordSet": {
        "Name": "cdn.cartaosimples.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "d111111abcdef8.cloudfront.net"}]
      }
    }]
  }'
```

---

## 🚀 Configuração Bootstrap

### 1. URLs de Produção

Após o deploy, as URLs ficam disponíveis:

```
Bootstrap: https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js (1.8KB)
CDN Bundle: https://cdn.cartaosimples.com/widget.v1.min.js (122KB)  
CSS: https://cdn.cartaosimples.com/widget.v1.min.css (4.6KB)
```

### 2. Integração Básica

```html
<!-- Método 1: Data attributes -->
<script 
  src="https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js"
  data-merchant-id="merchant-123"
  data-primary="#FF6600" 
  data-secondary="#0A0A0A"
  data-logo="https://seusite.com/logo.png"
  data-env="production"
  async>
</script>
```

```html
<!-- Método 2: Configuração JavaScript -->
<script src="https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js" async></script>
<script>
  window.PaymentWidgetInit = {
    merchantId: 'merchant-123',
    primaryColor: '#FF6600',
    onSuccess: (data) => console.log('Sucesso:', data.token)
  };
</script>
```

### 3. Subresource Integrity (SRI)

```bash
# Gerar hash SRI
openssl dgst -sha384 -binary dist/bootstrap/widget-bootstrap.v1.min.umd.cjs | openssl base64 -A
```

```html
<!-- Uso com SRI -->
<script 
  src="https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js"
  integrity="sha384-HASH_GERADO_AQUI"
  crossorigin="anonymous"
  async>
</script>
```

### 4. Fallback e Redundância

```html
<script>
  // Carregar com fallback
  (function() {
    var script = document.createElement('script');
    script.src = 'https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js';
    script.async = true;
    script.onerror = function() {
      // Fallback para CDN alternativo
      script.src = 'https://backup-cdn.cartaosimples.com/widget-bootstrap.v1.min.js';
    };
    document.head.appendChild(script);
  })();
</script>
```

---

## 🏷️ Versionamento

### Estratégia de Versões

```bash
# Semantic Versioning (semver)
# MAJOR.MINOR.PATCH

# PATCH: Bug fixes (1.0.0 → 1.0.1)
npm version patch

# MINOR: New features (1.0.1 → 1.1.0)  
npm version minor

# MAJOR: Breaking changes (1.1.0 → 2.0.0)
npm version major

# Pre-release versions
npm version prerelease --preid=beta   # 1.0.0-beta.1
npm version prerelease --preid=rc     # 1.0.0-rc.1
```

### Git Tags

```bash
# Criar tag manualmente
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Listar tags
git tag -l

# Deletar tag
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
```

### Branching Strategy

```bash
# Feature branch
git checkout -b feature/new-payment-method
git push -u origin feature/new-payment-method

# Release branch
git checkout -b release/v1.1.0
# ... fazer release prep
git checkout main
git merge release/v1.1.0
git tag v1.1.0

# Hotfix
git checkout -b hotfix/security-patch
# ... fix crítico
git checkout main
git merge hotfix/security-patch
git tag v1.0.1
```

---

## 🐛 Troubleshooting

### Problemas Comuns

#### **❌ npm publish falha**

```bash
# Verificar login
npm whoami

# Verificar registry
npm config get registry

# Limpar cache
npm cache clean --force

# Verificar se versão já existe
npm view cartao-simples-widget versions --json
```

#### **❌ Build falha**

```bash
# Limpar tudo e reinstalar
rm -rf node_modules/ dist/
npm ci

# Verificar tipos
npm run type-check

# Verificar lint
npm run lint
```

#### **❌ CDN não carrega**

```bash
# Testar URLs diretamente
curl -I https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js

# Verificar cache CloudFront
aws cloudfront get-distribution --id E1ABCDEFGHIJKL

# Invalidar cache se necessário
aws cloudfront create-invalidation --distribution-id E1ABCDEFGHIJKL --paths "/*"
```

#### **❌ CORS errors**

```bash
# Verificar configuração S3 CORS
aws s3api get-bucket-cors --bucket cartao-simples-widget-production

# Reconfigurar se necessário
aws s3api put-bucket-cors --bucket cartao-simples-widget-production --cors-configuration file://cors.json
```

### Debug Mode

```bash
# Build com debug
VITE_DEBUG=true npm run build

# Testar localmente com debug
VITE_DEBUG=true npm run dev
```

### Logs e Monitoramento

```bash
# CloudWatch logs (se configurado)
aws logs describe-log-groups --log-group-name-prefix "/aws/cloudfront/"

# S3 access logs
aws s3 ls s3://cartao-simples-widget-logs/ --recursive

# npm download stats
npm view cartao-simples-widget --json | jq '.downloads'
```

---

## 📊 Checklist de Release

### Pré-Release

- [ ] ✅ Todos os testes passando
- [ ] ✅ Type check sem erros
- [ ] ✅ Lint sem warnings
- [ ] ✅ Build funciona em todos os targets
- [ ] ✅ Documentação atualizada
- [ ] ✅ CHANGELOG.md atualizado
- [ ] ✅ Versão bumped no package.json

### Release

- [ ] 📦 Build SDK publicado no npm
- [ ] ☁️ CDN deployado no S3/CloudFront  
- [ ] 🚀 Bootstrap loader atualizado
- [ ] 🏷️ Git tag criada e pushed
- [ ] 📄 Release notes no GitHub
- [ ] ✅ Testes de integração passando
- [ ] 📧 Stakeholders notificados

### Pós-Release

- [ ] 🔍 Monitorar erros por 24h
- [ ] 📈 Verificar métricas de uso
- [ ] 🐛 Fix crítico se necessário
- [ ] 📚 Atualizar documentação se necessário

---

## 🤝 Contribuição

### Setup para Contributors

```bash
# Fork do repositório no GitHub
git clone https://github.com/SEU_USERNAME/widget.git
cd widget

# Adicionar upstream
git remote add upstream https://github.com/cartao-simples/widget.git

# Criar branch para feature
git checkout -b feature/minha-feature

# Após desenvolvimento
git push origin feature/minha-feature
# ... criar Pull Request no GitHub
```

### Code Review Checklist

- [ ] 📝 Código segue style guide
- [ ] 🧪 Testes adicionados/atualizados  
- [ ] 📚 Documentação atualizada
- [ ] 🔒 Sem vulnerabilidades de segurança
- [ ] ⚡ Performance não degradada
- [ ] ♿ Acessibilidade mantida/melhorada

---

**📞 Suporte:** Para dúvidas sobre publicação, contate dev@cartaosimples.com

**📖 Docs:** https://docs.cartaosimples.com/widget/publishing