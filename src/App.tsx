import { useState } from "react";
import { PaymentWidget } from "./components/PaymentWidget";
import type { WidgetConfig } from "./types";
import "./styles/widget.css";

function App() {
  const [isWidgetOpen, setIsWidgetOpen] = useState(false);

  const widgetConfig: WidgetConfig = {
    merchantId: "demo-merchant-123",
    primaryColor: "#ff6600",
    secondaryColor: "#0a0a0a",
    logoUrl: "https://www.cartaosimples.com.br/logo-extendida.svg",
    borderRadius: "md",
    environment: "staging",
    onSuccess: (data) => {
      console.log("Pagamento realizado com sucesso:", data);
      setIsWidgetOpen(false);
    },
    onError: (error) => {
      console.error("Erro no pagamento:", error);
    },
    onOpen: () => {
      console.log("Widget aberto");
    },
    onClose: () => {
      console.log("Widget fechado");
      setIsWidgetOpen(false);
    },
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 text-center shadow-lg">
        <h1 className="mb-4 font-bold text-2xl text-gray-900">
          Cartão Simples Widget
        </h1>

        <p className="mb-8 text-gray-600">
          Demonstração do widget de pagamento white-label. Clique no botão
          abaixo para testar o fluxo completo.
        </p>

        <button
          className="w-full rounded-lg bg-orange-500 px-6 py-3 font-semibold text-white transition-colors hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          onClick={() => setIsWidgetOpen(true)}
          type="button"
        >
          Parcele suas compras sem comprometer o limite do cartão
        </button>

        <div className="mt-6 text-gray-500 text-xs">
          <p>• Aprovação em minutos</p>
          <p>• Sem anuidade</p>
          <p>• Cartão físico grátis</p>
        </div>
      </div>

      {/* Widget */}
      <PaymentWidget
        config={widgetConfig}
        initialState={{ isOpen: isWidgetOpen }}
      />
    </div>
  );
}

export default App;
