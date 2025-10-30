import { Footer, Sidebar, TopMenu } from "@/components";
import moment from 'moment';

export default function SixLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  moment.locale('es');
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
