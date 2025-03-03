// export const revalidate = 604800; //7 dias

import { notFound } from 'next/navigation';
import { getTournamenttUrl } from '@/actions';
import { MDXRemote } from 'next-mdx-remote/rsc';
import "./style.css";

interface Props {
  params: {
    slug: string;
  }
}
 

const mku = `
La espera ha terminado.  Souls In Xtinction_ entra oficialmente en la arena competitiva con el lanzamiento del **Souls Masters Circuit**, un torneo épico donde los mejores jugadores se enfrentarán por el honor y la supremacía. Este evento no solo es una competencia, sino el primer paso para consolidar a _Souls In Xtinction_ como un fenómeno en el universo de los juegos de cartas coleccionables.

El **Souls Masters Circuit** es más que un torneo, es una experiencia que pondrá a prueba la habilidad, la estrategia y la capacidad de los jugadores para adaptarse a las mecánicas únicas del juego. En este torneo, los participantes tendrán la oportunidad de demostrar su destreza con las cartas más poderosas, usando combinaciones letales y elaboradas para superar a sus oponentes.

## Premiación del Evento

### Primer lugar

1. $1'000.000 pesos en efectivo.
2. Tapete de juego Souls Masters Circuit
3. Entrada VIP al Souls Masters Champions
4. 1 Purificador de Almas Gold Secret AA
5. 1 Alma Gold Secret Souls Masters Circuit
6. 45 puntos Souls Master

### Segundo lugar

1. 2 caja Génesis del Caos
2. 2 cajas leyendas peludas
3. Tapete de juego Souls Masters Circuit
4. 1 Purificador de Almas Gold Secret AA
5. 1 Alma Gold secret Souls Masters Circuit
6. 35 puntos Souls Master

### Tercero y Cuarto lugar

1. 12 Sobres Génesis del Caos
2. 1 Caja leyendas peludas
3. Tapete de juego Souls Masters Circuit
4. 1 Purificador de Almas Gold Secret AA
5. 1 Alma Gold secret Souls Masters Circuit
6. 25 puntos Souls Master

### Quinto al Octavo Lugar

1. 6 Sobres Génesis del Caos
2. Tapete de juego Souls Masters Circuit
3. 1 Alma Gold secret Souls Masters Circuit
4. 15 puntos Souls Master

## Información del evento

**Dia:** 1 Diciembre 2024

**Lugar:** TCG Collectibles, Cra. 13a #127-8 en la Ciudad de Bogotá.

**Hora:** 10:00 am

**Costo:** $48:000

### Por participar recibes:

1. 1 Sobre de Souls Masters Circuit
2. 1 Sobre Génesis del Caos
3. 1 Sobre maestro
4. 1 Alma Ultra
5. 5 Puntos Souls Masters

**El Souls Masters Circuit** será el escenario perfecto para que los jugadores demuestren sus habilidades y se enfrenten a otros guerreros de almas en un campo de batalla épico. Prepárate para el inicio de esta nueva era del competitivo de _Souls In Xtinction._

**¡Inscripciones abiertas ahora!** No pierdas la oportunidad de ser parte de este histórico evento que definirá el futuro de los jugadores más legendarios.`;

export default async function getTournamentBySlug({ params }: Props) {

  const { slug } = await params;
  const tournament = await getTournamenttUrl(slug);
  console.log(slug);
  if (!tournament) {
    notFound();
  }

  return (

    <>
    <section className='grid grid-cols-1 lg:grid-cols-8 lg:mx-40'>


      <div className=''>
        <p>redes</p>
      </div>
      <div className='col-span-5'>
        <div className='bg-green-500 w-full h-80'>
        </div>
        <h1 className='text-5xl font-bold my-4'>{tournament?.title}</h1>
        <MDXRemote source={mku} />
        <p>{tournament?.format}</p>
        <p>{tournament?.typeTournament.name}</p>
      </div>
      <div className='col-span-2'>
        <p>{tournament.store.name}</p>
        <p>{tournament.store.lat}</p>
        <p>{tournament.store.lgn}</p>
        <p>{tournament.store.url}</p>
      </div>
    </section>

    </>
  )
}
