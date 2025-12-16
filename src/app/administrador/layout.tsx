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

        <div className="flex-1 px-4 py-2 md:px-8 md:py-3 overflow-visible">
          {children}
        </div>
      </div>
      <Footer />
      <ConfirmationModalHost />
    </>
  );
}
