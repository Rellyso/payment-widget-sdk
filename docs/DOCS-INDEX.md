# 📚 Índice de Documentação - Widget Cartão Simples

Este projeto possui documentação completa e organizada. Use este índice para encontrar rapidamente o que precisa.

---

## 🚀 Para Começar Rapidamente

### [QUICK-START.md](./QUICK-START.md)

**Comece aqui se você quer testar o widget em menos de 5 minutos.**

- ✅ Exemplo HTML puro (copiar e colar)
- ✅ Integração React com Vite
- ✅ Integração Vue.js
- ✅ Como testar localmente
- ✅ Debug rápido

**Use quando:** Você quer apenas testar o widget rapidamente ou precisa de um exemplo funcional.

---

## 📖 Para Entender o Projeto

### [README.md](./README.md)

**Documentação principal do projeto.**

- Características do widget
- Instalação via CDN e npm
- API completa de configuração
- Callbacks e eventos
- Segurança e acessibilidade
- Exemplos de integração
- Troubleshooting

**Use quando:** Você quer entender como o widget funciona em profundidade ou precisa da referência completa da API.

### [GUIA-CRIAR-WIDGET-DO-ZERO.md](./GUIA-CRIAR-WIDGET-DO-ZERO.md) ⭐ **NOVO**

**Guia completo para criar um Payment Widget do zero.**

- Introdução e conceitos (SDK vs CDN vs Bootstrap)
- Arquitetura e decisões técnicas (por que React, Vite, Shadow DOM)
- Configuração inicial do projeto (setup passo a passo)
- Estrutura de build múltiplo (SDK, CDN, Bootstrap)
- Implementação completa do widget
- Shadow DOM e isolamento de estilos
- Sistema de build com Vite
- Deploy e distribuição (NPM, S3, CloudFront)
- Segurança e boas práticas
- Testes e validação
- Checklist completo

**Use quando:** Você quer criar um widget embarcável do zero ou entender profundamente as decisões arquiteturais do projeto.

### [CDN-CONFIGURATION.md](./CDN-CONFIGURATION.md) ⭐ **NOVO**

**Configuração da URL do CDN via variáveis de ambiente.**

- Como funciona o sistema de fallback
- Override para desenvolvimento/staging
- Build time replacement com Vite
- Cenários de uso (dev/staging/prod)
- Troubleshooting de problemas de CDN
- Boas práticas

**Use quando:** Você precisa usar URLs de CDN diferentes por ambiente ou quer entender como configurar o CDN_BASE_URL.

### [VITE-ENV-VARIABLES.md](./VITE-ENV-VARIABLES.md) ⭐ **NOVO**

**Guia completo sobre variáveis de ambiente no Vite.**

- Diferença entre prefixo `VITE_` e sem prefixo
- Quando usar `define` no vite.config.ts
- Como funciona o build-time replacement
- Exemplos práticos (simples, fallback, sem prefixo)
- Armadilhas comuns e soluções
- TypeScript types para variáveis de ambiente

**Use quando:** Você vai adicionar novas variáveis de ambiente ou quer entender por que usamos `define` para algumas variáveis.

### [TOKENIZACAO.md](./TOKENIZACAO.md) ⭐ **NOVO**

**Guia completo de tokenização de cartão de crédito.**

- O que é tokenização e por que usar
- 2 arquiteturas: Backend vs API Pública (JavaScript)
- Implementação completa passo a passo
- Serviço de tokenização com validação Luhn
- Comparação das abordagens
- Segurança do token (expiração, uso único)
- Exemplo completo de integração

**Use quando:** Você precisa entender como gerar e usar tokens de cartão de forma segura, ou quer implementar a tokenização no widget.

### [PAYMENT-FORM.md](./PAYMENT-FORM.md) ⭐ **NOVO**

**Documentação completa do formulário de pagamento (PaymentFormStep).**

