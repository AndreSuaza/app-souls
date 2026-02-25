"use client";

import { forwardRef } from "react";
import clsx from "clsx";

type Props = React.ComponentPropsWithoutRef<"select"> & {
  hasError?: boolean;
};

export const FormSelect = forwardRef<HTMLSelectElement, Props>(
  ({ className, hasError, ...props }, ref) => (
    <select
      ref={ref}
      className={clsx(
        "h-10 w-full rounded-lg border border-tournament-dark-accent bg-white px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-purple-600 focus:outline-none focus:ring-1 focus:ring-purple-600/30 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-white",
        hasError && "border-red-500 focus:border-red-500 focus:ring-red-500/30",
        className,
      )}
      {...props}
    />
  ),
);

FormSelect.displayName = "FormSelect";
