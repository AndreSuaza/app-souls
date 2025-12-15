import {
  Sidebar,
  TopMenu,
  LoadingOverlay,
  ToastContainer,
  TournamentSidebar,
  ConfirmationModalHost,
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

        <div className="flex-1 p-4 md:p-8">{children}</div>
      </div>

      <ConfirmationModalHost />
    </>
  );
}
