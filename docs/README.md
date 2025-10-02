# 📚 Documentação - Cartão Simples Payment Widget

Bem-vindo à documentação completa do Payment Widget! Aqui você encontra tudo o que precisa para integrar, configurar e fazer deploy do widget.

## 🗂️ Índice de Documentação

### 🚀 Começando

- **[Quick Start](./QUICK-START.md)** - Integre o widget em 5 minutos
- **[Guia de Uso do Widget](./GUIA-USO-WIDGET.md)** - APIs, exemplos e boas práticas

### 🌐 Deploy e Infraestrutura

- **[Guia de Deploy CDN](./GUIA-DEPLOY-CDN.md)** - Deploy completo no AWS CloudFront
- **[Solução CORS](./SOLUCAO-CORS.md)** - Configuração CORS e troubleshooting
- **[Comandos Úteis](./COMANDOS-UTEIS.md)** - Referência rápida de comandos

### 🧪 Desenvolvimento e Testes

- **[Servidor Local](./SERVIDOR-LOCAL.md)** - Como testar localmente com HTTP server
- **[Resumo Visual](./RESUMO-VISUAL.md)** - Status, métricas e checklist do projeto

### 📋 Referência Completa

- **[Índice de Documentação](./DOCS-INDEX.md)** - Navegação organizada por caso de uso

## 🎯 Navegação por Objetivo

### "Quero integrar o widget no meu site"

1. Leia o [Quick Start](./QUICK-START.md)
2. Consulte [Guia de Uso](./GUIA-USO-WIDGET.md) para exemplos específicos
3. Teste localmente com [Servidor Local](./SERVIDOR-LOCAL.md)

### "Preciso fazer deploy em produção"

1. Leia o [Guia de Deploy CDN](./GUIA-DEPLOY-CDN.md)
2. Configure CORS seguindo [Solução CORS](./SOLUCAO-CORS.md)
3. Use os [Comandos Úteis](./COMANDOS-UTEIS.md) como referência

### "Estou com erro de CORS"

1. Vá direto para [Solução CORS](./SOLUCAO-CORS.md)
2. Execute o script de deploy que já configura tudo
3. Aguarde invalidação do cache (1-2 minutos)

### "Quero entender a arquitetura"

1. Leia [Guia de Deploy CDN](./GUIA-DEPLOY-CDN.md) - Seção Arquitetura
2. Consulte [Resumo Visual](./RESUMO-VISUAL.md) para visão geral
3. Veja `.github/copilot-instructions.md` para detalhes técnicos

## 🏗️ Arquitetura do Projeto

```
payment-widget-poc-v2/
├── src/
│   ├── bootstrap/         # Loader leve (~5KB)
│   ├── cdn/              # Bundle completo (~400KB)
│   ├── sdk/              # NPM package
│   └── components/       # Componentes React
├── dist/
│   ├── bootstrap/        # Build do loader
│   ├── cdn/             # Build do bundle
│   └── sdk/             # Build do SDK
├── docs/                # 📚 Você está aqui!
│   ├── QUICK-START.md
│   ├── GUIA-DEPLOY-CDN.md
│   ├── GUIA-USO-WIDGET.md
│   ├── SOLUCAO-CORS.md
│   ├── COMANDOS-UTEIS.md
│   ├── SERVIDOR-LOCAL.md
│   ├── RESUMO-VISUAL.md
│   └── DOCS-INDEX.md
├── examples/            # Páginas de teste HTML
└── deploy.sh           # Script automatizado de deploy
```

## 🔗 URLs de Produção

### CloudFront CDN

- **Bootstrap**: `https://d2x7cg3k3on9lk.cloudfront.net/widget-bootstrap.v1.min.js` (~5KB)
- **Bundle**: `https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.js` (~400KB)
- **CSS**: `https://d2x7cg3k3on9lk.cloudfront.net/widget.v1.min.css` (~29KB)

### AWS Resources

- **Distribution ID**: `EOLJNTE5PW5O9`
- **Bucket Produção**: `cartao-simples-widget`
- **Bucket Staging**: `cartao-simples-widget-staging`

## 🎓 Glossário

### Termos Importantes

- **Bootstrap**: Script leve que carrega o widget sob demanda
- **Bundle CDN**: Arquivo completo com React incluído
- **SDK**: Pacote NPM para uso direto em projetos React
- **Shadow DOM**: Isolamento CSS/JS para evitar conflitos
- **CORS**: Cross-Origin Resource Sharing - permissão para acessar recursos entre domínios
- **CloudFront**: CDN da AWS para distribuição global
- **S3**: Armazenamento de objetos da AWS

### APIs Globais

- `window.PaymentWidget` - API do Bootstrap
- `window.CartaoSimplesWidget` - API do Bundle CDN

## 📞 Suporte

### Problemas Comuns

Consulte a seção "Troubleshooting" em cada guia específico.

### Logs e Debug

- Ambiente staging tem logs habilitados
- Use `environment: 'staging'` na configuração
- Verifique console do navegador (F12)

### Contato

- Email: dev@cartaosimples.com
- Docs: https://docs.cartaosimples.com/widget

## 📝 Contribuindo

Encontrou um erro na documentação ou quer adicionar mais exemplos?

1. Edite os arquivos markdown nesta pasta
2. Mantenha o estilo e formatação consistentes
3. Adicione exemplos práticos quando possível
4. Atualize o índice se criar novos documentos

---

**Última atualização**: 2 de outubro de 2025  
**Versão do Widget**: 1.0.0  
**Status**: ✅ Produção
