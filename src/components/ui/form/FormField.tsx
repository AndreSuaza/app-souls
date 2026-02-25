"use client";

import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { MdError } from "react-icons/md";
import { IoInformationCircleOutline } from "react-icons/io5";

type Props = {
  label?: string;
  labelFor?: string;
  tooltip?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  labelClassName?: string;
};

const FormFieldTooltip = ({ text }: { text: string }) => {
  const [isPinned, setIsPinned] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  // Muestra el mensaje si el usuario pasa el cursor o lo fija con click.
  const isOpen = isPinned || isHover;

  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      if (wrapperRef.current && !wrapperRef.current.contains(target)) {
        // Cierra el tooltip cuando el usuario interactúa fuera del componente.
        setIsPinned(false);
        setIsHover(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        aria-label="Ayuda del campo"
        onClick={() => setIsPinned((prev) => !prev)}
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-slate-400 transition hover:text-purple-600 dark:text-slate-500 dark:hover:text-purple-300"
      >
        <IoInformationCircleOutline className="h-4 w-4" />
      </button>
      {isOpen && (
        <div className="absolute left-0 top-full z-20 mt-2 w-60 rounded-md border border-tournament-dark-accent bg-white px-3 py-2 text-xs text-slate-600 shadow-lg dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-slate-200">
          {text}
        </div>
      )}
    </div>
  );
};

export const FormField = (props: Props) => {
  const { label, labelFor, tooltip, error, children, className, labelClassName } =
    props;
  const isRequired = Object.prototype.hasOwnProperty.call(props, "error");
  return (
    <div className={clsx("space-y-1", className)}>
      {label && (
        <div className="flex items-center gap-2">
          <label
            htmlFor={labelFor}
            className={clsx(
              "block text-sm font-medium text-slate-700 dark:text-slate-200",
              labelClassName,
            )}
          >
            {label}
            {isRequired && (
              <span
                className={clsx(
                  "ml-1",
                  error
                    ? "text-red-500 dark:text-red-400"
                    : "text-slate-700 dark:text-slate-200",
                )}
              >
                *
              </span>
            )}
          </label>
          {tooltip && <FormFieldTooltip text={tooltip} />}
        </div>
      )}

      {children}

      {error && (
        <div className="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
          <MdError size={14} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
