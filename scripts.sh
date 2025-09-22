#!/bin/bash

# 📦 Scripts de Utilitários - Cartão Simples Widget
# Conjunto de scripts para facilitar publicação e deploy

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Funções de log
log() { echo -e "${GREEN}[INFO] $1${NC}"; }
warn() { echo -e "${YELLOW}[WARN] $1${NC}"; }
error() { echo -e "${RED}[ERROR] $1${NC}"; exit 1; }
info() { echo -e "${BLUE}[INFO] $1${NC}"; }

# Função para verificar dependências
check_deps() {
    local deps=("node" "npm" "git")
    for dep in "${deps[@]}"; do
        if ! command -v "$dep" &> /dev/null; then
            error "$dep não encontrado. Instale antes de continuar."
        fi
    done
    log "✅ Dependências verificadas"
}

# Função para limpar projeto
clean() {
    log "🧹 Limpando projeto..."
    rm -rf dist/ node_modules/ *.tgz
    npm ci
    log "✅ Projeto limpo e dependências reinstaladas"
}

# Função para executar todos os testes
test_all() {
    log "🧪 Executando testes completos..."
    
    # Type check
    npm run type-check || error "Type check falhou"
    
    # Lint
    npm run lint || error "Lint falhou"
    
    # Build todos os targets
    npm run build:sdk || error "Build SDK falhou"
    npm run build:cdn || error "Build CDN falhou"  
    npm run build:bootstrap || error "Build Bootstrap falhou"
    
    log "✅ Todos os testes passaram"
}

# Função para verificar integridade dos builds
verify_builds() {
    log "🔍 Verificando integridade dos builds..."
    
    # Verificar se arquivos existem
    local files=(
        "dist/sdk/index.js"
        "dist/sdk/index.es.js" 
        "dist/sdk/index.d.ts"
        "dist/cdn/widget.v1.min.umd.cjs"
        "dist/bootstrap/widget-bootstrap.v1.min.umd.cjs"
    )
    
    for file in "${files[@]}"; do
        if [ ! -f "$file" ]; then
            error "Arquivo obrigatório não encontrado: $file"
        fi
    done
    
    # Verificar se são JS válidos
    node -c dist/sdk/index.js || error "SDK JS inválido"
    node -c dist/cdn/widget.v1.min.umd.cjs || error "CDN JS inválido"
    node -c dist/bootstrap/widget-bootstrap.v1.min.umd.cjs || error "Bootstrap JS inválido"
    
    # Verificar tamanhos
    local bootstrap_size=$(stat -f%z "dist/bootstrap/widget-bootstrap.v1.min.umd.cjs" 2>/dev/null || stat -c%s "dist/bootstrap/widget-bootstrap.v1.min.umd.cjs")
    local bootstrap_size_kb=$((bootstrap_size / 1024))
    
    if [ $bootstrap_size_kb -gt 10 ]; then
        warn "Bootstrap maior que 10KB: ${bootstrap_size_kb}KB"
    else
        log "✅ Bootstrap size OK: ${bootstrap_size_kb}KB"
    fi
    
    log "✅ Builds verificados com sucesso"
}

# Função para preparar release
prepare_release() {
    local version_type=${1:-patch}
    
    log "📋 Preparando release ($version_type)..."
    
    # Verificar se working directory está limpo
    if [ -n "$(git status --porcelain)" ]; then
        error "Working directory não está limpo. Commit suas mudanças primeiro."
    fi
    
    # Pull das últimas mudanças
    git pull origin main
    
    # Limpar e testar
    clean
    test_all
    verify_builds
    
    # Bump version
    local new_version=$(npm version "$version_type" --no-git-tag-version)
    log "📈 Versão atualizada para: $new_version"
    
    # Commit mudanças
    git add package.json package-lock.json
    git commit -m "chore: bump version to $new_version"
    
    # Criar tag
    git tag -a "$new_version" -m "Release $new_version"
    
    log "✅ Release preparado: $new_version"
    log "💡 Execute 'npm run publish-sdk' para publicar no npm"
    log "💡 Execute 'npm run deploy-cdn' para fazer deploy do CDN"
}

# Função para publicar SDK
publish_sdk() {
    log "📦 Publicando SDK no npm..."
    
    # Verificar login npm
    npm whoami > /dev/null || error "Não logado no npm. Execute: npm login"
    
    # Verificar se é registry oficial
    local registry=$(npm config get registry)
    if [ "$registry" != "https://registry.npmjs.org/" ]; then
        error "Registry incorreto: $registry. Use: npm config set registry https://registry.npmjs.org/"
    fi
    
    # Build SDK
    npm run build:sdk
    verify_builds
    
    # Dry run para verificar
    log "🔍 Verificando conteúdo do pacote..."
    npm pack --dry-run
    
    read -p "Confirma publicação no npm? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "❌ Publicação cancelada"
        exit 0
    fi
    
    # Publicar
    npm publish
    
    # Push tags
    git push origin main
    git push origin --tags
    
    log "✅ SDK publicado com sucesso!"
    log "🔗 Verifique em: https://www.npmjs.com/package/cartao-simples-widget"
}

