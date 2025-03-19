import { Map } from "@/components";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Forja tu Legión de Almas Torneo Souls In Xticition',
  description: 'Vive la emoción de la competencia y el crecimiento de la comunidad en los torneos oficiales de Souls In Xtinction.',
  openGraph: {
      title: 'Forja tu Legión de Almas Torneo Souls In Xticition',
      description: 'Vive la emoción de la competencia y el crecimiento de la comunidad en los torneos oficiales de Souls In Xtinction.',
      url: 'https://soulsinxtinction.com/torneos/forja-tu-legion-de-almas',
      siteName: 'Forja tu Legión Souls In Xticition',
      images: [
          {
          url: 'https://soulsinxtinction.com/tournaments/forja-tu-legion-de-almas.webp',
          width: 500,
          height: 500,
          alt: 'Forja tu Legión Souls In Xticition',
          }
      ],
      locale: 'en_ES',
      type: 'website',
  },
}

export default function Tournaments() {
    return (
      <>
      <div className="bg-[url(/tournaments/forja-tu-legion-de-almas.webp)] bg-cover bg-center h-[600px] w-full ">
        <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-black h-[600px] polygon bg-opacity-70 flex justify-center">
                <div className="text-white font-bold my-auto ml-6 md:w-2/3 uppercase md:pb-24">
                    <h1 className="text-4xl md:text-6xl mb-2">Forja tu Legión de Almas</h1>
                    <p className="text-4xl mb-2">HIDDEN TCG STORE</p>
                    <p className="mr-20 font-normal md:font-semibold">Vive la emoción de la competencia y el crecimiento de la comunidad en los torneos oficiales de Souls In Xtinction. </p>
                </div>
            </div>
        </div>
      </div>
      <article className="mx-4 lg:mx-40 grid md:grid-cols-3">
        <section className="md:col-span-2 my-10">
          <p>Este torneo está diseñado para fortalecer la comunidad invitando a nuevos jugadores a unirse a la batalla.</p>
          <h3 className="text-3xl font-bold my-4">¿Cómo participar?</h3>
          <p className="mb-4">Los jugadores activos pueden invitar nuevos jugadores y recibir recompensas por cada persona que traigan:</p>
         
          <h3 className="text-3xl font-bold mb-4">Recompensas para jugadores activos</h3>
          <p className="mb-4">Dependiendo del número de nuevos jugadores que invites, recibirás sobres de recompensa:</p>
          <ul className="mb-6">
              <li className="ml-4"><b>1 </b>jugador nuevo → 1 sobre maestro.</li>
              <li className="ml-4"><b>3 </b>jugadores nuevos → 1 sobre maestro + 1 sobre de expansión.</li>
              <li className="ml-4"><b>5 </b>jugadores nuevos → 2 sobres maestros + 2 sobres de expansión + 1 sobre de circuito.</li>
              <li className="ml-4"><b>10 </b>jugadores nuevos → 3 sobres maestros + 3 sobres de expansión + 3 sobres de circuito.</li>
          </ul>
          <p className="mb-6 font-semibold">¿Eres nuevo y quieres conocer Souls In Xtinction? Puedes inscribirte directamente y recibirás 1 sobre maestro solo por participar.</p>
          
          <div className="">
            <p className="mb-6"><strong>Recompensa especial:</strong> El jugador que traiga más nuevos jugadores recibirá una carta Escudos gemelos foil promocional exclusiva.</p>
            <Image
                src={`/cards/IMP-PC-011-6072.webp`}
                alt={"Imagen Cartas Escudos Gemelos Arte Alterno"}
                className='rounded-lg mx-auto mb-10'
                width={300}
                height={718}
            />
          </div>
          

          <h3 className="text-3xl font-bold mb-4">Beneficios para nuevos jugadores</h3>
          <ul className="mb-4">
              <li className="font-semibold">Un mazo de demostración para aprender a jugar.</li>
              <li className="font-semibold">Acceso a un torneo exclusivo en formato suizo con un mazo estructurado como premio para el ganador.</li>
          </ul>
          <div className="text-center mb-6">
            <Link href={"/productos/mazo-demostracion-2"}>
            <Image
                src={`/products/MD2.webp`}
                alt={"Imagen Mazo demostracion 2.0"}
                className='rounded-lg shadow-md mx-auto mb-2'
                width={300}
                height={500}
                // onMouseEnter={ () => setDisplayImage(`${product.images[0].name}.webp`) }
                // onMouseLeave={ () => setDisplayImage(`${product.images[1].name}.webp`) }
            />
            <p className="text-indigo-600">Mazo demostracion 2.0</p>
            </Link>
          </div>
          
          <p className="mb-4"><strong>Nota:</strong> Hay 40 mazos de demostración disponibles por evento, así que llega temprano y asegura tu participación.</p>

          <p><strong>¡Forja tu legión y conviértete en parte del universo de Souls In Xtinction!</strong></p>
      </section>

      <div className="bg-gray-200 px-6 py-4 rounded-xl mt-10">
          
          <h2 className="text-4xl font-bold uppercase mb-6">Detalles del evento</h2>
          <div className="grid grid-cols-3">
              <div className="col-span-2 mt-2">
                  
                  <p className=""><span className="font-bold mr-1">Fecha:</span> 29 Marzo 2025</p>
                  <p className=""><span className="font-bold mr-1">Hora:</span> 02:00 PM</p>
                  <p className=""><span className="font-bold mr-1">Costo:</span> Gratis</p>
                  <p className=""><span className="font-bold mr-1">Ciudad:</span> Bogotá, Colombia</p>
                  <p className=""><span className="font-bold mr-1">Dirección:</span> Cl. 52 #24-18</p>
                  
              </div>
          </div>
          {/* <button className="btn-primary mt-3 w-full">Inscríbete</button> */}
          <Map className="h-[300px] w-full rounded-lg mt-6" lat={4.641061151712014} lgn={-74.07435758650631} title="CLOVER TCG STORE"/>
      </div>
           
     
      </article>


      </>
    )
  }
  