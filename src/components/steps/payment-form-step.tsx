import { useState } from "react";
import { logger } from "../../utils/logger";
import { cleanValue, getCardBrand } from "../../utils/masks";
import { Button } from "../ui/button";
import { Combobox } from "../ui/combobox";
import { Input } from "../ui/input";
import type { StepProps } from "./types";
import { VisaIcon } from "../icons/visa";
import { MastercardIcon } from "../icons/mastercard";
import { AmexIcon } from "../icons/amex";
import { DinersIcon } from "../icons/diners";
import { EloIcon } from "../icons/elo";
import { HipercardIcon } from "../icons/hipercard";
import { CreditCard } from "lucide-react";
import { WIDGET_STEPS, type Option } from '@/types/index';

// Constantes de validação
const MIN_CARD_NUMBER_LENGTH = 13;
const MAX_CARD_NUMBER_LENGTH = 19;
const MIN_NAME_LENGTH = 3;
const MIN_CVV_LENGTH = 3;
const MAX_CVV_LENGTH = 4;
const MIN_MONTH = 1;
const MAX_MONTH = 12;
const LUHN_DIGIT_THRESHOLD = 9;
const LUHN_SUBTRACT = 9;
const LUHN_MOD = 10;

const installmentOptions: Map<string, Option> = new Map([
  ["1", { value: 1, label: '1x de R$ 100,00'}],
  ["2", { value: 2, label: '2x de R$ 50,00'}],
  ["3", { value: 3, label: '3x de R$ 33,33'}],
  ["4", { value: 4, label: '4x de R$ 25,00'}],
  ["5", { value: 5, label: '5x de R$ 20,00'}],
  ["6", { value: 6, label: '6x de R$ 16,67'}],
])

type CardFormData = {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  installments: number;
};

type CardFormErrors = Partial<Record<keyof CardFormData, string>>;

