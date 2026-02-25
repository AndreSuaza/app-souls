"use client";

import {
  FieldErrors,
  FieldValues,
  Path,
  UseFormRegister,
} from "react-hook-form";
import { FormField, FormSelect } from "@/components/ui/form";

// Permite usar el componente con cualquier formulario (tipado para react-hook-form)
type Props<T extends FieldValues> = {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  name: Path<T>; // Garantiza que name sea una key válida
  tournamentTypes: { id: string; name: string }[];
};

export const TournamentTypeSelect = <T extends FieldValues>({
  register,
  errors,
  name,
  tournamentTypes,
}: Props<T>) => {
  const selectId = `${String(name)}-type`;
  const errorMessage = errors[name]?.message as string | undefined;

  return (
    <FormField label="Tipo de torneo" labelFor={selectId} error={errorMessage}>
      <FormSelect
        id={selectId}
        hasError={!!errors[name]}
        {...register(name, {
          required: "Debe seleccionar un tipo de torneo",
        })}
      >
        <option value="">Selecciona un tipo</option>

        {tournamentTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </FormSelect>
    </FormField>
  );
};
