import type { StepWithSuccessProps } from "./types";

export function ConfirmationStep({ onSuccess }: StepWithSuccessProps) {
  const handleFinish = () => {
    // Simula dados de sucesso
    const successData = {
      transactionId: "txn_123456789",
      token: "tok_abcdef123",
      merchantId: "merchant_001",
      timestamp: new Date().toISOString(),
    };

    onSuccess(successData);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <svg
            className="h-8 w-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <title>Sucesso</title>
            <path
              d="M5 13l4 4L19 7"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </svg>
        </div>

        <h3 className="mb-2 font-semibold text-gray-900 text-lg">
          Tudo pronto!
        </h3>
        <p className="text-gray-600 text-sm">
          Seu cartão foi solicitado com sucesso e chegará em até 15 dias úteis.
        </p>
      </div>

      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="text-center">
          <h4 className="mb-2 font-medium text-green-800 text-sm">
            Próximos passos
          </h4>
          <ul className="space-y-1 text-green-700 text-sm">
            <li>• Você receberá um e-mail de confirmação</li>
            <li>• Acompanhe o status pelo app Cartão Simples</li>
            <li>• Seu cartão chegará no endereço informado</li>
          </ul>
        </div>
      </div>

      <div className="text-center">
        <button
          className="rounded-lg bg-primary px-8 py-3 font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={handleFinish}
          type="button"
        >
          Finalizar
        </button>
      </div>
    </div>
  );
}
