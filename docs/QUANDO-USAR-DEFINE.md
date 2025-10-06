# 🎨 Fluxograma - Preciso usar `define`?

```
┌─────────────────────────────────────────────────────────────┐
│         Você quer adicionar uma variável de ambiente        │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  A variável tem        │
              │  prefixo VITE_?        │
              └────────┬───────────────┘
                       │
           ┌───────────┴───────────┐
           │                       │
          SIM                     NÃO
           │                       │
           ▼                       ▼
    ┌──────────────┐      ┌──────────────────┐
    │ Vai precisar │      │ OBRIGATÓRIO usar │
    │ de fallback  │      │ define no        │
    │ customizado? │      │ vite.config.ts   │
    └──────┬───────┘      └──────────────────┘
           │
      ┌────┴────┐
      │         │
     SIM       NÃO
      │         │
      ▼         ▼
  ┌───────┐ ┌────────────────┐
  │ Use   │ │ NÃO precisa    │
  │define │ │ de define      │
  └───────┘ └────────────────┘
```

## 📋 Exemplos Rápidos

### ✅ Cenário 1: Variável VITE\_ simples

```bash
# .env
VITE_API_URL=https://api.com
```

```typescript
// ❌ NÃO precisa no vite.config.ts
// Funciona direto:
const api = import.meta.env.VITE_API_URL;
```

### ⚠️ Cenário 2: Variável VITE\_ com fallback

```bash
# .env
VITE_CDN_BASE_URL=https://cdn.com
```

```typescript
// ✅ OPCIONAL - para controlar fallback
// vite.config.ts
define: {
  "import.meta.env.VITE_CDN_BASE_URL": JSON.stringify(
    process.env.VITE_CDN_BASE_URL || "https://default.com"
  )
}

// Código
const cdn = import.meta.env.VITE_CDN_BASE_URL || "https://fallback.com";
```

**Diferença:**

- **Com define**: Se vazio, usa `"https://default.com"`
- **Sem define**: Se vazio, usa `"https://fallback.com"`

### 🚨 Cenário 3: Variável SEM prefixo VITE\_

```bash
# .env
MY_SECRET=abc123
```

```typescript
// ✅ OBRIGATÓRIO no vite.config.ts
define: {
  "import.meta.env.MY_SECRET": JSON.stringify(process.env.MY_SECRET)
}

// Código
const secret = import.meta.env.MY_SECRET;  // Funciona ✅
```

### 🔥 Cenário 4: process.env.\*

```typescript
// ✅ OBRIGATÓRIO no vite.config.ts
define: {
  "process.env.NODE_ENV": JSON.stringify("production")
}

// Código
if (process.env.NODE_ENV !== "production") {
  console.log("Dev mode");
}
```

## 🎯 Nosso Caso no Bootstrap

```typescript
// vite.config.bootstrap.ts
define: {
  // 1. process.env não existe no browser → OBRIGATÓRIO ✅
  "process.env.NODE_ENV": '"production"',

  // 2. VITE_CDN_BASE_URL com fallback → OPCIONAL mas útil ✅
  "import.meta.env.VITE_CDN_BASE_URL": JSON.stringify(
    process.env.VITE_CDN_BASE_URL || ""
  ),
}
```

**Por quê?**

1. **`process.env.NODE_ENV`**: Não existe no navegador, precisa substituir
2. **`VITE_CDN_BASE_URL`**: Queremos garantir string vazia (não undefined) + controle centralizado

## 📊 Tabela de Decisão

| Variável        | Tem VITE\_? | Precisa Fallback? | Use define? | Razão                      |
| --------------- | ----------- | ----------------- | ----------- | -------------------------- |
| `VITE_API_URL`  | ✅          | ❌                | ❌ Não      | Automático                 |
| `VITE_API_URL`  | ✅          | ✅                | ⚠️ Opcional | Controlar fallback         |
| `API_URL`       | ❌          | -                 | ✅ Sim      | Sem prefixo = não funciona |
| `process.env.*` | -           | -                 | ✅ Sim      | Não existe no browser      |

## 🧪 Teste Prático

### Sem `define`:

```bash
# .env
VITE_TEST=hello
NO_PREFIX=world
```

```typescript
// Código
console.log(import.meta.env.VITE_TEST); // "hello" ✅
console.log(import.meta.env.NO_PREFIX); // undefined ❌
console.log(process.env.NODE_ENV); // undefined ❌
```

### Com `define`:

```typescript
// vite.config.ts
define: {
  "import.meta.env.NO_PREFIX": JSON.stringify(process.env.NO_PREFIX),
  "process.env.NODE_ENV": '"production"',
}
```

```typescript
// Código
console.log(import.meta.env.VITE_TEST); // "hello" ✅
console.log(import.meta.env.NO_PREFIX); // "world" ✅
console.log(process.env.NODE_ENV); // "production" ✅
```

## 💡 Dica Pro

**Sempre use prefixo `VITE_` quando possível:**

```bash
# ✅ Recomendado
VITE_CDN_BASE_URL=...
VITE_API_URL=...
VITE_MERCHANT_ID=...

# ❌ Evite (precisa define)
CDN_BASE_URL=...
API_URL=...
MERCHANT_ID=...
```

**Exceção**: `process.env.NODE_ENV` é um caso especial que sempre precisa de `define`.
