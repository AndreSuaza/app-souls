import { getStorePagination } from "@/actions";
import { StoreItemSimple, Title } from "@/components";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IoDocumentAttachOutline } from "react-icons/io5";

export const metadata: Metadata = {
  title: 'Aprende a Jugar Souls In Xtinction TCG – Guía Completa para Principiantes',
  description: 'Descubre las reglas básicas, mecánicas y estrategias para dominar Souls In Xtinction TCG. Esta guía te enseñará cómo construir tu mazo, entender las cartas y desarrollar tácticas para vencer a tus oponentes.',
  openGraph: {
    title: 'Aprende a Jugar Souls In Xtinction TCG – Guía Completa para Principiantes',
      description: 'Descubre las reglas básicas, mecánicas y estrategias para dominar Souls In Xtinction TCG. Esta guía te enseñará cómo construir tu mazo, entender las cartas y desarrollar tácticas para vencer a tus oponentes.',
      url: 'https://soulsinxtinction.com/como-jugar',
      siteName: 'Aprende a jugar - Souls In Xtinction',
      images: [
          {
          url: 'https://soulsinxtinction.com/souls-in-xtinction.webp',
          width: 800,
          height: 600,
          alt: 'Aprende a jugar Souls In Xtinction TCG',
          }
      ],
      locale: 'en_ES',
      type: 'website',
  },
}

