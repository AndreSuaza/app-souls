
import { auth } from "@/auth";
import Image from "next/image";
export default async function PerfilPage() {

  const session = await auth();
  console.log(session?.user)

  return (
    <div className="md:mx-40 my-6">
    <h1>Perfil</h1>
    <div>Datos del jugador</div>
    <div className="mt-6">
      <h1 className="text-4xl font-bold">Mazos</h1>
      <div className="grid grid-cols-4 gap-4 mt-6">
        <div className="bg-slate-200 rounded-md">
          <Image 
            width={350} 
            height={356} 
            src='/logo-six.webp' 
            alt="Logo Souls In Xtinction" 
            title="Souls In Xtinction"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
            placeholder="blur"
          />
          <div className="bg-slate-300 p-2">
              <p className="text-xl font-semibold">Dragones</p>
          </div>
        </div>
        <div className="bg-slate-200 rounded-md">
          <Image 
            width={350} 
            height={356} 
            src='/logo-six.webp' 
            alt="Logo Souls In Xtinction" 
            title="Souls In Xtinction"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
            placeholder="blur"
          />
          <div className="bg-slate-300 p-2 rounded-b-md">
              <p className="text-xl font-semibold">Dragones</p>
          </div>
        </div>
        <div className="bg-slate-200 rounded-md">
          <Image 
            width={350} 
            height={356} 
            src='/logo-six.webp' 
            alt="Logo Souls In Xtinction" 
            title="Souls In Xtinction"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
            placeholder="blur"
          />
          <div className="bg-slate-300 p-2">
              <p className="text-xl font-semibold">Dragones</p>
          </div>
        </div>
        <div className="bg-slate-200 rounded-md">
          <Image 
            width={350} 
            height={356} 
            src='/logo-six.webp' 
            alt="Logo Souls In Xtinction" 
            title="Souls In Xtinction"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNMTvt4EgAFcwKFsn71ygAAAABJRU5ErkJggg=="
            placeholder="blur"
          />
          <div className="bg-slate-300 p-2">
              <p className="text-xl font-semibold">Dragones</p>
          </div>
        </div>
        <div></div>
        <div></div>
      </div>
    </div>
    </div>
  )
}