- Visão geral do componente
- Funcionalidades (máscaras, validação, detecção de bandeira)
- Fluxo de tokenização detalhado com diagrama
- Validações (Luhn, expiry, CVV, nome)
- Estrutura do componente
- Integração com APIs (endpoints, requests, responses)
- Exemplos de uso (básico, backend customizado, múltiplos comerciantes)
- Segurança (boas práticas, o que nunca fazer, checklist)
- Callbacks e eventos
- Performance e métricas
- Acessibilidade (WCAG 2.1 AA)
- Números de teste
- Troubleshooting
- Roadmap de funcionalidades

**Use quando:** Você precisa entender como funciona o formulário de pagamento, integrar com APIs de tokenização/pagamento, ou customizar validações.

### [BOOTSTRAP-EXPLICACAO.md](./BOOTSTRAP-EXPLICACAO.md)

**Explicação técnica detalhada do Bootstrap Loader.**

- O que é e para que serve o bootstrap
- Quando e como é executado
- Arquitetura de 3 camadas (Bootstrap → CDN → UI)
- Fluxo de inicialização completo
- Recursos principais (multi-instância, Shadow DOM, lazy loading, white-label)
- API pública e exemplos de uso
- Ciclo de vida detalhado
- Troubleshooting técnico

**Use quando:** Você quer entender em profundidade como funciona o carregamento do widget, ou precisa modificar o bootstrap.

---

## 🏗️ Para Deploy e Infraestrutura

### [CLOUDFRONT-SETUP.md](./CLOUDFRONT-SETUP.md) ⭐ **NOVO**

**Guia completo de configuração do CloudFront (primeira vez).**

- Setup automático com `setup-cloudfront.sh`
- Setup manual passo a passo
- Configuração de OAI (Origin Access Identity)
- Criação de distribuição CloudFront
- Políticas de cache otimizadas
- Validação e testes
- Estimativas de custo (~$3-5/mês)
- Troubleshooting CloudFront

**Use quando:** É a primeira vez que você vai fazer deploy em produção e precisa configurar o CloudFront.

### [RESUMO-CLOUDFRONT.md](./RESUMO-CLOUDFRONT.md) ⭐ **NOVO**

**Resumo executivo da configuração CloudFront.**

- Arquivos criados pelo setup
- Fluxo completo de uso
- Checklist de setup
- Custos detalhados
- Próximos passos após configuração

**Use quando:** Você acabou de executar o setup do CloudFront e quer entender o que foi criado.

### [DEPLOY-GUIDE.md](./DEPLOY-GUIDE.md)

**Guia prático de deploy (após CloudFront configurado).**

- Pré-requisitos
- Deploy completo automatizado
- Deploy manual passo a passo
- Testes em staging
- Checklist de deploy
- Troubleshooting

**Use quando:** CloudFront já está configurado e você precisa fazer deploy dos arquivos.

### [AWS-CLI-SETUP.md](./AWS-CLI-SETUP.md) ⭐ **NOVO**

**Guia de configuração do AWS CLI (macOS + fish) para este projeto.**

- Instalação com Homebrew ou instalador oficial
- Perfis nomeados (staging/prod) com Access Key ou SSO
- Variáveis de ambiente no fish (AWS_PROFILE, AWS_REGION, AWS_PAGER)
- Policies IAM mínimas para S3 e CloudFront
- Sanity checks (STS, S3, CloudFront)
- Como usar com `deploy.sh` e `setup-cloudfront.sh`
- Troubleshooting de credenciais, permissões e região

**Use quando:** Você precisa preparar o ambiente AWS local para fazer deploy.

### [GUIA-DEPLOY-CDN.md](./GUIA-DEPLOY-CDN.md)

**Guia completo e didático explicando toda a infraestrutura.**

- O que foi feito (passo a passo)
- Arquitetura da solução (diagramas)
- Problemas encontrados e soluções
- Como fazer deploy (staging e produção)
- Próximos passos
- Troubleshooting detalhado

**Use quando:** Você precisa entender como funciona o deploy para AWS ou quer fazer alterações na infraestrutura.

---

## 📝 Para Publicação no NPM

### [PUBLISHING.md](./PUBLISHING.md)

**Guia original de publicação e configuração.**

