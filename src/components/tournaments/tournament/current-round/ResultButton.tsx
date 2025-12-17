"use client";

type Variant = "p1" | "draw" | "p2";

interface Props {
  label: string;
  active: boolean;
  onClick: () => void;
  variant: Variant;
  readOnly?: boolean;
}

export const ResultButton = ({
  label,
  active,
  onClick,
  variant,
  readOnly,
}: Props) => {
  const base =
    "px-3 py-1 rounded-md text-sm font-semibold select-none transition";

  const cursor = readOnly ? "cursor-default" : "cursor-pointer";

  // Define el estilo del boton
  const stylesByVariant: Record<Variant, { active: string; idle: string }> = {
    p1: {
      active: "bg-blue-600 text-white",
      idle: readOnly
        ? "bg-gray-100 text-gray-400"
        : "bg-gray-100 hover:bg-blue-100 hover:text-blue-700",
    },
    draw: {
      active: "bg-yellow-500 text-white",
      idle: readOnly
        ? "bg-gray-100 text-gray-400"
        : "bg-gray-100 hover:bg-yellow-100 hover:text-yellow-700",
    },
    p2: {
      active: "bg-red-600 text-white",
      idle: readOnly
        ? "bg-gray-100 text-gray-400"
        : "bg-gray-100 hover:bg-red-100 hover:text-red-700",
    },
  };

  return (
    <button
      onClick={readOnly ? undefined : onClick}
      className={`${base} ${cursor} ${
        active ? stylesByVariant[variant].active : stylesByVariant[variant].idle
      }`}
    >
      {label}
    </button>
  );
};
