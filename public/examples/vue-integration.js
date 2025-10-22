<!--
Exemplo
de;
integração;
do Cartão Simples
Widget;
com;
Vue.js;
3;
Usando;
Composition;
API;
-->

<template>
  <div class="payment-integration">
    <div class="product-card">
      <h2>iPhone 15 Pro</h2>
      <p class="price">R$ 8.999,00</p>
      <p class="installments">ou até 12x de R$ 749,92 sem juros</p>

      <button
        @click="openPaymentWidget"
        :disabled="loading"
        class="payment-button"
      >
        <span v-if="loading">Carregando...</span>
        <span v-else>Parcele sem comprometer o limite do cartão</span>
      </button>
    </div>

    <!-- Widget será montado aqui via Shadow DOM -->
    <div id="cartao-simples-widget" ref="widgetContainer" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(false)
const widgetContainer = ref(null)
let widgetInstance = null

// Configuração do widget
const widgetConfig = {
  orderId: import.meta.env.VITE_CARTAO_SIMPLES_MERCHANT_ID,
  primaryColor: '#3a36f5',
  secondaryColor: '#0A0A0A',
  logoUrl: '/logo.png',
  environment: import.meta.env.VITE_APP_ENV === 'production' ? 'production' : 'staging',
  apiBaseUrl: import.meta.env.VITE_CARTAO_SIMPLES_API_URL,
  autoOpen: false
}

// Carregar script do widget dinamicamente
const loadWidget = () => {
  return new Promise((resolve, reject) => {
    if (window.PaymentWidget) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://cdn.cartaosimples.com/widget-bootstrap.v1.min.js'
    script.async = true
    script.onload = resolve
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const openPaymentWidget = async () => {
  try {
    loading.value = true

    // Carregar widget se ainda não estiver carregado
    await loadWidget()

    // Inicializar widget
    widgetInstance = window.PaymentWidget.init({
      ...widgetConfig,
      onSuccess: handlePaymentSuccess,
      onError: handlePaymentError,
      onOpen: handleWidgetOpen,
      onClose: handleWidgetClose
    })

    // Abrir widget
    widgetInstance.open()

  } catch (error) {
    console.error('Erro ao carregar widget:', error)
    handlePaymentError({ message: 'Erro ao carregar widget de pagamento' })
  } finally {
    loading.value = false
  }
}

const handlePaymentSuccess = (data) => {
  console.log('Pagamento realizado com sucesso:', data)

  // Redirecionar para página de sucesso
  router.push({
    name: 'PaymentSuccess',
    query: {
      token: data.token,
      transactionId: data.transactionId,
      amount: data.amount
    }
  })
}

const handlePaymentError = (error) => {
  console.error('Erro no pagamento:', error)

  // Mostrar notificação de erro
  // Aqui você pode usar sua biblioteca de notificações favorita
  alert(`Erro: ${error.message}`)

  // Ou redirecionar para página de erro
  router.push({
    name: 'PaymentError',
    query: {
      error: error.message
    }
  })
}

const handleWidgetOpen = () => {
  console.log('Widget aberto')
  // Analytics
  gtag('event', 'widget_open', {
    event_category: 'payment',
    event_label: 'cartao_simples'
  })
}

const handleWidgetClose = () => {
  console.log('Widget fechado')
  loading.value = false
}

// Cleanup ao desmontar componente
onUnmounted(() => {
  if (widgetInstance) {
    widgetInstance.destroy()
  }
})

// Pré-carregar widget ao montar componente (opcional)
onMounted(async () => {
  try {
    await loadWidget()
    console.log('Widget pré-carregado com sucesso')
  } catch (error) {
    console.warn('Falha ao pré-carregar widget:', error)
  }
})
</script>

<style scoped>
.payment-integration {
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.product-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.product-card h2 {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #333;
}

.price {
  font-size: 32px;
  font-weight: 700;
  color: #FF6600;
  margin-bottom: 4px;
}

.installments {
  font-size: 14px;
  color: #666;
  margin-bottom: 24px;
}

.payment-button {
  background: linear-gradient(135deg, #FF6600 0%, #FF8533 100%);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  position: relative;
  overflow: hidden;
}

.payment-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(255, 102, 0, 0.3);
}

.payment-button:active:not(:disabled) {
  transform: translateY(0);
}

.payment-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.payment-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.payment-button:hover:not(:disabled)::before {
  left: 100%;
}

/* Responsividade */
@media (max-width: 480px) {
  .payment-integration {
    padding: 16px;
  }

  .product-card {
    padding: 20px;
  }

  .payment-button {
    font-size: 14px;
    padding: 14px 20px;
  }
}
</style>
