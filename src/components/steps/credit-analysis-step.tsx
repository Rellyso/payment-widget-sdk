import { useWidgetForm } from "../../hooks/use-widget-form";
import type { CreditAnalysisFormData } from "../../schemas/validation";
import { creditAnalysisSchema } from "../../schemas/validation";
import { WIDGET_STEPS } from "../../types";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import type { StepProps } from "./types";

export function CreditAnalysisStep({ onNext }: StepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useWidgetForm<CreditAnalysisFormData>({
    schema: creditAnalysisSchema,
    onSubmit: (data) => {
      onNext(WIDGET_STEPS.TOKEN_VALIDATION, data);
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div>
          <h3 className="mb-2 font-bold text-black-001 text-xl leading-7">
            Cadastre-se no Cartão Simples
          </h3>
          <p className="text-base text-black-002 leading-5">
            Preencha os campos abaixo para criar sua conta.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Input
                {...register("firstName")}
                error={errors.firstName?.message}
                label="Nome"
                placeholder="Digite aqui..."
                required
              />
            </div>
            <div className="md:col-span-2">
              <Input
                {...register("lastName")}
                error={errors.lastName?.message}
                label="Sobrenome"
                placeholder="Digite aqui..."
                required
              />
            </div>

            <div className="md:col-span-2">
              <Input
                {...register("email")}
                error={errors.email?.message}
                label="Email"
                placeholder="email@email.com"
                required
                type="email"
              />
            </div>

            <Input
              {...register("phone")}
              error={errors.phone?.message}
              label="Telefone"
              mask="phone"
              placeholder="(00) 00000-0000"
              required
            />

            <Input
              {...register("birthDate")}
              error={errors.birthDate?.message}
              label="Data de Nascimento"
              mask="date"
              placeholder="dd/mm/aaaa"
              required
            />
            <div className="md:col-span-2">
              <Input
                {...register("password")}
                error={errors.password?.message}
                label="Crie uma senha"
                placeholder="Digite sua senha..."
                required
                type="password"
              />
            </div>
            <div className="md:col-span-2">
              <Input
                {...register("confirmPassword")}
                error={errors.confirmPassword?.message}
                label="Confirme sua senha"
                placeholder="Confirme sua senha..."
                required
                type="password"
              />
            </div>
          </div>
        </div>

        <div>
          <Button className="w-full" type="submit">
            Continuar para validação
          </Button>
        </div>
      </div>
    </form>
  );
}
