'use client';

import Image from "next/image";
import { useState } from "react";
import { IoImageOutline } from "react-icons/io5";
import { ButtonLogOut } from "../login/ButtonLogOut";
import { Modal } from "../ui/modal/modal";
import { updateUser } from "@/actions";
import { useToastStore } from "@/store";

interface User {
    name?: string | null;
    lastname?: string| null;
    email?: string| null;
    nickname?: string| null;
    image?: string| null;
}

// interface Archetype {
//   name: string| null;
// }

type Avatar = {
  id: string;
  name: string;
  imageUrl: string;
  rarity: string;
  isExclusive: boolean;
};

// interface Deck {
//   id: string;
//   name: string;
//   imagen: string;
//   cards: string;
//   likesCount: number;
//   createdAt: Date;
//   user: User;
//   archetype: Archetype;
// }

interface Props {
    user: User;
    avatars: Avatar[];
}

export const Pefil = ({user, avatars}: Props) => {
  const [activeTab, setActiveTab] = useState("mazos");
  const [showAvatars, setShowAvatars] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState<string>(user.image ? user.image : "");
  const showToast = useToastStore((state) => state.showToast);

  const handleSelect = (avatar: Avatar) => {
    setSelectedAvatar(avatar.imageUrl);
    setShowAvatars(false);
    user.image = avatar.imageUrl
  };
  
  const updateUserProfile = async () => {
    try {
      await updateUser(selectedAvatar);
      showToast("Avatar actualizado correctamente", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el avatar",
        "error"
      );
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-purple-900 text-white overflow-hidden p-4">
      {/* Fondo */}
      <div className="absolute inset-0 bg-[url('/images/fondo-souls.jpg')] bg-cover bg-center opacity-20 blur-sm"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 to-black/95"></div>

      {/* Contenedor principal */}
      <div className="relative z-10 w-full max-w-6xl bg-gray-900/70 border border-purple-600/40 rounded-2xl shadow-[rgba(168,85,247,0.3)] p-8 backdrop-blur-md flex flex-col items-center transition">
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row items-center gap-8 w-full">
          {/* Avatar */}
          <div className="relative group">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-purple-500 shadow-[rgba(168,85,247,0.4)] transition group-hover:scale-105">
              <Image className="rounded-lg" width={270} height={287} src={`/profile/${user.image}.webp`} alt="Carta Prime Wenddygo" title="Prime Wenddygo"/>
            </div>
            <button onClick={() => setShowAvatars(true)} className="absolute bottom-2 right-2 bg-purple-600 text-white p-2 rounded-full text-xs hover:bg-purple-700 transition">
              <IoImageOutline className="w-6 h-6" />
            </button>
          </div>

          {/* Info básica */}
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-purple-400">{user.nickname}</h1>
            {/* <p className="text-gray-300 italic">“No soy un mazo... soy un monstruo.”</p> */}

            {/* Barra de experiencia */}
            {/* <div className="mt-4">
              <p className="text-sm text-gray-400 mb-1">Nivel 12</p>
              <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden border border-purple-700/50">
                <div className="bg-purple-500 h-full w-3/4 transition-all"></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">XP: 750 / 1000</p>
            </div> */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 text-sm text-gray-300">
              <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/50">
                <p className="text-gray-400 text-xs">Nombre</p>
                <p className="font-semibold">{user.name}</p>
              </div>
              <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/50">
                <p className="text-gray-400 text-xs">Apellido</p>
                <p className="font-semibold">{user.lastname}</p>
              </div>
              <div className="bg-gray-800/60 p-3 rounded-lg border border-gray-700/50">
                <p className="text-gray-400 text-xs">Email</p>
                <p className="font-semibold">{user.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex mt-10 border-b border-purple-500/40 w-full justify-center md:justify-start">
          {["mazos"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 uppercase text-sm font-semibold transition ${
                activeTab === tab
                  ? "text-purple-400 border-b-2 border-purple-500"
                  : "text-gray-400 hover:text-purple-300"
              }`}
            >
              {tab === "perfil"
                ? "Perfil"
                : tab === "mazos"
                ? "Mis Mazos"
                : "Historial de Torneos"}
            </button>
          ))}
        </div>

        {/* Contenido */}
        <div className="mt-8 w-full">
          {/* {activeTab === "perfil" && (
            <div className="grid grid-cols-3 gap-4 text-center">
              <StatCard label="Victorias" value="42" />
              <StatCard label="Derrotas" value="18" />
              <StatCard label="Torneos" value="9" />
            </div>
          )} */}

          {/* {activeTab === "mazos" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {decks.map((m, i) => (
                <div
                  key={i}
                  className="bg-gray-800/70 p-5 rounded-xl border border-purple-600/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)] transition"
                >
                  <h3 className="text-lg font-bold text-purple-400">{m.name}</h3>
                  <p className="text-sm text-gray-300">Arquetipo: {m.archetype.name}</p>
                  <button className="mt-4 w-full py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition">
                    Ver Detalles
                  </button>
                </div>
              ))}
            </div>
          )} */}

          {/* {activeTab === "torneos" && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-purple-600/40">
                <thead>
                  <tr className="bg-purple-800/30 text-purple-300 uppercase text-xs">
                    <th className="px-4 py-2 text-left">Torneo</th>
                    <th className="px-4 py-2">Fecha</th>
                    <th className="px-4 py-2">Resultado</th>
                  </tr>
                </thead>
                <tbody>
                  {torneos.map((t, i) => (
                    <tr
                      key={i}
                      className="border-t border-purple-700/30 hover:bg-purple-900/20 transition"
                    >
                      <td className="px-4 py-2">{t.nombre}</td>
                      <td className="px-4 py-2 text-center">{t.fecha}</td>
                      <td className="px-4 py-2 text-center text-purple-400 font-semibold">
                        {t.posicion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )} */}
        </div>

        {/* Botones */}
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <button onClick={() => updateUserProfile()} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold shadow-md hover:shadow-purple-500/50 transition">
            Guardar
          </button>
          <ButtonLogOut className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold shadow-md hover:shadow-red-500/50 transition">    
            Cerrar Sesión
          </ButtonLogOut>
        </div>
      </div>
      { showAvatars && 
        <Modal 
            className="top-0 left-0 flex justify-center bg-gray-100 z-20 transition-all w-full h-screen md:h-auto md:w-1/2 md:left-1/4 md:top-28"
            close={() => setShowAvatars(false)}
        >
          <div className="overflow-auto w-full text-center">
            <div className=" text-gray-100 py-4 bg-slate-950"> 
                <h1 className="font-bold md:text-2xl uppercase">¡Elige tu avatar favorito!</h1>
            </div>    
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mx-10 my-6">
              {avatars.map((avatar) => (
                <div
                  key={avatar.id}
                  onClick={() => handleSelect(avatar)}
                  className={`cursor-pointer rounded border-4 transition-all ${
                    selectedAvatar === avatar.name
                      ? "border-purple-500 shadow-lg shadow-purple-500/50 scale-105"
                      : "border-transparent hover:border-purple-400"
                  }`}
                >
                  <Image
                    src={`/profile/${avatar.imageUrl}.webp`}
                    alt={avatar.name}
                    width={200}
                    height={200}
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </Modal>
      }
    </div>
  );


}
