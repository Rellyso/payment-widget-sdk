# ✅ Setup CloudFront - Completo!

## 🎉 O Que Foi Criado

Acabei de criar toda a infraestrutura e documentação necessária para configurar o CloudFront e fazer deploy em produção do Payment Widget.

---

## 📁 Arquivos Criados/Atualizados

### 🆕 Novos Arquivos

1. **`setup-cloudfront.sh`** (executável)

   - Script de configuração automática do CloudFront
   - Cria OAI, distribuição, configura S3, testes
   - Gera relatório completo ao final

2. **`docs/CLOUDFRONT-SETUP.md`**

   - Guia completo de configuração CloudFront
   - Setup automático e manual
   - Troubleshooting e estimativas de custo

3. **`docs/RESUMO-CLOUDFRONT.md`**
   - Resumo executivo do que foi criado
   - Fluxo de uso e checklist
   - Explicação dos arquivos gerados

### 🔄 Arquivos Atualizados

4. **`README.md`**

   - Adicionada seção "Deploy Rápido"
   - Link para documentação CloudFront

5. **`docs/DEPLOY-GUIDE.md`**

   - Adicionada seção "Primeira Vez?"
   - Pré-requisito: CloudFront configurado

6. **`docs/DOCS-INDEX.md`**

   - Adicionadas novas documentações
   - Fluxo de trabalho atualizado
   - Casos de uso expandidos

7. **`.gitignore`**
   - Arquivos temporários do setup ignorados

---

## 🚀 Como Usar - Passo a Passo

### 1️⃣ Primeira Vez (Setup CloudFront)

```bash
# Executar setup automático
./setup-cloudfront.sh production

# Aguardar conclusão (15-30 minutos)
# ✅ Cria OAI
# ✅ Cria distribuição CloudFront
# ✅ Configura bucket S3
# ✅ Gera relatório

# Verificar resultado
cat cloudfront-setup-report.txt
```

### 2️⃣ Deploy dos Arquivos

```bash
# Fazer deploy
./deploy.sh production

# Arquivos enviados:
# ✅ widget-bootstrap.v1.min.js (~5KB)
# ✅ widget.v1.min.js (~427KB)
# ✅ widget.v1.min.css (~29KB)
```

### 3️⃣ Testar

```bash
# Obter domain do CloudFront
cat .cloudfront-domain

# Testar URLs
curl -I https://$(cat .cloudfront-domain)/widget-bootstrap.v1.min.js
curl -I https://$(cat .cloudfront-domain)/widget.v1.min.js
curl -I https://$(cat .cloudfront-domain)/widget.v1.min.css

# Ou abrir página de teste
open examples/cloudfront-test.html
```

---

## 📊 Arquivos Gerados pelo Setup

Após executar `./setup-cloudfront.sh production`, você terá:

```
.oai-id                           # ID do Origin Access Identity
.distribution-id                  # ID da distribuição CloudFront
.cloudfront-domain                # Domain Name (ex: d123abc.cloudfront.net)
cloudfront-setup-report.txt       # Relatório completo com próximos passos
```

**Não commitar esses arquivos** (já estão no .gitignore).

---

## 📚 Documentação

### Guias de Referência Rápida

| Documento                                               | Quando Usar                                |
| ------------------------------------------------------- | ------------------------------------------ |
| **[CLOUDFRONT-SETUP.md](./docs/CLOUDFRONT-SETUP.md)**   | Primeira vez configurando CloudFront       |
| **[RESUMO-CLOUDFRONT.md](./docs/RESUMO-CLOUDFRONT.md)** | Ver o que foi criado pelo setup            |
| **[DEPLOY-GUIDE.md](./docs/DEPLOY-GUIDE.md)**           | Deploy regular após CloudFront configurado |
| **[DOCS-INDEX.md](./docs/DOCS-INDEX.md)**               | Navegar por toda documentação              |

### Fluxo Completo

```
1. Primeira vez
   └── CLOUDFRONT-SETUP.md → setup-cloudfront.sh → RESUMO-CLOUDFRONT.md

2. Deploy regular
   └── DEPLOY-GUIDE.md → deploy.sh

3. Troubleshooting
   └── CLOUDFRONT-SETUP.md (Troubleshooting) → DEPLOY-GUIDE.md (Troubleshooting)
```

---

## 💡 Comandos Úteis

### Setup CloudFront

```bash
# Production
./setup-cloudfront.sh production

# Staging (se necessário)
./setup-cloudfront.sh staging
```

### Deploy

```bash
# Production
./deploy.sh production

# Staging
./deploy.sh staging
```

### Verificar Status

```bash
# Ver domain CloudFront
cat .cloudfront-domain

# Ver distribution ID
cat .distribution-id

# Ver status da distribuição
aws cloudfront get-distribution --id $(cat .distribution-id) | jq -r '.Distribution.Status'
```

