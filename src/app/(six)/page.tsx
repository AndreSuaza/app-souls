

import { YoutubeList } from "@/components";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: 'Souls In Xtinction - El TCG Colombiano de Estrategia y Diversión',
  description: 'Descubre Souls In Xtinction, el emocionante TCG colombiano que combina estrategia, unidades poderosas y un universo único. Construye tu mazo, desafía a tus amigos y demuestra tu dominio en este juego de cartas coleccionables lleno de acción y diversión',
  openGraph: {
      title: 'Souls In Xtinction - El TCG Colombiano de Estrategia y Batalla',
      description: 'Descubre Souls In Xtinction, el emocionante TCG colombiano que combina estrategia, unidades poderosas y un universo único. Construye tu mazo, desafía a tus amigos y demuestra tu dominio en este juego de cartas coleccionables lleno de acción y diversión',
      url: 'https://soulsinxtinction.com',
      siteName: 'Souls In Xtinction - TCG',
      images: [
          {
          url: 'https://soulsinxtinction.com/souls-in-xtinction.webp',
          width: 800,
          height: 600,
          alt: 'Boveda Souls In Xtinction TCG',
          }
      ],
      locale: 'en_ES',
      type: 'website',
  },
}

export default function Home() {
  return (
    <div className="">
      <section className="card-animation grid grid-cols-3 md:grid-cols-6">
        <div className="content flex flex-grow justify-center items-center mx-auto">
          <div className="w-3/4 md:w-full">
            <Image 
              width={350} 
              height={356} 
              src='/logo-six.webp' 
              alt="Logo Souls In Xtinction" 
              title="Souls In Xtinction"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
              placeholder="blur"
            />
            <Link href={"/como-jugar"}>
              <button className="btn-primary mt-10 md:mt-20 uppercase font-bold"> Juega Ahora </button>
            </Link>
          </div>
        </div>
        
        <div className="column-animation h-[500px] md:h-[700px]">
            <Link href={"/cartas?&text=Prime%20wenddygo"} target="_blank" title="Prime Wenddygo" rel="nofollow">
              <Image className="rounded-lg" width={270} height={287} src='/home/P-001-0006.webp' alt="Carta Prime Wenddygo" title="Prime Wenddygo"/>
              </Link>
            <Link href={"/cartas?&text=Zadkiel%20Misericordioso"} target="_blank" title="Zadkiel Misericordioso" rel="nofollow">
              <Image className="rounded-lg" width={270} height={287} src='/home/ME2-025-6851.webp' alt="Carta Zadkiel Misericordioso" title="Zadkiel Misericordioso"/>
            </Link>
            <Link href={"/cartas?&text=Mark%20Exp-303"} target="_blank" title="Mark Ex-303" rel="nofollow">
              <Image className="rounded-lg" width={270} height={287} src='/home/ME4-024-1331.webp' alt="Carta Mark Ex-303" title="Mark Ex-303"/>
            </Link>
        </div>
        <div className="column-animation animate-reverse h-[500px] md:h-[700px]">
            <Link href={"/cartas?&text=Volviendo%20a%20Casa"} target="_blank" title="Volviendo a Casa" rel="nofollow">
              <Image className="rounded-lg" width={270} height={287} src='/home/P-008-3720.webp' alt="Carta Volviendo a Casa" title="Volviendo a Casa"/>
            </Link>
            <Link href={"/cartas?&text=Bahamoot%20Aniquilador"} target="_blank" title="Bahamoot Aniquilador" rel="nofollow">
              <Image className="rounded-lg" width={270} height={287} src='/home/ME1-025-7116.webp' alt="Carta Bahamoot Aniquilador" title="Bahamoot Aniquilador"/>
            </Link>
            <Link href={"/cartas?&text=Devora%20Cobardes"} target="_blank" title="Devora Cobardes" rel="nofollow">
              <Image className="rounded-lg" width={270} height={287} src='/home/P-003-9340.webp' alt="Carta Devora Cobardes" title="Devora Cobardes"/>
            </Link>
        </div>
        <div className="column-animation h-[500px] md:h-[700px]">
            <Link href={"/cartas?&text=Aleksandra"} target="_blank" title="Aleksandra" rel="nofollow">
              <Image className="rounded-lg" width={270} height={287} src='/home/P-004-8477.webp' alt="Carta Aleksandra" title="Aleksandra"/>
            </Link>
            <Link href={"/cartas?&text=Dionea%20Matamoscas"} target="_blank" title="Dionea Matamoscas" rel="nofollow">
              <Image className="rounded-lg" width={270} height={287} src='/home/ME3-025-9620.webp' alt="Carta Dionea Matamoscas" title="Dionea Matamoscas"/>
            </Link>
            <Link href={"/cartas?&text=Ariete"} target="_blank" title="Ariete" rel="nofollow">
              <Image className="rounded-lg" width={270} height={287} src='/home/P-010-8971.webp' alt="Carta Ariete" title="Ariete"/>
            </Link>
        </div>
        <div className="column-animation animate-reverse hidden md:block h-[700px]">
            <Link href={"/cartas?&text=Copito"} target="_blank" title="Copito de Nieve" rel="nofollow">
              <Image className="rounded-lg" width={270} height={287} src='/home/P-005-4137.webp' alt="Carta Copito de Nieve" title="Copito de Nieve"/>
            </Link>
            <Link href={"/cartas?&text=Sadhu%20Armormaster"} target="_blank" title="Sadhu Armormaster" rel="nofollow">
                <Image className="rounded-lg" width={270} height={287} src='/home/ME4-025-5419.webp' alt="Carta Sadhu Armormaster" title="Sadhu Armormaster"/>
            </Link>
            <Link href={"/cartas?&text=Angel&types=Ficha"} target="_blank" title="Ficha Ángel" rel="nofollow">
              <Image className="rounded-lg" width={270} height={287} src='/home/P-009-0009.webp' alt="Carta Ficha Ángel" title="Ficha Ángel"/>
            </Link>
        </div>
        <div className="column-animation hidden md:block h-[700px]">
            <Link href={"/cartas?&text=purificador"} target="_blank">
              <Image className="rounded-lg" width={270} height={287} src='/home/P-006-0349.webp' alt="Carta Purificador de almas" title="Purificador de almas"/>
            </Link>
            <Link href={"/cartas?&text=Arbol%20Mágico"} target="_blank" title="Arbol Mágico" rel="nofollow">
              <Image className="rounded-lg" width={270} height={287} src='/home/ME3-022-6438.webp' alt="Carta Arbol Mágico" title="Arbol Mágico"/>
            </Link>
            <Link href={"/cartas?&text=Expulsión%20Divina"} target="_blank" title="Expulsión Divina" rel="nofollow">
              <Image className="rounded-lg" width={270} height={287} src='/home/ME2-009-3219.webp' alt="Carta Expulsión Divina" title="Expulsión Divina"/>
            </Link>
        </div>
        <div className="column-animation animate-reverse hidden md:block h-[700px]">
            <Link href={"/cartas?&text=Mammon"} target="_blank" title="Mammon" rel="nofollow">
              <Image className="rounded-lg" width={270} height={287} src='/home/P-007-6618.webp' alt="Carta Mammon" title="Mammon"/>
            </Link>
            <Link href={"/cartas?&text=Triada"} target="_blank" title="Sátiro de la Triada" rel="nofollow">
              <Image className="rounded-lg" width={270} height={287} src='/home/ME1-026-5513.webp' alt="Carta Sátiro de la Triada" title="Sátiro de la Triada"/>
            </Link>
            <Link href={"/cartas?&types=Mana"} target="_blank" title="Mana Ente" rel="nofollow">
              <Image className="rounded-lg" width={270} height={287} src='/home/MD-022-0066.webp' alt="Carta Mana Ente" title="Mana Ente"/>
            </Link>
        </div>
      </section>
      
      <section className="grid grid-cols-1 gap-5 px-20 md:grid-cols-3 bg-gradient-to-b from-[#0e0e10] to-[#1a1a1f] text-white py-10">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-5xl uppercase font-bold mb-2">SoulsCreators</h1>
            <p className="text-2xl font-semibold uppercase text-indigo-600 mb-10">
              ¡Mira cómo juegan, enseñan y hacen historia!
            </p>
            <p className="text-xl">
              Jugadores apasionados, streamers y maestros del contenido que difunden la batalla por las almas en cada video, post y directo.
            </p>
          </div>
        </div>
        <div className="col-span-2 grid grid-cols-1 gap-5 md:grid-cols-2 mx-6">
          <YoutubeList name="Herosbran" playlistId="PLBSLhQCb0owr3A8x_-Q0QTyJh4Z_wFXKa"/>
          <YoutubeList name="Black Widow" playlistId="PLeZObnb91fKhclJrIj-JWuUYYpYhVx9Np"/>
        </div>
      </section>
    </div>
  );
}
