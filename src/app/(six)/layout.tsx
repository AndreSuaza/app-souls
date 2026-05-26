import { ConfirmationModalHost } from "@/components/ui/modal/ConfirmationModalHost";
import { Footer } from "@/components/ui/footer/footer";
import { LoadingOverlay } from "@/components/ui/loading/LoadingOverlay";
import { Sidebar } from "@/components/ui/sidebar/Sidebar";
import { TopMenu } from "@/components/ui/top-menu/TopMenu";
import { ToastContainer } from "@/components/ui/toast/ToastContainer";
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
