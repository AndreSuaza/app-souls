import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminFooter } from "@/components/ui/footer/AdminFooter";
import { LoadingOverlay } from "@/components/ui/loading/LoadingOverlay";
import { ConfirmationModalHost } from "@/components/ui/modal/ConfirmationModalHost";
import { Sidebar } from "@/components/ui/sidebar/Sidebar";
import { ToastContainer } from "@/components/ui/toast/ToastContainer";
import { AdminTopMenu } from "@/components/ui/top-menu/AdminTopMenu";
import { TopMenu } from "@/components/ui/top-menu/TopMenu";
import moment from "moment";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Administrador | Souls In Xtinction TCG",
  description:
    "Panel de administracion de Souls In Xtinction TCG para gestionar noticias, torneos, productos, tiendas y mazos del sistema.",
};

export default function TournamentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  moment.locale("es");
  return (
    <>
      <div className="hidden md:block">
        <TopMenu />
      </div>
      <AdminTopMenu />
      <Sidebar />
      <div className="flex min-h-screen bg-slate-50 text-slate-900 dark:bg-tournament-dark-bg dark:text-white">
        <LoadingOverlay />
        <ToastContainer />
        <AdminSidebar />

        <div className="min-w-0 flex-1 overflow-x-hidden px-4 py-6 lg:px-8 mb-4">
          {children}
        </div>
      </div>
      <AdminFooter />
      <ConfirmationModalHost />
    </>
  );
}
