import { useState } from "react";
import { WIDGET_STEPS } from "../../types";
import type { StepProps } from "./types";

export function AuthorizationStep({ onNext, config }: StepProps) {
  const [isAccepted, setIsAccepted] = useState(false);

  const handleContinue = () => {
    if (isAccepted) {
      onNext(WIDGET_STEPS.CREDIT_ANALYSIS);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="mb-2 font-semibold text-gray-900 text-lg">
          Autorização de Análise de Crédito
        </h3>
        <p className="text-gray-600 text-sm">
          Para prosseguir, precisamos da sua autorização para análise de crédito
        </p>
      </div>

      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <title>Informação</title>
              <path
                clipRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                fillRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h4 className="font-medium text-blue-800 text-sm">
              Sobre a análise
            </h4>
            <p className="mt-1 text-blue-700 text-sm">
              Vamos consultar seu CPF nos órgãos de proteção ao crédito para
              avaliar sua elegibilidade ao Cartão Simples. Este processo é
              seguro e não afeta seu score.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative flex items-start">
          <div className="flex h-5 items-center">
            <input
              checked={isAccepted}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              id="accept-analysis"
              name="accept-analysis"
              onChange={(e) => setIsAccepted(e.target.checked)}
              type="checkbox"
            />
          </div>
          <div className="ml-3 text-sm">
            <label
              className="font-medium text-gray-700"
              htmlFor="accept-analysis"
            >
              Autorizo a consulta aos órgãos de proteção ao crédito
            </label>
            <p className="text-gray-500">
              Declaro estar ciente de que meus dados serão consultados conforme
              a Lei Geral de Proteção de Dados (LGPD).
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!isAccepted}
          onClick={handleContinue}
          type="button"
        >
          Continuar
        </button>
      </div>
    </div>
  );
}
