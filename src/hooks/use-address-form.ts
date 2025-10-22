import { useState } from "react";
import { type AddressFormData, addressSchema } from "@/schemas/validation";
import { useWidgetForm } from "./use-widget-form";

const INVALID_ZIP_CODE_ERROR =
  "CEP não encontrado. Verifique o CEP e preencha novamente ou digite o endereço manualmente.";

const ZIP_CODE_MAX_LENGTH = 8;

export function useAddressForm() {
  const [isEditable, setIsEditable] = useState(false);
  const [zipCodeNotFoundMessage, setzipCodeNotFoundMessage] = useState<
    string | undefined
  >(undefined);
  const form = useWidgetForm<AddressFormData>({
    schema: addressSchema,
    onSubmit: async (data) => {
      // Lógica de submissão do formulário
    },
  });

  const setInvalidZipCodeError = () =>
    setzipCodeNotFoundMessage(INVALID_ZIP_CODE_ERROR);

  const fetchAddress = async (zipCode: string) => {
    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${zipCode}/json/`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();
      if (data.erro) {
        setInvalidZipCodeError();
      } else {
        form.clearErrors("cep");
        setzipCodeNotFoundMessage(undefined);
      }
      return data;
    } catch {
      setInvalidZipCodeError();
    }
  };

  const getAddressByZipCode = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const zipCode = e.target.value.replace(/\D/g, "");
    const isValidZipCode = zipCode.length === ZIP_CODE_MAX_LENGTH;
    if (isValidZipCode) {
      const address = await fetchAddress(zipCode);
      form.setValue("street", address.logradouro || "", {
        shouldValidate: true,
        shouldDirty: true,
      });
      form.setValue("city", address.localidade || "", {
        shouldValidate: true,
        shouldDirty: true,
      });
      form.setValue("state", address.uf || "", {
        shouldValidate: true,
        shouldDirty: true,
      });
      form.setValue("neighborhood", address.bairro || "", {
        shouldValidate: true,
        shouldDirty: true,
      });

      if (!(address.logradouro || address.bairro)) {
        setIsEditable(true);
      }
    }
  };

  return {
    form,
    getAddressByZipCode,
    zipCodeNotFoundMessage,
    isEditable,
  };
}
