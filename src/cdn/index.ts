// CDN Entry Point - Bundle completo com React incluído
import React from "react";
import ReactDOM from "react-dom/client";
import { PaymentWidget } from "../components/PaymentWidget";
import type { WidgetConfig } from "../types";
import "../styles/widget.css";

// Garante que React está disponível globalmente
(window as any).React = React;
(window as any).ReactDOM = ReactDOM;

// API global para CDN
const CartaoSimplesWidget = {
  mount: (container: HTMLElement, config: WidgetConfig) => {
    const root = ReactDOM.createRoot(container);

    const widgetInstance: any = null;

    const WidgetWrapper = () => {
      const [isOpen, setIsOpen] = React.useState(false);

      React.useImperativeHandle(widgetInstance, () => ({
        open: () => setIsOpen(true),
        close: () => setIsOpen(false),
        destroy: () => root.unmount(),
        getState: () => ({ isOpen }),
      }));

      return React.createElement(PaymentWidget, {
        config: {
          ...config,
          onClose: () => {
            setIsOpen(false);
            config.onClose?.();
          },
        },
        initialState: { isOpen },
      });
    };

    root.render(React.createElement(WidgetWrapper));

    return {
      open: () => widgetInstance?.open?.(),
      close: () => widgetInstance?.close?.(),
      destroy: () => widgetInstance?.destroy?.(),
      getState: () => widgetInstance?.getState?.() || { isOpen: false },
    };
  },
};

// Expõe globalmente
(window as any).CartaoSimplesWidget = CartaoSimplesWidget;

export default CartaoSimplesWidget;
