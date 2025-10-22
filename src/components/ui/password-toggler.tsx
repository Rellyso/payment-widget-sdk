import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function PasswordToggler({
  isPasswordVisible,
  togglePasswordVisibility,
}: {
  isPasswordVisible: boolean;
  togglePasswordVisibility: () => void;
}) {
  return (
    <div className="-translate-y-1/2 absolute top-1/2 right-3 flex items-center justify-center">
      <button
        aria-label={isPasswordVisible ? "Ocultar senha" : "Mostrar senha"}
        className={cn(
          "flex h-8 w-8 items-center justify-center text-gray-500 transition-colors hover:text-gray-700 focus:text-gray-700 focus:outline-none",
          {
            "text-gray-700": isPasswordVisible,
            "text-gray-500": !isPasswordVisible,
          }
        )}
        onClick={togglePasswordVisibility}
        type="button"
      >
        {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
