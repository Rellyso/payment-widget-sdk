# ☁️ Configuração CloudFront - Payment Widget

## 📋 Visão Geral

O CloudFront é o CDN da AWS que distribui os arquivos do widget globalmente com baixa latência. Este guia mostra como configurar do zero.

---

## 🎯 Pré-requisitos

- ✅ AWS CLI instalado e configurado
- ✅ Conta AWS com permissões para CloudFront e S3
- ✅ Bucket S3 já criado (`cartao-simples-widget`)

---

## 🚀 Configuração Automática (Recomendado)

Criei um script que configura tudo automaticamente:

```bash
# Tornar executável
chmod +x setup-cloudfront.sh

# Executar
./setup-cloudfront.sh production
```

O script cria:

- ✅ Distribuição CloudFront
- ✅ Origin Access Identity (OAI)
- ✅ Cache policies otimizadas
- ✅ Configurações de CORS
- ✅ SSL/TLS configurado
- ✅ Atualiza deploy.sh com DISTRIBUTION_ID

---

## 🔧 Configuração Manual

### 1. Criar Origin Access Identity (OAI)

```bash
# Criar OAI
aws cloudfront create-cloud-front-origin-access-identity \
  --cloud-front-origin-access-identity-config \
  "CallerReference=$(date +%s),Comment=Payment Widget OAI" \
  > oai-output.json

# Extrair ID
OAI_ID=$(jq -r '.CloudFrontOriginAccessIdentity.Id' oai-output.json)
echo "OAI ID: $OAI_ID"
```

### 2. Atualizar Bucket Policy

Substitua o Origin Access Identity no bucket:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity YOUR_OAI_ID"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::cartao-simples-widget/*"
    }
  ]
}
```

Aplicar:

```bash
aws s3api put-bucket-policy \
  --bucket cartao-simples-widget \
  --policy file://bucket-policy-cloudfront.json
```

### 3. Criar Distribuição CloudFront

Use o comando:

```bash
aws cloudfront create-distribution \
  --distribution-config file://cloudfront.json \
  > distribution-output.json

# Extrair ID e Domain
DISTRIBUTION_ID=$(jq -r '.Distribution.Id' distribution-output.json)
DOMAIN_NAME=$(jq -r '.Distribution.DomainName' distribution-output.json)

echo "Distribution ID: $DISTRIBUTION_ID"
echo "Domain Name: $DOMAIN_NAME"
```

### 4. Atualizar deploy.sh

Edite `deploy.sh` e atualize:

```bash
# Linha 12 (aproximadamente)
DISTRIBUTION_ID="SEU_DISTRIBUTION_ID_AQUI"  # Ex: E2X3Y4Z5ABCDEF
```

### 5. Aguardar Deploy

```bash
# Verificar status
aws cloudfront get-distribution --id $DISTRIBUTION_ID | jq -r '.Distribution.Status'

# Deve mudar de "InProgress" para "Deployed" (~15-20 minutos)
```

---

## ✅ Validação

### 1. Testar HTTP

```bash
# Testar bootstrap
curl -I https://$DOMAIN_NAME/widget-bootstrap.v1.min.js

# Deve retornar HTTP/2 200
```

### 2. Testar CORS

```bash
curl -I -H "Origin: https://example.com" \
  https://$DOMAIN_NAME/widget-bootstrap.v1.min.js

# Deve incluir headers:
# access-control-allow-origin: *
# access-control-allow-methods: GET, HEAD
```

### 3. Testar Cache

```bash
# Primeira requisição
curl -I https://$DOMAIN_NAME/widget.v1.min.js | grep -i "x-cache"
# X-Cache: Miss from cloudfront

# Segunda requisição
curl -I https://$DOMAIN_NAME/widget.v1.min.js | grep -i "x-cache"
# X-Cache: Hit from cloudfront
```

---

## 📊 Configurações de Cache

### Bootstrap (5 minutos)

```json
{
  "MinTTL": 0,
  "DefaultTTL": 300,
  "MaxTTL": 300
}
```

**Por quê?** Permite atualizações rápidas do loader sem cache longo.

### Bundle + CSS (1 ano)

```json
{
  "MinTTL": 0,
  "DefaultTTL": 31536000,
  "MaxTTL": 31536000
}
```

**Por quê?** Arquivos versionados podem ter cache longo (ex: `widget.v1.min.js`).

---

## 🔄 Invalidação de Cache

### Manual

```bash
aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*"
```

### Via deploy.sh

O script já faz isso automaticamente após upload.

---

## 💰 Custos Estimados

### Free Tier (Primeiros 12 meses)

- ✅ 50 GB de transferência de dados/mês
- ✅ 2.000.000 de requisições HTTP/HTTPS

### Após Free Tier

- 📊 ~$0.085/GB transferido (EUA)
- 📊 ~$0.01/10.000 requisições HTTPS

**Estimativa para 100k pageviews/mês:**

- Transferência: ~40 GB (bootstrap + bundle)
- Custo: ~$3-5/mês

---

## 🐛 Troubleshooting

### Erro: "AccessDenied" no S3

**Causa:** Bucket policy incorreta ou OAI não configurado

**Solução:**

```bash
# Verificar OAI
aws cloudfront get-cloud-front-origin-access-identity --id $OAI_ID

# Atualizar bucket policy
aws s3api put-bucket-policy \
  --bucket cartao-simples-widget \
  --policy file://bucket-policy-cloudfront.json
```

### CloudFront retorna "InProgress" por muito tempo

**Normal:** Deploy inicial leva 15-30 minutos

**Verificar status:**

```bash
watch -n 30 'aws cloudfront get-distribution --id $DISTRIBUTION_ID | jq -r ".Distribution.Status"'
```

---

## 📚 Referências

- [AWS CloudFront Documentation](https://docs.aws.amazon.com/cloudfront/)
- [S3 + CloudFront Tutorial](https://aws.amazon.com/premiumsupport/knowledge-center/cloudfront-serve-static-website/)

---

**Próximo Passo:** Execute `./setup-cloudfront.sh production` para configuração automática! 🚀
