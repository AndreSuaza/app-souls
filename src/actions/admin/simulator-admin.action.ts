"use server";

import { auth } from "@/auth";
import { z } from "zod";

const controlSchema = z.object({
  mode: z.enum(["normal", "draining"]),
  message: z.string().min(1),
  updatedAt: z.string().datetime(),
  updatedBy: z.string().min(1).optional(),
});

const roomSchema = z.object({
  createdAt: z.string().datetime(),
  entryMode: z.enum(["manual", "matchmaking"]),
  matchMode: z.enum(["bestOf1", "bestOf3"]),
  matchStatus: z.enum(["waitingForPlayers", "setup", "mulligan", "inProgress", "completed"]),
  phase: z.string(),
  players: z.array(z.object({
    connectionStatus: z.enum(["connected", "disconnected"]),
    disconnectedAt: z.string().optional(),
    lives: z.number().int().nonnegative(),
    nickname: z.string().min(1),
    seat: z.enum(["playerA", "playerB"]),
    userId: z.string().min(1),
  })),
  roomId: z.string().min(1),
  spectatorCount: z.number().int().nonnegative(),
  spectatorUrl: z.string().url().optional(),
  winner: z.enum(["playerA", "playerB", ""]),
});

const roomsSchema = z.object({
  rooms: z.array(roomSchema),
  updatedAt: z.string().datetime(),
});

const updateControlSchema = z.object({
  mode: z.enum(["normal", "draining"]),
  message: z.string().max(300),
});

const roomIdSchema = z.string().trim().min(1).max(128);

export type SimulatorAdminControl = z.infer<typeof controlSchema>;
export type SimulatorAdminRoom = z.infer<typeof roomSchema>;
export type SimulatorAdminRooms = z.infer<typeof roomsSchema>;

const requireAdmin = async () => {
  const session = await auth();
  if (!session?.user?.idd || session.user.role !== "admin") {
    throw new Error("No tienes permisos para administrar el simulador.");
  }
  return session.user.idd;
};

const simulatorRequest = async (path: string, init: RequestInit = {}) => {
  const url = process.env.SIMULATOR_ADMIN_API_URL?.trim();
  const token = process.env.SIMULATOR_ADMIN_API_TOKEN?.trim();
  if (!url || !token) {
    throw new Error("El API administrativo del simulador no está configurado.");
  }

  const response = await fetch(`${url.replace(/\/$/, "")}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    signal: AbortSignal.timeout(5_000),
  });
  const payload = (await response.json().catch(() => null)) as unknown;
  if (!response.ok) {
    const message = z.object({ error: z.string().optional() }).safeParse(payload);
    throw new Error(message.success && message.data.error ? message.data.error : `El simulador respondió ${response.status}.`);
  }
  return payload;
};

export async function getAdminSimulatorControlAction(): Promise<SimulatorAdminControl> {
  await requireAdmin();
  return controlSchema.parse(await simulatorRequest("/admin/control"));
}

export async function getAdminSimulatorRoomsAction(): Promise<SimulatorAdminRooms> {
  await requireAdmin();
  const rooms = roomsSchema.parse(await simulatorRequest("/admin/rooms"));
  const simulatorOrigin = process.env.SIMULATOR_WEB_ORIGIN?.trim() || "http://127.0.0.1:5173";

  return {
    ...rooms,
    rooms: rooms.rooms.map((room) => ({
      ...room,
      spectatorUrl: new URL(`/rooms/${encodeURIComponent(room.roomId)}`, simulatorOrigin).toString(),
    })),
  };
}

export async function updateAdminSimulatorControlAction(input: unknown): Promise<SimulatorAdminControl> {
  const adminId = await requireAdmin();
  const parsed = updateControlSchema.parse(input);
  return controlSchema.parse(
    await simulatorRequest("/admin/control", {
      method: "POST",
      body: JSON.stringify({ ...parsed, updatedBy: adminId }),
    }),
  );
}

export async function forceFinishAdminSimulatorRoomAction(roomId: string): Promise<SimulatorAdminRoom> {
  await requireAdmin();
  const parsedRoomId = roomIdSchema.parse(roomId);
  return roomSchema.parse(
    await simulatorRequest(`/admin/rooms/${encodeURIComponent(parsedRoomId)}/force-finish`, {
      method: "POST",
      body: JSON.stringify({}),
    }),
  );
}
