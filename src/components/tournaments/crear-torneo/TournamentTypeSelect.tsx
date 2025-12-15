"use client";

import clsx from "clsx";
import { MdError } from "react-icons/md";
import {
  FieldErrors,
  UseFormRegister,
  FieldValues,
  Path,
} from "react-hook-form";

type Props<T extends FieldValues> = {
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  name: Path<T>;
  tournamentTypes: { id: string; name: string }[];
};

export const TournamentTypeSelect = <T extends FieldValues>({
  register,
  errors,
  name,
  tournamentTypes,
}: Props<T>) => {
  return (
    <div>
      <label className="block text-sm font-medium">Tipo de torneo</label>

      <select
        className={clsx("w-full border rounded p-2", {
          "border-red-500": errors[name],
        })}
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
      </select>

      {errors[name] && (
        <div className="flex items-center gap-1 text-red-500 text-xs mt-1">
          <MdError size={14} />
          <span>{errors[name]?.message as string}</span>
        </div>
      )}
    </div>
  );
};