// Ícones de bandeira de cartão (fora do componente)
const CardBrandIcon = ({ brand }: { brand: string }) => {
  switch (brand) {
    case "visa":
      return <VisaIcon />;
    case "mastercard":
      return <MastercardIcon />;
    case "amex":
      return <AmexIcon />;
    case "diners":
      return <DinersIcon />;
    case "elo":
      return <EloIcon />;
    case "hipercard":
      return <HipercardIcon />;
    default:
      return <CreditCard className="text-primary" />;
  }
};
export function PaymentFormStep({ onNext, config }: StepProps) {
  const [formData, setFormData] = useState<CardFormData>({
    cardNumber: "",
    cardholderName: "",
    expiryDate: "",
    cvv: "",
    installments: 0,
  });

  const [errors, setErrors] = useState<CardFormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [cardBrand, setCardBrand] = useState<string>("unknown");

  // Atualiza campo e limpa erro
  const updateField = (field: keyof CardFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));

    // Detectar bandeira do cartão
    if (field === "cardNumber") {
      const brand = getCardBrand(value as string);
      setCardBrand(brand);
    }
  };

  // Algoritmo de Luhn para validação de cartão
  const isValidLuhn = (cardNumber: string): boolean => {
    const digits = cardNumber.split("").map(Number);
    let sum = 0;

    for (let i = digits.length - 1; i >= 0; i--) {
      const position = digits.length - 1 - i;
      const isEvenPosition = position % 2 === 1;

      const digit = digits[i];

      // Dobra o dígito em posições pares (contando da direita para esquerda)
      const doubledDigit = digit * 2;
      const adjustedDigit =
        doubledDigit > LUHN_DIGIT_THRESHOLD
          ? doubledDigit - LUHN_SUBTRACT
          : doubledDigit;

      sum += isEvenPosition ? adjustedDigit : digit;
    }

    return sum % LUHN_MOD === 0;
  };

  // Valida número do cartão
  const validateCardNumber = (cleanCardNumber: string): string | null => {
    if (!cleanCardNumber) {
      return "Número do cartão é obrigatório";
    }

    if (
      cleanCardNumber.length < MIN_CARD_NUMBER_LENGTH ||
      cleanCardNumber.length > MAX_CARD_NUMBER_LENGTH
    ) {
      return "Número do cartão inválido";
    }

    if (!isValidLuhn(cleanCardNumber)) {
      return "Número do cartão inválido";
    }

    return null;
  };

  // Valida nome do titular
  const validateCardholderName = (name: string): string | null => {
    if (!name.trim()) {
      return "Nome do titular é obrigatório";
    }

    if (name.trim().length < MIN_NAME_LENGTH) {
      return "Nome muito curto";
    }

    return null;
  };

  // Valida data de validade
  const validateExpiryDate = (expiryDate: string): string | null => {
    if (!expiryDate) {
      return "Data de validade é obrigatória";
    }

    const [month, year] = expiryDate.split("/");
    const monthNum = Number.parseInt(month, 10);
    const yearNum = Number.parseInt(year, 10);

    if (monthNum < MIN_MONTH || monthNum > MAX_MONTH) {
      return "Mês inválido";
    }

    const expiryDateObj = new Date(yearNum, monthNum - 1);
    const now = new Date();

    if (expiryDateObj < now) {
      return "Cartão expirado";
    }

    return null;
  };

  // Valida CVV
  const validateCvv = (cvv: string): string | null => {
    if (!cvv) {
      return "CVV é obrigatório";
    }

    if (cvv.length < MIN_CVV_LENGTH || cvv.length > MAX_CVV_LENGTH) {
      return "CVV inválido";
    }

    return null;
  };

  // Valida formulário completo
  const validateForm = (): boolean => {
    const newErrors: CardFormErrors = {};

    const cleanCardNumber = cleanValue(formData.cardNumber);

    const cardNumberError = validateCardNumber(cleanCardNumber);
    if (cardNumberError) {
      newErrors.cardNumber = cardNumberError;
    }

    const nameError = validateCardholderName(formData.cardholderName);
    if (nameError) {
      newErrors.cardholderName = nameError;
    }

    const expiryError = validateExpiryDate(formData.expiryDate);
    if (expiryError) {
      newErrors.expiryDate = expiryError;
    }

    const cvvError = validateCvv(formData.cvv);
    if (cvvError) {
      newErrors.cvv = cvvError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Tokenizar e processar pagamento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    onNext(WIDGET_STEPS.CONFIRMATION)
    // if (!validateForm()) {
    //   return;
    // }

    // setIsLoading(true);

    // try {
    //   // 1. Tokenizar cartão
    //   const tokenResult = await tokenizeCard();

    //   logger.info("[Payment] Token gerado:", tokenResult.token);

    //   // 2. Processar pagamento com token
    //   const paymentResult = await processPayment(tokenResult.token);

    //   logger.info("[Payment] Pagamento processado:", paymentResult);

    //   // 3. Callback de sucesso
    //   if (config?.onSuccess) {
    //     config.onSuccess({
    //       transactionId: paymentResult.transactionId,
    //       token: tokenResult.token,
    //       orderId: config.orderId,
    //       installments: formData.installments,
    //       timestamp: new Date().toISOString(),
    //     });
    //   }

    //   // 4. Avançar para confirmação
    //   onNext("confirmation");
    // } catch (error) {
    //   logger.error("[Payment] Erro:", error);

    //   const errorMessage =
    //     error instanceof Error ? error.message : "Erro ao processar pagamento";

    //   // Callback de erro
    //   if (config?.onError) {
    //     config.onError({
    //       code: "PAYMENT_ERROR",
    //       message: errorMessage,
    //     });
    //   }

    //   // Mostrar erro no formulário
    //   setErrors({
    //     cardNumber: errorMessage,
    //   });
    // } finally {
    //   setIsLoading(false);
    // }
  };

  // Tokeniza dados do cartão via API
  const tokenizeCard = async (): Promise<{
    token: string;
    last4: string;
    brand: string;
  }> => {
    const apiBaseUrl = config?.apiBaseUrl || "/api";

    const response = await fetch(`${apiBaseUrl}/tokenize`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cardNumber: cleanValue(formData.cardNumber),
        cvv: formData.cvv,
        expiryMonth: formData.expiryDate.split("/")[0],
        expiryYear: formData.expiryDate.split("/")[1],
        cardholderName: formData.cardholderName,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao tokenizar cartão");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Erro ao tokenizar cartão");
    }

    return {
      token: result.token,
      last4: result.card.last4,
      brand: result.card.brand,
    };
  };

  // Processa pagamento com token
  const processPayment = async (
    token: string
  ): Promise<{ transactionId: string }> => {
    const apiBaseUrl = config?.apiBaseUrl || "/api";

    const response = await fetch(`${apiBaseUrl}/payments/process`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,
        orderId: config?.orderId,
        amount: 10_000, // TODO: Pegar do contexto
        installments: formData.installments,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Erro ao processar pagamento");
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message || "Erro ao processar pagamento");
    }

    return {
      transactionId: result.transactionId,
    };
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <h3 className="mb-2 font-bold text-black-001 text-xl">
          Dados do Pagamento
        </h3>
        <p className="text-black-002 text-base">
          Digite os dados do cartão e selecione como prefere parcelar sua
          compra.
        </p>
      </div>

      <div className="space-y-4">
        {/* Número do Cartão */}
        <Input
          autoComplete="cc-number"
          error={errors.cardNumber}
          icon={<CardBrandIcon brand={cardBrand} />}
          label="Número do Cartão"
          mask="cardNumber"
          maxLength={19}
          name="cardNumber"
          onChange={(e) => updateField("cardNumber", e.target.value)}
          placeholder="0000 0000 0000 0000"
          required
          value={formData.cardNumber}
        />

        {/* Nome do Titular */}
        <Input
          autoComplete="cc-name"
          error={errors.cardholderName}
          label="Nome no cartão"
          maxLength={100}
          name="cardholderName"
          onChange={(e) =>
            updateField("cardholderName", e.target.value.toUpperCase())
          }
          placeholder="Digite aqui..."
          required
          value={formData.cardholderName}
        />

        <div className="grid grid-cols-2 gap-4">
          {/* Data de Validade */}
          <Input
            autoComplete="cc-exp"
            error={errors.expiryDate}
            label="Data de expiração"
            mask="expiryDate"
            maxLength={7}
            name="expiryDate"
            onChange={(e) => updateField("expiryDate", e.target.value)}
            placeholder="mm/aaaa"
            required
            value={formData.expiryDate}
          />

          {/* CVV */}
          <Input
            autoComplete="cc-csc"
            error={errors.cvv}
            inputMode="numeric"
            label="Código de segurança (CVV)"
            mask="cvv"
            maxLength={4}
            name="cvv"
            onChange={(e) => updateField("cvv", e.target.value)}
            placeholder="000"
            required
            value={formData.cvv}
          />
        </div>

        {/* Parcelas */}
        <Combobox
          value={formData.installments}
          onChange={(value) => updateField("installments", Number(value))}
          preserveValueType={true}
          searchPlaceholder="Pesquise a parcela"
          options={installmentOptions}
          placeholder="Selecione"
          label="Quantidade de parcelas"
        />
      </div>

      {/* Botões */}
      <div className="flex">
        <Button className="w-full" disabled={isLoading} type="submit">
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                aria-hidden="true"
                className="-ml-1 mr-3 h-5 w-5 animate-spin text-white"
                fill="none"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Carregando</title>
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  fill="currentColor"
                />
              </svg>
              Processando...
            </span>
          ) : (
            "Concluir compra"
          )}
        </Button>
      </div>
    </form>
  );
}
