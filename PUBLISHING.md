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
│   └── widget.v1.min.js   # Bundle completo
└── bootstrap/             # Loader leve
    └── widget-bootstrap.v1.min.js  # 1.8KB gzipped
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
node -c dist/cdn/widget.v1.min.js
node -c dist/bootstrap/widget-bootstrap.v1.min.js
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
aws s3 mb s3://cartao-simples-widget-staging --region us-east-1

# Upload bootstrap (cache curto - 5min)
aws s3 cp dist/bootstrap/widget-bootstrap.v1.min.js \
  s3://cartao-simples-widget-staging/widget-bootstrap.v1.min.js \
  --content-type "application/javascript" \
  --cache-control "public, max-age=300" \
  --metadata-directive REPLACE

# Upload CDN bundle (cache longo - 1 ano)
aws s3 cp dist/cdn/widget.v1.min.js \
  s3://cartao-simples-widget-staging/widget.v1.min.js \
  --content-type "application/javascript" \
  --cache-control "public, max-age=31536000" \
  --metadata-directive REPLACE

# Upload CSS
aws s3 cp dist/cdn/widget.v1.min.css \
  s3://cartao-simples-widget-staging/widget.v1.min.css \
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
  --distribution-id EOLJNTE5PW5O9 \
  --paths "/*"
```

### 6. Configurar DNS para cdn.cartaosimples.com.br

> **🎯 OBJETIVO:** Configurar `cdn.cartaosimples.com.br` para apontar para a distribuição CloudFront.

#### **Opção A: Usar Domínio CloudFront (Funciona agora)**

```bash
# ✅ Usar diretamente (sem configuração DNS necessária)
https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js
https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.js
```

#### **Opção B: Configurar cdn.cartaosimples.com.br**

##### **Passo 1: Criar Hosted Zone para cartaosimples.com.br**

```bash
# 1. Verificar se já existe hosted zone
aws route53 list-hosted-zones --query 'HostedZones[?Name==`cartaosimples.com.br.`]'

# 2. Criar hosted zone (se não existir)
aws route53 create-hosted-zone \
  --name cartaosimples.com.br \
  --caller-reference "cartaosimples-$(date +%s)" \
  --hosted-zone-config Comment="Hosted zone for cartaosimples.com.br"

# 3. Anotar o Hosted Zone ID retornado (ex: /hostedzone/Z1D633PJN98FT9)

# 4. Obter nameservers para configurar no registrador do domínio
aws route53 get-hosted-zone \
  --id /hostedzone/SEU_HOSTED_ZONE_ID \
  --query 'DelegationSet.NameServers' \
  --output table
```

##### **Passo 2: Solicitar Certificado SSL**

```bash
# 1. Solicitar certificado wildcard para *.cartaosimples.com.br
aws acm request-certificate \
  --domain-name "*.cartaosimples.com.br" \
  --subject-alternative-names "cartaosimples.com.br" \
  --validation-method DNS \
  --region us-east-1

# 2. Anotar o Certificate ARN retornado
# Exemplo: arn:aws:acm:us-east-1:123456789:certificate/abcd-1234-efgh-5678

# 3. Obter registros DNS para validação
aws acm describe-certificate \
  --certificate-arn "SEU_CERTIFICATE_ARN" \
  --region us-east-1 \
  --query 'Certificate.DomainValidationOptions[*].ResourceRecord'
```

##### **Passo 3: Configurar CNAME para cdn.cartaosimples.com.br**

**Pré-requisitos:**

1. Possuir o domínio `cartaosimples.com.br`
2. Certificado SSL válido no AWS Certificate Manager (ACM)
3. Hosted Zone configurada no Route 53

```bash
# 1. Primeiro, obter o Hosted Zone ID do seu domínio
aws route53 list-hosted-zones-by-name \
  --dns-name cartaosimples.com.br \
  --query 'HostedZones[0].Id' \
  --output text

