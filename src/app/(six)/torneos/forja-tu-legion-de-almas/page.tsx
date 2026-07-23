import { Map } from "@/components/map/Map";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { cardImageBlurDataURL } from "@/models/images.models";
import { toAssetUrl } from "@/utils/asset-path";

export const metadata: Metadata = {
  title: "Forja tu LegiÃ³n de Almas Torneo Souls In Xticition",
  description:
    "Vive la emociÃ³n de la competencia y el crecimiento de la comunidad en los torneos oficiales de Souls In Xtinction.",
  openGraph: {
    title: "Forja tu LegiÃ³n de Almas Torneo Souls In Xticition",
    description:
      "Vive la emociÃ³n de la competencia y el crecimiento de la comunidad en los torneos oficiales de Souls In Xtinction.",
    url: "https://soulsinxtinction.com/torneos/forja-tu-legion-de-almas",
    siteName: "Forja tu LegiÃ³n Souls In Xticition",
    images: [
      {
        url: "https://soulsinxtinction.com/tournaments/forja-tu-legion-de-almas.webp",
        width: 500,
        height: 500,
        alt: "Forja tu LegiÃ³n Souls In Xticition",
      },
    ],
    locale: "es_ES",
    type: "website",
  },
};

export default function Tournaments() {
  return (
    <>
      <div className="bg-[url(/tournaments/forja-tu-legion-de-almas.webp)] bg-cover bg-center h-[600px] w-full ">
        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="bg-black h-[600px] polygon bg-opacity-70 flex justify-center">
            <div className="text-white font-bold my-auto ml-6 md:w-2/3 uppercase md:pb-24">
              <h1 className="text-4xl md:text-6xl mb-2">
                Forja tu LegiÃ³n de Almas
              </h1>
              <p className="text-4xl mb-2">HIDDEN TCG STORE</p>
              <p className="mr-20 font-normal md:font-semibold">
                Vive la emociÃ³n de la competencia y el crecimiento de la
                comunidad en los torneos oficiales de Souls In Xtinction.{" "}
              </p>
            </div>
          </div>
        </div>
      </div>
      <article className="mx-4 lg:mx-40 grid md:grid-cols-3">
        <section className="md:col-span-2 my-10">
          <p>
            Este torneo estÃ¡ diseÃ±ado para fortalecer la comunidad invitando a
            nuevos jugadores a unirse a la batalla.
          </p>
          <h3 className="text-3xl font-bold my-4">Â¿CÃ³mo participar?</h3>
          <p className="mb-4">
            Los jugadores activos pueden invitar nuevos jugadores y recibir
            recompensas por cada persona que traigan:
          </p>

          <h3 className="text-3xl font-bold mb-4">
            Recompensas para jugadores activos
          </h3>
          <p className="mb-4">
            Dependiendo del nÃºmero de nuevos jugadores que invites, recibirÃ¡s
            sobres de recompensa:
          </p>
          <ul className="mb-6">
            <li className="ml-4">
              <b>1 </b>jugador nuevo â†’ 1 sobre maestro.
            </li>
            <li className="ml-4">
              <b>3 </b>jugadores nuevos â†’ 1 sobre maestro + 1 sobre de
              expansiÃ³n.
            </li>
            <li className="ml-4">
              <b>5 </b>jugadores nuevos â†’ 2 sobres maestros + 2 sobres de
              expansiÃ³n + 1 sobre de circuito.
            </li>
            <li className="ml-4">
              <b>10 </b>jugadores nuevos â†’ 3 sobres maestros + 3 sobres de
              expansiÃ³n + 3 sobres de circuito.
            </li>
          </ul>
          <p className="mb-6 font-semibold">
            Â¿Eres nuevo y quieres conocer Souls In Xtinction? Puedes inscribirte
            directamente y recibirÃ¡s 1 sobre maestro solo por participar.
          </p>

          <div className="">
            <p className="mb-6">
              <strong>Recompensa especial:</strong> El jugador que traiga mÃ¡s
              nuevos jugadores recibirÃ¡ una carta Escudos gemelos foil
              promocional exclusiva.
            </p>
            <Image
              src={toAssetUrl("/cards/IMP-PC-011-6072.webp")}
              alt={"Imagen Cartas Escudos Gemelos Arte Alterno"}
              title="Imagen Cartas Escudos Gemelos Arte Alterno"
              placeholder="blur"
              blurDataURL={cardImageBlurDataURL}
              className="rounded-lg mx-auto mb-10"
              width={300}
              height={718}
            />
          </div>

          <h3 className="text-3xl font-bold mb-4">
            Beneficios para nuevos jugadores
          </h3>
          <ul className="mb-4">
            <li className="font-semibold">
              Un mazo de demostraciÃ³n para aprender a jugar.
            </li>
            <li className="font-semibold">
              Acceso a un torneo exclusivo en formato suizo con un mazo
              estructurado como premio para el ganador.
            </li>
          </ul>
          <div className="text-center mb-6">
            <Link href={"/productos/mazo-demostracion-2"}>
              <Image
                src={`/products/MD2.webp`}
                alt={"Imagen Mazo demostracion 2.0"}
                className="rounded-lg shadow-md mx-auto mb-2"
                width={300}
                height={500}
                // onMouseEnter={ () => setDisplayImage(`${product.images[0].name}.webp`) }
                // onMouseLeave={ () => setDisplayImage(`${product.images[1].name}.webp`) }
              />
              <p className="text-indigo-600">Mazo demostracion 2.0</p>
            </Link>
          </div>

          <p className="mb-4">
            <strong>Nota:</strong> Hay 40 mazos de demostraciÃ³n disponibles por
            evento, asÃ­ que llega temprano y asegura tu participaciÃ³n.
          </p>

          <p>
            <strong>
              Â¡Forja tu legiÃ³n y conviÃ©rtete en parte del universo de Souls In
              Xtinction!
            </strong>
          </p>
        </section>

        <div className="bg-gray-200 px-6 py-4 rounded-xl mt-10">
          <h2 className="text-4xl font-bold uppercase mb-6">
            Detalles del evento
          </h2>
          <div className="grid grid-cols-3">
            <div className="col-span-2 mt-2">
              <p className="">
                <span className="font-bold mr-1">Fecha:</span> 12 Abril 2025
              </p>
              <p className="">
                <span className="font-bold mr-1">Hora:</span> 02:00 PM
              </p>
              <p className="">
                <span className="font-bold mr-1">Costo:</span> Gratis
              </p>
              <p className="">
                <span className="font-bold mr-1">Ciudad:</span> BogotÃ¡, Colombia
              </p>
              <p className="">
                <span className="font-bold mr-1">DirecciÃ³n:</span> Cl. 52 #24-18
              </p>
            </div>
          </div>
          {/* <button className="btn-primary mt-3 w-full">InscrÃ­bete</button> */}
          <Map
            className="h-[300px] w-full rounded-lg mt-6"
            lat={4.641061151712014}
            lgn={-74.07435758650631}
            title="HIDDEN TCG STORE"
          />
        </div>
      </article>
    </>
  );
}
