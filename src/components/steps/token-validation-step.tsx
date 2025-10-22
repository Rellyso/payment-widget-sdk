import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Controller } from "react-hook-form";
import { useWidgetForm } from "@/hooks/use-widget-form";
import { type PhoneCodeFormData, phoneCodeSchema } from "@/schemas/validation";
import { WIDGET_STEPS } from "@/types";
import { Button } from "../ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../ui/otp";
import type { StepProps } from "./types";

export function TokenValidationStep({ onNext }: StepProps) {
  const form = useWidgetForm<PhoneCodeFormData>({
    schema: phoneCodeSchema,
    onSubmit: (data) => {
      onNext(WIDGET_STEPS.TOKEN_RESULT, data);
    }
  })
  return (
    <form className="space-y-6" onSubmit={form.handleSubmit}>
      <div>
        <h3 className="mb-2 font-bold text-black-001 text-lg leading-7">
          Confirme seu telefone
        </h3>
        <p className="text-base text-black-002 leading-5">
          Insira o token recebido via SMS.
        </p>
      </div>
      <div className="space-y-4">
        <Controller
          control={form.control}
          name="phoneCode"
          render={({ field }) => (
            <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} {...field}>
              <InputOTPGroup>
                <InputOTPSlot index={0} />
                <InputOTPSlot index={1} />
                <InputOTPSlot index={2} />
                <InputOTPSlot index={3} />
                <InputOTPSlot index={4} />
                <InputOTPSlot index={5} />
              </InputOTPGroup>
            </InputOTP>
          )}
        />
      </div>

      <div className="flex">
        <Button
          className="w-full"
          type="submit"
        >
          Continuar
        </Button>
      </div>
    </form>
  );
}
