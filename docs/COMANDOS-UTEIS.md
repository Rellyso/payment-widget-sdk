# 🛠️ Comandos Úteis - Widget Cartão Simples

Referência rápida de todos os comandos úteis do projeto.

---

## 📦 NPM Scripts

### Desenvolvimento

```bash
# Iniciar servidor de desenvolvimento
npm run dev

# Abrir automaticamente: http://localhost:5173
```

### Build

```bash
# Build completo (SDK + CDN + Bootstrap)
npm run build

# Build individual
npm run build:sdk         # SDK para npm (384 KB)
npm run build:cdn         # Bundle CDN (426 KB)
npm run build:bootstrap   # Bootstrap leve (4.6 KB)
```

### Qualidade de Código

```bash
# Executar lint
npm run lint

# Corrigir automaticamente
npm run lint:fix

# Type checking
npm run type-check
```

### Testes

```bash
# Servidor local para testes
npm run test:local
# Abre: http://localhost:8080
```

### Deploy

```bash
# Deploy para staging
npm run deploy:staging

# Deploy para production
npm run deploy:production
```

---

## 🚀 Deploy Manual

### Deploy Staging

```bash
./deploy.sh staging
```

**O que acontece:**

1. ✅ Lint (não-bloqueante)
2. ✅ Type check (não-bloqueante)
3. ✅ Build de todos os targets
4. ✅ Upload para `s3://cartao-simples-widget-staging`
5. ✅ Invalidação do CloudFront

### Deploy Production

```bash
./deploy.sh production
```

**O que acontece:**

1. ✅ Mesmos passos do staging
2. ✅ Upload para `s3://cartao-simples-widget`
3. ✅ Invalidação do CloudFront de produção

---

## ☁️ AWS CLI

### S3 Commands

**Listar arquivos:**

```bash
# Staging
aws s3 ls s3://cartao-simples-widget-staging/

# Production
aws s3 ls s3://cartao-simples-widget/
```

**Upload manual:**

```bash
# Bootstrap
aws s3 cp dist/bootstrap/widget-bootstrap.v1.min.js \
  s3://cartao-simples-widget/widget-bootstrap.v1.min.js \
  --content-type "application/javascript" \
  --cache-control "public, max-age=300"

# CDN Bundle
aws s3 cp dist/cdn/widget.v1.min.js \
  s3://cartao-simples-widget/widget.v1.min.js \
  --content-type "application/javascript" \
  --cache-control "public, max-age=31536000"

# CSS
aws s3 cp dist/cdn/widget.v1.min.css \
  s3://cartao-simples-widget/widget.v1.min.css \
  --content-type "text/css" \
  --cache-control "public, max-age=31536000"
```

**Sync completo:**

```bash
aws s3 sync dist/ s3://cartao-simples-widget/ \
  --delete \
  --cache-control "public, max-age=31536000"
```

**Deletar arquivo:**

```bash
aws s3 rm s3://cartao-simples-widget/widget.v1.min.js
```

**Configurar bucket público:**

```bash
# Desabilitar bloqueio de acesso público
aws s3api put-public-access-block \
  --bucket cartao-simples-widget \
  --public-access-block-configuration \
  "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Aplicar política pública
aws s3api put-bucket-policy \
  --bucket cartao-simples-widget \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::cartao-simples-widget/*"
    }]
  }'
```

### CloudFront Commands

**Invalidar cache:**

```bash
aws cloudfront create-invalidation \
  --distribution-id EOLJNTE5PW5O9 \
  --paths "/*"
```

**Invalidar arquivo específico:**

```bash
aws cloudfront create-invalidation \
  --distribution-id EOLJNTE5PW5O9 \
  --paths "/widget.v1.min.js" "/widget.v1.min.css"
```

**Status da distribuição:**

```bash
aws cloudfront get-distribution \
  --id EOLJNTE5PW5O9
```

**Listar distribuições:**

```bash
aws cloudfront list-distributions
```

**Aguardar invalidação completar:**

```bash
aws cloudfront wait invalidation-completed \
  --distribution-id EOLJNTE5PW5O9 \
  --id INVALIDATION_ID
```

---

## 🧪 Testes Locais

### Servidor HTTP

**Python 3:**

```bash
python3 -m http.server 8080
open http://localhost:8080
```

**Node.js:**

```bash
npx http-server -p 8080
open http://localhost:8080
```

**PHP:**

```bash
php -S localhost:8080
```

### Testar exemplos

```bash
# Exemplo completo
open examples/exemplo-completo.html

# Teste de CDN
python3 -m http.server 8080
open http://localhost:8080/examples/cloudfront-test.html
```

---

## 🔍 Debug e Verificação

### Verificar se CDN está funcionando

**Bootstrap:**

```bash
curl -I https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js
# Deve retornar: HTTP/2 200
```

**CDN Bundle:**

```bash
curl -I https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.js
# Deve retornar: HTTP/2 200
```

**CSS:**

```bash
curl -I https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.css
# Deve retornar: HTTP/2 200
```

**Download completo (ver conteúdo):**

```bash
curl https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js
```

### Verificar tamanhos

**Build local:**

```bash
ls -lh dist/bootstrap/
ls -lh dist/cdn/
ls -lh dist/sdk/
```

**S3:**

```bash
aws s3 ls s3://cartao-simples-widget/ --human-readable
```

