// Utilitário de logging que respeita o environment
export const logger = {
  warn: (message: string, ...args: unknown[]): void => {
    if (process.env.NODE_ENV !== "production") {
      // biome-ignore lint: logging necessário em desenvolvimento
      console.warn(`[PaymentWidget] ${message}`, ...args);
    }
  },

  error: (message: string, ...args: unknown[]): void => {
    if (process.env.NODE_ENV !== "production") {
      // biome-ignore lint: logging necessário em desenvolvimento
      console.error(`[PaymentWidget] ${message}`, ...args);
    }
  },

  info: (message: string, ...args: unknown[]): void => {
    if (process.env.NODE_ENV !== "production") {
      // biome-ignore lint: logging necessário em desenvolvimento
      console.info(`[PaymentWidget] ${message}`, ...args);
    }
  },
};
