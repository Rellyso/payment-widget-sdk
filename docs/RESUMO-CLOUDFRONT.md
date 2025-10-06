# ☁️ Resumo: Configuração CloudFront - Payment Widget

## 📋 O Que Foi Criado

### 1. Script de Configuração Automática

**Arquivo:** `setup-cloudfront.sh`

Script bash que automatiza todo o processo de configuração do CloudFront:

```bash
./setup-cloudfront.sh production   # Primeira vez
./setup-cloudfront.sh staging      # Ou staging
```

**O que ele faz:**

1. ✅ Verifica dependências (AWS CLI, jq)
2. ✅ Cria Origin Access Identity (OAI)
3. ✅ Atualiza bucket policy para CloudFront
4. ✅ Cria distribuição CloudFront com cache otimizado
5. ✅ Atualiza `deploy.sh` com Distribution ID
6. ✅ Aguarda deploy (15-30 minutos)
7. ✅ Testa disponibilidade
8. ✅ Gera relatório completo

### 2. Documentação Completa

**Arquivo:** `docs/CLOUDFRONT-SETUP.md`

Guia completo com:

- Setup automático via script
- Setup manual passo a passo
- Validação e testes
- Troubleshooting
- Estimativas de custo (~$3-5/mês)

### 3. Guia de Deploy Atualizado

**Arquivo:** `docs/DEPLOY-GUIDE.md`

Atualizado com:

- Seção "Primeira Vez? Configure o CloudFront"
- Link para documentação CloudFront
- Avisos sobre pré-requisitos

### 4. README Atualizado

**Arquivo:** `README.md`

Adicionado:

- Seção "Deploy Rápido" com fluxo simplificado
- Link para documentação CloudFront
- Explicação sobre staging vs production

### 5. .gitignore Atualizado

**Arquivo:** `.gitignore`

Adicionado arquivos temporários gerados pelo script:

```
.oai-id
.distribution-id
.cloudfront-domain
cloudfront-setup-report.txt
cloudfront-temp.json
oai-output.json
distribution-output.json
bucket-policy-cloudfront.json
```

---

## 🎯 Como Usar

### Fluxo Completo (Primeira Vez)

```bash
# 1. Configurar CloudFront (apenas uma vez)
./setup-cloudfront.sh production

# 2. Aguardar mensagem de sucesso
# Verificar cloudfront-setup-report.txt

# 3. Fazer deploy dos arquivos
./deploy.sh production

# 4. Testar
curl -I https://{SEU_DOMAIN}.cloudfront.net/widget-bootstrap.v1.min.js
```

### Fluxo Simplificado (Após Configuração)

```bash
# Build + Deploy
./deploy.sh production

# Pronto! O script já sabe o Distribution ID
```

### Staging (Sem CloudFront)

```bash
# Deploy direto no S3
./deploy.sh staging

# URL: https://cartao-simples-widget-staging.s3.us-east-1.amazonaws.com/
```

---

## 📊 Arquivos Gerados

Após executar `./setup-cloudfront.sh production`:

### .oai-id

```
E2ABCDEFGHIJK
```

ID do Origin Access Identity criado.

### .distribution-id

```
E3XYZABCDEFGH
```

ID da distribuição CloudFront.

### .cloudfront-domain

```
d1234567890abc.cloudfront.net
```

Domain Name do CloudFront (URL do CDN).

### cloudfront-setup-report.txt

```
==================================================
  🎉 CloudFront Configurado com Sucesso!
==================================================

Ambiente: production
Bucket S3: cartao-simples-widget
OAI ID: E2ABCDEFGHIJK
Distribution ID: E3XYZABCDEFGH
Domain Name: d1234567890abc.cloudfront.net

==================================================
  📋 Próximos Passos
==================================================

1. Fazer deploy dos arquivos:
   ./deploy.sh production

2. URLs do CDN:
   Bootstrap: https://d1234567890abc.cloudfront.net/widget-bootstrap.v1.min.js
   Bundle:    https://d1234567890abc.cloudfront.net/widget.v1.min.js
   CSS:       https://d1234567890abc.cloudfront.net/widget.v1.min.css

...
```

---

## 🔧 Configuração de Cache

O script configura automaticamente:

| Arquivo                      | Cache | Motivo                          |
| ---------------------------- | ----- | ------------------------------- |
| `widget-bootstrap.v1.min.js` | 5 min | Permite atualizações rápidas    |
| `widget.v1.min.js`           | 1 ano | Arquivo versionado (nunca muda) |
| `widget.v1.min.css`          | 1 ano | Arquivo versionado (nunca muda) |

**Por que 5 minutos no bootstrap?**

O bootstrap é o ponto de entrada e pode receber correções urgentes. Com cache curto, mudanças propagam rapidamente sem invalidação manual.

**Por que 1 ano no bundle/CSS?**

São arquivos versionados (`v1`). Se precisar mudar, cria-se uma nova versão (`v2`). Cache longo = performance máxima.

---

## 🚨 Troubleshooting

### Erro: "Bucket não existe"

```bash
# Criar bucket primeiro
./deploy.sh production

# Depois configurar CloudFront
./setup-cloudfront.sh production
```

