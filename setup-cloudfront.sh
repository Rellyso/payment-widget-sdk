#!/bin/bash

# Script de Configuração CloudFront para Payment Widget
# Cria distribuição CloudFront, OAI, e configura bucket S3
#
# Uso: ./setup-cloudfront.sh [production|staging]

set -e

ENVIRONMENT=${1:-production}
BUCKET_NAME="cartao-simples-widget"
if [ "$ENVIRONMENT" = "staging" ]; then
  BUCKET_NAME="cartao-simples-widget-staging"
fi

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
  echo -e "${GREEN}✅ $1${NC}"
}

warn() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
  echo -e "${RED}❌ $1${NC}"
  exit 1
}

# Verificar dependências
check_dependencies() {
  log "Verificando dependências..."
  
  command -v aws >/dev/null 2>&1 || error "AWS CLI não instalado"
  command -v jq >/dev/null 2>&1 || error "jq não instalado (brew install jq)"
  
  aws sts get-caller-identity >/dev/null 2>&1 || error "AWS CLI não configurado"
  
  log "Dependências OK"
}

# Verificar se bucket existe
check_bucket() {
  log "Verificando bucket S3: $BUCKET_NAME..."
  
  if ! aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    error "Bucket $BUCKET_NAME não existe. Execute './deploy.sh $ENVIRONMENT' primeiro."
  fi
  
  log "Bucket encontrado"
}

# Criar Origin Access Identity
create_oai() {
  log "Criando Origin Access Identity..."
  
  CALLER_REF="payment-widget-oai-$(date +%s)"
  
  aws cloudfront create-cloud-front-origin-access-identity \
    --cloud-front-origin-access-identity-config \
    "CallerReference=$CALLER_REF,Comment=Payment Widget OAI for $ENVIRONMENT" \
    > oai-output.json
  
  OAI_ID=$(jq -r '.CloudFrontOriginAccessIdentity.Id' oai-output.json)
  OAI_ARN="arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity $OAI_ID"
  
  log "OAI criado: $OAI_ID"
  echo "$OAI_ID" > .oai-id
}

# Atualizar bucket policy para CloudFront
update_bucket_policy() {
  log "Atualizando bucket policy para CloudFront..."
  
  cat > bucket-policy-cloudfront.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "AWS": "$OAI_ARN"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF
  
  aws s3api put-bucket-policy \
    --bucket "$BUCKET_NAME" \
    --policy file://bucket-policy-cloudfront.json
  
  log "Bucket policy atualizada"
}

# Criar distribuição CloudFront
create_distribution() {
  log "Criando distribuição CloudFront..."
  
  CALLER_REF="payment-widget-dist-$(date +%s)"
  
  # Usar arquivo cloudfront.json existente e substituir variáveis
  if [ -f "cloudfront.json" ]; then
    # Criar config temporário com OAI
    jq --arg oai "$OAI_ID" \
       --arg bucket "$BUCKET_NAME.s3.amazonaws.com" \
       '.Origins.Items[0].DomainName = $bucket | 
        .Origins.Items[0].S3OriginConfig.OriginAccessIdentity = "origin-access-identity/cloudfront/" + $oai' \
       cloudfront.json > cloudfront-temp.json
    
    aws cloudfront create-distribution \
      --distribution-config file://cloudfront-temp.json \
      > distribution-output.json
    
    rm cloudfront-temp.json
  else
    error "Arquivo cloudfront.json não encontrado"
  fi
  
  DISTRIBUTION_ID=$(jq -r '.Distribution.Id' distribution-output.json)
  DOMAIN_NAME=$(jq -r '.Distribution.DomainName' distribution-output.json)
  
  log "Distribuição criada: $DISTRIBUTION_ID"
  log "Domain Name: $DOMAIN_NAME"
  
  echo "$DISTRIBUTION_ID" > .distribution-id
  echo "$DOMAIN_NAME" > .cloudfront-domain
}

