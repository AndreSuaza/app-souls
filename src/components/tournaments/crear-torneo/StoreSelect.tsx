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
  stores: { id: string; name: string }[];
};

export const StoreSelect = <T extends FieldValues>({
  register,
  errors,
  name,
  stores,
}: Props<T>) => {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
        Tienda
      </label>

      <select
        className={clsx(
          "w-full rounded-lg border border-slate-200 bg-white p-2 text-slate-900 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white",
          {
            "border-red-500": errors[name],
          }
        )}
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
      </select>

      {errors[name] && (
        <div className="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
          <MdError size={14} />
          <span>{errors[name]?.message as string}</span>
        </div>
      )}
    </div>
  );
};