### Verificar validação JavaScript

**Node.js syntax check:**

```bash
node -c dist/bootstrap/widget-bootstrap.v1.min.js
node -c dist/cdn/widget.v1.min.js
```

---

## 🔧 Git

### Commits semânticos

```bash
git commit -m "feat: adiciona nova funcionalidade"
git commit -m "fix: corrige bug no widget"
git commit -m "docs: atualiza documentação"
git commit -m "chore: atualiza dependências"
git commit -m "refactor: refatora código"
```

### Branch e Deploy

```bash
# Criar branch
git checkout -b feature/nova-funcionalidade

# Commit e push
git add .
git commit -m "feat: nova funcionalidade"
git push origin feature/nova-funcionalidade

# Merge para main (após aprovação)
git checkout main
git merge feature/nova-funcionalidade
git push origin main

# Deploy automático
npm run deploy:production
```

---

## 📊 Monitoramento

### CloudWatch Metrics

**Requests do CloudFront:**

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name Requests \
  --dimensions Name=DistributionId,Value=EOLJNTE5PW5O9 \
  --start-time 2025-10-01T00:00:00Z \
  --end-time 2025-10-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

**Bytes Downloaded:**

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/CloudFront \
  --metric-name BytesDownloaded \
  --dimensions Name=DistributionId,Value=EOLJNTE5PW5O9 \
  --start-time 2025-10-01T00:00:00Z \
  --end-time 2025-10-02T00:00:00Z \
  --period 3600 \
  --statistics Sum
```

### Logs do CloudFront

**Habilitar logs:**

```bash
aws cloudfront update-distribution \
  --id EOLJNTE5PW5O9 \
  --distribution-config file://distribution-config-with-logging.json
```

---

## 🧹 Limpeza

### Limpar build

```bash
rm -rf dist/
```

### Limpar node_modules

```bash
rm -rf node_modules/
npm install
```

### Limpar cache do Vite

```bash
rm -rf .vite/
```

### Limpar tudo

```bash
rm -rf dist/ node_modules/ .vite/ package-lock.json
npm install
npm run build
```

---

## 🔐 Segurança

### Verificar CVEs nas dependências

```bash
npm audit

# Corrigir automaticamente
npm audit fix

# Corrigir forçado (breaking changes)
npm audit fix --force
```

### Atualizar dependências

```bash
# Ver atualizações disponíveis
npm outdated

# Atualizar para latest
npm update

# Atualizar para major versions (cuidado!)
npx npm-check-updates -u
npm install
```

---

## 📦 NPM Publish

### Preparar publicação

```bash
# Atualizar versão
npm version patch    # 1.0.0 → 1.0.1
npm version minor    # 1.0.0 → 1.1.0
npm version major    # 1.0.0 → 2.0.0

# Build
npm run build

# Verificar o que será publicado
npm pack --dry-run

# Publicar
npm publish
```

### Publicar com tag

```bash
# Beta
npm publish --tag beta

# Next
npm publish --tag next
```

---

## 🎯 Atalhos Úteis

### Workflow completo de desenvolvimento

```bash
# 1. Desenvolver localmente
npm run dev

# 2. Build
npm run build

# 3. Testar local
npm run test:local

# 4. Deploy staging
npm run deploy:staging

# 5. Testar staging
curl -I https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js

# 6. Deploy production
npm run deploy:production
```

### Fix rápido em produção

```bash
# 1. Fix no código
# 2. Build rápido
npm run build:cdn && npm run build:bootstrap

# 3. Deploy direto
./deploy.sh production

# 4. Verificar
curl -I https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.js
```

---

## 📝 Aliases Úteis (Fish Shell)

Adicione ao `~/.config/fish/config.fish`:

```fish
# Widget shortcuts
alias widget-dev="npm run dev"
alias widget-build="npm run build"
alias widget-test="npm run test:local"
alias widget-deploy-stg="npm run deploy:staging"
alias widget-deploy-prd="npm run deploy:production"
alias widget-cdn-test="curl -I https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js"
```

Depois:

```bash
source ~/.config/fish/config.fish
widget-dev
```

---

## 🆘 Comandos de Emergência

### CDN não está servindo arquivos

```bash
# 1. Verificar bucket
aws s3 ls s3://cartao-simples-widget/

# 2. Re-upload
npm run build
aws s3 sync dist/ s3://cartao-simples-widget/

# 3. Invalidar cache
aws cloudfront create-invalidation --distribution-id EOLJNTE5PW5O9 --paths "/*"

# 4. Testar
curl -I https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js
```

### Build quebrado

```bash
# 1. Limpar tudo
rm -rf dist/ node_modules/ .vite/ package-lock.json

# 2. Reinstalar
npm install

# 3. Rebuild
npm run build

# 4. Verificar
ls -la dist/
```

### Widget não carrega no site

```bash
# 1. Verificar CDN
curl https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js | head -n 5

# 2. Verificar JavaScript válido
node -c dist/bootstrap/widget-bootstrap.v1.min.js

# 3. Testar localmente
open examples/exemplo-completo.html
```

---

**📌 Salve este arquivo nos seus favoritos!**

Para mais informações:

- [GUIA-DEPLOY-CDN.md](./GUIA-DEPLOY-CDN.md)
- [README.md](./README.md)
- [DOCS-INDEX.md](./DOCS-INDEX.md)
