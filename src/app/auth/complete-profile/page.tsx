import { auth } from "@/auth";
import { CompleteGoogleProfileForm } from "@/components/auth/CompleteGoogleProfileForm";
import { sanitizeAuthCallbackUrl } from "@/utils/auth-callback";
import { redirect } from "next/navigation";

interface Props {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function CompleteProfilePage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.idd) redirect("/auth/login");

  const callbackUrl = sanitizeAuthCallbackUrl(
    (await searchParams).callbackUrl,
  );
  if (session.user.profileCompleted !== false) redirect(callbackUrl);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-900 bg-[url(/bg-registro.webp)] bg-cover px-4 py-10">
      <section className="w-full max-w-xl rounded-2xl border border-white/35 bg-white/95 p-8 shadow-[0_28px_70px_rgba(15,23,42,0.35)] backdrop-blur">
        <h1 className="text-center text-2xl font-semibold text-slate-900">
          Completa tu registro
        </h1>
        <p className="mt-2 text-center text-sm text-slate-600">
          Elige el nickname que usarás en Souls In Xtinction.
        </p>
        <CompleteGoogleProfileForm
          callbackUrl={callbackUrl}
          initialLastname={session.user.lastname ?? ""}
          initialName={session.user.name ?? ""}
        />
      </section>
    </main>
  );
}