- Publicação no npm
- Configuração DNS para domínio customizado
- Setup completo de CloudFront
- Detalhes de certificados SSL
- Configurações avançadas

**Use quando:** Você vai publicar uma nova versão no npm ou configurar o domínio customizado `cdn.cartaosimples.com.br`.

---

## 🧪 Exemplos Práticos

### [examples/exemplo-completo.html](./examples/exemplo-completo.html)

**Página HTML interativa e completa para testar todas as funcionalidades.**

- Interface visual moderna
- Testes de configuração customizada
- Console de logs em tempo real
- Demonstração de controle programático
- Painel de configuração

**Use quando:** Você quer ver o widget em ação ou testar diferentes configurações.

### [examples/cloudfront-test.html](./examples/cloudfront-test.html)

**Página para testar se os arquivos CDN estão acessíveis.**

- Testa bootstrap, bundle CDN e CSS
- Mostra status HTTP e tamanhos
- Indicadores visuais de sucesso/erro

**Use quando:** Você acabou de fazer deploy e quer confirmar que os arquivos estão acessíveis via CloudFront.

---

## � Segurança

### [SEGURANCA-E-SECRETS.md](./SEGURANCA-E-SECRETS.md) ⭐ **NOVO**

**Guia completo de segurança e gerenciamento de secrets.**

- Regra de ouro: nunca expor secrets no frontend
- Arquitetura segura (Widget → Backend → API)
- O que PODE e o que NUNCA pode ficar no frontend
- Implementação correta passo a passo
- Tipos de tokens e keys (public vs secret)
- Camadas de segurança (HTTPS, CORS, Rate Limiting, etc)
- Checklist de segurança completo
- O que fazer se API key vazar
- Princípios de segurança (menor privilégio, defesa em profundidade)

**Use quando:** Você precisa entender como proteger API keys e secrets, ou quer implementar o fluxo de pagamento de forma segura.

### [examples/security/](../examples/security/)

**Exemplos práticos de integração segura.**

- `nextjs-integration.tsx` - Integração completa com Next.js
- `express-backend.ts` - Backend seguro com Express
- `merchant-validation.ts` - Sistema de validação de merchants
- Todos com código comentado e boas práticas

**Use quando:** Você precisa de um exemplo real de implementação segura para copiar e adaptar.

---

## �🛠️ Arquivos de Configuração

### Vite Configs

- **vite.config.cdn.ts** - Build do bundle CDN completo (426 KB)
- **vite.config.bootstrap.ts** - Build do bootstrap leve (4.6 KB)
- **vite.config.sdk.ts** - Build do SDK para npm

### AWS

- **cloudfront.json** - Configuração da distribuição CloudFront
- **deploy.sh** - Script automatizado de deploy

### Package

- **package.json** - Dependências e scripts npm

---

## 📊 Fluxo de Trabalho Recomendado

### 1️⃣ Primeira vez usando o projeto?

```
QUICK-START.md → Testar localmente → README.md
```

### 2️⃣ Precisa integrar no seu site?

```
README.md (seção "Como Usar") → examples/exemplo-completo.html
```

### 3️⃣ Primeira vez fazendo deploy em produção?

```
CLOUDFRONT-SETUP.md → setup-cloudfront.sh → DEPLOY-GUIDE.md → deploy.sh
```

### 4️⃣ Deploy regular (CloudFront já configurado)?

```
deploy.sh production → examples/cloudfront-test.html
```

### 5️⃣ Deploy em staging?

```
deploy.sh staging → examples/test-staging.html
```

### 6️⃣ Vai publicar no npm?

```
PUBLISHING.md → npm publish
```

### 7️⃣ Algo deu errado?

```
README.md (Troubleshooting) → CLOUDFRONT-SETUP.md (Troubleshooting)
```

---

## 🔗 Links Úteis

### CDN (Staging)

- Bootstrap: https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js
- Bundle: https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.js
- CSS: https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.css

### AWS Console

