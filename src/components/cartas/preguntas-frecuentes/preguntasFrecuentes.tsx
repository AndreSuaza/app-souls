"use client";
import { useState, useMemo } from "react";
import { FaSearch, FaChevronDown, FaChevronUp } from "react-icons/fa";

type FAQItem = {
  id: number;
  q: string;
  a: string;
};

const FAQS: FAQItem[] = [
  {
    id: 1,
    q: "¿Si una unidad con estadísticas aumentadas sufre daño, cómo se aplican los daños?",
    a:
      "Cuando las unidades equipadas o con estadísticas aumentadas sufren daño, primero se agotan las estadísticas del arma y/o la defensa aumentada.",
  },
  {
    id: 2,
    q: "¿Cuándo se considera que un duelo inició?",
    a: "Cuando ambos jugadores han robado sus 6 cartas iniciales.",
  },
  {
    id: 3,
    q: "¿Si una unidad está negada, le puedo poner un Arma para usar sus efectos?",
    a:
      "Las unidades negadas, aunque sean equipadas o reciban nuevos efectos, no podrán usar esos efectos mientras la unidad esté negada; sin embargo, continúan recibiendo las estadísticas de las Armas.",
  },
  {
    id: 4,
    q: "¿Una unidad bloqueadora es retirada del combate, el ataque continúa?",
    a:
      "Las unidades bloqueadoras retiradas del campo por cualquier razón durante el combate ya se consideran que bloquearon correctamente. Se asume que el ataque fue bloqueado, salvo si la unidad atacante tiene “Destrozar” — en ese caso el ataque continúa.",
  },
  {
    id: 5,
    q: "¿Retornar es lo mismo que devolver?",
    a:
      "No. Aunque el efecto sea el mismo en esencia, la palabra clave “Retornar” se usa en interacciones que especifican esa palabra en particular.",
  },
  {
    id: 6,
    q: "¿Cómo calculo los daños entre una unidad atacante con “Destrozar” vs una unidad bloqueadora con “Sed de sangre”?",
    a:
      "Resta las estadísticas totales (fuerza y defensa) de la unidad con “Sed de Sangre” a la fuerza del “Destrozar”. Ese es el modo más sencillo para calcular el daño resultante.",
  },
  {
    id: 7,
    q: "¿Si ambos jugadores tienen múltiples efectos en Fase de robo, cómo se resuelven?",
    a:
      "El jugador en turno inicia resolviendo uno de sus efectos de Fase de robo, luego el oponente resuelve uno de los suyos y así sucesivamente. Si un jugador decide no activar alguno de sus efectos, se considera que no desea activar ninguno.",
  },
  {
    id: 8,
    q: "¿Puedo invocar una unidad con Requerimiento de la mano o cementerio?",
    a:
      "Las unidades con Requerimiento solo pueden jugarse desde la mano. Pueden invocarse desde el cementerio si previamente cumplieron con dicho requerimiento.",
  },
  {
    id: 9,
    q: "¿Cómo debo jugar múltiples conjuros correctamente?",
    a:
      "Primero muestras todos los conjuros que vas a jugar y, simultáneamente, pagas el costo de los mismos; luego especificas el orden y los objetivos de cada conjuro.",
  },
  {
    id: 10,
    q: "¿Si le niego el efecto a una unidad Dormida, puede atacar y bloquear?",
    a:
      "Las unidades con “Dormir” no pueden atacar ni bloquear. Dormir es un estado de la carta, no un efecto que se pueda negar para reactivar la unidad.",
  },
  {
    id: 11,
    q: "¿Si le niego el efecto a una unidad que tenía estadísticas aumentadas por algún efecto o contador, los pierde o se mantienen?",
    a:
      "Cuando se niega una unidad, pierde todos los bonus provenientes de otros efectos; se mantienen las estadísticas aportadas por Armas, pero las demás modificaciones se pierden.",
  },
  {
    id: 12,
    q: "¿Si una unidad raptada es liberada, se considera invocada de nuevo, puede activar sus efectos?",
    a:
      "Al liberar una unidad raptada, no se considera una nueva invocación: simplemente vuelve al campo de su dueño. Si tenía efectos tipo “Acción” o “Rápido”, podrá volver a usarlos según sus condiciones.",
  },
  {
    id: 13,
    q: "¿Cómo interpretar conectores tipo “Luego” y la letra “y” en los textos de cartas?",
    a:
      "“Luego” indica que la segunda parte ocurre solo después de la primera; si la primera parte no puede ocurrir, lo demás tampoco ocurre. “Y” indica que ambas partes deben poder suceder; si una no es posible, ninguna de las partes ocurrirá.",
  },
  {
    id: 14,
    q: "¿Puedo activar una carta que busca una carta en mi mazo si no tengo objetivos disponibles?",
    a:
      "No. No puedes activar la carta si ya se sabe que no hay objetivos. En algunos casos se permite intentar buscar una vez para confirmar que no hay más objetivos, pero intentar activar repetidamente sabiendo que no existen objetivos es ilegal.",
  },
];

export const PreguntasFrecuentes = () => {
  const [openId, setOpenId] = useState<number | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return FAQS;
    return FAQS.filter(
      (f) => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
    );
  }, [query]);

  const toggle = (id: number) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-gray-800/60 rounded-2xl p-6 shadow-lg">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-purple-300">Preguntas Frecuentes</h1>
            <p className="text-sm text-gray-400 mt-1">Reglas y aclaraciones rápidas del juego</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar pregunta o respuesta..."
                className="bg-gray-900 border border-gray-700 px-3 py-2 rounded-lg w-72 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <FaSearch className="absolute right-3 top-2.5 text-gray-400" />
            </div>

          </div>
        </header>

        <main className="mt-6">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No se encontraron resultados.</p>
          ) : (
            <ul className="space-y-3">
              {filtered.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <li
                    key={item.id}
                    className="bg-gray-900/60 border border-gray-700 rounded-lg overflow-hidden"
                  >
                    <button
                      onClick={() => toggle(item.id)}
                      aria-expanded={isOpen}
                      className="w-full text-left px-4 py-3 flex items-start justify-between gap-4"
                    >
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-100">{item.q}</h3>
                        <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                          {item.a}
                        </p>
                      </div>

                      <div className="flex flex-col items-end justify-center gap-2">
                        <div className="text-xs text-gray-400">{isOpen ? "Ocultar" : "Ver"}</div>
                        <div className="text-purple-400">
                          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
                        </div>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 bg-gray-800/40">
                        <p className="text-sm text-gray-200 whitespace-pre-line">{item.a}</p>
                        <div className="mt-3 flex gap-2">
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </main>

        <footer className="mt-6 text-xs text-gray-500">
          <p>
            Si necesitas aclaraciones adicionales, contacta al equipo de reglas de Souls In Xtinction.
          </p>
        </footer>
      </div>
    </div>
  );
}