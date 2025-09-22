import type { StepProps } from "./types";

export function PaymentFormStep({ onNext, onPrev }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-2 font-semibold text-gray-900 text-lg">
          Dados de Pagamento
        </h3>
        <p className="text-gray-600 text-sm">
          Informe os dados do cartão para primeira compra
        </p>
      </div>

      <div className="space-y-4">
        <p className="text-center text-gray-500">
          Formulário de pagamento em construção...
        </p>
      </div>

      <div className="flex justify-between">
        <button
          className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          onClick={onPrev}
          type="button"
        >
          Voltar
        </button>
        <button
          className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => onNext("confirmation")}
          type="button"
        >
          Finalizar
        </button>
      </div>
    </div>
  );
}
