import moment from "moment";
import "moment/locale/es";
import { ConfirmationModalHost, Sidebar, TopMenu } from "@/components";

export default function SixLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  moment.locale("es");
  return (
    <main className="flex h-screen flex-col overflow-hidden bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-tournament-dark-bg dark:via-tournament-dark-muted dark:to-tournament-dark-bg">
      <TopMenu />
      <Sidebar />
      <div className="h-[calc(100vh-4.5rem)] min-h-0">{children}</div>
      <ConfirmationModalHost />
    </main>
  );
}
