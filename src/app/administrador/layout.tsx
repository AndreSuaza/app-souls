import {
  Sidebar,
  TopMenu,
  LoadingOverlay,
  ToastContainer,
  TournamentSidebar,
  ConfirmationModalHost,
  Footer,
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
      <TopMenu />
      <Sidebar />
      <div className="flex min-h-screen bg-gray-100">
        <LoadingOverlay />
        <ToastContainer />
        <TournamentSidebar />

        <div className="flex-1 px-4 py-2 lg:px-8 lg:py-3 overflow-visible mb-4">
          {children}
        </div>
      </div>
      <Footer />
      <ConfirmationModalHost />
    </>
  );
}
