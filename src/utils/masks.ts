// Utilitários para máscaras e formatação de campos
export const masks = {
  cpf: (value: string): string => {
    return value
      .replace(/\D/g, "") // Remove tudo que não é dígito
      .replace(/(\d{3})(\d)/, "$1.$2") // 000.000.000-00
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1"); // Limita a 11 dígitos
  },

  phone: (value: string): string => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")   // (00)
      .replace(/(\d{5})(\d)/, "$1-$2")     // 00000-0000
      .replace(/(-\d{4})\d+?$/, "$1");     // Limita a 4 dígitos finais
  },

  cep: (value: string): string => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2") // 00000-000
      .replace(/(-\d{3})\d+?$/, "$1");
  },

  cardNumber: (value: string): string => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{4})(\d)/, "$1 $2") // 0000 0000 0000 0000
      .replace(/(\d{4}) (\d{4})(\d)/, "$1 $2 $3")
      .replace(/(\d{4}) (\d{4}) (\d{4})(\d)/, "$1 $2 $3 $4")
      .replace(/( \d{4})\d+?$/, "$1");
  },

  expiryDate: (value: string): string => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2") // MM/AAAA
      .replace(/(\/\d{4})\d+?$/, "$1");
  },

  cvv: (value: string): string => {
    return value.replace(/\D/g, "").slice(0, 4);
  },

  currency: (value: number): string => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  },

  date: (value: string): string => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2") // DD/MM/AAAA
      .replace(/(\d{2})\/(\d{2})(\d)/, "$1/$2/$3")
      .replace(/(\/\d{4})\d+?$/, "$1");
  },
};

// Detecta a bandeira do cartão pelo número
export const getCardBrand = (cardNumber: string): string => {
  const cleanNumber = cardNumber.replace(/\D/g, "");

  if (/^4/.test(cleanNumber)) {
    return "visa";
  }

  if (/^5[1-5]/.test(cleanNumber) || /^2[2-7]/.test(cleanNumber)) {
    return "mastercard";
  }

  if (/^3[47]/.test(cleanNumber)) {
    return "amex";
  }

  if (/^6(?:011|5)/.test(cleanNumber)) {
    return "discover";
  }

  if (/^35/.test(cleanNumber)) {
    return "jcb";
  }

  return "unknown";
};

// Remove formatação de campos
export const cleanValue = (value: string): string => {
  return value.replace(/\D/g, "");
};

// Aplica máscara dinamicamente
export const applyMask = (
  value: string,
  maskType: keyof typeof masks
): string => {
  if (maskType === "currency") {
    const numValue = Number.parseFloat(value) || 0;
    return masks.currency(numValue);
  }

  return masks[maskType](value);
};

// Valida se o campo está completamente preenchido
export const isFieldComplete = (
  value: string,
  maskType: keyof typeof masks
): boolean => {
  const expectedLengths = {
    cpf: 14, // 000.000.000-00
    phone: 15, // (00) 00000-0000
    cep: 9, // 00000-000
    cardNumber: 19, // 0000 0000 0000 0000
    expiryDate: 7, // MM/AA
    cvv: 3, // 000 ou 0000
    date: 10, // DD/MM/AAAA
    currency: 0, // Variável
  };

  if (maskType === "cvv") {
    return value.length >= 3 && value.length <= 4;
  }

  if (maskType === "currency") {
    return Number.parseFloat(value) > 0;
  }

  return value.length === expectedLengths[maskType];
};
