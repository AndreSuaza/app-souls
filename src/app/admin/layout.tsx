import {
  Footer,
  Sidebar,
  TopMenu,
  LoadingOverlay,
  ToastContainer,
} from "@/components";
import moment from "moment";

export default function SixLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  moment.locale("es");
  return (
    <>
      <main className="">
        <LoadingOverlay />
        <ToastContainer />
        <TopMenu />
        <Sidebar />
        <div className="px-0">{children}</div>
      </main>
      <Footer />
    </>
  );
}
