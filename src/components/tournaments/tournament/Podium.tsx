import clsx from "clsx";
import Image from "next/image";

type PodiumPlace = 1 | 2 | 3;

interface PodiumUser {
  id: string;
  name: string;
  points: number;
  avatarUrl: string;
}

interface PodiumProps {
  first: PodiumUser;
  second: PodiumUser;
  third: PodiumUser;
}

// 🎨 Configuración visual: dorado más amarillo (menos café)
const PODIUM_STYLE: Record<
  PodiumPlace,
  {
    topGradient: string;
    frontGradient: string;
    numberColor: string;
    height: number;
  }
> = {
  1: {
    // Dorado principal (amarillo intenso)
    topGradient: "from-[#FFD966] to-[#FFEB99]", // luz superior más amarilla
    frontGradient: "from-[#E6B800] via-[#FFD24D] to-[#FFEB99]", // profundidad dorada
    numberColor: "#E6B800", // amarillo dorado fuerte
    height: 180,
  },
  2: {
    // Dorado secundario (ligeramente menos intenso)
    topGradient: "from-[#FFE066] to-[#FFF2B2]",
    frontGradient: "from-[#E6C200] via-[#FFE066] to-[#FFF2B2]",
    numberColor: "#D9B200",
    height: 150,
  },
  3: {
    // Dorado terciario (más suave, pero sigue siendo amarillo)
    topGradient: "from-[#FFE699] to-[#FFF5CC]",
    frontGradient: "from-[#D9AD26] via-[#FFE699] to-[#FFF5CC]",
    numberColor: "#C9A227",
    height: 120,
  },
};

export function Podium({ first, second, third }: PodiumProps) {
  // Mapeo por puesto para renderizar consistente
  const places: Array<{ place: PodiumPlace; user: PodiumUser }> = [
    { place: 2, user: second },
    { place: 1, user: first },
    { place: 3, user: third },
  ];

  // Forma de la cara superior segun el puesto
  const getTopClipPath = (place: PodiumPlace): string => {
    switch (place) {
      case 1:
        // Oro: ambos lados hacia dentro (NO SE TOCA)
        return "polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%)";

      case 2:
        // Plata: solo lado izquierdo diagonal, derecho recto
        return "polygon(10% 0%, 100% 0%, 100% 100%, 0% 100%)";

      case 3:
        // Bronce: solo lado derecho diagonal, izquierdo recto
        return "polygon(0% 0%, 90% 0%, 100% 100%, 0% 100%)";

      default:
        return "polygon(0 0, 100% 0, 100% 100%, 0 100%)";
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-end justify-center">
        {places.map(({ place, user }) => (
          <div key={user.id} className="flex flex-col items-center">
            {/* Avatar + nombre + puntos */}
            <div className="flex flex-col items-center mb-2">
              {/* Avatar */}
              <Image
                src={user.avatarUrl}
                alt={user.name}
                className="h-12 w-12 rounded-full border-2 border-white object-cover"
              />
              <span className="mt-1 text-sm font-semibold text-white">
                {user.name}
              </span>

              {/* Puntos (burbuja) */}
              <span className="mt-1 rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
                {user.points}
              </span>
            </div>

            {/* Columna del podio con efecto 3D */}
            <div
              className="relative w-28 flex flex-col items-center -mx-[1px]"
              style={{
                height: PODIUM_STYLE[place].height,
                zIndex: place === 1 ? 30 : place === 2 ? 20 : 10, // orden visual
              }}
            >
              {/* Cara superior */}
              <div
                className={clsx(
                  "w-full h-8 bg-gradient-to-b",
                  PODIUM_STYLE[place].topGradient
                )}
                style={{
                  clipPath: getTopClipPath(place),
                  height: "25px",
                }}
              />

              {/* Cara frontal */}
              <div
                className={clsx(
                  "relative w-full flex-1 bg-gradient-to-b flex items-center justify-center font-bold",
                  PODIUM_STYLE[place].frontGradient
                )}
                style={{
                  boxShadow: "0px 40px 60px rgba(0,0,0,0.15)", // sombra profunda
                }}
              >
                {/* Numero del puesto */}
                <span className="text-[90px] leading-none text-gray-200">
                  {place}
                </span>

                {/* Sombra lateral derecha */}
                <div className="absolute right-0 top-0 h-full w-4 bg-black/10 blur-sm" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
