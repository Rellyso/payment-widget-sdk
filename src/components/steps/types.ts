import type { WidgetConfig, WidgetState, WidgetStep } from "../../types";

export type StepProps = {
  state: WidgetState;
  config: WidgetConfig;
  onNext: (nextStep: WidgetStep, data?: unknown) => void;
  onPrev: () => void;
  onError: (error: { code: string; message: string }) => void;
};

export type StepWithSuccessProps = StepProps & {
  onSuccess: (data: unknown) => void;
};
