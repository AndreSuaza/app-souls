import { auth } from "@/auth";
import { Title, Tournament } from "@/components";
import { redirect } from "next/navigation";

const Torneo = async () => {
  const session = await auth();
  
  if (session?.user?.role !== "store") {
      redirect( '/auth/login' );
  }
  
  return (
    <>
    <Title title="Creador de torneos"/>
    <Tournament/>
    </>
  )
}

export default Torneo;