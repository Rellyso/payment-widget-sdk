import { z } from "zod";

// Constantes de validação
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 100;
const MAX_STREET_LENGTH = 200;
const MAX_COMPLEMENT_LENGTH = 100;
const MAX_NEIGHBORHOOD_LENGTH = 100;
const MAX_CITY_LENGTH = 100;
const MAX_CARDHOLDER_NAME_LENGTH = 50;
const MAX_NUMBER_LENGTH = 10;
const MAX_INSTALLMENTS = 12;
const MIN_AGE = 18;
const CPF_DIGIT_COUNT_FIRST = 9;
const DECIMAL_BASE = 10;
const MIN_PASSWORD_LENGTH = 8;
const PHONE_CODE_LENGTH = 6;

// Validações customizadas - Regex definidos no escopo superior
const PHONE_REGEX = /^\(\d{2}\) \d{4,5}-\d{4}$/;
const CEP_REGEX = /^\d{5}-\d{3}$/;
const CARD_NUMBER_REGEX = /^\d{4} \d{4} \d{4} \d{4}$/;
const EXPIRY_DATE_REGEX = /^(0[1-9]|1[0-2])\/\d{4}$/;
const CVV_REGEX = /^\d{3,4}$/;
const LETTERS_ONLY_REGEX = /^[a-zA-ZÀ-ÿ\s]+$/;
const STATE_REGEX = /^[A-Z]{2}$/;
const DATE_FORMAT_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;
const PIXEL_VALUE_REGEX = /^\d+px$/;
const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
const PASSWORD_LOWERCASE_REGEX = /[a-z]/;
const PASSWORD_NUMBER_REGEX = /[0-9]/;
const PASSWORD_SPECIAL_CHAR_REGEX = /[^a-zA-Z0-9]/;
const PASSWORD_NO_SPACES_REGEX = /^[^\s]+$/;

// Schema de configuração do widget
export const widgetConfigSchema = z.object({
  orderId: z.string().min(1, "Order ID é obrigatório"),
  primaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor primária deve ser um hex válido")
    .optional(),
  secondaryColor: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Cor secundária deve ser um hex válido")
    .optional(),
  logoUrl: z.string().url("URL do logo deve ser válida").optional(),
  borderRadius: z
    .union([
      z.literal("sm"),
      z.literal("md"),
      z.literal("lg"),
      z.literal("full"),
      z
        .string()
        .regex(
          PIXEL_VALUE_REGEX,
          "Border radius deve ser sm|md|lg|full ou valor em px"
        ),
    ])
    .optional(),
  locale: z.literal("pt-BR").optional(),
  environment: z.enum(["staging", "production"]).optional(),
  apiBaseUrl: z.string().url("URL da API deve ser válida").optional(),
  autoOpen: z.boolean().optional(),
});

// Schema para análise de crédito
export const creditAnalysisSchema = z.object({
  firstName: z.string().min(1, { message: 'O nome é obrigatório' }),
  lastName: z.string().min(1, { message: 'O sobrenome é obrigatório' }),
  phone: z
    .string()
    .regex(PHONE_REGEX, "Telefone deve estar no formato (00) 00000-0000"),
  birthDate: z
    .string()
    .regex(DATE_FORMAT_REGEX, "Data deve estar no formato DD/MM/AAAA")
    .refine(validateAge, "Você deve ter pelo menos 18 anos"),
  email: z
    .string()
    .email("Email deve ser válido")
    .max(MAX_EMAIL_LENGTH, "Email deve ter no máximo 100 caracteres"),
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, "No mínimo 8 caracteres")
    .regex(
      PASSWORD_UPPERCASE_REGEX,
      "Deve conter pelo menos uma letra maiúscula"
    )
    .regex(
      PASSWORD_LOWERCASE_REGEX,
      "Deve conter pelo menos uma letra minúscula"
    )
    .regex(PASSWORD_NUMBER_REGEX, "Deve conter pelo menos um número")
    .regex(PASSWORD_NO_SPACES_REGEX, "Não deve conter espaços")
    .regex(
      PASSWORD_SPECIAL_CHAR_REGEX,
      "Deve conter ao menos um caractere especial"
    ),
  confirmPassword: z.string(),
});

