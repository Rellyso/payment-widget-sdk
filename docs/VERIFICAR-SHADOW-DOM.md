# 🔍 Como Verificar se o Shadow DOM está Funcionando

Este guia mostra diferentes formas de verificar se o Shadow DOM do Payment Widget está funcionando corretamente.

---

## 🎯 Por que Verificar?

O Shadow DOM é essencial para:

- ✅ **Isolamento de estilos** - CSS da página não afeta o widget
- ✅ **Evitar conflitos** - Classes CSS não colidem
- ✅ **Segurança** - Escopo controlado
- ✅ **White-label** - Personalização via CSS variables

---

## 🛠️ Método 1: DevTools do Navegador (Mais Fácil)

### **Passo a Passo:**

1. **Inicialize o widget** na sua página
2. **Abra o DevTools**:
   - Windows/Linux: `F12` ou `Ctrl+Shift+I`
   - Mac: `Cmd+Option+I`
3. **Vá para a aba "Elements"** (Chrome/Edge) ou "Inspetor" (Firefox)
4. **Procure pelo container do widget**: `div[id^="__payment_widget_root__"]`
5. **Veja se tem `#shadow-root (open)`** dentro do elemento

### **Como Interpretar:**

#### ✅ **Shadow DOM Funcionando:**

```html
<div id="__payment_widget_root__merchant_123" style="...">
  #shadow-root (open)
  <div id="pw-root" class="pw-root payment-widget">
    <!-- Conteúdo do widget aqui -->
  </div>
</div>
```

**Indicadores visuais no DevTools:**

- Ícone especial ao lado de `#shadow-root`
- Texto em cinza ou cor diferente
- Conteúdo indentado dentro do shadow-root

#### ⚠️ **Fallback para Iframe:**

```html
<div id="__payment_widget_root__merchant_123" style="...">
  <iframe id="pw-root" sandbox="...">
    <!-- Conteúdo do widget aqui -->
  </iframe>
</div>
```

**O que significa:**

- Shadow DOM não é suportado (navegador antigo)
- Widget usa iframe como fallback
- Isolamento ainda funciona, mas via iframe

#### ❌ **Problema:**

```html
<div id="__payment_widget_root__merchant_123" style="...">
  <!-- Vazio ou sem isolamento -->
</div>
```

**Possíveis causas:**

- Widget não foi inicializado
- Erro no carregamento do bundle
- JavaScript desabilitado

---

## 🧪 Método 2: Página de Teste HTML

Criamos uma página de teste completa em `examples/test-shadow-dom.html`.

### **Como usar:**

```bash
# 1. Abra a página de teste
open examples/test-shadow-dom.html

# Ou via servidor HTTP:
npx http-server -p 3000
# Depois acesse: http://localhost:3000/examples/test-shadow-dom.html
```

### **Recursos da página:**

- ✅ **Detecção automática** de Shadow DOM
- ✅ **Teste de isolamento** de estilos
- ✅ **Inspeção da estrutura** do DOM
- ✅ **Console de logs** em tempo real
- ✅ **Testes visuais** com status colorido

---

## 💻 Método 3: Console JavaScript

Execute estes comandos no console do navegador (F12):

### **Verificar se Shadow DOM é suportado:**

```javascript
// Verifica suporte do navegador
"attachShadow" in Element.prototype;
// true = suportado, false = não suportado
```

### **Encontrar o container do widget:**

```javascript
// Busca o container principal
const container = document.querySelector('[id^="__payment_widget_root__"]');
console.log("Container:", container);
```

### **Verificar Shadow DOM:**

```javascript
// Verifica se shadowRoot existe
if (container.shadowRoot) {
  console.log("✅ Shadow DOM criado!");
  console.log("Mode:", container.shadowRoot.mode); // 'open'
  console.log("Children:", container.shadowRoot.children.length);
  console.log("Root element:", container.shadowRoot.getElementById("pw-root"));
} else {
  console.log("❌ Shadow DOM não encontrado");

  // Verifica fallback iframe
  const iframe = container.querySelector("iframe");
  if (iframe) {
    console.log("⚠️ Usando iframe fallback");
  }
}
```

