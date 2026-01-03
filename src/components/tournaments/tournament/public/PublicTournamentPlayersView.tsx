import { TournamentRankingPanel } from "@/components";
import {
  type RoundInterface,
  type TournamentPlayerInterface,
} from "@/interfaces";

type TournamentStatus = "pending" | "in_progress" | "finished" | "cancelled";

type Props = {
  players: TournamentPlayerInterface[];
  rounds: RoundInterface[];
  status: TournamentStatus;
};

export function PublicTournamentPlayersView({
  players,
  rounds,
  status,
}: Props) {
  return (
    <div className="flex w-full">
      <TournamentRankingPanel
        players={players}
        rounds={rounds}
        status={status}
        showTitle
      />
    </div>
  );
}
