import { WIDGET_STEPS } from "@/types";
import { Button } from "../ui/button";
import type { StepProps } from "./types";

export function AnalysisResultStep({ onNext }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border-5 border-green-100 bg-white">
            <svg
              fill="none"
              height="16"
              viewBox="0 0 16 16"
              width="16"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Aprovado</title>
              <path
                d="M1 1c0-.531.438-1 1-1 .531 0 1 .469 1 1 0 .563-.469 1-1 1-.562 0-1-.437-1-1m13 4c0-.531.438-1 1-1 .531 0 1 .469 1 1 0 .563-.469 1-1 1-.562 0-1-.437-1-1m1 8c.531 0 1 .469 1 1 0 .563-.469 1-1 1-.562 0-1-.437-1-1 0-.531.438-1 1-1M4.688 4.25l.53-.531.25-.25a3.25 3.25 0 0 0 .938-1.938L6.5.688l1.469.156-.094.844A4.6 4.6 0 0 1 6.531 4.53l-.25.25-.531.532zm6.53 5.469.25-.25c.75-.75 1.75-1.25 2.813-1.344l.875-.094.156 1.469-.843.094c-.75.094-1.438.406-1.938.937l-.25.25-.531.531-1.062-1.062zm4.5-8.375-.312.25a2.5 2.5 0 0 1-1.656.593.95.95 0 0 0-1 .907l-.031.937c-.094 1.313-1.219 2.344-2.531 2.313a.98.98 0 0 0-.657.218l-.312.282-.563.468-.969-1.125.563-.5.313-.25a2.5 2.5 0 0 1 1.656-.593.95.95 0 0 0 1-.907L11.28 3c.063-1.312 1.188-2.344 2.5-2.312.25 0 .469-.063.656-.22l.313-.28zM1 16l-1-1 1.188-3.062 2.875 2.874zm4.094-1.594-3.5-3.5.718-1.875 4.657 4.656zm2.875-1.125-5.25-5.25L3.5 6l6.5 6.5z"
                fill="#1CB961"
              />
            </svg>
          </div>
          <h4 className="mb-2 font-bold text-black-001 text-lg leading-5">
            Crédito aprovado com sucesso!
          </h4>
          <p className="text-black-002 text-sm">
            Sua análise foi aprovada e seu crédito já está liberado. Continue e
            finalize sua compra com tranquilidade.
          </p>
        </div>
      </div>

      <div className="flex">
        <Button
          className="w-full"
          onClick={() => onNext(WIDGET_STEPS.ADDRESS_FORM)}
          type="button"
        >
          Continuar para endereço
        </Button>
      </div>
    </div>
  );
}
