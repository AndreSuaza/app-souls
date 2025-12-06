import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { Title, Tournament } from "@/components";

type Props = {
  params: { id: string };
};

const TournamentPage = async ({ params }: Props) => {
  const { id } = await params;

  const session = await auth();

  if (
    !session ||
    (session.user.role !== "store" && session.user.role !== "admin")
  ) {
    redirect("/auth/login");
  }

  return (
    <>
      <Title title="Torneo" />
      <Tournament tournamentId={id} />
    </>
  );
};

export default TournamentPage;
