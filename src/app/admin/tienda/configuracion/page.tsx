import { redirect } from "next/navigation";

export default function Page() {
  // Ruta reservada para una futura reactivación de configuración de tienda.
  redirect("/admin");
}
