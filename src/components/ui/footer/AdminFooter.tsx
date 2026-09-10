import { ThemeModeToggle } from "@/components/ui/theme/ThemeModeToggle";

export const AdminFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 dark:border-tournament-dark-border bg-white dark:bg-tournament-dark-surface">
      <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center gap-2 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center gap-2">
          <p className="text-center text-xs text-slate-500 dark:text-slate-400 sm:text-sm">
            &copy; {currentYear} Souls In Xtinction. Todos los derechos
            reservados.
          </p>
          <ThemeModeToggle />
        </div>
      </div>
    </footer>
  );
};
