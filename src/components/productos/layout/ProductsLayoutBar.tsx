import Link from "next/link";
import { IoLogoWhatsapp, IoStorefrontOutline } from "react-icons/io5";

export function ProductsLayoutBar() {
  return (
    <div className="bg-indigo-600 text-white text-center uppercase text-lg font-bold py-2">
      <div className="flex flex-row justify-center">
        <p className="mt-1 mr-4">¿Dónde conseguirlo?</p>
        <Link href="/tiendas">
          <button className="flex mx-auto items-center ml-2 px-2 py-1 border-2 rounded-lg hover:bg-yellow-600">
            <IoStorefrontOutline className="w-6 h-6 md:mr-2" />
            <span className="hidden md:block">Tiendas oficiales</span>
          </button>
        </Link>
        <Link
          href="https://wa.me/573180726340?text=Hola%2C+me+gustar%C3%ADa+conocer+m%C3%A1s+de+sus+productos"
          target="_blank"
          rel="noreferrer"
        >
          <button className="flex flex-row ml-4 px-2 py-1 border-2 rounded-lg hover:bg-yellow-600">
            <IoLogoWhatsapp className="w-6 h-6 md:mr-1" />
            <span className="hidden md:block">Escríbenos</span>
          </button>
        </Link>
      </div>
    </div>
  );
}
