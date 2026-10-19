"use client";

import {
  completeGoogleProfile,
  completeSimulatorGoogleProfile,
} from "@/actions";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

interface Props {
  callbackUrl: string;
  initialName: string;
  initialLastname: string;
  simulatorTicket?: string;
}

type ProfileCompletionResult = {
  success: boolean;
  message?: string;
  redirectUrl?: string;
};

export function CompleteGoogleProfileForm({
  callbackUrl,
  initialName,
  initialLastname,
  simulatorTicket,
}: Props) {
  const router = useRouter();
  const { update } = useSession();
  const [name, setName] = useState(initialName);
  const [lastname, setLastname] = useState(initialLastname);
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result: ProfileCompletionResult = simulatorTicket
        ? await completeSimulatorGoogleProfile(simulatorTicket, {
            name,
            lastname,
            nickname,
          })
        : await completeGoogleProfile({ name, lastname, nickname });
      if (!result.success) {
        setError(result.message ?? "No se pudo completar el perfil.");
        return;
      }

      if (simulatorTicket && result.redirectUrl) {
        window.location.assign(result.redirectUrl);
        return;
      }

      await update({
        user: { name, lastname, nickname, profileCompleted: true },
      });
      router.replace(callbackUrl);
    });
  }

  return (
    <form className="mt-8 flex flex-col gap-4" onSubmit={handleSubmit}>
      {error ? (
        <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      ) : null}
      <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
        Nombre
        <input
          className="rounded-lg border border-slate-200 bg-slate-100/80 px-4 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          maxLength={15}
          onChange={(event) => setName(event.target.value)}
          required
          value={name}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
        Apellido
        <input
          className="rounded-lg border border-slate-200 bg-slate-100/80 px-4 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          maxLength={15}
          onChange={(event) => setLastname(event.target.value)}
          required
          value={lastname}
        />
      </label>
      <label className="flex flex-col gap-1 text-sm font-semibold text-slate-700">
        Nickname
        <input
          className="rounded-lg border border-slate-200 bg-slate-100/80 px-4 py-2 text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
          maxLength={10}
          minLength={3}
          onChange={(event) => setNickname(event.target.value)}
          required
          value={nickname}
        />
      </label>
      <button
        className="mt-2 rounded-lg bg-indigo-600 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Guardando..." : "Completar registro"}
      </button>
    </form>
  );
}
