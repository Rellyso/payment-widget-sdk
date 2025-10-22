import { WIDGET_STEPS } from "@/types";
import { Button } from "../ui/button";
import type { StepProps } from "./types";

export function TokenResultStep({ onNext }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border-5 border-green-100 bg-white">
            <svg
              fill="none"
              height="16"
              viewBox="0 0 18 16"
              width="18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Sucesso</title>
              <path
                d="M9 16c-2.875 0-5.5-1.5-6.937-4-1.438-2.469-1.438-5.5 0-8A8.02 8.02 0 0 1 9 0c2.844 0 5.469 1.531 6.906 4 1.438 2.5 1.438 5.531 0 8A7.94 7.94 0 0 1 9 16m3.531-9.469H12.5L13.031 6 12 4.938l-.531.53L8 8.969 6.531 7.5 6 6.969 4.938 8l.53.531 2 2 .532.531.531-.53z"
                fill="#1CB961"
              />
            </svg>
          </div>
          <h4 className="mb-2 font-bold text-black-001 text-lg leading-5">
            Telefone validado com sucesso!
          </h4>
          <p className="text-black-002 text-sm">
            Clique em continuar para finalizar sua compra.
          </p>
        </div>
      </div>

      <div className="flex">
        <Button
          className="w-full"
          onClick={() => onNext(WIDGET_STEPS.AUTHORIZATION)}
          type="button"
        >
          Continuar para análise de crédito
        </Button>
      </div>
    </div>
  );
}
