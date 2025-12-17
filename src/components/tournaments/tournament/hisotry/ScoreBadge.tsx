"use client";

interface Props {
  value: string;
}

export const ScoreBadge = ({ value }: Props) => {
  return (
    <div className="px-3 py-1 rounded-md bg-gray-100 text-sm font-semibold text-gray-700">
      {value}
    </div>
  );
};
