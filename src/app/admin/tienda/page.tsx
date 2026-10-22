import { redirect } from "next/navigation";

export default function Page() {
  // La administración de tienda queda oculta temporalmente; se conserva
  // AdminStoreManager para reactivar esta ruta en el futuro.
  redirect("/admin");
}
