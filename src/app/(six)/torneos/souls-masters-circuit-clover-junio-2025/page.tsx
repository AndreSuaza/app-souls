import { Map } from "@/components";
import { IoCalendarOutline } from "react-icons/io5";



export default function Tournaments() {
    return (
      <>
      <div className="bg-[url(/tournaments/SMCC-baner.jpg)] bg-cover h-[600px] w-full bg-left-top">
        <div className="grid grid-cols-1 md:grid-cols-2">
            <div className="bg-black h-[600px] polygon bg-opacity-90 flex justify-center">
                <div className="text-white font-bold my-auto ml-6 md:w-2/3 uppercase md:pb-24">
                    <h1 className="text-4xl md:text-6xl mb-2">Souls Masters Circuit</h1>
                    <p className="text-4xl mb-2">Dageon singles store</p>
                    <p className="mr-20 font-normal md:font-semibold">Estamos en la tercera edición del Souls Masters Circuit, esta vez en la vibrante ciudad de Cali, donde los mejores estrategas se enfrentarán en un torneo que desafiarán su destreza, creatividad y dominio del juego.</p>
                </div>
            </div>
        </div>
      </div>
      <div className="grid mx-2 md:grid-cols-3 md:gap-4 lg:mx-40">
            <div className="md:col-span-2 my-4 md:my-10">
                <p>El Souls Masters Circuit es más que un torneo, es una experiencia que pondrá a prueba la habilidad, la estrategia y la capacidad de los jugadores para adaptarse a las mecánicas únicas del juego. En este torneo, los participantes tendrán la oportunidad de demostrar su destreza con las cartas más poderosas, usando combinaciones letales y elaboradas para superar a sus oponentes.</p>

                <h2 className="text-4xl font-bold uppercase mt-10 mb-6">Por participar recibes:</h2>

                <div className="grid md:grid-cols-2">
   
                        <ul className="ml-4 p-2">
                            <li className="mb-2">1 Sobre de Souls Masters Circuit</li>
                            <li className="mb-2">1 Sobre de Expansión</li>
                            <li className="mb-2">1 Sobre maestro</li>
                            <li className="mb-2">1 Alma Ultra</li>
                        </ul>
          
                </div>
                <h2 className="text-4xl font-bold uppercase my-10">Premiación del Evento</h2>

                <div className="grid md:grid-cols-2">
                    <div className="">
                        <h3 className="text-2xl uppercase font-bold mb-6">Primer lugar</h3>
                        <ul className="ml-4 p-2">
                            <li className="font-bold uppercase mb-2">$1&apos;000.000 pesos en efectivo.</li>
                            <li className="mb-2">Tapete de juego Souls Masters Circuit</li>
                            <li className="mb-2">Entrada VIP al Souls Masters Champions</li>
                            <li className="mb-2">1 Purificador de Almas Gold Secret AA</li>
                            <li className="mb-2">1 Alma Gold Secret Souls Masters Circuit</li>
                            <li className="mb-2">45 puntos Souls Master</li>
                        </ul>
                    </div>
                    <div className="">
                        <h3 className="text-2xl uppercase font-bold mb-6">Segundo lugar</h3>
                        <ul className="ml-4">
                            <li className="mb-2">2 cajas de Expansión</li>
                            <li className="mb-2">2 cajas Ecos del abismo</li>
                            <li className="mb-2">Tapete de juego Souls Masters Circuit</li>
                            <li className="mb-2">1 Purificador de Almas Gold Secret AA</li>
                            <li className="mb-2">1 Alma Gold Secret Souls Masters Circuit</li>
                            <li className="mb-2">35 puntos Souls Master</li>
                        </ul>
                    </div>
                    <div className="">
                        <h3 className="text-2xl uppercase font-bold mb-6">Tercero y Cuarto lugar</h3>
                        <ul className="ml-4">
                            <li className="mb-2">12 Sobres de Expansión</li>
                            <li className="mb-2">2 Cajas Ecos del abismo</li>
                            <li className="mb-2">Tapete de juego Souls Masters Circuit</li>
                            <li className="mb-2">1 Purificador de Almas Gold Secret AA</li>
                            <li className="mb-2">1 Alma Gold Secret Souls Masters Circuit</li>
                            <li className="mb-2">25 puntos Souls Master</li>
                        </ul>
                    </div>
                    <div className="">
                        <h3 className="text-2xl uppercase font-bold mb-6">Quinto al Octavo Lugar</h3>
                        <ul className="ml-4">
                            <li className="mb-2">6 Sobres de Expansión</li>
                            <li className="mb-2">Tapete de juego Souls Masters Circuit</li>
                            <li className="mb-2">1 Alma Gold Secret Souls Masters Circuit</li>
                            <li className="mb-2">15 puntos Souls Master</li>
                        </ul>
                    </div>
                </div>
                
                <p className="my-2">El Souls Masters Circuit será el escenario perfecto para que los jugadores demuestren sus habilidades y se enfrenten a otros guerreros de almas en un campo de batalla épico. Prepárate para el inicio de esta nueva era del competitivo de Souls In Xtinction.</p>

                <p className="mb-6">¡Inscripciones abiertas ahora! No pierdas la oportunidad de ser parte de este histórico evento que definirá el futuro de los jugadores más legendarios.</p>
            </div>
            <div className="">
                <div className="bg-gray-200 w-full md:px-6 py-4 rounded-xl md:mt-10">
                    
                    <h2 className="text-4xl font-bold uppercase mb-6">Detalles del evento</h2>
                    <div className="grid grid-cols-3">
                        <div className="col-span-2 mt-2">
                            
                            <p className=""><span className="font-bold mr-1">Fecha:</span> 1 Junio 2025</p>
                            <p className=""><span className="font-bold mr-1">Hora:</span> 10:00 AM</p>
                            <p className=""><span className="font-bold mr-1">Costo:</span> $48.000</p>
                            <p className=""><span className="font-bold mr-1">Ciudad:</span> Cali, Valle del Cauca, Colombia</p>
                            <p className=""><span className="font-bold mr-1">Dirección:</span> Cra. 36b #5b2-44, San Fernando</p>
                            
                        </div>
                        <div className='text-center'>
                            <p className='text-xl md:text-lg mb-2 font-bold'>1 Junio 2025</p>
                            <IoCalendarOutline className='w-16 h-16 mx-auto mb-3'/>
                            <p className='font-semibold '>10:00 AM</p>
                        </div>
                    </div>
                    {/* <button className="btn-primary mt-3 w-full">Inscríbete</button> */}
                    <Map className="h-[300px] w-full rounded-lg mt-6" lat={3.4284595119743866} lgn={-76.54209978650715} title="Dageon singles store"/>
                </div>
           
            </div>    
      </div>
        <div className="bg-black">
            <div className="grid grid-cols-2 items-center justify-center p-4 text-gray-200 lg:mx-40">
            <h3 className="text-4xl my-6 font-bold mx-6 uppercase">Te compartimos la gran final del pasado Souls Masters Circuit.</h3>
            <iframe width="100%" height={400} src="https://www.youtube.com/embed/PKqHFB2V7JQ?si=SRGTRepZT54Ra8NZ" title="YouTube video player" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"></iframe>
            </div>
        </div>
      </>
    )
  }
  