export default async function ComoJuagarPage() {

  const stores = await getStorePagination();

  return (
    <>
    <Title title="Aprende a jugar" className="mb-3 lg:mb-10"/>
    <div className="grid grid-cols-1 md:grid-cols-4 lg:mx-40 mb-10 text-gray-800">
      <article className="leading-7 text-xl col-span-3 lg:px-20 bg-slate-50 lg:p-10 p-3 mb-6 mx-2">

        <p className="mb-10 text-xl"><b>Souls In Xtinction</b> es un juego de estrategia que prioriza la destreza del jugador, integrando nuevas mecánicas, efectos y sinergias que relegan la suerte a un segundo plano, premiando la habilidad y la planificación en cada enfrentamiento. </p>
        <p className="text-4xl font-bold text-center mb-10">¡Aprendamos a jugar en solo 4 simples pasos!</p>
        <h3 className="text-4xl font-bold mb-10">1. Arma tu mazo</h3>

        <p className="font-semibold">En el universo de Souls In Xtinction existen 5 tipos de cartas:</p>

        <div className="grid grid-cols-1 md:grid-cols-2 mt-6">
        <div className="grid grid-cols-2 gap-2">
          <div className="">
            <Image 
                width={460} 
                height={500} 
                src={'/howtoplay/unidad.webp'} 
                alt="Carta de Unidad Souls In Xtinction" 
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
                placeholder="blur" 
                className="my-6 m-auto"
            />
          </div>
          <div className="">
            <Image 
                width={460} 
                height={500} 
                src={'/howtoplay/conjuro.webp'} 
                alt="Carta de Conjuro Souls In Xtinction" 
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
                placeholder="blur" 
                className="my-6 m-auto"
            />
          </div>
          <div className="">
            <Image 
                width={460} 
                height={500} 
                src={'/howtoplay/arma.webp'} 
                alt="Carta de Arma Souls In Xtinction" 
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
                placeholder="blur" 
                className="my-6 m-auto"
            />
          </div>
          <div className="">
            <Image 
                width={460} 
                height={500} 
                src={'/howtoplay/ente.webp'} 
                alt="Carta de Ente Souls In Xtinction" 
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
                placeholder="blur" 
                className="my-6 m-auto"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center">
          <ul className="bg-gray-200 md:ml-10 p-6 rounded-lg">
              <li className="mb-6"><b>Unidades:</b> Especializadas en ataque y defensa.</li>
              <li className="mb-6"><b>Conjuros:</b> Hechizos con efectos poderosos para mejorar tu estrategia.</li>
              <li className="mb-6"><b>Armas:</b> Equipamientos que potencian las estadísticas de ataque y defensa de tus unidades.</li>
              <li className="mb-6"><b>Entes:</b> Cartas de apoyo que entran al campo de batalla, pero no participan directamente en el combate.</li>
              <li className="mb-6"><b>Almas:</b> Utilizadas para pagar el coste de las demás cartas.</li>
          </ul>
        </div>
        
        </div>
        <h2 className="mb-6 text-gray-900 text-center my-6 pt-10"><i>Descripcion general de una carta</i></h2>  
        <Image 
                width={600} 
                height={550} 
                src={'/howtoplay/carta-ds.webp'} 
                alt="Componentes de una carta Souls In Xtinction" 
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
                placeholder="blur" 
                className=" my-6 m-auto"
            />

        <h3 className="text-2xl mt-12 font-bold mb-6">Para ir a una batalla, necesitarás: </h3>

        <div className="grid grid-cols-1 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <ul className="bg-gray-200 md:mr-10 py-10 p-6 rounded-lg">
              <li className="mb-8"><b>Mazo Principal:</b> 40 cartas (Unidades, Conjuros, Armas o Entes).</li>
              <li className="mb-8"><b>Mazo de Almas:</b> 6 cartas de almas  (reverso azul).</li>
              <li className="mb-8"><b>Mazo de Limbo:</b> Hasta 6 cartas de limbo (con borde dorado y reverso rojo).</li>
              <li className="mb-8"><b>Ficha de ataque:</b> Encargada de señalar quien puede atacar en el turno.</li>
            </ul>
          </div>
          <div className="grid grid-cols-2 gap-3 md:mb-6 p-10">
                <div className="">
                  
                  <Image 
                      width={400} 
                      height={600} 
                      src={'/howtoplay/mazo-principal.webp'} 
                      alt="Retiro mazo principal Souls In Xtinction" 
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
                      placeholder="blur" 
                      className="my-6 m-auto"
                  />
                  <p className="text-center text-sm font-semibold text-indigo-500">(Figura 1) Mazo principal de 40 cartas</p>
                </div>
                <div className="">
                  
                  <Image 
                      width={400} 
                      height={600} 
                      src={'/howtoplay/mazo-mana.webp'} 
                      alt="Retiro mazo Maná Souls In Xtinction" 
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
                      placeholder="blur" 
                      className="my-6 m-auto"
                  />
                  <p className="text-center text-sm font-semibold">Mazo Maná de 6 cartas</p>
                </div>
                <div className="">
                  
                  <Image 
                      width={400} 
                      height={600} 
                      src={'/howtoplay/mazo-limbo.webp'} 
                      alt="Retiro mazo limbo Souls In Xtinction" 
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
                      placeholder="blur" 
                      className="my-6 m-auto"
                  />
                  <p className="text-center text-sm font-semibold">Mazo Limbo de 0 a 6 cartas</p>
                </div>
                <div className="">
                  
                  <Image 
                      width={400} 
                      height={600} 
                      src={'/howtoplay/ficha-ataque.webp'} 
                      alt="Ficha de Ataque Souls In Xtinction" 
                      blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
                      placeholder="blur" 
                      className="my-6 m-auto"
                  />
                  <p className="text-center text-sm font-semibold">Ficha de Ataque</p>
                </div>
                
          </div>
        </div>

        <h3 className="text-4xl mt-20 mb-6 font-bold">2. Preparándote para la batalla</h3>

        <p className="text-center mt-16 pb-6 text-3xl">
            <i>Ubica tus mazos en sus respectivas zonas en el juego.</i>
        </p>
        <Image 
                width={822 } 
                height={426} 
                src={'/howtoplay/playmat-video.webp'} 
                alt="Tablero Souls In Xtinction" 
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
                placeholder="blur" 
                className="mt-6 mb-20 m-auto"
          />

        <p className="mb-3">Cada partida de Souls In Xtinction se juega entre <b>dos jugadores</b>.</p>
        <p className="mb-3">Decidiran quién inicia con un método aleatorio.</p>
        <p className="mb-3">El jugador que inicia obtiene la <b>Ficha de Ataque</b>, señalando que será el primero en realizar una acción y el único con la capacidad de atacar durante ese turno.</p>
        <p className="mb-3">Cada jugador tiene <b className="text-indigo-500">6 vidas</b>  (no puede tener más de 6 vidas).</p>
        <p className="mb-3">Una vez por partida ambos jugadores <b>roban 6</b> cartas de su mazo principal. Luego, <b className="text-indigo-500">pueden devolver al mazo cualquier número de cartas</b>, barajar y robar la misma cantidad.</p> 

        <h3 className="text-4xl font-bold mt-20 mb-6">3. Inicio de la batalla</h3>
        <p className="mb-3">La batalla se divide en turnos compartidos con <b>4 fases:</b></p>

        <div className="grid grid-cols-1 md:grid-cols-2 mt-10">
          <ul className="bg-gray-200 md:mr-10 pt-8 pb-4 p-6 rounded-lg">
            <li className="mb-3"><b>Fase de Robo:</b> Cada jugador roba una carta del mazo principal.</li>
            <li className="mb-3"><b>Fase de Almas:</b> Cada jugador coloca una carta de alma desde su mazo de almas en la zona de almas.</li>
            <li className="mb-3"><b>Fase Principal o de Acción:</b> Cada jugador puede realizar diferentes acciones en el turno:</li>
              <ul>
                  <li className="ml-4 mb-3"><i>Jugar una carta pagando su coste.</i></li>
                  <li className="ml-4 mb-3"><i>Activar un efecto de una carta</i></li>
                  <li className="ml-4 mb-3"><i>Atacar, si tienes la ficha de ataque.</i></li>
                  <li className="ml-4 mb-3"><i>Pasar la prioridad de hacer una acción al oponente.</i></li>
              </ul>
            <li className=""><b>Fase Final:</b> Si ambos jugadores pasan consecutivamente, el turno termina.</li>
          </ul>
          <div className="grid grid-cols-1 gap-3 mb-6 p-10">
              <Image 
                        width={628} 
                        height={222} 
                        src={'/howtoplay/fase-mana-1.webp'} 
                        alt="Imagen Poner Mana Souls In Xtinction" 
                        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
                        placeholder="blur" 
                        className="my-6 m-auto"
              />
              <Image 
                    width={628} 
                    height={296} 
                    src={'/howtoplay/fase-mana-2.webp'} 
                    alt="Imagen de la Fase de Mana de Souls In Xtinction" 
                    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
                    placeholder="blur" 
                    className="my-6 m-auto"
                />
              <p className="text-center text-sm font-semibold text-indigo-500">Figura 1 (Funcionamiento de las Almas)</p>
          </div>
        </div>

        <h3 className="text-4xl my-6 font-bold">4. Ataque</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 mt-10">
          <div className="mb-6">
            <Image
                src={`/howtoplay/ataque.webp`}
                alt="cartas de unidad"
                className="mb-6"
                width={500}
                height={100}
            />
            <p className="text-center text-sm font-semibold text-indigo-500">Figura 2 (Declaración de ataque)</p>
            <Image
                src={`/howtoplay/bloqueo.webp`}
                alt="cartas de unidad"
                className="mt-12 mb-6"
                width={500}
                height={100}
            />
            <p className="text-center text-sm font-semibold text-indigo-500">Figura 3 (Declaración de bloqueos)</p>
          </div>
            <ul className="bg-gray-200 md:mr-10 pt-8 pb-4 p-6 rounded-lg">
              <li className="mb-3">Cuando un jugador decide atacar:</li>
              <li className="mb-3">Selecciona las unidades con las que desea atacar y las <b className="text-indigo-500">mueve a la zona de combate</b>. (Figura 2)</li>
              <li className="mb-3">El oponente elige las unidades que usará para bloquear y las <b className="text-indigo-500">coloca frente a las unidades atacantes.</b> (Figura 3)</li>
              <li className="mb-3">El jugador atacante puede activar conjuros de su mano.</li>
              <li className="mb-3">El jugador defensor puede responder activando conjuros.</li>
              <li className="mb-3">Después de que ambos jugadores terminan de activar conjuros, se resuelven los enfrentamientos. <b>Las unidades que reciban daño igual o mayor a su defensa son destruidas y enviadas al cementerio.</b></li>
              <li className="mb-3">Las unidades que no fueron bloqueadas y que permanecen en la zona de combate al resolver los enfrentamientos <b className="text-indigo-500">hacen daño directo a las vidas del jugador</b> defensor igual al ataque de la unidad</li>
              <li className="mb-3">El jugador que <b className="text-indigo-500">reduzca a 0 las vidas</b> del oponente será el <b>vencedor</b>.</li>
            </ul>
        </div>
        <p className="mb-10 mt-10 text-center text-3xl font-semibold md:mx-20">¡Ahora estás listo para iniciar tu aventura en el universo de Souls In Xtinction!</p>
        <hr />
        <div className="my-6">
          <p>Si ya dominaste las reglas básicas, es hora de llevar tu experiencia al siguiente nivel. Te invitamos a descubrir las reglas avanzadas que te permitirán explorar nuevas estrategias, habilidades y tácticas que transformarán tu manera de jugar. Sumérgete en el corazón de Souls In Xtinction y descubre todo lo que necesitas para convertirte en un verdadero maestro del juego.</p>
          <Link href={"/Manual de reglas Souls In Xtinction.pdf"} target="_blank" title="Reglas avanzadas Souls In Xtinction">
            <button className="btn-primary m-auto flex mt-6"><IoDocumentAttachOutline className="w-6 h-6 mr-3" />Reglas Avanzadas</button>
          </Link>
        </div>
      </article>
      <div className="">
        <div className="bg-gray-200 mx-4 rounded-lg p-4">
        <h2 className="text-center uppercase font-bold mb-4">¿Dónde puedes jugar?</h2>
        <ul>
        {stores.map( (store) => (
          <li key={ store.id }>
                    <StoreItemSimple                       
                      store={store}
                    />
          </li>
          ))}
        </ul>
        </div>
      </div>
    </div>
    </>
  )
}
