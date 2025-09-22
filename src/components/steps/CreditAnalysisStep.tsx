import { useWidgetForm } from "../../hooks/useWidgetForm";
import type { CreditAnalysisFormData } from "../../schemas/validation";
import { creditAnalysisSchema } from "../../schemas/validation";
import { WIDGET_STEPS } from "../../types";
import { Input } from "../Input";
import type { StepProps } from "./types";

export function CreditAnalysisStep({ onNext, onPrev, onError }: StepProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    isSubmitting,
  } = useWidgetForm<CreditAnalysisFormData>({
    schema: creditAnalysisSchema,
    onSubmit: async (data) => {
      try {
        // Simula envio para API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Em caso de sucesso, prosseguir
        onNext(WIDGET_STEPS.ANALYSIS_RESULT, data);
      } catch (error) {
        onError({
          code: "CREDIT_ANALYSIS_ERROR",
          message: "Erro ao processar análise de crédito",
        });
      }
    },
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="mb-2 font-semibold text-gray-900 text-lg">
            Dados Pessoais
          </h3>
          <p className="text-gray-600 text-sm">
            Informe seus dados para análise de crédito
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Input
                {...register("fullName")}
                error={errors.fullName?.message}
                label="Nome Completo"
                placeholder="Digite seu nome completo"
                required
              />
            </div>

            <Input
              {...register("cpf")}
              error={errors.cpf?.message}
              label="CPF"
              mask="cpf"
              placeholder="000.000.000-00"
              required
            />

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
              placeholder="DD/MM/AAAA"
              required
            />

            <Input
              {...register("monthlyIncome", { valueAsNumber: true })}
              error={errors.monthlyIncome?.message}
              icon={<span className="text-gray-500 text-sm">R$</span>}
              label="Renda Mensal"
              placeholder="0,00"
              required
              type="number"
            />

            <div className="md:col-span-2">
              <Input
                {...register("email")}
                error={errors.email?.message}
                label="Email"
                placeholder="seu@email.com"
                required
                type="email"
              />
            </div>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-blue-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <title>Informação sobre dados</title>
                  <path
                    clipRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    fillRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h4 className="font-medium text-blue-800 text-sm">
                  Seus dados estão seguros
                </h4>
                <p className="mt-1 text-blue-700 text-sm">
                  Utilizamos criptografia de ponta e seguimos as normas da LGPD
                  para proteger suas informações pessoais.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <button
            className="rounded-lg border border-gray-300 bg-white px-6 py-3 font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            onClick={onPrev}
            type="button"
          >
            Voltar
          </button>
          <button
            className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!isValid || isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Analisando..." : "Continuar"}
          </button>
        </div>
      </div>
    </form>
  );
}