# Função para gerar SRI hashes
generate_sri() {
    log "🔐 Gerando hashes SRI..."
    
    if [ ! -f "dist/bootstrap/widget-bootstrap.v1.min.umd.cjs" ]; then
        npm run build:bootstrap
    fi
    
    if [ ! -f "dist/cdn/widget.v1.min.umd.cjs" ]; then
        npm run build:cdn
    fi
    
    local bootstrap_hash=$(openssl dgst -sha384 -binary "dist/bootstrap/widget-bootstrap.v1.min.umd.cjs" | openssl base64 -A)
    local cdn_hash=$(openssl dgst -sha384 -binary "dist/cdn/widget.v1.min.umd.cjs" | openssl base64 -A)
    
    cat > sri-hashes.json << EOF
{
  "bootstrap": {
    "file": "widget-bootstrap.v1.min.js",
    "integrity": "sha384-$bootstrap_hash"
  },
  "cdn": {
    "file": "widget.v1.min.js", 
    "integrity": "sha384-$cdn_hash"
  },
  "generated": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
}
EOF
    
    log "✅ Hashes SRI gerados em sri-hashes.json"
    
    cat << EOF

📋 Use nos seus HTML templates:

Bootstrap:
<script 
  src="https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js"
  integrity="sha384-$bootstrap_hash"
  crossorigin="anonymous"
  async>
</script>

CDN Bundle:
<script 
  src="https://cdn.cartaosimples.com/widget.v1.min.js"
  integrity="sha384-$cdn_hash"
  crossorigin="anonymous">
</script>

EOF
}

# Função para testar instalação local
test_install() {
    log "🧪 Testando instalação local..."
    
    # Build SDK
    npm run build:sdk
    
    # Criar pacote
    npm pack
    local package_file=$(ls cartao-simples-widget-*.tgz | head -n1)
    
    # Criar diretório de teste
    local test_dir="/tmp/test-cartao-simples-widget-$(date +%s)"
    mkdir -p "$test_dir"
    cd "$test_dir"
    
    # Inicializar projeto teste
    npm init -y
    npm install "$OLDPWD/$package_file"
    
    # Testar importação CommonJS
    cat > test-cjs.js << 'EOF'
const widget = require('cartao-simples-widget');
console.log('✅ CommonJS import OK:', typeof widget);
EOF
    
    node test-cjs.js
    
    # Testar importação ES Modules
    cat > package.json << 'EOF'
{
  "name": "test-project",
  "type": "module",
  "version": "1.0.0"
}
EOF
    
    cat > test-esm.js << 'EOF'
import * as widget from 'cartao-simples-widget';
console.log('✅ ES Modules import OK:', typeof widget);
EOF
    
    node test-esm.js
    
    # Limpar
    cd "$OLDPWD"
    rm -rf "$test_dir" "$package_file"
    
    log "✅ Instalação local testada com sucesso"
}

# Função para verificar status
status() {
    log "📊 Status do Projeto"
    
    echo
    info "📦 Package Info:"
    local current_version=$(node -p "require('./package.json').version")
    echo "  Versão atual: $current_version"
    echo "  Nome: cartao-simples-widget"
    
    echo
    info "🏗️ Builds:"
    if [ -d "dist" ]; then
        echo "  ✅ Diretório dist existe"
        ls -la dist/ 2>/dev/null | tail -n +2 | sed 's/^/    /'
    else
        echo "  ❌ Diretório dist não existe"
    fi
    
    echo
    info "🔗 Git Status:"
    git status --short | sed 's/^/  /'
    
    local latest_tag=$(git describe --tags --abbrev=0 2>/dev/null || echo "nenhuma")
    echo "  Última tag: $latest_tag"
    
    echo
    info "📡 npm Info:"
    if npm whoami &>/dev/null; then
        echo "  ✅ Logado como: $(npm whoami)"
    else
        echo "  ❌ Não logado no npm"
    fi
    echo "  Registry: $(npm config get registry)"
    
    echo
    info "☁️ AWS Status:"
    if aws sts get-caller-identity &>/dev/null; then
        echo "  ✅ AWS configurado"
        aws sts get-caller-identity --query 'Account' --output text | sed 's/^/  Account: /'
    else
        echo "  ❌ AWS não configurado"
    fi
}

# Função para mostrar ajuda
help() {
    cat << EOF
📦 Scripts de Utilitários - Cartão Simples Widget

Uso: ./scripts.sh <comando> [argumentos]

Comandos disponíveis:

  🧹 clean                    - Limpar projeto e reinstalar dependências
  🧪 test                     - Executar todos os testes (type-check, lint, build)
  🔍 verify                   - Verificar integridade dos builds
  📋 prepare [patch|minor|major] - Preparar nova release (default: patch)
  📦 publish-sdk              - Publicar SDK no npm
  🔐 sri                      - Gerar hashes SRI para CDN
  🧪 test-install             - Testar instalação local do pacote
  📊 status                   - Mostrar status do projeto
  ❓ help                     - Mostrar esta ajuda

Exemplos:

  ./scripts.sh clean          # Limpar tudo
  ./scripts.sh test           # Rodar testes
  ./scripts.sh prepare minor  # Preparar release minor
  ./scripts.sh publish-sdk    # Publicar no npm
  ./scripts.sh sri            # Gerar SRI hashes

Para deploy CDN, use:
  ./deploy.sh staging         # Deploy para staging
  ./deploy.sh production      # Deploy para production

EOF
}

# Função principal
main() {
    case "${1:-help}" in
        "clean")
            check_deps
            clean
            ;;
        "test")
            check_deps
            test_all
            ;;
        "verify")
            verify_builds
            ;;
        "prepare")
            check_deps
            prepare_release "${2:-patch}"
            ;;
        "publish-sdk")
            check_deps
            publish_sdk
            ;;
        "sri")
            generate_sri
            ;;
        "test-install")
            check_deps
            test_install
            ;;
        "status")
            status
            ;;
        "help"|*)
            help
            ;;
    esac
}

# Executar se chamado diretamente
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    main "$@"
fi