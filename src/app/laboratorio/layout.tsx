import type { ReactNode } from "react";
import { Footer, Sidebar, TopMenu } from "@/components";

interface Props {
  children: ReactNode;
}

export default function Layout({ children }: Props) {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-tournament-dark-bg dark:via-tournament-dark-muted dark:to-tournament-dark-bg">
      <TopMenu />
      <Sidebar />
      <div className="h-screen min-h-0">{children}</div>
      <Footer />
    </main>
  );
}
