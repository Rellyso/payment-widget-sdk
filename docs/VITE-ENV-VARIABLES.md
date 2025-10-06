# 🔧 Variáveis de Ambiente no Vite - Guia Completo

## Como Funciona no Vite

O Vite tem **dois sistemas** para variáveis de ambiente:

### 1️⃣ Sistema Automático (Prefixo `VITE_`)

Qualquer variável que **começa com `VITE_`** é automaticamente exposta para o código do navegador.

#### ✅ Exemplo - Não precisa de `define`:

```bash
# .env
VITE_API_URL=https://api.example.com
VITE_MERCHANT_ID=merchant-123
```

```typescript
// src/components/MyComponent.tsx
// Funciona AUTOMATICAMENTE ✅
const apiUrl = import.meta.env.VITE_API_URL;
const merchantId = import.meta.env.VITE_MERCHANT_ID;

console.log(apiUrl); // "https://api.example.com"
```

**Vite substitui automaticamente no build:**

```javascript
// Bundle final
const apiUrl = "https://api.example.com";
const merchantId = "merchant-123";
```

### 2️⃣ Sistema Manual (Via `define`)

Para variáveis **sem o prefixo `VITE_`** ou para controle customizado, você precisa declarar no `define`.

#### ❌ Exemplo - Precisa de `define`:

```bash
# .env
CDN_BASE_URL=https://cdn.example.com  # ⚠️ Sem prefixo VITE_
```

```typescript
// src/bootstrap/index.ts
const cdnUrl = import.meta.env.CDN_BASE_URL;
console.log(cdnUrl); // undefined ❌ - Não funciona!
```

#### ✅ Solução - Adicionar no `define`:

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    "import.meta.env.CDN_BASE_URL": JSON.stringify(
      process.env.CDN_BASE_URL || ""
    ),
  },
});
```

Agora funciona:

```typescript
// src/bootstrap/index.ts
const cdnUrl = import.meta.env.CDN_BASE_URL;
console.log(cdnUrl); // "https://cdn.example.com" ✅
```

## Por que Usamos `define` no Bootstrap?

### Caso Real do Projeto

```typescript
// vite.config.bootstrap.ts
define: {
  "process.env.NODE_ENV": '"production"',
  "import.meta.env.VITE_CDN_BASE_URL": JSON.stringify(
    process.env.VITE_CDN_BASE_URL || ""
  ),
}
```

### Motivo 1: Já tem o prefixo `VITE_` - Por que usar `define`?

**Resposta**: Controle extra + fallback vazio

```typescript
// Sem define - Vite usa o valor .env diretamente
const CDN = import.meta.env.VITE_CDN_BASE_URL;
// Se não definido: undefined

// Com define - Controlamos o fallback
const CDN = import.meta.env.VITE_CDN_BASE_URL || "https://cloudfront...";
// Se não definido: "" (string vazia, não undefined)
```

O `define` garante que `VITE_CDN_BASE_URL` será **sempre uma string** (vazia ou com valor), nunca `undefined`.

### Motivo 2: `process.env.NODE_ENV`

```typescript
"process.env.NODE_ENV": '"production"'
```

**Por que precisa?**

- `process.env` **não existe no navegador**
- Sem o `define`, `process.env.NODE_ENV` seria `undefined`
- Com `define`, substituímos por `"production"` em build-time

Exemplo de uso no código:

```typescript
// src/utils/logger.ts
if (process.env.NODE_ENV !== "production") {
  console.log("Debug message");
}
```

No bundle final:

```javascript
// Substituído em build-time
if ("production" !== "production") {
  // Sempre false
  console.log("Debug message"); // Dead code elimination
}
```

## Regras Práticas

### ✅ NÃO precisa de `define` quando:

1. **Variável tem prefixo `VITE_`**
2. **Vai usar direto sem fallback**
3. **Está OK com `undefined` se não definida**

```typescript
// .env
VITE_API_URL=https://api.com

// Código - funciona direto ✅
const api = import.meta.env.VITE_API_URL;
```

### ❌ PRECISA de `define` quando:

1. **Variável NÃO tem prefixo `VITE_`**
2. **Precisa de fallback customizado**
3. **Precisa garantir tipo (string vs undefined)**
4. **Usa `process.env.*` (que não existe no browser)**

```typescript
// .env
MY_SECRET=abc123  # Sem VITE_