# 2. Criar registro CNAME para cdn.cartaosimples.com.br
aws route53 change-resource-record-sets \
  --hosted-zone-id /hostedzone/SEU_HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "cdn.cartaosimples.com.br",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "d2x7cg3k3on9lk.cloudfront.net"}]
      }
    }]
  }'

# 3. Verificar se o registro foi criado
aws route53 list-resource-record-sets \
  --hosted-zone-id /hostedzone/SEU_HOSTED_ZONE_ID \
  --query 'ResourceRecordSets[?Name==`cdn.cartaosimples.com.br.`]'

# 4. Testar resolução DNS (aguarde alguns minutos)
nslookup cdn.cartaosimples.com.br
# Deve retornar: cdn.cartaosimples.com.br canonical name = d2x7cg3k3on9lk.cloudfront.net
```

##### **Passo 4: Atualizar Distribuição CloudFront**

```bash
# 1. Obter configuração atual da distribuição
aws cloudfront get-distribution-config \
  --id EOLJNTE5PW5O9 > current-distribution.json

# 2. Extrair apenas a configuração (sem metadados)
cat current-distribution.json | jq '.DistributionConfig' > distribution-config.json

# 3. Editar o arquivo distribution-config.json para adicionar:
# - Aliases: ["cdn.cartaosimples.com.br"]
# - ViewerCertificate com seu Certificate ARN
# Exemplo de configuração necessária:
cat > distribution-update.json << 'EOF'
{
  "Aliases": {
    "Quantity": 1,
    "Items": ["cdn.cartaosimples.com.br"]
  },
  "ViewerCertificate": {
    "CloudFrontDefaultCertificate": false,
    "ACMCertificateArn": "arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID",
    "SSLSupportMethod": "sni-only",
    "MinimumProtocolVersion": "TLSv1.2_2021"
  }
}
EOF

# 4. Obter ETag atual da distribuição
ETAG=$(cat current-distribution.json | jq -r '.ETag')

# 5. Atualizar a distribuição (após editar o arquivo)
aws cloudfront update-distribution \
  --id EOLJNTE5PW5O9 \
  --distribution-config file://distribution-config.json \
  --if-match "$ETAG"
```

##### **Passo 5: Verificações Finais**

```bash
# 1. Verificar status da distribuição
aws cloudfront get-distribution \
  --id EOLJNTE5PW5O9 \
  --query 'Distribution.{Status:Status,Aliases:DistributionConfig.Aliases.Items}' \
  --output table

# 2. Aguardar deployment (pode levar 15-20 minutos)
aws cloudfront wait distribution-deployed --id EOLJNTE5PW5O9

# 3. Testar o domínio personalizado
curl -I https://cdn.cartaosimples.com.br/
curl -I https://cdn.cartaosimples.com.br/widget-bootstrap.v1.min.js

# 4. Testar resolução DNS
dig cdn.cartaosimples.com.br CNAME
nslookup cdn.cartaosimples.com.br
```

#### **📋 Resumo Prático para cdn.cartaosimples.com.br**

**Opção Rápida (sem domínio personalizado):**

```bash
# Use direto (funciona imediatamente):
https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js
```

**Opção Completa (com cdn.cartaosimples.com.br):**

1. **✅ Criar Hosted Zone:** `aws route53 create-hosted-zone --name cartaosimples.com.br`
2. **✅ Solicitar Certificado SSL:** `aws acm request-certificate --domain-name "*.cartaosimples.com.br"`
3. **✅ Validar Certificado:** Criar registros CNAME de validação no Route 53
4. **✅ Criar CNAME:** `cdn.cartaosimples.com.br` → `d2x7cg3k3on9lk.cloudfront.net`
5. **✅ Atualizar CloudFront:** Adicionar alias e certificado SSL
6. **✅ Configurar Nameservers:** No registrador do domínio (onde comprou cartaosimples.com.br)

**Custos Estimados:**

- Hosted Zone Route 53: ~$0.50/mês
- Certificado ACM: Gratuito
- Queries DNS: ~$0.40 por milhão

**Tempo Total:** 2-4 horas (incluindo propagação DNS)

#### **Passo Extra: Certificado SSL para Domínio Personalizado**

Se você quiser usar domínio personalizado, também precisa configurar certificado SSL:

```bash
# 1. Solicitar certificado SSL no ACM (deve ser em us-east-1 para CloudFront)
aws acm request-certificate \
  --domain-name cdn.cartaosimples.com \
  --validation-method DNS \
  --region us-east-1

