import { Tournament } from "@/interfaces";
import clsx from "clsx";
import moment from "moment";
import Image from "next/image";
import Link from "next/link";

interface Props {
  tournament: Tournament;
}

export const TournamentItem = ({ tournament }: Props) => {
  return (
    <div
      className={clsx(
        "bg-white shadow-md grid grid-cols-1 md:grid-cols-6 my-4 px-2 rounded-lg py-4",
        { "opacity-70": tournament.date < new Date() }
      )}
    >
      <div className="">
        <div className="text-center flex flex-row md:flex-col">
          <p className="text-2xl mx-1 font-bold uppercase">
            {moment(tournament.date).format("MMMM")}
          </p>
          <p className="text-2xl mx-1 font-bold md:text-5xl mb-2">
            {moment(tournament.date).format("DD")}
          </p>
          <p className="text-2xl mx-1 font-bold ">
            {moment(tournament.date).format("h:mm a")}
          </p>
        </div>
      </div>
      <div className="col-span-4 mx-2">
        <span className="font-semibold text-indigo-600">{`${tournament.store.name}, ${tournament.store.city}`}</span>
        <h2 className="text-2xl font-bold mb-2">{tournament.title}</h2>
        <p>{tournament.description}</p>
        {tournament.date > new Date() ? (
          tournament.url !== "" ? (
            <Link href={`/torneos/${tournament.url}`}>
              <button className="btn-primary mt-3 mb-6">Conoce Mas</button>
            </Link>
          ) : (
            <p className="font-bold uppercase my-2 text-indigo-600">
              Más información próximamente.
            </p>
          )
        ) : (
          <></>
        )}
      </div>
      <div className="m-auto hidden md:block">
        <Image
          src={`/tournaments/${tournament.TournamentImage[0].url}.jpg`}
          alt={tournament.title}
          className="rounded-lg"
          width={160}
          height={160}
        />
      </div>
    </div>
  );
};
