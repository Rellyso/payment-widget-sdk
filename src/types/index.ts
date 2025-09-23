export type WidgetConfig = {
  /** ID único do merchant/parceiro */
  merchantId: string;

  /** Chave da API do merchant */
  apiKey?: string;

  /** Configurações de tema */
  theme?: {
    /** Cores primária (hex) */
    primaryColor?: string;
    /** Cor secundária (hex) */
    secondaryColor?: string;
    /** Border radius (sm|md|lg|full|px) */
    borderRadius?: "sm" | "md" | "lg" | "full" | string;
  };

  /** URL do logo do parceiro */
  logoUrl?: string;

  /** Localização */
  locale?: "pt-BR";

  /** Ambiente */
  environment?: "staging" | "production";

  /** URL base da API */
  apiBaseUrl?: string;

  /** Abrir automaticamente após init */
  autoOpen?: boolean;

  /** Callbacks */
  onSuccess?: (data: PaymentSuccessData) => void;
  onError?: (error: PaymentError) => void;
  onOpen?: () => void;
  onClose?: () => void;
};

export type PaymentSuccessData = {
  transactionId: string;
  token: string;
  merchantId: string;
  amount?: number;
  installments?: number;
  timestamp: string;
};

export type PaymentError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type CreditAnalysisData = {
  cpf: string;
  fullName: string;
  phone: string;
  birthDate: string;
  monthlyIncome: number;
  email: string;
};

export type AddressData = {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
};

export type PaymentData = {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  installments: number;
};

export const WIDGET_STEPS = {
  AUTHORIZATION: "authorization",
  CREDIT_ANALYSIS: "credit-analysis",
  ANALYSIS_RESULT: "analysis-result",
  ADDRESS_FORM: "address-form",
  PAYMENT_FORM: "payment-form",
  CONFIRMATION: "confirmation",
} as const;

export type WidgetStep = (typeof WIDGET_STEPS)[keyof typeof WIDGET_STEPS];

export type WidgetState = {
  isOpen: boolean;
  currentStep: WidgetStep;
  isLoading: boolean;
  creditAnalysis?: CreditAnalysisData;
  address?: AddressData;
  payment?: PaymentData;
  isApproved?: boolean;
  error?: PaymentError;
};

export type WidgetAPI = {
  init: (config: WidgetConfig) => Promise<void>;
  open: () => void;
  close: () => void;
  destroy: () => void;
  getState: () => WidgetState;
};

declare global {
  // biome-ignore lint/nursery/useConsistentTypeDefinitions: global Window interface extension
  interface Window {
    PaymentWidget?: WidgetAPI;
    CartaoSimplesWidget?: WidgetAPI;
    PaymentWidgetInit?: WidgetConfig;
  }
}