- CloudFront: https://console.aws.amazon.com/cloudfront/v3/home#/distributions/EOLJNTE5PW5O9
- S3 (Produção): https://s3.console.aws.amazon.com/s3/buckets/cartao-simples-widget
- S3 (Staging): https://s3.console.aws.amazon.com/s3/buckets/cartao-simples-widget-staging

---

## 🎯 Casos de Uso Específicos

### Quero apenas usar o widget no meu site

→ **[QUICK-START.md](./QUICK-START.md)** → Copiar exemplo HTML

### Estou criando uma integração React/Vue

→ **[README.md](./README.md)** → Seção "Uso como SDK npm"

### Quero criar um widget parecido do zero

→ **[GUIA-CRIAR-WIDGET-DO-ZERO.md](./GUIA-CRIAR-WIDGET-DO-ZERO.md)** → Guia completo passo a passo ⭐ **NOVO**

### Primeira vez fazendo deploy em produção

→ **[CLOUDFRONT-SETUP.md](./CLOUDFRONT-SETUP.md)** → Setup automático

### Preciso entender a arquitetura

→ **[GUIA-DEPLOY-CDN.md](./GUIA-DEPLOY-CDN.md)** → Seção "Arquitetura da Solução"

### Quero entender como funciona o Bootstrap Loader

→ **[BOOTSTRAP-EXPLICACAO.md](./BOOTSTRAP-EXPLICACAO.md)** → Explicação completa técnica

### Vou fazer alterações no código

→ **[README.md](./README.md)** → Seção "Desenvolvimento Local"

### CloudFront setup falhou

→ **[CLOUDFRONT-SETUP.md](./CLOUDFRONT-SETUP.md)** → Seção "Troubleshooting"

### Deploy falhou com erro

→ **[DEPLOY-GUIDE.md](./DEPLOY-GUIDE.md)** → Seção "Troubleshooting"

### Quero configurar domínio customizado

→ **[PUBLISHING.md](./PUBLISHING.md)** → Seção "Configuração de DNS"

### Erro 404 no CloudFront

→ **[CLOUDFRONT-SETUP.md](./CLOUDFRONT-SETUP.md)** → Verificar distribuição

### Widget não aparece no site

→ **[README.md](./README.md)** → Seção "Troubleshooting"

### Quanto vai custar o CloudFront?

→ **[RESUMO-CLOUDFRONT.md](./RESUMO-CLOUDFRONT.md)** → Seção "Custos Estimados"

---

## 📞 Suporte

- **Issues**: https://github.com/Rellyso/payment-widget-poc/issues
- **Email**: dev@cartaosimples.com
- **Documentação**: Todos os arquivos `.md` neste projeto

---

## ✅ Checklist Rápido

### Antes de usar em produção

**Setup Inicial:**

- [ ] Li o [QUICK-START.md](./QUICK-START.md) e testei localmente
- [ ] Entendi a API completa no [README.md](./README.md)
- [ ] AWS CLI instalado e configurado
- [ ] `jq` instalado (`brew install jq`)

**Configuração CloudFront (Primeira Vez):**

- [ ] Executei `./setup-cloudfront.sh production`
- [ ] Verifiquei `cloudfront-setup-report.txt`
- [ ] Anotei Domain Name do CloudFront
- [ ] Aguardei deploy da distribuição (15-30 min)

**Deploy e Testes:**

- [ ] Executei `./deploy.sh production`
- [ ] Testei os endpoints com [cloudfront-test.html](./examples/cloudfront-test.html)
- [ ] Testei integração com [exemplo-completo.html](./examples/exemplo-completo.html)
- [ ] Configurei callbacks `onSuccess` e `onError`
- [ ] Testei em diferentes navegadores
- [ ] Testei em mobile
- [ ] Configurei ambiente de staging
- [ ] Documentei minha integração

**Pós-Deploy:**

- [ ] Verifiquei console sem erros
- [ ] Modal abre e fecha corretamente
- [ ] Estilos aplicados (Shadow DOM)
- [ ] Commit e push dos arquivos

---

**Última atualização**: Outubro 2025  
**Versão do Widget**: 1.0.0  
**CloudFront Distribution**: EOLJNTE5PW5O9
