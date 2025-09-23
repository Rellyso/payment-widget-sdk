import { useState } from "react";
import { WIDGET_STEPS } from "../../types";
import { Button } from "../ui/button";
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
      <div className="">
        <h3 className="mb-2 font-semibold text-gray-900 text-lg">
          Tudo pronto para a análise?
        </h3>
        <p className="text-gray-600 text-sm">
          Ao autorizar, o Cartão Simples utilizará seus dados apenas para a
          análise de crédito.
        </p>
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
              Li e concordo com a Política de Privacidade do Cartão Simples
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button disabled={!isAccepted} onClick={handleContinue} type="button">
          Autorizar análise de crédito
        </Button>
      </div>
    </div>
  );
}
