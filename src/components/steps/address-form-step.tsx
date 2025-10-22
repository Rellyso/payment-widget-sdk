import { useAddressForm } from "@/hooks/use-address-form";
import { WIDGET_STEPS } from "@/types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { StepProps } from "./types";

export function AddressFormStep({ onNext }: StepProps) {
  const { form, getAddressByZipCode, isEditable, zipCodeNotFoundMessage } =
    useAddressForm();

  const handleSubmit = () => {
    onNext(WIDGET_STEPS.QR_CODE_IDENTITY_VALIDATION)
  };
  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="">
        <h3 className="mb-2 font-bold text-black-001 text-lg leading-7">
          Informe seu endereço
        </h3>
        <p className="text-base text-black-002 leading-5">
          Preencha os campos abaixo para continuar sua compra.
        </p>
      </div>

      <div className="space-y-4">
        <Input
          autoComplete="postal-code"
          error={zipCodeNotFoundMessage || form.formState.errors.cep?.message}
          label="CEP"
          mask="cep"
          placeholder="00.000-000"
          required
          {...form.register("cep", { onChange: getAddressByZipCode })}
        />

        <Input
          autoComplete="street-address"
          disabled={!isEditable}
          error={form.formState.errors.street?.message}
          label="Rua"
          placeholder="Digite aqui..."
          required
          {...form.register("street")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            error={form.formState.errors.number?.message}
            label="Número"
            placeholder="00"
            {...form.register("number")}
          />
          <Input
            error={form.formState.errors.complement?.message}
            label="Complemento"
            placeholder="Digite aqui..."
            {...form.register("complement")}
          />
        </div>
        <Input
          disabled={!isEditable}
          error={form.formState.errors.neighborhood?.message}
          label="Bairro"
          placeholder="Digite aqui..."
          {...form.register("neighborhood")}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            disabled={!isEditable}
            error={form.formState.errors.city?.message}
            label="Cidade"
            placeholder="Digite aqui..."
            required
            {...form.register("city")}
          />
          <Input
            disabled={!isEditable}
            error={form.formState.errors.state?.message}
            label="Estado"
            placeholder="Digite aqui..."
            required
            {...form.register("state")}
          />
        </div>
      </div>

      <div className="flex">
        <Button
          className="w-full"
          type="submit"
        >
          Validar identidade
        </Button>
      </div>
    </form>
  );
}
