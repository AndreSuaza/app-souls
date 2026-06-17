"use client";

type EventDetailTimelineNavItem = {
  href: string;
  label: string;
};

type Props = {
  items: EventDetailTimelineNavItem[];
};

const easeOutCubic = (value: number) => 1 - Math.pow(1 - value, 3);

const getVisibleTarget = (href: string) => {
  const id = href.startsWith("#") ? href.slice(1) : href;
  const targets = Array.from(
    document.querySelectorAll<HTMLElement>(`[id="${id}"]`),
  );

  return (
    targets.find((target) => {
      const styles = window.getComputedStyle(target);
      return (
        target.getClientRects().length > 0 &&
        styles.display !== "none" &&
        styles.visibility !== "hidden"
      );
    }) ?? targets[0]
  );
};

const scrollToSection = (href: string) => {
  const target = getVisibleTarget(href);
  if (!target) return;

  const startTop = window.scrollY;
  const targetTop = target.getBoundingClientRect().top + startTop - 112;
  const distance = targetTop - startTop;
  const duration = Math.min(900, Math.max(420, Math.abs(distance) * 0.45));
  const startedAt = window.performance.now();

  const animateScroll = (timestamp: number) => {
    const progress = Math.min((timestamp - startedAt) / duration, 1);
    const nextTop = startTop + distance * easeOutCubic(progress);

    window.scrollTo(0, nextTop);

    if (progress < 1) {
      window.requestAnimationFrame(animateScroll);
      return;
    }

    window.history.replaceState(null, "", href);
  };

  window.requestAnimationFrame(animateScroll);
};

export const EventDetailTimelineNav = ({ items }: Props) => {
  return (
    <nav className="relative z-10 flex flex-col">
      {items.map((item, index) => {
        const active = index === 0;

        return (
          <button
            key={item.href}
            type="button"
            onClick={() => scrollToSection(item.href)}
            className="group relative flex h-16 items-start justify-center"
            aria-label={`Ir a ${item.label}`}
          >
            <span
              className={`mt-1 h-3.5 w-3.5 rounded-full border-2 transition group-hover:scale-125 ${
                active
                  ? "border-purple-500 bg-purple-500 shadow-[0_0_18px_rgba(168,85,247,0.55)] dark:border-purple-200 dark:bg-purple-200"
                  : "border-slate-300 bg-white group-hover:border-purple-500 dark:border-tournament-dark-accent dark:bg-[#0b0b0c] dark:group-hover:border-purple-200"
              }`}
            />
            <span className="pointer-events-none absolute left-9 top-0 whitespace-nowrap rounded-sm border border-slate-200 bg-white px-2 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 opacity-0 shadow-sm transition group-hover:opacity-100 dark:border-tournament-dark-border dark:bg-tournament-dark-surface dark:text-purple-100">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
