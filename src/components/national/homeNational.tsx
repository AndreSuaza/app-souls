'use client';

import { motion } from "framer-motion";

export const HomeNational = () => {
  return (
        <div className="bg-[url(/national/bg-national.png)] bg-fixed bg-cover bg-center text-gray-200 font-sans overflow-x-hidden">
      {/* HERO */}
      <section className="bg-[url(/national/bg-national-souls.webp)] bg-cover bg-top min-h-screen flex flex-col justify-center items-center text-center px-6 pt-6 pb-12">
        <motion.img
          src="/souls-in-xtinction-logo-white.webp"
          alt="Souls In Xtinction"
          className="w-96 md:w-1/2 mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
        />
        <motion.h1
          className="uppercase text-5xl md:text-6xl font-extrabold text-yellow-400 drop-shadow-[0_0_12px_rgba(250,204,21,0.8)]"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Torneo Nacional 2025
        </motion.h1>

        <motion.p
          className="text-lg md:text-xl mt-4 text-gray-200 max-w-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          El evento más grande del año está aquí. Compite con los mejores jugadores de Colombia, gana premios épicos y deja tu alma en el campo de batalla.
        </motion.p>

        <motion.a
          href="https://forms.gle/iMbqjJhF79keoucaA"
          target="_blank"
          className="mt-8 bg-gradient-to-r from-yellow-500 to-yellow-300 text-[#0b1220] font-bold px-8 py-3 rounded-lg shadow-lg hover:scale-105 transition"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ¡Inscríbete Ahora!
        </motion.a>

        <p className="mt-6 text-gray-200 uppercase text-2xl font-bold">📍 Hidden TCG Store | 30 de Noviembre | 9:00 AM</p>
      </section>

      {/* PREMIOS */}
      <section id="premios" className="py-20 bg-black/80 px-6">
        <h2 className="text-4xl font-bold text-center mb-10 text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
          🏆 Premiación
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            { lugar: "1° Lugar", color: "text-yellow-400", premio: "$3.000.000 + Purificador Dorado + Tapete Nacional + Alma Dorada" },
            { lugar: "2° Lugar", color: "text-yellow-300", premio: "$1.000.000 + Purificador Dorado + Tapete Nacional + Alma Dorada" },
            { lugar: "3° - 4° Lugar", color: "text-yellow-200", premio: "$500.000 + Purificador Secreto + Tapete Nacional + Alma Dorada" },
            { lugar: "5° - 8° Lugar", color: "text-yellow-100", premio: "$250.000 + Tapete Nacional + Alma Dorada + Purificador Secreto" },
            { lugar: "9° - 16° Lugar", color: "text-gray-200", premio: "Media caja de la última expansión." },
          ].map((item, index) => (
            <motion.div
              key={index}
              className="p-6 rounded-xl bg-white/5 border border-white/10 hover:-translate-y-1 transition-all backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <h3 className={`text-xl font-bold ${item.color} mb-2`}>{item.lugar}</h3>
              <p className="text-gray-300 text-sm">{item.premio}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ENTRADAS */}
      <section id="entradas" className="py-20 bg-black/80 px-6">
        <h2 className="text-4xl font-bold text-center mb-10 text-yellow-400">🎟️ Entradas</h2>
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <motion.div
            className="p-6 rounded-xl bg-white/5 border border-white/10 hover:shadow-lg backdrop-blur-sm"
            whileHover={{ scale: 1.03 }}
          >
            <h3 className="text-2xl font-semibold text-yellow-300 mb-4">Entrada Normal – $78.000</h3>
            <ul className="list-disc ml-5 space-y-2 text-gray-300 text-sm">
              <li>1 sobre con una de 3 promos exclusivas del nacional</li>
              <li>4 sobres de expansión a elección</li>
              <li>1 sobre maestro</li>
              <li>1 oportunidad en la rifa de la carta gigante “Aleksandra”</li>
            </ul>
          </motion.div>
          <motion.div
            className="p-6 rounded-xl bg-white/5 border border-yellow-400/20 hover:shadow-xl backdrop-blur-sm"
            whileHover={{ scale: 1.03 }}
          >
            <h3 className="text-2xl font-semibold text-yellow-400 mb-4">Entrada Pro – $150.000</h3>
            <ul className="list-disc ml-5 space-y-2 text-gray-300 text-sm">
              <li>3 sobres con las 3 promos exclusivas del nacional</li>
              <li>1 caja de expansión a elección</li>
              <li>3 sobres maestros</li>
              <li>2 oportunidades en la rifa de la carta gigante “Aleksandra”</li>
            </ul>
          </motion.div>
        </div>
        <h2 className="capitalize text-yellow-400 mt-12 text-center ">promos exclusivas del nacional</h2>
        <div
            className="grid grid-cols-1 gap-4 md:grid-cols-3 md:px-20 mx-auto items-center justify-center mt-10"
          >
            <img
                src="/cards/GNC-044-6547.webp"
                alt="Guerrero Caído"
                className="mx-auto w-60 rounded-xl shadow-[0_0_30px_rgba(250,204,21,0.5)] border border-yellow-400/30 hover:scale-105 transition-transform duration-500"
            />
            <img
                src="/cards/ME3-016-3938.webp"
                alt="Esporas Somníferas"
                className="mx-auto w-60 rounded-xl shadow-[0_0_30px_rgba(250,204,21,0.5)] border border-yellow-400/30 hover:scale-105 transition-transform duration-500"
            />
            <img
                src="/cards/LP-018-6874.webp"
                alt="Aplasta Insectos"
                className="mx-auto w-60 rounded-xl shadow-[0_0_30px_rgba(250,204,21,0.5)] border border-yellow-400/30 hover:scale-105 transition-transform duration-500"
            />
         </div>
      </section>


        {/* RIFAS */}
        <section
        className="py-24 px-6 bg-black/95 flex flex-col items-center justify-center"
        >
        <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]">
            🎁 Rifas Especiales
        </h2>

        <div className="max-w-6xl w-full flex flex-col lg:flex-row items-center justify-center gap-12 text-center lg:text-left">
            {/* Imagen carta */}
            <motion.div
            className="flex justify-center lg:justify-end w-full lg:w-1/2"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            >
            <img
                src="/cards/P-004-8477.webp"
                alt="Aleksandra"
                className="w-72 md:w-80 rounded-xl shadow-[0_0_30px_rgba(250,204,21,0.5)] border border-yellow-400/30 hover:scale-105 transition-transform duration-500"
            />
            </motion.div>

            {/* Texto rifas */}
            <motion.div
            className="lg:w-1/2 w-full flex flex-col justify-center items-center lg:items-start"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            >
            <ul className="space-y-3 text-gray-200 text-lg md:text-xl font-light">
                <li>🎫 <span className="font-semibold text-yellow-400">1 Rifa</span> – 25 puntos</li>
                <li>🎫 <span className="font-semibold text-yellow-400">1 Rifa</span> – 45 puntos</li>
                <li>💥 <span className="font-semibold text-yellow-400">4 Rifas</span> – 5 sobres (1 de cada expansión + maestro)</li>
                <li>📦 <span className="font-semibold text-yellow-400">1 Caja de expansión</span></li>
                <li>🧙‍♂️ <span className="font-semibold text-yellow-400">1 Tapete exclusivo</span></li>
                <li>🔥 <span className="font-semibold text-yellow-400">1 Carta Dorada</span> “Alma del Dragón”</li>
                <li>✨ <span className="font-semibold text-yellow-400">1 Carta gigante especial</span></li>
            </ul>
            </motion.div>
        </div>
        </section>

    </div>
  )
}
