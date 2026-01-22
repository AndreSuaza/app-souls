import type { ReactNode } from "react";
import { ConfirmationModalHost, Sidebar, TopMenu } from "@/components";

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <main className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-tournament-dark-bg dark:via-tournament-dark-muted dark:to-tournament-dark-bg">
      <TopMenu />
      <Sidebar />
      <div className="h-[calc(100vh-4.5rem)] min-h-0">{children}</div>
      <ConfirmationModalHost />
    </main>
  );
}
