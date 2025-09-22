#!/bin/bash

# Script de deploy para AWS S3 + CloudFront
# Cartão Simples Payment Widget
# 
# Uso: ./deploy.sh [staging|production]

set -e

# Configurações
ENVIRONMENT=${1:-staging}
BUCKET_NAME="cartao-simples-widget-${ENVIRONMENT}"
DISTRIBUTION_ID=""  # Configurar com o ID da distribuição CloudFront

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log colorido
log() {
  echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')] $1${NC}"
}

warn() {
  echo -e "${YELLOW}[WARNING] $1${NC}"
}

error() {
  echo -e "${RED}[ERROR] $1${NC}"
  exit 1
}

# Verificar dependências
check_dependencies() {
  log "Verificando dependências..."
  
  if ! command -v aws &> /dev/null; then
    error "AWS CLI não encontrado. Instale: https://aws.amazon.com/cli/"
  fi
  
  if ! command -v jq &> /dev/null; then
    error "jq não encontrado. Instale: brew install jq"
  fi
  
  if ! command -v npm &> /dev/null; then
    error "npm não encontrado. Instale Node.js"
  fi
  
  # Verificar credenciais AWS
  if ! aws sts get-caller-identity &> /dev/null; then
    error "Credenciais AWS não configuradas. Execute: aws configure"
  fi
  
  log "✅ Todas as dependências OK"
}

# Configurar ambiente
setup_environment() {
  log "Configurando ambiente: $ENVIRONMENT"
  
  case $ENVIRONMENT in
    "staging")
      BUCKET_NAME="cartao-simples-widget-staging"
      DISTRIBUTION_ID="E1ABCDEF123456"  # Substituir pelo ID real
      CDN_BASE_URL="https://staging-cdn.cartaosimples.com"
      ;;
    "production")
      BUCKET_NAME="cartao-simples-widget-production"
      DISTRIBUTION_ID="E7GHIJKL789012"  # Substituir pelo ID real
      CDN_BASE_URL="https://cdn.cartaosimples.com"
      ;;
    *)
      error "Ambiente inválido: $ENVIRONMENT. Use: staging ou production"
      ;;
  esac
  
  log "📦 Bucket: $BUCKET_NAME"
  log "🌐 CDN: $CDN_BASE_URL"
}

# Build do projeto
build_project() {
  log "Executando build do projeto..."
  
  # Limpar build anterior
  rm -rf dist/
  
  # Instalar dependências se necessário
  if [ ! -d "node_modules" ]; then
    log "Instalando dependências..."
    npm ci
  fi
  
  # Type check
  log "Verificando tipos..."
  npm run type-check
  
  # Lint
  log "Executando lint..."
  npm run lint
  
  # Build de todos os targets
  log "Gerando builds..."
  npm run build
  
  # Verificar se os builds foram gerados
  if [ ! -d "dist" ]; then
    error "Diretório dist não foi gerado"
  fi
  
  # Verificar arquivos essenciais
  REQUIRED_FILES=(
    "dist/bootstrap/widget-bootstrap.min.js"
    "dist/cdn/widget.min.js"
    "dist/sdk/index.js"
  )
  
  for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$file" ]; then
      error "Arquivo obrigatório não encontrado: $file"
    fi
  done
  
  log "✅ Build concluído com sucesso"
}

# Verificar integridade dos arquivos
verify_files() {
  log "Verificando integridade dos arquivos..."
  
  # Verificar tamanho do bootstrap
  BOOTSTRAP_SIZE=$(stat -f%z "dist/bootstrap/widget-bootstrap.min.js" 2>/dev/null || stat -c%s "dist/bootstrap/widget-bootstrap.min.js")
  BOOTSTRAP_SIZE_KB=$((BOOTSTRAP_SIZE / 1024))
  
  if [ $BOOTSTRAP_SIZE_KB -gt 10 ]; then
    warn "Bootstrap muito grande: ${BOOTSTRAP_SIZE_KB}KB (deveria ser < 10KB)"
  else
    log "✅ Bootstrap size OK: ${BOOTSTRAP_SIZE_KB}KB"
  fi
  
  # Verificar se os arquivos são válidos JavaScript
  if ! node -c "dist/bootstrap/widget-bootstrap.min.js"; then
    error "Bootstrap JS inválido"
  fi
  
  if ! node -c "dist/cdn/widget.min.js"; then
    error "CDN bundle JS inválido"
  fi
  
  log "✅ Arquivos verificados"
}

# Criar bucket S3 se não existir
create_bucket_if_needed() {
  log "Verificando bucket S3: $BUCKET_NAME"
  
  if ! aws s3 ls "s3://$BUCKET_NAME" &> /dev/null; then
    log "Criando bucket: $BUCKET_NAME"
    
    aws s3 mb "s3://$BUCKET_NAME" --region us-east-1
    
    # Configurar bucket para hosting
    aws s3 website "s3://$BUCKET_NAME" \
      --index-document index.html \
      --error-document error.html
    
    # Configurar política de bucket
    cat > bucket-policy.json << EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
    }
  ]
}
EOF
    
    aws s3api put-bucket-policy \
      --bucket "$BUCKET_NAME" \
      --policy file://bucket-policy.json
    
    rm bucket-policy.json
    
    # Configurar CORS
    cat > cors.json << EOF
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
EOF
    
    aws s3api put-bucket-cors \
      --bucket "$BUCKET_NAME" \
      --cors-configuration file://cors.json
    
    rm cors.json
    
  else
    log "✅ Bucket já existe"
  fi
}

