import { useState } from "react";
import { WIDGET_STEPS } from "../../types";
import { Button } from "../ui/button";
import type { StepProps } from "./types";

export function AuthorizationStep({ onNext }: StepProps) {
  const [isAccepted, setIsAccepted] = useState(false);

  const handleContinue = () => {
    if (isAccepted) {
      onNext(WIDGET_STEPS.ANALYSIS_RESULT);
    }
  };

  return (
    <div className="space-y-6">
      <div className="">
        <h3 className="mb-2 font-bold text-black-001 text-xl leading-5">
          Tudo pronto para a análise?
        </h3>
        <p className="text-black-002 text-sm leading-5">
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
            <label className="text-black-002" htmlFor="accept-analysis">
              Li e concordo com os{" "}
              <a href="https://www.cartaosimples.com.br/cliente/termos-de-uso">
                Termos de uso
              </a>{" "}
              do Cartão Simples
            </label>
          </div>
        </div>
      </div>

      <div className="flex">
        <Button
          className="w-full"
          disabled={!isAccepted}
          onClick={handleContinue}
          type="button"
        >
          Continuar
        </Button>
      </div>
    </div>
  );
}