### Erro: "AWS CLI não configurado"

```bash
aws configure

# Informe:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region (us-east-1)
```

### Erro: "jq não instalado"

```bash
brew install jq
```

### CloudFront não responde após setup

**Normal!** Primeira propagação pode levar até 30 minutos. O script aguarda automaticamente.

### Testar se CloudFront está funcionando

```bash
# Obter domain
DOMAIN=$(cat .cloudfront-domain)

# Testar
curl -I https://$DOMAIN/

# Deve retornar 200 ou 404 (bucket vazio = ok)
```

---

## 💰 Custos Estimados

Para **100.000 pageviews/mês**:

- **Data Transfer Out**: 10 GB × $0.085/GB = **$0.85**
- **HTTPS Requests**: 100k × $0.01/10k = **$1.00**
- **S3 Storage**: 1 GB × $0.023/GB = **$0.02**
- **S3 Requests**: 100k × $0.0004/1k = **$0.04**

**Total estimado:** ~$2-3/mês

Com CDN regional brasileiro (mais caro):

- **Data Transfer Out BR**: 10 GB × $0.22/GB = **$2.20**
- **Demais custos:** ~$1.06

**Total com BR:** ~$3-5/mês

**Gratuito até 1 TB/mês** com AWS Free Tier no primeiro ano!

---

## 📁 Estrutura de Arquivos (Atualizada)

```
payment-widget-poc-v2/
├── setup-cloudfront.sh           # ✨ NOVO - Script de setup CloudFront
├── deploy.sh                     # Atualizado automaticamente pelo setup
├── README.md                     # Atualizado com seção Deploy Rápido
├── .gitignore                    # Atualizado com arquivos temporários
├── cloudfront.json               # Template da distribuição
├── cors-config.json              # Configuração CORS
├── bucket-policy-staging.json    # Policy para staging
│
├── docs/
│   ├── CLOUDFRONT-SETUP.md       # ✨ NOVO - Guia completo CloudFront
│   ├── RESUMO-CLOUDFRONT.md      # ✨ NOVO - Este arquivo
│   ├── DEPLOY-GUIDE.md           # Atualizado com pré-requisitos
│   ├── DOCS-INDEX.md
│   ├── QUICK-START.md
│   ├── GUIA-USO-WIDGET.md
│   ├── SOLUCAO-CORS.md
│   └── ...
│
└── [gerados após setup]
    ├── .oai-id                   # ID do OAI
    ├── .distribution-id          # ID da distribuição
    ├── .cloudfront-domain        # Domain do CloudFront
    ├── cloudfront-setup-report.txt # Relatório completo
    ├── oai-output.json           # Output do OAI
    ├── distribution-output.json  # Output da distribuição
    └── bucket-policy-cloudfront.json # Policy gerada
```

---

## ✅ Checklist Final

### Antes do Setup

- [ ] AWS CLI instalado e configurado
- [ ] jq instalado (`brew install jq`)
- [ ] Bucket S3 criado (via `./deploy.sh`)
- [ ] Permissões AWS: S3 + CloudFront

### Durante o Setup

- [ ] Executar `./setup-cloudfront.sh production`
- [ ] Aguardar conclusão (15-30 min)
- [ ] Verificar mensagem de sucesso

### Após o Setup

- [ ] Ler `cloudfront-setup-report.txt`
- [ ] Anotar Domain Name do CloudFront
- [ ] Executar `./deploy.sh production`
- [ ] Testar URLs com `curl -I`
- [ ] Atualizar `src/bootstrap/index.ts` se necessário
- [ ] Commit e push dos arquivos

### Teste Final

- [ ] Abrir `examples/cloudfront-test.html`
- [ ] Verificar console (sem erros)
- [ ] Modal abre corretamente
- [ ] Estilos aplicados (Shadow DOM)
- [ ] Testar abrir/fechar
- [ ] Testar em diferentes navegadores

---

## 🎉 Próximos Passos

Após configurar o CloudFront com sucesso:

1. **Fazer deploy regular:**

   ```bash
   ./deploy.sh production
   ```

2. **Atualizar DNS (opcional):**

   ```
   cdn.cartaosimples.com → CNAME → d1234567890abc.cloudfront.net
   ```

3. **Configurar SSL customizado (opcional):**

   - AWS Certificate Manager
   - Associar certificado à distribuição

4. **Monitorar CloudFront:**

   ```bash
   aws cloudfront get-distribution --id $(cat .distribution-id)
   ```

5. **Invalidar cache quando necessário:**
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id $(cat .distribution-id) \
     --paths "/*"
   ```

---

## 🔗 Links Úteis

- **Documentação CloudFront:** [CLOUDFRONT-SETUP.md](./CLOUDFRONT-SETUP.md)
- **Guia de Deploy:** [DEPLOY-GUIDE.md](./DEPLOY-GUIDE.md)
- **Quick Start:** [QUICK-START.md](./QUICK-START.md)
- **Troubleshooting CORS:** [SOLUCAO-CORS.md](./SOLUCAO-CORS.md)

---

**💡 Dúvidas?** Veja a documentação completa ou abra uma issue no repositório.

**🚀 Happy Deploying!**
