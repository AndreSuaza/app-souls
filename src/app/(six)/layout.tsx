import { Sidebar, TopMenu } from "@/components";
import { Footer } from "@/components/ui/footer/footer";

export default function SixLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
    <main className="">
        <TopMenu/>
        <Sidebar/>
        <div className="px-0">
          { children }
        </div>
    </main>
    <Footer/>
  </>
  );
}
