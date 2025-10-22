# 🔒 Diagrama de Segurança - Payment Widget

## 🎨 Arquitetura de Segurança

```
┌─────────────────────────────────────────────────────────────────┐
│                      CAMADA PÚBLICA                             │
│                    (Navegador do Usuário)                       │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  HTML do E-commerce                                       │  │
│  │                                                           │  │
│  │  <script src="widget-bootstrap.v1.min.js"></script>     │  │
│  │                                                           │  │
│  │  ✅ Merchant ID Público: "merchant-123"                  │  │
│  │  ❌ Sem API Keys                                         │  │
│  │  ❌ Sem Secrets                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              │ Carrega widget                   │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Payment Widget (Shadow DOM)                             │  │
│  │                                                           │  │
│  │  • Coleta dados do cartão                               │  │
│  │  • Valida formulários                                    │  │
│  │  • Gera token temporário                                │  │
│  │  • NÃO faz chamadas diretas à API de pagamento          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              │ onSuccess(token)                 │
│                              ▼                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS POST
                               │ { token, orderId, amount }
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CAMADA DE APLICAÇÃO                           │
│                   (Seu Backend - Seguro)                        │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API Route: /api/payments/process                        │  │
│  │                                                           │  │
│  │  🔒 CORS: Apenas origens autorizadas                     │  │
│  │  🔒 Rate Limiting: 10 req/15min por IP                   │  │
│  │  🔒 Validação: Zod schema                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              │ Valida orderId                │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Merchant Validator                                       │  │
│  │                                                           │  │
│  │  • Verifica whitelist                                    │  │
│  │  • Valida status (active/suspended)                      │  │
│  │  • Cache de validação                                    │  │
│  │  • Logs de auditoria                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              │ Merchant válido ✅                │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  🔐 Secrets Manager                                       │  │
│  │                                                           │  │
│  │  • API_SECRET_KEY (do .env ou AWS Secrets)              │  │
│  │  • Nunca hardcoded no código                            │  │
│  │  • Rotacionado periodicamente                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              │ Authorization: Bearer sk_...     │
│                              ▼                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ HTTPS POST + API Key
                               │ { token, amount, orderId }
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                   CAMADA DE PAGAMENTO                           │
│              (API Externa - Cartão Simples)                     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  API: /v1/charges                                         │  │
│  │                                                           │  │
│  │  • Valida API Key                                        │  │
│  │  • Verifica token temporário                            │  │
│  │  • Processa transação                                    │  │
│  │  • Retorna resultado                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              │ { transactionId, status }        │
│                              ▼                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ Response
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  SEU BACKEND (Continua...)                      │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Salva Transação no DB                                    │  │
│  │                                                           │  │
│  │  • Log completo                                          │  │
│  │  • IP, User-Agent                                        │  │
│  │  • Timestamp                                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Notificações                                             │  │
│  │                                                           │  │
│  │  • Email de confirmação                                  │  │
│  │  • Webhook para merchant                                 │  │
│  │  • SMS (se aplicável)                                    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              │ { success, transactionId }       │
│                              ▼                                  │
└─────────────────────────────────────────────────────────────────┘
                               │
                               │ Response JSON
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                  NAVEGADOR (Recebe resultado)                   │
│                                                                 │
│  • Redireciona para página de sucesso                          │
│  • Mostra mensagem de confirmação                              │
│  • NÃO recebe dados sensíveis (apenas transactionId)           │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔐 Fluxo de Secrets

```
┌─────────────────────────────────────────────────────────────────┐
│                    ONDE FICAM OS SECRETS?                       │
└─────────────────────────────────────────────────────────────────┘

❌ NUNCA no Frontend (Navegador)
├─ Qualquer pessoa pode ver
├─ DevTools (F12) expõe tudo
└─ View Source revela código

✅ SEMPRE no Backend (Servidor)
├─ Variáveis de ambiente (.env)
├─ Secret Manager (AWS Secrets, Azure Key Vault)
├─ Protegido por firewall
└─ Logs não expõem secrets

┌─────────────────────────────────────────────────────────────────┐
│                  FLUXO DE AUTENTICAÇÃO                          │
└─────────────────────────────────────────────────────────────────┘

1. Frontend → Identifica-se com orderId público
   ✅ "merchant-123" (OK ser público)

2. Backend → Valida orderId na whitelist
   ✅ Verifica se merchant está ativo
   ✅ Log de acesso

3. Backend → Autentica com API usando Secret Key
   ✅ Authorization: Bearer sk_live_abc123...
   ✅ Secret nunca sai do servidor

4. API → Valida Secret Key
   ✅ Verifica se é válida
   ✅ Checa permissões
   ✅ Processa request
