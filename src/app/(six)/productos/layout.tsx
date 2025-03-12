import { Sidebar, TopMenu } from "@/components";
import { Footer } from "@/components/ui/footer/footer";
import moment from 'moment';
import 'moment/locale/es';
import Link from "next/link";
import { IoLogoWhatsapp, IoStorefrontOutline } from "react-icons/io5";

export default function SixLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  moment.locale('es');
  return (
    <>
      <div className="bg-indigo-600 text-white text-center uppercase text-lg font-bold py-2">
        <div className="flex flex-row justify-center">
          <p className="mt-2">¿Dónde conseguirlo? </p>
          <Link href="/tiendas" >
          <button className="flex flex-row ml-6 px-2 py-1 border-2 rounded-lg hover:bg-yellow-600"><IoStorefrontOutline className='w-6 h-6 mr-1'/>Tiendas oficiales</button>
          </Link>
          <Link href="/tiendas" >
          <button className="flex flex-row ml-6 px-2 py-1 border-2 rounded-lg hover:bg-yellow-600"><IoLogoWhatsapp  className='w-6 h-6 mr-1'/>Escríbenos</button>
          </Link>
        </div> 
      </div>

      { children }
      

  </>
  );
}
