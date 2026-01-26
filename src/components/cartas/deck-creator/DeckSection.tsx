import type { ReactNode } from "react";
import clsx from "clsx";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";

interface Props {
  title: string;
  count: number;
  isOpen: boolean;
  ariaLabel: string;
  onToggle: () => void;
  containerClassName: string;
  headerClassName: string;
  titleClassName: string;
  chevronClassName: string;
  countClassName: string;
  titleWrapperClassName: string;
  bodyClassName: string;
  children: ReactNode;
}

export function DeckSection({
  title,
  count,
  isOpen,
  ariaLabel,
  onToggle,
  containerClassName,
  headerClassName,
  titleClassName,
  chevronClassName,
  countClassName,
  titleWrapperClassName,
  bodyClassName,
  children,
}: Props) {
  return (
    <section className={containerClassName}>
      <button
        type="button"
        onClick={onToggle}
        className={headerClassName}
        aria-label={ariaLabel}
      >
        <div className={titleWrapperClassName}>
          <span className={clsx("shrink-0", titleClassName)}>{title}</span>
          <span className={countClassName}>{count}</span>
        </div>
        {isOpen ? (
          <IoChevronUpOutline
            className={clsx("absolute right-2 top-2 h-4 w-4", chevronClassName)}
          />
        ) : (
          <IoChevronDownOutline
            className={clsx("absolute right-2 top-2 h-4 w-4", chevronClassName)}
          />
        )}
      </button>

      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
