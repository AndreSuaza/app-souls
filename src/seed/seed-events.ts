import { PrismaClient, type EventStatus } from "@prisma/client";

const prisma = new PrismaClient();

const PLACEHOLDER_IMAGE = "/souls-in-xtinction.webp";

type EventSeed = {
  title: string;
  slug: string;
  subtitle: string;
  shortSummary: string;
  content: string;
  startsAt: Date;
  endsAt: Date;
  badgeLabel: string;
};

const eventDate = (
  year: number,
  monthIndex: number,
  day: number,
  hour: number,
) => new Date(year, monthIndex, day, hour, 0, 0, 0);

const buildContent = (summary: string, details?: string) =>
  details ? `${summary}\n\n${details}` : summary;

const events: EventSeed[] = [
  {
    title: "Ascenso: Nueva Era",
    slug: "ascenso-nueva-era-marzo-2026",
    subtitle: "Premiacion y rifas",
    shortSummary:
      "Evento promocional con sobres de la nueva expansion y carta especial para el Top.",
    content: buildContent(
      "Premiacion y rifas del evento por sobres de la nueva expansion.",
      "El Top recibe una carta promocional especial.",
    ),
    startsAt: eventDate(2026, 2, 27, 10),
    endsAt: eventDate(2026, 2, 29, 20),
    badgeLabel: "Promocional",
  },
  {
    title: "Lanzamiento de Cataclismos",
    slug: "lanzamiento-de-cataclismos-abril-2026",
    subtitle: "Nueva expansion",
    shortSummary:
      "Evento de lanzamiento de Cataclismos, la nueva expansion de Souls In Xtinction.",
    content: buildContent(
      "El universo Souls nunca sera el mismo.",
      "Cataclismos reescribe el destino con una nueva expansion de Souls In Xtinction.",
    ),
    startsAt: eventDate(2026, 3, 10, 10),
    endsAt: eventDate(2026, 3, 12, 20),
    badgeLabel: "Lanzamiento",
  },
  {
    title: "Banquete de Almas",
    slug: "banquete-de-almas-abril-2026",
    subtitle: "Rifa especial",
    shortSummary:
      "Rifa de una caja de sobres entre participantes y playmat exclusivo para el campeon.",
    content: buildContent(
      "Rifa de una caja de sobres entre todos los jugadores participantes.",
      "El campeon del evento recibe un playmat exclusivo.",
    ),
    startsAt: eventDate(2026, 3, 24, 10),
    endsAt: eventDate(2026, 3, 26, 20),
    badgeLabel: "Premio",
  },
  {
    title: "Souls Keeper",
    slug: "souls-keeper-mayo-2026",
    subtitle: "Victoria automatica SMC",
    shortSummary:
      "Evento especial donde el ganador obtiene una victoria automatica para el SMC.",
    content: buildContent(
      "El ganador obtendra una victoria automatica en el SMC.",
      "Cada victoria suma un sobre a tu recompensa, pero si caes en batalla, tu pozo se reparte con el jugador que te derroto.",
    ),
    startsAt: eventDate(2026, 4, 1, 10),
    endsAt: eventDate(2026, 4, 1, 20),
    badgeLabel: "Evento especial SMC",
  },
  {
    title: "El llamado del trono",
    slug: "el-llamado-del-trono-mayo-2026",
    subtitle: "Pase VIP SMC",
    shortSummary:
      "Evento especial con victoria automatica en el SMC y pase VIP para el ganador.",
    content: buildContent(
      "El ganador obtendra una victoria automatica en el SMC.",
      "Ademas, el campeon recibe un pase VIP para el evento.",
    ),
    startsAt: eventDate(2026, 4, 8, 10),
    endsAt: eventDate(2026, 4, 8, 20),
    badgeLabel: "Evento especial SMC",
  },
  {
    title: "Souls Master Circuit Bogota",
    slug: "souls-master-circuit-bogota-2026",
    subtitle: "Hidden TCG Store",
    shortSummary:
      "Parada competitiva del Souls Master Circuit en Bogota.",
    content: buildContent(
      "Parada competitiva del Souls Master Circuit.",
      "Compite por puntos, premios y posicion en el circuito oficial de Souls In Xtinction.",
    ),
    startsAt: eventDate(2026, 4, 17, 10),
    endsAt: eventDate(2026, 4, 17, 20),
    badgeLabel: "SMC por ciudad",
  },
  {
    title: "Universo de la locura",
    slug: "universo-de-la-locura-mayo-2026",
    subtitle: "Formato fun",
    shortSummary:
      "Evento de formato especial para jugar con reglas alternativas y premios de participacion.",
    content: buildContent(
      "Evento de formato especial para vivir partidas con reglas alternativas.",
      "Una experiencia competitiva mas flexible, enfocada en diversion, comunidad y premios de participacion.",
    ),
    startsAt: eventDate(2026, 4, 22, 10),
    endsAt: eventDate(2026, 4, 24, 20),
    badgeLabel: "Formato especial",
  },
  {
    title: "Ascenso: Nueva Era",
    slug: "ascenso-nueva-era-mayo-2026",
    subtitle: "Premiacion y rifas",
    shortSummary:
      "Nueva fecha del evento promocional con sobres y carta especial para el Top.",
    content: buildContent(
      "Premiacion y rifas del evento por sobres de la nueva expansion.",
      "El Top recibe una carta promocional especial.",
    ),
    startsAt: eventDate(2026, 4, 29, 10),
    endsAt: eventDate(2026, 4, 31, 20),
    badgeLabel: "Promocional",
  },
  {
    title: "Torneo de lanzamiento Avance Etereo",
    slug: "torneo-de-lanzamiento-avance-etereo-junio-2026",
    subtitle: "Nueva expansion",
    shortSummary:
      "Torneo de lanzamiento de Avance Etereo con premios especiales de estreno.",
    content: buildContent(
      "Evento de lanzamiento de Avance Etereo.",
      "Participa en el estreno de la expansion y compite por recompensas especiales.",
    ),
    startsAt: eventDate(2026, 5, 5, 10),
    endsAt: eventDate(2026, 5, 7, 20),
    badgeLabel: "Lanzamiento",
  },
  {
    title: "Souls Keeper",
    slug: "souls-keeper-junio-2026",
    subtitle: "Victoria automatica SMC",
    shortSummary:
      "Nueva fecha de Souls Keeper con victoria automatica para el SMC.",
    content: buildContent(
      "El ganador obtendra una victoria automatica en el SMC.",
      "Cada victoria suma un sobre a tu recompensa, pero si caes en batalla, tu pozo se reparte con el jugador que te derroto.",
    ),
    startsAt: eventDate(2026, 5, 12, 10),
    endsAt: eventDate(2026, 5, 14, 20),
    badgeLabel: "Evento especial SMC",
  },
  {
    title: "El llamado del trono",
    slug: "el-llamado-del-trono-junio-2026",
    subtitle: "Pase VIP SMC",
    shortSummary:
      "Nueva fecha con victoria automatica en el SMC y pase VIP para el ganador.",
    content: buildContent(
      "El ganador obtendra una victoria automatica en el SMC.",
      "Ademas, el campeon recibe un pase VIP para el evento.",
    ),
    startsAt: eventDate(2026, 5, 19, 10),
    endsAt: eventDate(2026, 5, 21, 20),
    badgeLabel: "Evento especial SMC",
  },
  {
    title: "Souls Master Circuit Ibague",
    slug: "souls-master-circuit-ibague-2026",
    subtitle: "Game Pong",
    shortSummary:
      "Parada competitiva del Souls Master Circuit en Ibague.",
    content: buildContent(
      "Parada competitiva del Souls Master Circuit.",
      "Compite por puntos, premios y posicion en el circuito oficial de Souls In Xtinction.",
    ),
    startsAt: eventDate(2026, 5, 28, 10),
    endsAt: eventDate(2026, 5, 28, 20),
    badgeLabel: "SMC por ciudad",
  },
  {
    title: "Universo de la locura",
    slug: "universo-de-la-locura-julio-2026",
    subtitle: "Formato fun",
    shortSummary:
      "Nueva fecha de formato especial con reglas alternativas.",
    content: buildContent(
      "Evento de formato especial para vivir partidas con reglas alternativas.",
      "Una experiencia competitiva mas flexible, enfocada en diversion, comunidad y premios de participacion.",
    ),
    startsAt: eventDate(2026, 6, 3, 10),
    endsAt: eventDate(2026, 6, 5, 20),
    badgeLabel: "Formato especial",
  },
  {
    title: "Banquete de Almas",
    slug: "banquete-de-almas-julio-2026",
    subtitle: "Rifa especial",
    shortSummary:
      "Nueva fecha con rifa de caja de sobres y playmat exclusivo para el campeon.",
    content: buildContent(
      "Rifa de una caja de sobres entre todos los jugadores participantes.",
      "El campeon del evento recibe un playmat exclusivo.",
    ),
    startsAt: eventDate(2026, 6, 10, 10),
    endsAt: eventDate(2026, 6, 12, 20),
    badgeLabel: "Premio",
  },
  {
    title: "Souls Keeper",
    slug: "souls-keeper-julio-2026",
    subtitle: "Victoria automatica SMC",
    shortSummary:
      "Nueva fecha de Souls Keeper con victoria automatica para el SMC.",
    content: buildContent(
      "El ganador obtendra una victoria automatica en el SMC.",
      "Cada victoria suma un sobre a tu recompensa, pero si caes en batalla, tu pozo se reparte con el jugador que te derroto.",
    ),
    startsAt: eventDate(2026, 6, 25, 10),
    endsAt: eventDate(2026, 6, 26, 20),
    badgeLabel: "Evento especial SMC",
  },
  {
    title: "Lanzamiento mazo estructurado",
    slug: "lanzamiento-mazo-estructurado-julio-agosto-2026",
    subtitle: "Mazo estructurado",
    shortSummary:
      "Evento de lanzamiento de un nuevo mazo estructurado.",
    content: buildContent(
      "Evento de lanzamiento de nuevo mazo estructurado.",
      "Una oportunidad para conocer la nueva propuesta de juego y competir con la comunidad.",
    ),
    startsAt: eventDate(2026, 6, 31, 10),
    endsAt: eventDate(2026, 7, 2, 20),
    badgeLabel: "Lanzamiento",
  },
  {
    title: "El llamado del trono",
    slug: "el-llamado-del-trono-agosto-2026",
    subtitle: "Pase VIP SMC",
    shortSummary:
      "Nueva fecha con victoria automatica en el SMC y pase VIP para el ganador.",
    content: buildContent(
      "El ganador obtendra una victoria automatica en el SMC.",
      "Ademas, el campeon recibe un pase VIP para el evento.",
    ),
    startsAt: eventDate(2026, 7, 7, 10),
    endsAt: eventDate(2026, 7, 9, 20),
    badgeLabel: "Evento especial SMC",
  },
  {
    title: "Souls Master Circuit Medellin",
    slug: "souls-master-circuit-medellin-2026",
    subtitle: "Draco Hobby Center",
    shortSummary:
      "Parada competitiva del Souls Master Circuit en Medellin.",
    content: buildContent(
      "Parada competitiva del Souls Master Circuit.",
      "Compite por puntos, premios y posicion en el circuito oficial de Souls In Xtinction.",
    ),
    startsAt: eventDate(2026, 7, 16, 10),
    endsAt: eventDate(2026, 7, 16, 20),
    badgeLabel: "SMC por ciudad",
  },
  {
    title: "Universo de la locura",
    slug: "universo-de-la-locura-agosto-2026",
    subtitle: "Formato fun",
    shortSummary:
      "Nueva fecha de formato especial con reglas alternativas.",
    content: buildContent(
      "Evento de formato especial para vivir partidas con reglas alternativas.",
      "Una experiencia competitiva mas flexible, enfocada en diversion, comunidad y premios de participacion.",
    ),
    startsAt: eventDate(2026, 7, 21, 10),
    endsAt: eventDate(2026, 7, 23, 20),
    badgeLabel: "Formato especial",
  },
  {
    title: "Banquete de Almas",
    slug: "banquete-de-almas-agosto-2026",
    subtitle: "Rifa especial",
    shortSummary:
      "Nueva fecha con rifa de caja de sobres y playmat exclusivo para el campeon.",
    content: buildContent(
      "Rifa de una caja de sobres entre todos los jugadores participantes.",
      "El campeon del evento recibe un playmat exclusivo.",
    ),
    startsAt: eventDate(2026, 7, 28, 10),
    endsAt: eventDate(2026, 7, 30, 20),
    badgeLabel: "Premio",
  },
];

async function main() {
  const status: EventStatus = "published";

  await prisma.$transaction(async (tx) => {
    const deleted = await tx.event.deleteMany({});

    for (const event of events) {
      await tx.event.create({
        data: {
          ...event,
          status,
          featuredImage: PLACEHOLDER_IMAGE,
          cardImage: PLACEHOLDER_IMAGE,
        },
      });
    }

    console.log(`[seed-events] Eventos eliminados: ${deleted.count}`);
    console.log(`[seed-events] Eventos creados: ${events.length}`);
  });
}

main()
  .catch((error) => {
    console.error("[seed-events] Error:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
