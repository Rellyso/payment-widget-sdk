// CDN Entry Point - Bundle completo com React incluído
import React from "react";
import ReactDOM from "react-dom/client";
import type { WidgetConfig } from "../types";
import "../styles/widget.css";
import "../styles/widget-native.css";
import { PaymentWidget } from "@/components/payment-widget";

// Garante que React está disponível globalmente
(
  window as unknown as { React: typeof React; ReactDOM: typeof ReactDOM }
).React = React;
(
  window as unknown as { React: typeof React; ReactDOM: typeof ReactDOM }
).ReactDOM = ReactDOM;

// API global para CDN
const CartaoSimplesWidget = {
  mount: (container: HTMLElement, config: WidgetConfig) => {
    const root = ReactDOM.createRoot(container);

    // Controlador de estado compartilhado
    let isOpen = false;
    const listeners: Array<(state: { isOpen: boolean }) => void> = [];

    const notifyListeners = () => {
      const state = { isOpen };
      for (const listener of listeners) {
        listener(state);
      }
    };

    const WidgetWrapper = () => {
      const [widgetIsOpen, setWidgetIsOpen] = React.useState(isOpen);

      React.useEffect(() => {
        const listener = (state: { isOpen: boolean }) => {
          setWidgetIsOpen(state.isOpen);
        };
        listeners.push(listener);

        return () => {
          const index = listeners.indexOf(listener);
          if (index > -1) {
            listeners.splice(index, 1);
          }
        };
      }, []);

      return React.createElement(PaymentWidget, {
        config: {
          ...config,
          onClose: () => {
            isOpen = false;
            notifyListeners();
            config.onClose?.();
          },
        },
        initialState: { isOpen: widgetIsOpen },
      });
    };

    root.render(React.createElement(WidgetWrapper));

    return {
      open: () => {
        isOpen = true;
        notifyListeners();
      },
      close: () => {
        isOpen = false;
        notifyListeners();
      },
      destroy: () => {
        listeners.length = 0;
        root.unmount();
      },
      getState: () => ({ isOpen }),
    };
  },
};

// Expõe globalmente
(
  window as unknown as { CartaoSimplesWidget: typeof CartaoSimplesWidget }
).CartaoSimplesWidget = CartaoSimplesWidget;

export default CartaoSimplesWidget;