```

---

## 🛡️ Camadas de Proteção

```
┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 1: Transporte                                           │
├─────────────────────────────────────────────────────────────────┤
│  ✅ HTTPS (TLS 1.3)                                             │
│  ✅ Certificado válido                                          │
│  ✅ HSTS habilitado                                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 2: Origem                                               │
├─────────────────────────────────────────────────────────────────┤
│  ✅ CORS restritivo                                             │
│  ✅ Whitelist de origens                                        │
│  ✅ Validação de referer                                        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 3: Rate Limiting                                        │
├─────────────────────────────────────────────────────────────────┤
│  ✅ 10 requests / 15 min por IP                                 │
│  ✅ Proteção contra brute force                                 │
│  ✅ Throttling automático                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 4: Validação                                            │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Schema validation (Zod)                                     │
│  ✅ Sanitização de inputs                                       │
│  ✅ Type checking                                               │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 5: Autorização                                          │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Merchant whitelist                                          │
│  ✅ API Key validation                                          │
│  ✅ Permissões por merchant                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CAMADA 6: Auditoria                                            │
├─────────────────────────────────────────────────────────────────┤
│  ✅ Logs de todas transações                                    │
│  ✅ IP tracking                                                 │
│  ✅ Alertas de anomalias                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🚨 Ameaças e Proteções

```
┌─────────────────────────────────────────────────────────────────┐
│  AMEAÇA: API Key exposta no frontend                           │
├─────────────────────────────────────────────────────────────────┤
│  PROTEÇÃO:                                                      │
│  • Nunca incluir secrets no código frontend                    │
│  • Usar apenas orderId público                              │
│  • Processar pagamentos no backend                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  AMEAÇA: Man-in-the-Middle (MITM)                              │
├─────────────────────────────────────────────────────────────────┤
│  PROTEÇÃO:                                                      │
│  • HTTPS obrigatório                                           │
│  • Certificate pinning                                          │
│  • HSTS headers                                                │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  AMEAÇA: Cross-Site Scripting (XSS)                            │
├─────────────────────────────────────────────────────────────────┤
│  PROTEÇÃO:                                                      │
│  • Shadow DOM (isolamento de estilos)                          │
│  • CSP (Content Security Policy)                               │
│  • Sanitização de inputs                                       │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  AMEAÇA: Brute Force / Rate Abuse                              │
├─────────────────────────────────────────────────────────────────┤
│  PROTEÇÃO:                                                      │
│  • Rate limiting (express-rate-limit)                          │
│  • Captcha após N tentativas                                   │
│  • Bloqueio temporário de IP                                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  AMEAÇA: Merchant não autorizado                               │
├─────────────────────────────────────────────────────────────────┤
│  PROTEÇÃO:                                                      │
│  • Whitelist de merchants                                      │
│  • Validação em cada request                                   │
│  • Revogação imediata                                          │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  AMEAÇA: Dados sensíveis em logs                               │
├─────────────────────────────────────────────────────────────────┤
│  PROTEÇÃO:                                                      │
│  • Nunca logar API keys                                        │
│  • Mascarar dados de cartão                                    │
│  • Redact PII em logs                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Checklist de Implementação

### 1️⃣ Frontend (HTML/React)

```
[ ] Usar apenas orderId público
[ ] Sem API keys hardcoded
[ ] HTTPS em produção
[ ] Carregar widget do CDN com SRI
[ ] Implementar callbacks (onSuccess, onError)
[ ] Validar dados antes de enviar
```

### 2️⃣ Backend (Node.js/Python/Java)

```
[ ] API keys em variáveis de ambiente
[ ] .env no .gitignore
[ ] CORS configurado (origens específicas)
[ ] Rate limiting implementado
[ ] Validação de orderId (whitelist)
[ ] Sanitização de inputs
[ ] Logs de todas transações
[ ] Error handling robusto
[ ] HTTPS com certificado válido
```

### 3️⃣ Infraestrutura

```
[ ] Secrets em secret manager (não em .env committed)
[ ] Firewall configurado
[ ] Monitoramento de acessos
[ ] Alertas para anomalias
[ ] Backups regulares
[ ] Plano de rotação de keys
[ ] Documentação de incidentes
```

### 4️⃣ Processo

```
[ ] Code review obrigatório
[ ] Scan de secrets (git-secrets)
[ ] Testes de segurança automatizados
[ ] Penetration testing periódico
[ ] Auditoria de logs
[ ] Treinamento da equipe
```

---

## 📖 Referências

- [Documentação Completa](./SEGURANCA-E-SECRETS.md)
- [Exemplos Práticos](../examples/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PCI DSS](https://www.pcisecuritystandards.org/)

---

**Última atualização**: 6 de outubro de 2025
