import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { useTheme } from "./theme-provider";

const FOCUS_DELAY_MS = 100;

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

export function PaymentModal({
  isOpen,
  onClose,
  children,
  title = "Cartão Simples",
}: PaymentModalProps) {
  const theme = useTheme();
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Gerenciamento de foco para acessibilidade
  useEffect(() => {
    if (isOpen) {
      // Salva o elemento que tinha foco antes
      // Foca no modal
      setTimeout(() => {
        modalRef.current?.focus();
      }, FOCUS_DELAY_MS);
    } else if (previousFocusRef.current) {
      // Restaura foco quando fecha
      previousFocusRef.current.focus();
    }
  }, [isOpen]);

  // Trap de foco dentro do modal
  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const getFocusableElements = (modal: HTMLDivElement) => {
      const elements = Array.from(
        modal.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      );

      const firstElement = elements[0] as HTMLElement;
      const lastElement = elements.at(-1) as HTMLElement;

      return { firstElement, lastElement };
    };

    const handleShiftTab = (
      firstElement: HTMLElement,
      lastElement: HTMLElement,
      event: KeyboardEvent
    ) => {
      if (document.activeElement === firstElement) {
        lastElement?.focus();
        event.preventDefault();
      }
    };

    const handleTab = (
      firstElement: HTMLElement,
      lastElement: HTMLElement,
      event: KeyboardEvent
    ) => {
      if (document.activeElement === lastElement) {
        firstElement?.focus();
        event.preventDefault();
      }
    };

    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }

      const modal = modalRef.current;
      if (!modal) {
        return;
      }

      const { firstElement, lastElement } = getFocusableElements(modal);

      if (event.shiftKey) {
        handleShiftTab(firstElement, lastElement, event);
      } else {
        handleTab(firstElement, lastElement, event);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleTabKey);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("keydown", handleTabKey);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Previne scroll do body quando modal está aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[999999] flex items-center justify-center p-4"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            animate={{ opacity: 1 }}
            aria-hidden="true"
            className="absolute inset-0 bg-black/65"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            aria-label={title}
            aria-modal="true"
            className="relative max-h-[90vh] w-full max-w-md overflow-hidden rounded-widget bg-white shadow-widget"
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            ref={modalRef}
            role="dialog"
            style={{ borderRadius: theme.borderRadius }}
            tabIndex={-1}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-gray-100 p-6 pb-0">
              {theme.logoUrl ? (
                <picture>
                  <source srcSet={theme.logoUrl} />
                  {/** biome-ignore lint/nursery/useImageSize: <just one required> */}
                  <img
                    alt="Logo"
                    className="h-8 w-auto bg-center bg-contain bg-no-repeat"
                    src={theme.logoUrl}
                  />
                </picture>
              ) : (
                <h2 className="font-semibold text-gray-900 text-xl">{title}</h2>
              )}

              <button
                aria-label="Fechar modal"
                className="rounded-md bg-transparent p-2 focus:outline-none focus:ring-2 focus:ring-offset-2"
                onClick={onClose}
                type="button"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <title>Fechar modal</title>
                  <path
                    d="M6 18L18 6M6 6l12 12"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                  />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="max-h-[calc(90vh-80px)] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
