import Link from "next/link"
import { IoRocketSharp } from "react-icons/io5"

export const PageNotFound = () => {
  return (
      <div className="bg-[url(/portal.webp)] bg-black bg-center bg-no-repeat grid grid-cols-1 min-h-[600px]">
        <div className="w-full px-4 md:w-2/4 m-auto text-white text-center">
          <h1 className="text-6xl -mt-10 font-bold uppercase">Error 404 Página Perdida</h1>
          <p className="text-xl mt-6 font-semibold">Parece que esta página ha caído en la extinción. Pero no te preocupes, aún puedes regresar y seguir explorando el mundo de Souls In Xtinction.</p>
          <Link href={"/"}>
            <button className="btn-primary mt-6 flex flex-row mx-auto"><IoRocketSharp className="w-6 h-6 mr-2" />        Volver al inicio</button>
          </Link>
        </div>
       
      </div>
    )
}
