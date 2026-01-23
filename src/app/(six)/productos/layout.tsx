import moment from "moment";
import "moment/locale/es";
import { ProductsLayoutBar } from "@/components/productos/layout/ProductsLayoutBar";

export default function SixLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  moment.locale("es");
  return (
    <>
      <ProductsLayoutBar />

      {children}
    </>
  );
}
