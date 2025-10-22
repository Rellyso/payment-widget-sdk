import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useState } from "react";
import type { FieldValues, Path, UseFormProps } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { ZodSchema } from "zod";
import { applyMask, type masks } from "../utils/masks";

type UseWidgetFormProps<T extends FieldValues> = UseFormProps<T> & {
  schema: ZodSchema<T>;
  onSubmit: (data: T) => void | Promise<void>;
};

export function useWidgetForm<T extends FieldValues>({
  schema,
  onSubmit,
  ...formProps
}: UseWidgetFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<T>({
    resolver: zodResolver(schema),
    mode: "onSubmit",
    ...formProps,
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  });

  const setMaskedValue = useCallback(
    (fieldName: Path<T>, value: string, maskType: keyof typeof masks) => {
      const maskedValue = applyMask(value, maskType);
      form.setValue(fieldName, maskedValue as T[Path<T>]);
    },
    [form]
  );

  return {
    ...form,
    handleSubmit,
    isSubmitting,
    setMaskedValue,
  };
}
