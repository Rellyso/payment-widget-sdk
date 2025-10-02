# 🚀 Guia de Deploy - Payment Widget

## ✅ Pré-requisitos

1. **AWS CLI** configurado com credenciais
2. **Node.js** 18+ instalado
3. **jq** instalado (`brew install jq`)
4. **Permissões AWS**: S3 e CloudFront

---

## 📦 Deploy Completo

### 1. Build + Deploy Automático

```bash
# Deploy para staging
./deploy.sh staging

# Deploy para production
./deploy.sh production
```

O script automaticamente:

- ✅ Verifica dependências
- ✅ Executa type-check e lint
- ✅ Builda SDK, CDN e Bootstrap
- ✅ Cria/configura bucket S3
- ✅ Configura CORS e permissões públicas
- ✅ Faz upload dos arquivos
- ✅ Invalida cache CloudFront
- ✅ Testa acessibilidade
- ✅ Gera relatório e hashes SRI

---

## 🔧 Deploy Manual (Passo a Passo)

### 1. Build Local

```bash
# Build de todos os targets
npm run build

# Ou individualmente
npm run build:sdk
npm run build:cdn
npm run build:bootstrap
```

### 2. Verificar Arquivos

```bash
ls -lh dist/bootstrap/widget-bootstrap.v1.min.js  # ~5-6 KB
ls -lh dist/cdn/widget.v1.min.js                   # ~400-450 KB
ls -lh dist/cdn/widget.v1.min.css                  # ~25-30 KB
```

### 3. Configurar Bucket S3 (primeira vez)

```bash
# Criar bucket
aws s3 mb s3://cartao-simples-widget --region us-east-1

# Desabilitar Block Public Access
aws s3api put-public-access-block \
  --bucket cartao-simples-widget \
  --public-access-block-configuration "BlockPublicAcls=false,IgnorePublicAcls=false,BlockPublicPolicy=false,RestrictPublicBuckets=false"

# Aplicar bucket policy
aws s3api put-bucket-policy \
  --bucket cartao-simples-widget \
  --policy file://bucket-policy-staging.json

# Configurar CORS
aws s3api put-bucket-cors \
  --bucket cartao-simples-widget \
  --cors-configuration file://cors-config.json
```

### 4. Upload dos Arquivos

```bash
# Bootstrap (cache 5 minutos)
aws s3 cp dist/bootstrap/widget-bootstrap.v1.min.js \
  s3://cartao-simples-widget/widget-bootstrap.v1.min.js \
  --content-type "application/javascript" \
  --cache-control "public, max-age=300" \
  --metadata-directive REPLACE

# Bundle (cache 1 ano)
aws s3 cp dist/cdn/widget.v1.min.js \
  s3://cartao-simples-widget/widget.v1.min.js \
  --content-type "application/javascript" \
  --cache-control "public, max-age=31536000" \
  --metadata-directive REPLACE

# CSS (cache 1 ano)
aws s3 cp dist/cdn/widget.v1.min.css \
  s3://cartao-simples-widget/widget.v1.min.css \
  --content-type "text/css" \
  --cache-control "public, max-age=31536000" \
  --metadata-directive REPLACE
```

### 5. Invalidar CloudFront

```bash
aws cloudfront create-invalidation \
  --distribution-id EOLJNTE5PW5O9 \
  --paths "/*"
```

### 6. Testar

```bash
# Testar bootstrap
curl -I https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js

# Testar bundle
curl -I https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.js

# Testar CSS
curl -I https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.css
```

---

## 🧪 Teste em Staging

### Ambiente Staging (S3 Direto)

```bash
# Deploy para staging
./deploy.sh staging
```

URLs staging:

- Bootstrap: `https://cartao-simples-widget-staging.s3.us-east-1.amazonaws.com/widget-bootstrap.v1.min.js`
- Bundle: `https://cartao-simples-widget-staging.s3.us-east-1.amazonaws.com/widget.v1.min.js`
- CSS: `https://cartao-simples-widget-staging.s3.us-east-1.amazonaws.com/widget.v1.min.css`

### Teste Local

```bash
# Página de teste staging
open examples/test-staging.html
```

---

## 📊 Checklist de Deploy

### Antes do Deploy

- [ ] Código revisado e testado localmente
- [ ] Tests passando (`npm test`)
- [ ] Build sem erros (`npm run build`)
- [ ] Versão atualizada no `package.json`
- [ ] CHANGELOG.md atualizado
- [ ] Commit e push para o repositório

### Durante o Deploy

- [ ] Executar `./deploy.sh production`
- [ ] Verificar saída do script (sem erros)
- [ ] Aguardar invalidação CloudFront (~2 minutos)

### Após o Deploy

- [ ] Testar URLs via `curl -I`
- [ ] Testar widget em página HTML
- [ ] Verificar console do navegador (sem erros)
- [ ] Verificar estilos aplicados (Shadow DOM)
- [ ] Testar abrir/fechar modal
- [ ] Testar em diferentes navegadores

---

## 🐛 Troubleshooting

### Bootstrap não carrega

```bash
# Verificar CORS
aws s3api get-bucket-cors --bucket cartao-simples-widget

# Verificar bucket policy
aws s3api get-bucket-policy --bucket cartao-simples-widget

# Verificar arquivo existe
aws s3 ls s3://cartao-simples-widget/widget-bootstrap.v1.min.js
```

### CSS não aplica

```bash
# Verificar CSS existe no S3
curl -I https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.css

# Verificar no DevTools
# 1. Inspecionar elemento com widget
# 2. Procurar por #shadow-root
# 3. Dentro do shadow-root deve ter <link rel="stylesheet">
```

### Cache antigo

```bash
# Forçar invalidação
aws cloudfront create-invalidation \
  --distribution-id EOLJNTE5PW5O9 \
  --paths "/*"

# Verificar status
aws cloudfront get-invalidation \
  --distribution-id EOLJNTE5PW5O9 \
  --id <INVALIDATION_ID>

# Limpar cache do navegador: Cmd+Shift+R (Mac) ou Ctrl+Shift+R
```

---

## 📁 Estrutura de Arquivos

```
dist/
├── bootstrap/
│   └── widget-bootstrap.v1.min.js  (~5 KB)   Cache: 5min
├── cdn/
│   ├── widget.v1.min.js             (~400 KB) Cache: 1yr
│   └── widget.v1.min.css            (~25 KB)  Cache: 1yr
└── sdk/
    ├── index.es.js
    └── index.umd.js
```

---

## 🔐 Segurança

### Bucket Policy (Somente Leitura Pública)

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::cartao-simples-widget/*"
    }
  ]
}
```

### SRI (Subresource Integrity)

Após cada deploy, o script gera `sri-hashes.json`:

```html
<script
  src="https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js"
  integrity="sha384-HASH_AQUI"
  crossorigin="anonymous"
></script>
```

---

## 📞 Suporte

- **Documentação**: `docs/`
- **Issues**: GitHub Issues
- **Slack**: #payment-widget

---

**🚀 Happy Deploying!**