// Schema para endereço
export const addressSchema = z.object({
  cep: z.string().regex(CEP_REGEX, "CEP deve estar no formato 00000-000"),
  street: z
    .string()
    .min(2, "Rua deve ter pelo menos 2 caracteres")
    .max(MAX_STREET_LENGTH, "Rua deve ter no máximo 200 caracteres"),
  number: z
    .string()
    .min(1, "Número é obrigatório")
    .max(MAX_NUMBER_LENGTH, "Número deve ter no máximo 10 caracteres"),
  complement: z
    .string()
    .max(MAX_COMPLEMENT_LENGTH, "Complemento deve ter no máximo 100 caracteres")
    .optional(),
  neighborhood: z
    .string()
    .min(2, "Bairro deve ter pelo menos 2 caracteres")
    .max(MAX_NEIGHBORHOOD_LENGTH, "Bairro deve ter no máximo 100 caracteres"),
  city: z
    .string()
    .min(2, "Cidade deve ter pelo menos 2 caracteres")
    .max(MAX_CITY_LENGTH, "Cidade deve ter no máximo 100 caracteres"),
  state: z
    .string()
    .length(2, "Estado deve ter exatamente 2 caracteres")
    .regex(STATE_REGEX, "Estado deve ser a sigla em maiúsculas"),
});

// Schema para dados de pagamento
export const paymentSchema = z.object({
  cardNumber: z
    .string()
    .regex(
      CARD_NUMBER_REGEX,
      "Número do cartão deve estar no formato 0000 0000 0000 0000"
    )
    .refine(validateCardNumber, "Número do cartão inválido"),
  cardholderName: z
    .string()
    .min(2, "Nome do portador deve ter pelo menos 2 caracteres")
    .max(
      MAX_CARDHOLDER_NAME_LENGTH,
      "Nome do portador deve ter no máximo 50 caracteres"
    )
    .regex(LETTERS_ONLY_REGEX, "Nome deve conter apenas letras e espaços"),
  expiryDate: z
    .string()
    .regex(EXPIRY_DATE_REGEX, "Data deve estar no formato mm/aaaa")
    .refine(validateExpiryDate, "Data de expiração inválida ou vencida"),
  cvv: z.string().regex(CVV_REGEX, "CVV deve ter 3 ou 4 dígitos"),
  installments: z
    .number()
    .int("Parcelas deve ser um número inteiro")
    .min(1, "Número mínimo de parcelas é 1")
    .max(MAX_INSTALLMENTS, "Número máximo de parcelas é 12"),
});

export const phoneCodeSchema = z.object({
  phoneCode: z.string({
    message: "Informe o código recebido via SMS",
  })
  .length(PHONE_CODE_LENGTH, "O código deve ter 6 dígitos"),
})

// Funções de validação customizadas
function validateAge(dateString: string): boolean {
  const [day, month, year] = dateString.split("/").map(Number);
  const birthDate = new Date(year, month - 1, day);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= MIN_AGE;
}

function validateCardNumber(cardNumber: string): boolean {
  const cleanNumber = cardNumber.replace(/\s/g, "");

  // Algoritmo de Luhn
  let sum = 0;
  const length = cleanNumber.length;

  for (let i = 0; i < length; i++) {
    let digit = Number.parseInt(
      cleanNumber.charAt(length - 1 - i),
      DECIMAL_BASE
    );

    // Dobra os dígitos em posições pares (contando da direita, começando em 0)
    if (i % 2 === 1) {
      digit *= 2;
      // Se o resultado tem dois dígitos, subtrai 9
      if (digit > CPF_DIGIT_COUNT_FIRST) {
        digit -= CPF_DIGIT_COUNT_FIRST;
      }
    }

    sum += digit;
  }

  return sum % DECIMAL_BASE === 0;
}

function validateExpiryDate(dateString: string): boolean {
  const [month, year] = dateString.split("/").map(Number);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const MIN_MONTH = 1;
  const MAX_MONTH = 12;

  // Verifica se o mês é válido
  if (month < MIN_MONTH || month > MAX_MONTH) {
    return false;
  }

  // Verifica se não está vencido
  if (year < currentYear || (year === currentYear && month < currentMonth)) {
    return false;
  }

  return true;
}

export type CreditAnalysisFormData = z.infer<typeof creditAnalysisSchema>;
export type AddressFormData = z.infer<typeof addressSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
export type PhoneCodeFormData = z.infer<typeof phoneCodeSchema>;
