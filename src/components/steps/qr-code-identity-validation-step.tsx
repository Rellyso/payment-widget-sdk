import { ArrowRight } from "lucide-react";
import { WIDGET_STEPS } from "@/types";
import { QRCode } from "../qr-code";
import { Button } from "../ui/button";
import type { StepProps } from "./types";

export function QRCodeIdentityValidation({ onNext }: StepProps) {
  return (
    <div className="flex flex-col items-center space-y-6">
      <div>
        <h3 className="mb-2 font-bold text-black-001 text-lg leading-7">
          Confirme sua identidade
        </h3>
        <p className="text-base text-black-002 leading-5">
          Leia o QR Code abaixo ou clique no link para validar seus dados.
        </p>
      </div>

      <QRCode value="https://www.cartaosimples.com.br/" />

      <div className="flex">
        <Button
          variant='link'
          className="w-full"
          onClick={() => onNext(WIDGET_STEPS.IDENTITY_VALIDATION_RESULT)}
          type="button"
        >
          Acessar validação <ArrowRight />
        </Button>
      </div>
    </div>
  );
}
