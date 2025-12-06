"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createTournament_action } from "@/actions";

export const TournamentCreator = () => {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [url, setUrl] = useState("");
  const [date, setDate] = useState("");

  // se usa estos valores provisionales mientras se hace la lógica para obtenerlos.
  const storeId = "67c4bb4b15d333fa8987403e";
  const typeTournamentId = "67c4e30b4177fdb03545c48a";
  const format = "default";

  const create = async () => {
    if (!title.trim()) return alert("El torneo debe tener un título");

    const result = await createTournament_action({
      title,
      descripcion,
      format,
      url,
      lat: 0,
      lgn: 0,
      maxRounds: 1,
      storeId,
      typeTournamentId,
      date: new Date(date),
    });

    // Redirección a la página dinámica del torneo
    router.push(`/admin/torneos/${result.id}`);
  };

  return (
    <div className="p-6 my-4 border rounded-md bg-white shadow max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-center uppercase">Crear Torneo</h2>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Título del Torneo</label>
        <input
          className="w-full border px-3 py-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Torneo Semanal #5"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Descripción</label>
        <textarea
          className="w-full border px-3 py-2 rounded"
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Descripción breve del torneo..."
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">URL del evento</label>
        <input
          className="w-full border px-3 py-2 rounded"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://midominio.com/evento"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-semibold">Fecha del torneo</label>
        <input
          type="date"
          className="w-full border px-3 py-2 rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      <button
        onClick={create}
        className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
      >
        Crear Torneo
      </button>
    </div>
  );
};
