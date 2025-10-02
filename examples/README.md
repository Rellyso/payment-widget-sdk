# 🧪 Exemplos do Widget Cartão Simples

Esta pasta contém exemplos práticos e funcionais do widget.

---

## 📁 Arquivos Disponíveis

### 1. [exemplo-completo.html](./exemplo-completo.html) ⭐

**Demonstração interativa e completa do widget**

**O que tem:**

- ✅ Interface visual moderna
- ✅ Painel de configuração em tempo real
- ✅ 3 botões de teste (básico, customizado, controle)
- ✅ Console de logs com eventos
- ✅ Status de carregamento do widget

**Como usar:**

```bash
# Abrir direto no navegador
open exemplo-completo.html

# OU com servidor local
python3 -m http.server 8080
# Depois: http://localhost:8080/exemplo-completo.html
```

**Perfeito para:**

- Ver o widget em ação
- Testar diferentes configurações
- Demonstrar para clientes
- Debug interativo

---

### 2. [cloudfront-test.html](./cloudfront-test.html)

**Página de teste de CDN**

**O que tem:**

- ✅ Testa 3 endpoints do CloudFront
- ✅ Mostra status HTTP e tamanhos
- ✅ Indicadores visuais de sucesso/erro
- ✅ Botão de re-teste

**Como usar:**

```bash
python3 -m http.server 8080
# Depois: http://localhost:8080/cloudfront-test.html
```

**Perfeito para:**

- Validar deploy
- Verificar se CDN está funcionando
- Troubleshooting de 404/403

---

### 3. [cdn-usage.html](./cdn-usage.html)

**Exemplo básico de uso via CDN**

**O que tem:**

- ✅ Código mínimo necessário
- ✅ Configuração simples
- ✅ Exemplo de callbacks

**Como usar:**

```bash
open cdn-usage.html
```

**Perfeito para:**

- Copiar código para seu site
- Entender o uso básico
- Quick start

---

### 4. [minimal.html](./minimal.html)

**Exemplo ultra-minimalista**

**O que tem:**

- ✅ Menos de 20 linhas
- ✅ Apenas o essencial

**Perfeito para:**

- Entender o mínimo necessário
- Base para customização

---

### 5. [html-integration.html](./html-integration.html)

**Integração completa em HTML puro**

**Perfeito para:**

- Sites sem framework
- WordPress, Wix, etc.

---

## 🚀 Como Testar Localmente

### Opção 1: Python (Recomendado)

```bash
# Na pasta examples/
python3 -m http.server 8080

# Abrir no navegador
open http://localhost:8080/exemplo-completo.html
```

### Opção 2: Node.js

```bash
# Instalar servidor HTTP
npm install -g http-server

# Rodar
http-server -p 8080

# Abrir
open http://localhost:8080/exemplo-completo.html
```

### Opção 3: VS Code Live Server

1. Instalar extensão "Live Server"
2. Clicar direito no arquivo HTML
3. "Open with Live Server"

### Opção 4: Direto no navegador

```bash
# Funciona para a maioria dos exemplos
open exemplo-completo.html
```

---

## 📊 Comparação Rápida

| Arquivo                 | Complexidade | Interativo | Melhor para           |
| ----------------------- | ------------ | ---------- | --------------------- |
| `exemplo-completo.html` | ⭐⭐⭐       | ✅         | Demonstração e testes |
| `cloudfront-test.html`  | ⭐⭐         | ✅         | Validar CDN           |
| `cdn-usage.html`        | ⭐           | ❌         | Copiar código básico  |
| `minimal.html`          | ⭐           | ❌         | Entender o mínimo     |
| `html-integration.html` | ⭐⭐         | ❌         | Integração HTML puro  |

---

## 🎯 Qual Exemplo Usar?

### Quero apenas ver o widget funcionando

→ **exemplo-completo.html**

### Preciso validar se o CDN está no ar

→ **cloudfront-test.html**

### Vou copiar código para meu site

→ **cdn-usage.html**

### Quero entender o código mais simples possível

→ **minimal.html**

### Estou integrando em site HTML puro

→ **html-integration.html**

---

## 🧪 Testando Configurações

Você pode editar qualquer exemplo e testar:

### Alterar cores

```javascript
primaryColor: '#FF6600',    // Laranja
secondaryColor: '#0A0A0A'   // Preto
```

### Alterar merchant ID

```javascript
merchantId: "seu-merchant-123";
```

### Adicionar logo

```javascript
logoUrl: "https://seusite.com/logo.png";
```

### Mudar ambiente

```javascript
environment: "production"; // ou 'staging'
```

---

## 🔍 Debug

### Widget não aparece?

**1. Verifique no console:**

```javascript
console.log("Widget carregado?", typeof window.PaymentWidget !== "undefined");
```

**2. Verifique se script carregou:**

```html
<!-- Deve estar no HTML -->
<script src="https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js"></script>
```

**3. Verifique callbacks:**

```javascript
onError: (error) => {
  console.error("Erro:", error);
  alert("Erro: " + error.message);
};
```

### CORS Error?

**Solução:** Use servidor local (não abra direto do filesystem)

```bash
python3 -m http.server 8080
```

---

## 📝 Criar Seu Próprio Exemplo

**1. Copie o template:**

```bash
cp minimal.html meu-exemplo.html
```

**2. Edite as configurações:**

```javascript
window.PaymentWidget.init({
  merchantId: "seu-id",
  primaryColor: "#sua-cor",
  // ... suas configurações
});
```

**3. Teste:**

```bash
python3 -m http.server 8080
open http://localhost:8080/meu-exemplo.html
```

---

## 📚 Documentação Completa

Para mais informações:

- **Quick Start**: [../QUICK-START.md](../QUICK-START.md)
- **README**: [../README.md](../README.md)
- **Guia de Deploy**: [../GUIA-DEPLOY-CDN.md](../GUIA-DEPLOY-CDN.md)
- **Índice de Docs**: [../DOCS-INDEX.md](../DOCS-INDEX.md)

---

## ✅ Checklist de Testes

Ao testar qualquer exemplo, verifique:

- [ ] Widget abre corretamente
- [ ] Cores/tema aplicados
- [ ] Formulário completo aparece
- [ ] Validações funcionam
- [ ] Callbacks executam
- [ ] Widget fecha com ESC
- [ ] Funciona em mobile
- [ ] Console sem erros
- [ ] Shadow DOM funcionando

---

**🎉 Divirta-se testando!**

💡 **Dica:** Comece com `exemplo-completo.html` para ver todas as funcionalidades!