### **Testar isolamento de estilos:**

```javascript
// Tenta acessar elementos dentro do Shadow DOM
const rootElement = container.shadowRoot?.getElementById("pw-root");

if (rootElement) {
  console.log("✅ Elemento acessível via shadowRoot");
  console.log("Computed styles:", window.getComputedStyle(rootElement));
} else {
  console.log("❌ Elemento não acessível (esperado se não tiver Shadow DOM)");
}

// Tenta acessar via querySelector normal (não deve funcionar)
const directAccess = document.getElementById("pw-root");
if (!directAccess) {
  console.log(
    "✅ Isolamento funcionando - elementos não acessíveis diretamente"
  );
} else {
  console.log("⚠️ Elemento acessível diretamente (sem isolamento)");
}
```

### **Inspecionar estrutura completa:**

```javascript
function inspectShadowDOM() {
  const container = document.querySelector('[id^="__payment_widget_root__"]');

  if (!container) {
    console.log("❌ Container não encontrado");
    return;
  }

  console.log("🔍 Estrutura do Widget:");
  console.log("Container ID:", container.id);
  console.log("Container display:", window.getComputedStyle(container).display);
  console.log("Container z-index:", window.getComputedStyle(container).zIndex);

  if (container.shadowRoot) {
    console.log("\n📦 Shadow DOM:");
    console.log("Mode:", container.shadowRoot.mode);
    console.log("Host:", container.shadowRoot.host);
    console.log(
      "Children:",
      Array.from(container.shadowRoot.children).map((c) => ({
        tag: c.tagName,
        id: c.id,
        className: c.className,
      }))
    );

    const styles = container.shadowRoot.querySelectorAll(
      'style, link[rel="stylesheet"]'
    );
    console.log("Stylesheets:", styles.length);
  } else {
    console.log("\n⚠️ Shadow DOM não encontrado");

    const iframe = container.querySelector("iframe");
    if (iframe) {
      console.log("📦 Iframe Fallback:");
      console.log("Iframe ID:", iframe.id);
      console.log("Sandbox:", iframe.sandbox.toString());
    }
  }
}

inspectShadowDOM();
```

---

## 🎨 Método 4: Testar Isolamento de Estilos

### **Teste Visual:**

1. **Adicione um estilo global** na página principal:

```html
<style>
  /* Este estilo NÃO deve afetar o widget se Shadow DOM funcionar */
  .pw-root {
    background: red !important;
    color: yellow !important;
    border: 10px solid green !important;
  }

  button {
    background: purple !important;
    font-size: 50px !important;
  }
</style>
```

2. **Inicialize o widget**

3. **Verifique se:**
   - ✅ O widget mantém seu estilo original (não fica vermelho/amarelo)
   - ✅ Botões do widget mantêm o estilo correto (não ficam roxos gigantes)
   - ✅ CSS da página não "vaza" para dentro do widget

### **Se os estilos vazaram:**

- ❌ Shadow DOM não está funcionando
- ⚠️ Verifique se o browser suporta Shadow DOM
- ⚠️ Pode estar usando iframe fallback (também tem isolamento)

---

## 🔍 Método 5: API do Widget

Use a API do widget para verificar o estado:

```javascript
// Verifica estado do widget
const state = window.PaymentWidget.getState();
console.log("Widget State:", state);
console.log("Is Loaded:", state.isLoaded);
console.log("Is Open:", state.isOpen);

// Se isLoaded = true, o widget foi montado com sucesso
// (incluindo Shadow DOM ou fallback)
```

---

## 📊 Checklist de Verificação

Use este checklist para garantir que tudo está funcionando:

- [ ] **Browser suporta Shadow DOM** (`'attachShadow' in Element.prototype`)
- [ ] **Container criado** (`document.querySelector('[id^="__payment_widget_root__"]')`)
- [ ] **Shadow Root existe** (`container.shadowRoot !== null`)
- [ ] **Root element existe** (`shadowRoot.getElementById('pw-root')`)
- [ ] **Isolamento de estilos** (CSS da página não afeta widget)
- [ ] **Elementos não acessíveis diretamente** (`document.getElementById('pw-root') === null`)
- [ ] **DevTools mostra #shadow-root** (inspeção visual)

