# 🌐 Configuração de CDN - Payment Widget

## Visão Geral

O Payment Widget usa uma abordagem **configurável com fallback seguro** para a URL do CDN.

## Como Funciona

### 1. Padrão (Production)

Se **nenhuma** variável de ambiente for definida, o widget usa automaticamente o CloudFront de produção:

```typescript
// Fallback automático
const CDN_BASE_URL = "https://d2x7cg3k3on9lk.cloudfront.net";
```

**✅ Vantagem**: Builds de produção funcionam sem configuração adicional.

### 2. Override via `.env`

Para **desenvolvimento** ou **staging**, você pode sobrescrever a URL:

```bash
# .env.local ou .env.development
VITE_CDN_BASE_URL=http://localhost:5173
```

```bash
# .env.staging
VITE_CDN_BASE_URL=https://staging-cdn.cartaosimples.com
```

### 3. Build Time Replacement

O Vite substitui `import.meta.env.VITE_CDN_BASE_URL` durante o build:

```typescript
// src/bootstrap/index.ts
const CDN_BASE_URL =
  import.meta.env.VITE_CDN_BASE_URL || "https://d2x7cg3k3on9lk.cloudfront.net";
```

No bundle final:

```javascript
// Se .env definiu VITE_CDN_BASE_URL=http://localhost:5173
const CDN_BASE_URL =
  "http://localhost:5173" || "https://d2x7cg3k3on9lk.cloudfront.net";

// Se nenhum .env foi definido
const CDN_BASE_URL = "" || "https://d2x7cg3k3on9lk.cloudfront.net";
```

## Cenários de Uso

### 🛠️ Desenvolvimento Local

```bash
# .env.local
VITE_CDN_BASE_URL=http://localhost:5173
```

```bash
npm run dev
npm run build:bootstrap
```

**Resultado**: Bootstrap carrega widget de `http://localhost:5173/widget.v1.min.js`

### 🧪 Staging

```bash
# .env.staging
VITE_CDN_BASE_URL=https://d2x7cg3k3on9lk.cloudfront.net
```

```bash
npm run build:bootstrap
./deploy.sh staging
```

**Resultado**: Bootstrap carrega do CloudFront staging (se diferente de prod)

### 🚀 Production

**Não precisa** definir `VITE_CDN_BASE_URL` - o fallback já aponta para produção.

```bash
npm run build:bootstrap
./deploy.sh production
```

**Resultado**: Bootstrap carrega de `https://d2x7cg3k3on9lk.cloudfront.net`

## Configuração no Vite

O `vite.config.bootstrap.ts` injeta a variável no build:

```typescript
export default defineConfig({
  // ...
  define: {
    "process.env.NODE_ENV": '"production"',
    "import.meta.env.VITE_CDN_BASE_URL": JSON.stringify(
      process.env.VITE_CDN_BASE_URL || ""
    ),
  },
});
```

## Troubleshooting

### Problema: Widget não carrega após mudar CDN_BASE_URL

**Causa**: Você alterou `.env` mas não fez rebuild do bootstrap.

**Solução**:

```bash
npm run build:bootstrap
```

### Problema: CDN_BASE_URL ainda aponta para localhost em produção

**Causa**: Arquivo `.env.local` com `VITE_CDN_BASE_URL` está commitado.

**Solução**:

```bash
# Remova o arquivo
rm .env.local

# Rebuild
npm run build:bootstrap
```

### Problema: Quero usar CDN diferente temporariamente

**Solução**: Define inline na build:

```bash
VITE_CDN_BASE_URL=https://meu-cdn-custom.com npm run build:bootstrap
```

## Boas Práticas

### ✅ Fazer

- **Produção**: Não definir `VITE_CDN_BASE_URL` (usar fallback)
- **Staging**: Definir em `.env.staging` se URL for diferente
- **Dev**: Definir em `.env.local` apontando para `localhost:5173`
- **Documentar**: Sempre documentar mudanças na URL do CDN

### ❌ Evitar

- ❌ Hardcodar URL diferente no código-fonte
- ❌ Commitar `.env.local` no Git
- ❌ Usar URLs não-HTTPS em produção
- ❌ Esquecer de fazer rebuild após mudar `.env`

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Build Time (Vite)                        │
│                                                             │
│  import.meta.env.VITE_CDN_BASE_URL  →  Substituído por:   │
│                                                             │
│  • process.env.VITE_CDN_BASE_URL (se definido)             │
│  • "" (se não definido)                                     │
│                                                             │
│  Resultado no bundle:                                       │
│  const CDN_BASE_URL = "[valor]" || "https://cloudfront..." │
└─────────────────────────────────────────────────────────────┘
```

## Referências

- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [CloudFront Distribution ID](../cloudfront.json)
- [Deploy Script](../deploy.sh)

---

**Última atualização**: 6 de outubro de 2025
