import { Tournament } from "@/interfaces";
import clsx from "clsx";
import moment from "moment";
import Image from "next/image";

interface Props {
  tournament: Tournament;
}

export const TournamentItem = ({ tournament }: Props) => {
  const tournamentImage =
    tournament.image && (tournament.image.startsWith("http") || tournament.image.startsWith("/"))
      ? tournament.image
      : tournament.image
        ? `/tournaments/${tournament.image}`
        : null;

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
          <p className="font-bold uppercase my-2 text-indigo-600">
            Mケs informaciИn prИximamente.
          </p>
        ) : (
          <></>
        )}
      </div>
      {tournamentImage ? (
        <div className="m-auto hidden md:block">
          <Image
            src={tournamentImage}
            alt={tournament.title}
            className="rounded-lg"
            width={160}
            height={160}
          />
        </div>
      ) : null}
    </div>
  );
};
