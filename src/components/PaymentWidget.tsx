/** biome-ignore-all lint/suspicious/noExplicitAny: <explanation> */
import { useState } from "react";
import type { WidgetConfig, WidgetState, WidgetStep } from "../types";
import { WIDGET_STEPS } from "../types";
import { PaymentModal } from "./PaymentModal";
import { StepNavigation } from "./StepNavigation";
import { AddressFormStep } from "./steps/AddressFormStep";
import { AnalysisResultStep } from "./steps/AnalysisResultStep";
import { AuthorizationStep } from "./steps/AuthorizationStep";
import { ConfirmationStep } from "./steps/ConfirmationStep";
import { CreditAnalysisStep } from "./steps/CreditAnalysisStep";
import { PaymentFormStep } from "./steps/PaymentFormStep";
import { ThemeProvider } from "./ThemeProvider";

type PaymentWidgetProps = {
  config: WidgetConfig;
  initialState?: Partial<WidgetState>;
};

export function PaymentWidget({ config, initialState }: PaymentWidgetProps) {
  const [internalState, setInternalState] = useState<WidgetState>(() => ({
    isOpen: false,
    currentStep: WIDGET_STEPS.AUTHORIZATION,
    isLoading: false,
    ...initialState,
  }));

  // Use initialState.isOpen se fornecido, senão use o estado interno
  const state = {
    ...internalState,
    ...(initialState?.isOpen !== undefined && { isOpen: initialState.isOpen }),
  };

  const handleNextStep = (nextStep: WidgetStep, data?: any) => {
    setInternalState((prevState) => ({
      ...prevState,
      currentStep: nextStep,
      ...(data && { [getCurrentStepDataKey(nextStep)]: data }),
    }));
  };

  const handlePrevStep = () => {
    const steps = Object.values(WIDGET_STEPS);
    const currentIndex = steps.indexOf(state.currentStep);
    if (currentIndex > 0) {
      setInternalState((prevState) => ({
        ...prevState,
        currentStep: steps[currentIndex - 1],
      }));
    }
  };

  const handleClose = () => {
    setInternalState((prevState) => ({ ...prevState, isOpen: false }));
    config.onClose?.();
  };

  const handleOpen = () => {
    setInternalState((prevState) => ({ ...prevState, isOpen: true }));
    config.onOpen?.();
  };

  const handleError = (error: { code: string; message: string }) => {
    setInternalState((prevState) => ({
      ...prevState,
      error,
      isLoading: false,
    }));
    config.onError?.(error);
  };

  const handleSuccess = (data: any) => {
    config.onSuccess?.(data);
    handleClose();
  };

  const renderCurrentStep = () => {
    const stepProps = {
      state,
      onNext: handleNextStep,
      onPrev: handlePrevStep,
      onError: handleError,
      config,
    };

    switch (state.currentStep) {
      case WIDGET_STEPS.AUTHORIZATION:
        return <AuthorizationStep {...stepProps} />;
      case WIDGET_STEPS.CREDIT_ANALYSIS:
        return <CreditAnalysisStep {...stepProps} />;
      case WIDGET_STEPS.ANALYSIS_RESULT:
        return <AnalysisResultStep {...stepProps} />;
      case WIDGET_STEPS.ADDRESS_FORM:
        return <AddressFormStep {...stepProps} />;
      case WIDGET_STEPS.PAYMENT_FORM:
        return <PaymentFormStep {...stepProps} />;
      case WIDGET_STEPS.CONFIRMATION:
        return <ConfirmationStep {...stepProps} onSuccess={handleSuccess} />;
      default:
        return <AuthorizationStep {...stepProps} />;
    }
  };

  // API pública do widget
  const api = {
    open: handleOpen,
    close: handleClose,
    getState: () => state,
    destroy: () => {
      handleClose();
    },
  };

  // Expõe API no ref se necessário
  if (config.onOpen && !state.isOpen) {
    // Auto-inicialização ou API externa
  }

  return (
    <ThemeProvider config={config}>
      <div className="payment-widget-root">
        <PaymentModal
          isOpen={state.isOpen}
          onClose={handleClose}
          title="Cartão Simples"
        >
          <div className="p-6">
            {/* Indicador de progresso */}
            {/* <StepNavigation
            currentStep={state.currentStep}
            steps={Object.values(WIDGET_STEPS)}
          /> */}

            {/* Conteúdo do step atual */}
            <div className="mt-6">{renderCurrentStep()}</div>
          </div>
        </PaymentModal>

        {/* API externa - pode ser usado para controle programático */}
        {typeof window !== "undefined" && (
          <div
            ref={(el) => {
              if (el && config.merchantId) {
                (window as any)[`PaymentWidget_${config.merchantId}`] = api;
              }
            }}
          />
        )}
      </div>
    </ThemeProvider>
  );
}

function getCurrentStepDataKey(step: WidgetStep): string {
  switch (step) {
    case WIDGET_STEPS.CREDIT_ANALYSIS:
      return "creditAnalysis";
    case WIDGET_STEPS.ADDRESS_FORM:
      return "address";
    case WIDGET_STEPS.PAYMENT_FORM:
      return "payment";
    default:
      return "data";
  }
}

// API para montagem externa (usado pelo bootstrap)
export const mount = (container: HTMLElement, config: WidgetConfig) => {
  // Usa React do bundle se disponível, senão tenta do window (fallback CDN)
  const React = (window as any).React || require("react");
  const ReactDOM = (window as any).ReactDOM || require("react-dom/client");

  if (!(React && ReactDOM)) {
    throw new Error(
      "React não está disponível. Use o bundle CDN completo ou carregue React manualmente."
    );
  }

  const root = ReactDOM.createRoot(container);
  root.render(React.createElement(PaymentWidget, { config }));

  // Função helper para aguardar a API global estar disponível
  const waitForApi = (merchantId: string): Promise<any> => {
    return new Promise((resolve) => {
      const checkApi = () => {
        const globalApi = (window as any)[`PaymentWidget_${merchantId}`];
        if (globalApi) {
          resolve(globalApi);
        } else {
          setTimeout(checkApi, 10); // Tenta novamente em 10ms
        }
      };
      checkApi();
    });
  };

  return {
    open: async () => {
      if (config.merchantId) {
        const api = await waitForApi(config.merchantId);
        api.open();
      }
    },
    close: async () => {
      if (config.merchantId) {
        const api = await waitForApi(config.merchantId);
        api.close();
      }
    },
    destroy: () => {
      // Remove API global se existir
      if (config.merchantId) {
        delete (window as any)[`PaymentWidget_${config.merchantId}`];
      }
      root.unmount();
    },
  };
};