// vite.config.ts - OBRIGATÓRIO
define: {
  "import.meta.env.MY_SECRET": JSON.stringify(process.env.MY_SECRET)
}
```

## Comparação Completa

| Cenário                     | .env | Precisa define? | Razão                             |
| --------------------------- | ---- | --------------- | --------------------------------- |
| `VITE_API_URL=...`          | Sim  | ❌ Não          | Prefixo VITE\_ = automático       |
| `API_URL=...`               | Sim  | ✅ Sim          | Sem prefixo VITE\_                |
| `VITE_CDN=...` com fallback | Sim  | ⚠️ Opcional     | Para controlar fallback           |
| `process.env.NODE_ENV`      | -    | ✅ Sim          | process.env não existe no browser |
| `__DEV__` custom            | -    | ✅ Sim          | Variável customizada              |

## Exemplos do Mundo Real

### Exemplo 1: Variável Simples (Não precisa define)

```bash
# .env
VITE_MERCHANT_ID=merchant-123
```

```typescript
// src/components/Widget.tsx
export function Widget() {
  const merchantId = import.meta.env.VITE_MERCHANT_ID;
  return <div>Merchant: {merchantId}</div>;
}
```

✅ Funciona automaticamente!

### Exemplo 2: Fallback Customizado (Use define)

```bash
# .env (pode estar vazio)
VITE_CDN_BASE_URL=
```

```typescript
// vite.config.ts
define: {
  "import.meta.env.VITE_CDN_BASE_URL": JSON.stringify(
    process.env.VITE_CDN_BASE_URL || "https://default-cdn.com"
  ),
}
```

```typescript
// src/bootstrap/index.ts
const CDN = import.meta.env.VITE_CDN_BASE_URL || "https://fallback.com";
// Se .env vazio: usa "https://default-cdn.com" (do define)
// Se .env indefinido: usa "https://fallback.com" (do código)
```

### Exemplo 3: Variável Sem Prefixo (PRECISA define)

```bash
# .env
NODE_ENV=production
API_SECRET=secret123
```

```typescript
// vite.config.ts
define: {
  "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
  "import.meta.env.API_SECRET": JSON.stringify(process.env.API_SECRET),
}
```

```typescript
// src/config.ts
const env = process.env.NODE_ENV; // ✅ Funciona
const secret = import.meta.env.API_SECRET; // ✅ Funciona
```

## Como o Vite Processa

### Passo a Passo do Build

```
1. Lê arquivo .env
   VITE_API_URL=https://api.com
   MY_SECRET=abc123

2. Processa automaticamente variáveis com VITE_
   import.meta.env.VITE_API_URL → "https://api.com"

3. Aplica transformações do define
   process.env.NODE_ENV → "production"
   import.meta.env.MY_SECRET → "abc123"

4. Gera bundle final com valores substituídos
   // Código original
   const api = import.meta.env.VITE_API_URL;
   const secret = import.meta.env.MY_SECRET;

   // Bundle final
   const api = "https://api.com";
   const secret = "abc123";
```

## Armadilhas Comuns

### ❌ Erro 1: Esquecer prefixo VITE\_

```bash
# .env
API_URL=https://api.com  # ❌ Sem VITE_
```

```typescript
// Código
const api = import.meta.env.API_URL;
console.log(api); // undefined ❌
```

**Solução**: Adicionar prefixo ou usar `define`:

```bash
VITE_API_URL=https://api.com  # ✅
```

### ❌ Erro 2: Usar process.env sem define

```typescript
// src/utils.ts
if (process.env.NODE_ENV === "development") {
  // ❌ undefined
  console.log("Dev mode");
}
```

**Solução**: Adicionar no `define`:

```typescript
// vite.config.ts
define: {
  "process.env.NODE_ENV": JSON.stringify("production"),
}
```

### ❌ Erro 3: Esquecer JSON.stringify

```typescript
// vite.config.ts
define: {
  "import.meta.env.API_URL": process.env.API_URL,  // ❌ Não funciona
}
```

**Solução**: Sempre usar `JSON.stringify`:

```typescript
define: {
  "import.meta.env.API_URL": JSON.stringify(process.env.API_URL),  // ✅
}
```

## Recomendações do Projeto

### Para Payment Widget:

1. **Use prefixo `VITE_`** sempre que possível

   ```bash
   VITE_CDN_BASE_URL=...
   VITE_API_BASE_URL=...
   VITE_MERCHANT_ID=...
   ```

2. **Use `define` apenas quando necessário:**

   - Fallbacks customizados
   - `process.env.*`
   - Variáveis sem prefixo VITE\_

3. **Nosso caso atual (correto):**
   ```typescript
   // vite.config.bootstrap.ts
   define: {
     // process.env não existe no browser - PRECISA ✅
     "process.env.NODE_ENV": '"production"',

     // Controle de fallback - OPCIONAL mas útil ✅
     "import.meta.env.VITE_CDN_BASE_URL": JSON.stringify(
       process.env.VITE_CDN_BASE_URL || ""
     ),
   }
   ```

## TypeScript - Tipos das Variáveis

Para ter autocomplete, declare as variáveis:

```typescript
// src/vite-env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CDN_BASE_URL: string;
  readonly VITE_MERCHANT_ID: string;
  // ...outras variáveis
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

## Resumo Final

```
┌─────────────────────────────────────────────────────────────┐
│                    Quando usar define?                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ✅ USE define quando:                                      │
│     • Variável não tem prefixo VITE_                        │
│     • Precisa substituir process.env.*                      │
│     • Quer fallback customizado                             │
│     • Precisa garantir tipo específico                      │
│                                                             │
│  ❌ NÃO precisa define quando:                              │
│     • Variável tem prefixo VITE_                            │
│     • Está OK com undefined se não definida                 │
│     • Vai usar direto sem transformações                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Referências

- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vite Define Option](https://vitejs.dev/config/shared-options.html#define)
- [Import Meta Env](https://vitejs.dev/guide/env-and-mode.html#env-variables)

---

**Última atualização**: 6 de outubro de 2025