### Invalidar Cache

```bash
# Invalidar todos os arquivos
aws cloudfront create-invalidation \
  --distribution-id $(cat .distribution-id) \
  --paths "/*"
```

### Testar URLs

```bash
# Testar bootstrap
curl -I https://$(cat .cloudfront-domain)/widget-bootstrap.v1.min.js

# Testar bundle
curl -I https://$(cat .cloudfront-domain)/widget.v1.min.js

# Testar CSS
curl -I https://$(cat .cloudfront-domain)/widget.v1.min.css
```

---

## ⚙️ Configuração de Cache

O setup configura automaticamente:

| Arquivo                      | Cache         | Motivo                        |
| ---------------------------- | ------------- | ----------------------------- |
| `widget-bootstrap.v1.min.js` | **5 minutos** | Permite atualizações rápidas  |
| `widget.v1.min.js`           | **1 ano**     | Arquivo versionado (imutável) |
| `widget.v1.min.css`          | **1 ano**     | Arquivo versionado (imutável) |

---

## 💰 Custos Estimados

Para **100.000 pageviews/mês**:

| Item              | Custo         |
| ----------------- | ------------- |
| Data Transfer Out | ~$0.85        |
| HTTPS Requests    | ~$1.00        |
| S3 Storage        | ~$0.02        |
| S3 Requests       | ~$0.04        |
| **Total**         | **~$2-3/mês** |

Com região Brasil (mais caro):

- **Total:** ~$3-5/mês

**AWS Free Tier:** Primeiros 1 TB/mês grátis no primeiro ano!

---

## ✅ Checklist Completo

### Antes de Executar

- [ ] AWS CLI instalado e configurado (`aws configure`)
- [ ] `jq` instalado (`brew install jq`)
- [ ] Permissões AWS: S3 + CloudFront
- [ ] Li [CLOUDFRONT-SETUP.md](./docs/CLOUDFRONT-SETUP.md)

### Executar Setup

- [ ] `./setup-cloudfront.sh production`
- [ ] Aguardar conclusão (15-30 min)
- [ ] Verificar mensagem de sucesso

### Após Setup

- [ ] Ler `cloudfront-setup-report.txt`
- [ ] Anotar Domain Name (`.cloudfront-domain`)
- [ ] Executar `./deploy.sh production`
- [ ] Testar URLs com `curl -I`
- [ ] Abrir `examples/cloudfront-test.html`
- [ ] Verificar console sem erros
- [ ] Testar modal abre/fecha
- [ ] Testar estilos aplicados

### Opcional

- [ ] Configurar domínio customizado (DNS CNAME)
- [ ] Configurar SSL customizado (ACM)
- [ ] Configurar alarmes CloudWatch
- [ ] Documentar URLs para equipe

---

## 🚨 Troubleshooting Rápido

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
# Informar Access Key, Secret Key, Region (us-east-1)
```

### Erro: "jq não instalado"

```bash
brew install jq
```

### CloudFront não responde

Normal no primeiro deploy! Aguardar até 30 minutos. Verificar status:

```bash
aws cloudfront get-distribution --id $(cat .distribution-id) | jq -r '.Distribution.Status'
# Deve retornar "Deployed"
```

### Cache desatualizado

```bash
# Forçar invalidação
aws cloudfront create-invalidation \
  --distribution-id $(cat .distribution-id) \
  --paths "/*"

# Aguardar 1-2 minutos
```

---

## 📞 Precisa de Ajuda?

1. **Documentação completa:** [docs/CLOUDFRONT-SETUP.md](./docs/CLOUDFRONT-SETUP.md)
2. **Troubleshooting detalhado:** Seção no final de cada guia
3. **Exemplos:** [examples/cloudfront-test.html](./examples/cloudfront-test.html)
4. **Issues:** https://github.com/Rellyso/payment-widget-poc/issues

---

## 🎯 Próximos Passos

Após o setup com sucesso:

1. ✅ **Testar em staging** antes de produção
2. ✅ **Configurar DNS** para domínio customizado (opcional)
3. ✅ **Configurar SSL** customizado (opcional)
4. ✅ **Monitorar CloudWatch** para métricas
5. ✅ **Documentar** URLs para a equipe

---

## 🎉 Pronto!

Agora você tem:

- ✅ Script de configuração automática do CloudFront
- ✅ Documentação completa e atualizada
- ✅ Fluxo de deploy automatizado
- ✅ Testes e validação prontos
- ✅ Troubleshooting documentado

**Execute `./setup-cloudfront.sh production` e siga o guia!**

---

**💡 Dica:** Comece sempre testando em staging (`./deploy.sh staging`) antes de produção.

**🚀 Boa sorte com o deploy!**