---

## 🐛 Troubleshooting

### **Problema: Shadow DOM não é criado**

**Causas possíveis:**

1. **Navegador não suporta Shadow DOM**

   - Solução: Widget usa iframe fallback automaticamente
   - Verificar: IE11, Safari muito antigo

2. **Erro no JavaScript**

   - Abra o console (F12) e veja os erros
   - Verifique se o bundle foi carregado corretamente

3. **Content Security Policy (CSP) bloqueando**
   - Verifique headers CSP da página
   - Adicione `script-src` e `style-src` necessários

### **Problema: Estilos não estão isolados**

**Verificar:**

1. **Shadow DOM realmente foi criado?**

   ```javascript
   const container = document.querySelector('[id^="__payment_widget_root__"]');
   console.log("Shadow Root:", container.shadowRoot); // Deve existir
   ```

2. **Usando mode: 'open'?**

   ```javascript
   console.log("Mode:", container.shadowRoot.mode); // Deve ser 'open'
   ```

3. **CSS do widget está sendo carregado?**
   ```javascript
   const styles = container.shadowRoot.querySelectorAll("style, link");
   console.log("Stylesheets:", styles.length); // Deve ter pelo menos 1
   ```

### **Problema: DevTools não mostra #shadow-root**

**Possíveis causas:**

1. **Widget não foi inicializado**

   - Execute `window.PaymentWidget.init({...})`

2. **Container está escondido**

   ```javascript
   const container = document.querySelector('[id^="__payment_widget_root__"]');
   console.log("Display:", window.getComputedStyle(container).display);
   // 'none' = escondido, 'block' = visível
   ```

3. **Usando iframe fallback**
   - Não é um problema, isolamento funciona via iframe
   - Verifique se `<iframe>` existe no container

---

## 🎓 Entendendo o Código do Bootstrap

No arquivo `src/bootstrap/index.ts`, a criação do Shadow DOM acontece aqui:

```typescript
private createShadowDOM(container: HTMLElement): ShadowRoot | null {
  try {
    // Tenta criar Shadow DOM
    if (container.attachShadow) {
      const shadowRoot = container.attachShadow({ mode: "open" });

      // Cria div root dentro do shadow
      const rootDiv = document.createElement("div");
      rootDiv.id = ROOT_ELEMENT_ID; // "pw-root"
      rootDiv.className = "pw-root payment-widget";
      shadowRoot.appendChild(rootDiv);

      return shadowRoot; // ✅ Shadow DOM criado
    }
  } catch (error) {
    logger.warn("Shadow DOM não suportado, usando fallback iframe:", error);
  }

  // Fallback: cria iframe sandbox
  this.createIframeFallback(container);
  return null; // ⚠️ Usando iframe
}
```

**Pontos importantes:**

- `mode: "open"` permite acesso via `container.shadowRoot`
- `ROOT_ELEMENT_ID` é "pw-root"
- Se falhar, usa `createIframeFallback()`

---

## 📚 Recursos Adicionais

- [MDN: Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_shadow_DOM)
- [Can I Use: Shadow DOM](https://caniuse.com/shadowdomv1)
- [Exemplo completo: test-shadow-dom.html](../examples/test-shadow-dom.html)
- [Explicação do Bootstrap](./BOOTSTRAP-EXPLICACAO.md)

---

## ✅ Conclusão

Para verificar rapidamente se o Shadow DOM está funcionando:

1. **Abra DevTools** (F12)
2. **Procure `#shadow-root`** no container do widget
3. **Se encontrar** = ✅ Funcionando
4. **Se encontrar `<iframe>`** = ⚠️ Fallback (também funciona)
5. **Se não encontrar nada** = ❌ Problema de inicialização

Use a **página de teste** (`examples/test-shadow-dom.html`) para diagnóstico completo e automatizado!