# 2. Obter informações para validação DNS
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:us-east-1:ACCOUNT:certificate/CERT-ID \
  --region us-east-1

# 3. Após validação, atualizar CloudFront para usar certificado personalizado
# (Isso requer modificação da distribuição CloudFront)
```

#### **Verificações de Status**

```bash
# Verificar status DNS
dig cdn.cartaosimples.com CNAME

# Verificar certificado SSL
openssl s_client -connect cdn.cartaosimples.com:443 -servername cdn.cartaosimples.com

# Testar HTTPS
curl -I https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js
```

#### **📋 Como Obter os Valores Corretos**

```bash
# 1. Obter domínio da distribuição CloudFront
aws cloudfront get-distribution \
  --id EOLJNTE5PW5O9 \
  --query 'Distribution.DomainName' \
  --output text
# Resultado: d2x7cg3k3on9lk.cloudfront.net

# 2. Listar Hosted Zones disponíveis
aws route53 list-hosted-zones \
  --query 'HostedZones[*].{Name:Name,Id:Id}' \
  --output table

# 3. Obter Hosted Zone específica
aws route53 list-hosted-zones-by-name \
  --dns-name cartaosimples.com \
  --query 'HostedZones[0].{Id:Id,Name:Name}' \
  --output table
```

#### **⚠️ Considerações Importantes**

1. **Certificado SSL**: Para usar domínio personalizado, é **obrigatório** ter certificado SSL válido
2. **Região**: Certificados para CloudFront devem estar na região **us-east-1**
3. **Propagação DNS**: Pode levar até 48 horas para propagar globalmente
4. **Custos**: Certificados ACM são gratuitos, mas domínios Route 53 têm custo
5. **Aliases**: Precisa reconfigurar a distribuição CloudFront para aceitar o domínio personalizado

---

## 🚀 Configuração Bootstrap

### 1. URLs de Produção

Após o deploy, as URLs ficam disponíveis:

````
Bootstrap: https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js (1.8KB)
CDN Bundle: https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.js (122KB)
CSS: https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.css (4.6KB)
```### 2. Integração Básica

```html
<!-- Método 1: Data attributes -->
<script
  src="https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js"
  data-merchant-id="merchant-123"
  data-primary="#FF6600"
  data-secondary="#0A0A0A"
  data-logo="https://seusite.com/logo.png"
  data-env="production"
  async
></script>
````

```html
<!-- Método 2: Configuração JavaScript -->
<script
  src="https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js"
  async
></script>
<script>
  window.PaymentWidgetInit = {
    orderId: "merchant-123",
    primaryColor: "#FF6600",
    onSuccess: (data) => console.log("Sucesso:", data.token),
  };
</script>
```

### 3. Subresource Integrity (SRI)

```bash
# Gerar hash SRI
openssl dgst -sha384 -binary dist/bootstrap/widget-bootstrap.v1.min.js | openssl base64 -A
```

```html
<!-- Uso com SRI -->
<script
  src="https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js"
  integrity="sha384-HASH_GERADO_AQUI"
  crossorigin="anonymous"
  async
></script>
```

### 4. Fallback e Redundância

```html
<script>
  // Carregar com fallback
  (function () {
    var script = document.createElement("script");
    script.src = "https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js";
    script.async = true;
    script.onerror = function () {
      // Fallback para CDN alternativo
      script.src =
        "https://backup-cdn.cartaosimples.com/widget-bootstrap.v1.min.js";
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
