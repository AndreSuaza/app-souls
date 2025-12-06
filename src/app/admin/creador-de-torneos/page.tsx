import { auth } from "@/auth";
import { Title, TournamentCreator } from "@/components";
import { redirect } from "next/navigation";

const Torneo = async () => {
  const session = await auth();

  const role = session?.user?.role;

  if (role !== "store" && role !== "admin") {
    redirect("/auth/login");
  }

  return (
    <>
      <Title title="Creador de torneos" />

      <TournamentCreator />
    </>
  );
};

export default Torneo;
