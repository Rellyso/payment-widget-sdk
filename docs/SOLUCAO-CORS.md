# 🔧 Solução do Problema CORS

## 📋 O Problema

Ao tentar acessar os arquivos do CDN CloudFront via browser, estava ocorrendo o seguinte erro:

```
Access to fetch at 'https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.js'
from origin 'null' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Por que isso aconteceu?

**CORS (Cross-Origin Resource Sharing)** é uma política de segurança dos navegadores que impede que scripts de uma origem (domínio) façam requisições para outra origem sem permissão explícita.

Quando você abre um arquivo HTML localmente (`file://`), o navegador considera como origem `null`. Para permitir que esse HTML carregue recursos do CloudFront (domínio diferente), o servidor precisa enviar cabeçalhos HTTP específicos autorizando a requisição.

---

## ✅ A Solução

### 1. Configuração CORS no S3

Criamos um arquivo `cors-config.json` com as regras de CORS:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["*"],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag", "Content-Length", "Content-Type"],
      "MaxAgeSeconds": 3600
    }
  ]
}
```

**Explicação:**

- `AllowedOrigins: ["*"]` → Permite requisições de qualquer origem
- `AllowedMethods: ["GET", "HEAD"]` → Permite métodos HTTP para leitura
- `AllowedHeaders: ["*"]` → Permite qualquer cabeçalho na requisição
- `ExposeHeaders` → Expõe cabeçalhos adicionais para o JavaScript
- `MaxAgeSeconds: 3600` → Cache da resposta CORS por 1 hora

### 2. Aplicação no Bucket S3

```bash
# Produção
aws s3api put-bucket-cors \
  --bucket cartao-simples-widget \
  --cors-configuration file://cors-config.json

# Staging
aws s3api put-bucket-cors \
  --bucket cartao-simples-widget-staging \
  --cors-configuration file://cors-config.json
```

### 3. Invalidação do Cache CloudFront

Após aplicar CORS, invalidamos o cache para forçar o CloudFront a buscar os novos cabeçalhos:

```bash
aws cloudfront create-invalidation \
  --distribution-id EOLJNTE5PW5O9 \
  --paths "/*"
```

### 4. Verificação

Testamos se o cabeçalho CORS está presente:

```bash
curl -I -H "Origin: http://localhost" \
  https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.js
```

**Resposta esperada (e recebida):**

```
HTTP/2 200
access-control-allow-origin: *
access-control-allow-methods: GET, HEAD
access-control-expose-headers: ETag, Content-Length, Content-Type
access-control-max-age: 3600
```

✅ **Cabeçalho `access-control-allow-origin: *` presente!**

---

## 🎯 Resultado

Agora o CDN funciona corretamente quando acessado de qualquer origem, incluindo:

- ✅ Arquivos HTML locais (`file://`)
- ✅ Sites hospedados em qualquer domínio
- ✅ Aplicações React/Vue/Angular
- ✅ Testes locais via `http://localhost`

---

## 🚀 Testes

### Teste Manual no Browser

1. Abra: `public/examples/teste-cdn-simples.html`
2. Os testes devem passar com **✅ 200 OK**
3. O console não deve mostrar erros de CORS

### Teste via cURL

```bash
# Testar CORS Headers
curl -I -H "Origin: http://localhost" \
  https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js

curl -I -H "Origin: http://localhost" \
  https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.js

curl -I -H "Origin: http://localhost" \
  https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.css
```

Todos devem retornar `access-control-allow-origin: *`

---

## 📦 Atualização no Deploy

O script `deploy.sh` foi atualizado para **sempre** configurar CORS automaticamente, mesmo em buckets existentes:

```bash
# Garantir que CORS está configurado
aws s3api put-bucket-cors \
  --bucket "$BUCKET_NAME" \
  --cors-configuration file://cors-config.json
```

Isso garante que futuros deploys mantenham a configuração CORS.

---

## 🔍 Debug CORS

Se você encontrar problemas de CORS no futuro, use estes comandos:

### Verificar se CORS está configurado

```bash
aws s3api get-bucket-cors --bucket cartao-simples-widget
```

### Remover CORS (se necessário resetar)

```bash
aws s3api delete-bucket-cors --bucket cartao-simples-widget
```

### Testar resposta CORS do CloudFront

```bash
curl -v -H "Origin: https://example.com" \
  https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.js \
  2>&1 | grep -i "access-control"
```

### Ver logs do CloudFront

```bash
aws cloudfront get-distribution --id EOLJNTE5PW5O9
```

---

## 📚 Referências

- [AWS S3 CORS Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/cors.html)
- [MDN Web Docs - CORS](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [CloudFront e CORS](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/header-caching.html#header-caching-web-cors)

---

## ✅ Checklist Pós-Solução

- [x] CORS configurado no bucket S3 de produção
- [x] CORS configurado no bucket S3 de staging
- [x] Cache do CloudFront invalidado
- [x] Testes via cURL passando (cabeçalho presente)
- [x] Script `deploy.sh` atualizado
- [x] Arquivo `cors-config.json` criado no repositório
- [x] Página de teste funcionando sem erros
- [x] Documentação criada

---

**Data da solução:** 2 de outubro de 2025
**Problema resolvido por:** GitHub Copilot
**Tempo de debug:** ~5 minutos
**Status:** ✅ **RESOLVIDO**
