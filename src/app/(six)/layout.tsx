import { Sidebar, TopMenu } from "@/components";
import { Footer } from "@/components/ui/footer/footer";
import moment from 'moment';
import 'moment/locale/es';

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
