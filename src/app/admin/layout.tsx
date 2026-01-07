import {
  Sidebar,
  TopMenu,
  AdminTopMenu,
  LoadingOverlay,
  ToastContainer,
  TournamentSidebar,
  ConfirmationModalHost,
  AdminFooter,
} from "@/components";
import moment from "moment";

export default function TournamentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  moment.locale("es");
  return (
    <>
      <div className="hidden md:block">
        <TopMenu variant="admin" />
      </div>
      <AdminTopMenu />
      <Sidebar variant="admin" />
      <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-tournament-dark-bg dark:text-white">
        <LoadingOverlay />
        <ToastContainer />
        <TournamentSidebar />

        <div className="flex-1 px-4 py-6 lg:px-8 overflow-visible mb-4">
          {children}
        </div>
      </div>
      <AdminFooter />
      <ConfirmationModalHost />
    </>
  );
}
