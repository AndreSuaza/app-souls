import { titleFont } from "@/config/fonts"
import { Routes } from "@/models/routes.models"
import Image from "next/image"
import Link from "next/link"


export const Footer = () => {
  return (
    <footer className='bottom-0 bg-indigo-600 py-10 text-gray-100'>
          <div className="mx-4 md:mx-40 grid md:grid-cols-3 grid-cols-1">
            <div className='items-center mt-6'>
            
            <Link href="/">
                <div className="flex flex-grow mb-10">
                <Image
                    src={`/souls-in-xtinction-logo-sm.png`}
                    alt={'logo-icono-souls-in-xtinction'}
                    className='w-12 h-12'
                    width={40}
                    height={40}
                />
                <span className={`${ titleFont.className } antialiased font-bold my-auto ml-2`}> Souls In Xtinction | TCG</span>
                </div>
            </Link>
            
            <p>Para más información, consultas o colaboraciones, no dudes en escribirnos a: <b>contacto@soulsinxtinction.com</b>. ¡Estamos aquí para ayudarte!</p>
            </div>
            
            <div className='flex justify-center mt-6'>
              <div className='mr-20'>
                <p className='text-xl uppercase font-bold'>Menu</p>
                <ul className='my-2'>
                {Routes.map((route) => (
                  <li className="mt-1">
                    <Link
                      key={route.name}
                      href={route.path}
                    >
                      {route.name}
                    </Link>
                  </li>
                  ))}
                </ul>
              </div>
              <div className=''>
                <p className='text-xl uppercase font-bold'>Redes</p>
                <ul>
                  <li className='mt-1'><Link href={'https://www.facebook.com/soulsinxtinction'} target="_blank" title="Facebook Souls in Xtincion">Facebook</Link></li>
                  <li className='mt-1'><Link href={'https://www.tiktok.com/@soulsinxtinction'} target="_blank" title="Tik Tok Souls in Xtincion">Tik Tok</Link></li>
                  <li className='mt-1'><Link href={'https://www.instagram.com/soulsinxtinction'} target="_blank" title="Instagram Souls in Xtincion">Instagram</Link></li>
                  <li className='mt-1'><Link href={'https://www.youtube.com/@SoulsInXtinction'} target="_blank" title="Youtube Souls in Xtincion">Youtube</Link></li>
                </ul>
              </div>
            </div>

            <div className='text-justify mt-7 lg:text-lg text-xs'>
              <p>La reproducción de imágenes, textos y datos de este sitio web está prohibida sin autorización. Es importante tener en cuenta que las imágenes aquí mostradas pueden no reflejar fielmente el producto final, dado que este aún se encuentra en fase de desarrollo.</p>
            </div>
          </div>
        </footer>
  )
}
