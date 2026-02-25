"use client";

import {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import { FormField, FormSelect } from "@/components/ui/form";

type Props<T extends FieldValues> = {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  name: Path<T>;
  stores: { id: string; name: string }[];
};

export const StoreSelect = <T extends FieldValues>({
  register,
  errors,
  name,
  stores,
}: Props<T>) => {
  const selectId = `${String(name)}-store`;
  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <FormField label="Tienda" labelFor={selectId} error={errorMessage}>
      <FormSelect
        id={selectId}
        hasError={!!errors[name]}
        {...register(name, {
          required: "Debe seleccionar una tienda",
        })}
      >
        <option value="">Selecciona una tienda</option>

        {stores.map((store) => (
          <option key={store.id} value={store.id}>
            {store.name}
          </option>
        ))}
      </FormSelect>
    </FormField>
  );
};
