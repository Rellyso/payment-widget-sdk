import { WIDGET_STEPS } from "@/types";
import { Button } from "../ui/button";
import type { StepProps } from "./types";

export function IdentityValidationResultStep({ onNext }: StepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full border-5 border-green-100 bg-white">
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width='14'
    height='16'
    fill='none'
    viewBox='0 0 14 16'
  >
    <title>Sucesso</title>
    <path
      fill='#1CB961'
      d='M7 8c-1.437 0-2.75-.75-3.469-2-.719-1.219-.719-2.75 0-4A4.04 4.04 0 0 1 7 0c1.406 0 2.719.781 3.438 2 .718 1.25.718 2.781 0 4A3.96 3.96 0 0 1 7 8m7 8H0l2-6.5h10z'
    />
  </svg>
          </div>
          <h4 className="mb-2 font-bold text-black-001 text-lg leading-5">
            Identidade validada com sucesso!
          </h4>
          <p className="text-black-002 text-sm">
            Sua identidade foi confirmada. Agora é só adicionar o cartão para finalizar a sua compra.
          </p>
        </div>
      </div>

      <div className="flex">
        <Button
          className="w-full"
          onClick={() => onNext(WIDGET_STEPS.PAYMENT_FORM)}
          type="button"
        >
          Adicionar cartão
        </Button>
      </div>
    </div>
  );
}