# Atualizar deploy.sh com distribution ID
update_deploy_script() {
  log "Atualizando deploy.sh com Distribution ID..."
  
  if [ "$(uname)" = "Darwin" ]; then
    # macOS
    sed -i '' "s/DISTRIBUTION_ID=\"\"/DISTRIBUTION_ID=\"$DISTRIBUTION_ID\"/" deploy.sh
  else
    # Linux
    sed -i "s/DISTRIBUTION_ID=\"\"/DISTRIBUTION_ID=\"$DISTRIBUTION_ID\"/" deploy.sh
  fi
  
  log "deploy.sh atualizado"
}

# Aguardar deploy
wait_for_deployment() {
  log "Aguardando deploy da distribuição CloudFront..."
  warn "Isso pode levar 15-30 minutos. Aguarde..."
  
  while true; do
    STATUS=$(aws cloudfront get-distribution --id "$DISTRIBUTION_ID" | jq -r '.Distribution.Status')
    
    if [ "$STATUS" = "Deployed" ]; then
      log "Distribuição implantada com sucesso!"
      break
    fi
    
    echo -n "."
    sleep 30
  done
}

# Testar distribuição
test_distribution() {
  log "Testando distribuição..."
  
  DOMAIN_NAME=$(cat .cloudfront-domain)
  
  # Aguardar um pouco antes de testar
  sleep 10
  
  # Testar se domínio responde
  if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN_NAME/" | grep -q "200\|404"; then
    log "Teste: CloudFront respondendo"
  else
    warn "CloudFront ainda não está respondendo (normal para primeiro deploy)"
  fi
}

# Gerar relatório
generate_report() {
  DOMAIN_NAME=$(cat .cloudfront-domain)
  
  cat > cloudfront-setup-report.txt << EOF
==================================================
  🎉 CloudFront Configurado com Sucesso!
==================================================

Ambiente: $ENVIRONMENT
Bucket S3: $BUCKET_NAME
OAI ID: $OAI_ID
Distribution ID: $DISTRIBUTION_ID
Domain Name: $DOMAIN_NAME

==================================================
  📋 Próximos Passos
==================================================

1. Fazer deploy dos arquivos:
   ./deploy.sh $ENVIRONMENT

2. URLs do CDN:
   Bootstrap: https://$DOMAIN_NAME/widget-bootstrap.v1.min.js
   Bundle:    https://$DOMAIN_NAME/widget.v1.min.js
   CSS:       https://$DOMAIN_NAME/widget.v1.min.css

3. Atualizar src/bootstrap/index.ts:
   const CDN_BASE_URL = "https://$DOMAIN_NAME";

4. Testar:
   curl -I https://$DOMAIN_NAME/widget-bootstrap.v1.min.js

==================================================
  📊 Informações Importantes
==================================================

• Cache Bootstrap: 5 minutos (permite atualizações rápidas)
• Cache Bundle/CSS: 1 ano (arquivos versionados)
• CORS: Configurado via S3
• HTTPS: Forçado (redirect HTTP → HTTPS)
• Compressão: Habilitada (Gzip/Brotli)

==================================================
  🔧 Comandos Úteis
==================================================

# Invalidar cache
aws cloudfront create-invalidation \\
  --distribution-id $DISTRIBUTION_ID \\
  --paths "/*"

# Ver status
aws cloudfront get-distribution \\
  --id $DISTRIBUTION_ID | jq -r '.Distribution.Status'

==================================================

Arquivos criados:
  • .oai-id
  • .distribution-id
  • .cloudfront-domain
  • cloudfront-setup-report.txt
  • bucket-policy-cloudfront.json

==================================================
EOF
  
  cat cloudfront-setup-report.txt
}

# Função principal
main() {
  echo "🚀 Configurando CloudFront para Payment Widget"
  echo "Ambiente: $ENVIRONMENT"
  echo ""
  
  check_dependencies
  check_bucket
  create_oai
  update_bucket_policy
  create_distribution
  update_deploy_script
  wait_for_deployment
  test_distribution
  generate_report
  
  log "✅ CloudFront configurado com sucesso!"
  warn "📄 Veja cloudfront-setup-report.txt para próximos passos"
}

main "$@"