# Upload dos arquivos
upload_files() {
  log "Fazendo upload dos arquivos..."
  
  # Sincronizar arquivos com cache headers apropriados
  
  # Bootstrap (cache curto)
  aws s3 cp "dist/bootstrap/widget-bootstrap.min.js" \
    "s3://$BUCKET_NAME/widget-bootstrap.v1.min.js" \
    --content-type "application/javascript" \
    --cache-control "public, max-age=300" \
    --metadata-directive REPLACE
  
  # CDN bundle (cache longo)
  aws s3 cp "dist/cdn/widget.min.js" \
    "s3://$BUCKET_NAME/widget.v1.min.js" \
    --content-type "application/javascript" \
    --cache-control "public, max-age=31536000" \
    --metadata-directive REPLACE
  
  # SDK files (cache longo)
  aws s3 sync "dist/sdk/" \
    "s3://$BUCKET_NAME/sdk/" \
    --cache-control "public, max-age=31536000" \
    --delete
  
  # Assets (se existirem)
  if [ -d "dist/assets" ]; then
    aws s3 sync "dist/assets/" \
      "s3://$BUCKET_NAME/assets/" \
      --cache-control "public, max-age=31536000" \
      --delete
  fi
  
  log "✅ Upload concluído"
}

# Invalidar cache do CloudFront
invalidate_cloudfront() {
  if [ -n "$DISTRIBUTION_ID" ] && [ "$DISTRIBUTION_ID" != "E1ABCDEF123456" ]; then
    log "Invalidando cache do CloudFront..."
    
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
      --distribution-id "$DISTRIBUTION_ID" \
      --paths "/*" \
      --query 'Invalidation.Id' \
      --output text)
    
    log "🔄 Invalidação iniciada: $INVALIDATION_ID"
    log "Aguardando conclusão..."
    
    aws cloudfront wait invalidation-completed \
      --distribution-id "$DISTRIBUTION_ID" \
      --id "$INVALIDATION_ID"
    
    log "✅ Cache invalidado"
  else
    warn "ID da distribuição CloudFront não configurado, pulando invalidação"
  fi
}

# Gerar hashes SRI
generate_sri_hashes() {
  log "Gerando hashes SRI..."
  
  BOOTSTRAP_HASH=$(openssl dgst -sha384 -binary "dist/bootstrap/widget-bootstrap.min.js" | openssl base64 -A)
  CDN_HASH=$(openssl dgst -sha384 -binary "dist/cdn/widget.min.js" | openssl base64 -A)
  
  cat > sri-hashes.json << EOF
{
  "bootstrap": "sha384-$BOOTSTRAP_HASH",
  "cdn": "sha384-$CDN_HASH"
}
EOF
  
  log "✅ Hashes SRI salvos em sri-hashes.json"
}

# Testes pós-deploy
test_deployment() {
  log "Testando deployment..."
  
  # Testar bootstrap
  BOOTSTRAP_URL="${CDN_BASE_URL}/widget-bootstrap.v1.min.js"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$BOOTSTRAP_URL")
  
  if [ "$HTTP_CODE" != "200" ]; then
    error "Bootstrap não acessível: $BOOTSTRAP_URL (HTTP $HTTP_CODE)"
  fi
  
  # Testar CDN bundle  
  CDN_URL="${CDN_BASE_URL}/widget.v1.min.js"
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$CDN_URL")
  
  if [ "$HTTP_CODE" != "200" ]; then
    error "CDN bundle não acessível: $CDN_URL (HTTP $HTTP_CODE)"
  fi
  
  log "✅ Testes de deployment aprovados"
}

# Relatório final
generate_report() {
  log "Gerando relatório de deploy..."
  
  DEPLOY_TIME=$(date)
  COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "N/A")
  
  cat > deploy-report.json << EOF
{
  "environment": "$ENVIRONMENT",
  "deployTime": "$DEPLOY_TIME",
  "commitHash": "$COMMIT_HASH",
  "bucketName": "$BUCKET_NAME",
  "cdnBaseUrl": "$CDN_BASE_URL",
  "files": {
    "bootstrap": "${CDN_BASE_URL}/widget-bootstrap.v1.min.js",
    "cdn": "${CDN_BASE_URL}/widget.v1.min.js"
  }
}
EOF
  
  log "✅ Relatório salvo em deploy-report.json"
  
  echo ""
  echo "🎉 Deploy concluído com sucesso!"
  echo ""
  echo "URLs de produção:"
  echo "📦 Bootstrap: ${CDN_BASE_URL}/widget-bootstrap.v1.min.js"
  echo "📦 CDN Bundle: ${CDN_BASE_URL}/widget.v1.min.js"
  echo ""
  echo "Exemplo de uso:"
  echo '<script src="'${CDN_BASE_URL}'/widget-bootstrap.v1.min.js" data-merchant-id="seu-merchant" async></script>'
}

# Função principal
main() {
  log "🚀 Iniciando deploy do Cartão Simples Widget"
  log "Ambiente: $ENVIRONMENT"
  
  check_dependencies
  setup_environment
  build_project
  verify_files
  create_bucket_if_needed
  upload_files
  invalidate_cloudfront
  generate_sri_hashes
  test_deployment
  generate_report
  
  log "🎊 Deploy finalizado!"
}

# Executar se chamado diretamente
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
  main "$@"
fi