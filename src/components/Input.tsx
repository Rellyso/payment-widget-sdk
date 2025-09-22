import clsx from "clsx";
import type { InputHTMLAttributes } from "react";
import { forwardRef, useState } from "react";
import { applyMask, masks } from "../utils/masks";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  mask?: keyof typeof masks;
  icon?: React.ReactNode;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, mask, icon, className, onChange, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      let value = event.target.value;

      if (mask && masks[mask]) {
        value = applyMask(value, mask);
        // Atualiza o valor do input diretamente para evitar problemas de cursor
        event.target.value = value;
      }

      onChange?.(event);
    };

    const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(event);
    };

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(event);
    };

    return (
      <div className="space-y-1">
        <label
          className={clsx("font-medium text-sm transition-colors", {
            "text-primary": isFocused,
            "text-red-600": error,
            "text-gray-700": !(isFocused || error),
          })}
          htmlFor={props.id || props.name}
        >
          {label}
          {props.required && <span className="ml-1 text-red-500">*</span>}
        </label>

        <div className="relative">
          {icon && (
            <div className="-translate-y-1/2 absolute top-1/2 left-3 text-gray-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            {...props}
            className={clsx(
              "w-full rounded-lg border px-3 py-2 transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary",
              {
                "pl-10": icon,
                "border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500":
                  error,
                "border-gray-300 text-gray-900 placeholder-gray-500": !error,
              },
              className
            )}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
          />
        </div>

        {error && (
          <p className="text-red-600 text-sm" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
