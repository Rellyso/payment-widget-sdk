import clsx from "clsx";
import type { WidgetStep } from "../types";
import { WIDGET_STEPS } from "../types";

type StepNavigationProps = {
  currentStep: WidgetStep;
  steps: WidgetStep[];
};

const stepLabels: Record<WidgetStep, string> = {
  [WIDGET_STEPS.AUTHORIZATION]: "Autorização",
  [WIDGET_STEPS.CREDIT_ANALYSIS]: "Análise",
  [WIDGET_STEPS.ANALYSIS_RESULT]: "Resultado",
  [WIDGET_STEPS.ADDRESS_FORM]: "Endereço",
  [WIDGET_STEPS.PAYMENT_FORM]: "Pagamento",
  [WIDGET_STEPS.CONFIRMATION]: "Confirmação",
};

export function StepNavigation({ currentStep, steps }: StepNavigationProps) {
  const currentIndex = steps.indexOf(currentStep);

  return (
    <nav aria-label="Progresso do pagamento" className="mb-6">
      <ol className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const label = stepLabels[step];

          return (
            <li className="flex items-center" key={step}>
              <div
                aria-current={isCurrent ? "step" : undefined}
                className={clsx(
                  "flex h-8 w-8 items-center justify-center rounded-full font-medium text-sm transition-colors",
                  {
                    "bg-primary text-white": isCompleted || isCurrent,
                    "bg-gray-200 text-gray-500": !(isCompleted || isCurrent),
                  }
                )}
              >
                {isCompleted ? (
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <title>Step completo</title>
                    <path
                      clipRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      fillRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>

              {/* Step label - apenas em telas maiores */}
              <span
                className={clsx(
                  "ml-2 hidden font-medium text-sm transition-colors sm:inline",
                  {
                    "text-primary": isCurrent,
                    "text-gray-500": !isCurrent,
                  }
                )}
              >
                {label}
              </span>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  aria-hidden="true"
                  className={clsx(
                    "ml-4 hidden h-px w-8 transition-colors sm:block",
                    {
                      "bg-primary": isCompleted,
                      "bg-gray-200": !isCompleted,
                    }
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
