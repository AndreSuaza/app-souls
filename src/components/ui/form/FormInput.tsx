"use client";

import { forwardRef } from "react";
import clsx from "clsx";

type Props = React.ComponentPropsWithoutRef<"input"> & {
  hasError?: boolean;
};

export const FormInput = forwardRef<HTMLInputElement, Props>(
  ({ className, hasError, ...props }, ref) => (
    <input
      ref={ref}
      className={clsx(
        "w-full rounded-lg border border-tournament-dark-accent bg-white p-2 text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white dark:placeholder:text-slate-500",
        hasError && "border-red-500",
        className,
      )}
      {...props}
    />
  ),
);

FormInput.displayName = "FormInput";
