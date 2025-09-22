import type { StepProps } from "./types";

export function AnalysisResultStep({ onNext, onPrev }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-2 font-semibold text-gray-900 text-lg">
          Resultado da Análise
        </h3>
        <p className="text-gray-600 text-sm">
          Resultado da consulta de crédito
        </p>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-8 w-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <title>Aprovado</title>
              <path
                d="M5 13l4 4L19 7"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
              />
            </svg>
          </div>
          <h4 className="mb-2 font-semibold text-green-600 text-lg">
            Parabéns! Você foi aprovado!
          </h4>
          <p className="text-gray-600 text-sm">
            Sua análise de crédito foi aprovada. Vamos prosseguir com os dados
            para finalizar seu cartão.
          </p>
        </div>
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
          onClick={() => onNext("address-form")}
          type="button"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
