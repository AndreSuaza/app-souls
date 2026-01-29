import {
  ConfirmationModalHost,
  Footer,
  LoadingOverlay,
  Sidebar,
  TopMenu,
  ToastContainer,
} from "@/components";
import moment from "moment";
import "moment/locale/es";

export default function SixLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  moment.locale("es");
  return (
    <>
      <main className="">
        <ConfirmationModalHost />
        <ToastContainer />
        <LoadingOverlay />
        <TopMenu />
        <Sidebar />
        <div className="px-0">{children}</div>
      </main>
      <Footer />
    </>
  );
}
