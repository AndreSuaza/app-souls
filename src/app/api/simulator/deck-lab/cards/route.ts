import { NextResponse } from "next/server";
import { loadDeckLabCards } from "@/lib/simulator-deck-lab";
import { simulatorCorsHeaders, simulatorOptionsResponse } from "@/lib/simulator-cors";
import { verifySimulatorToken } from "@/lib/simulator-token";

export const runtime = "nodejs";

const getToken = (request: Request) => request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";

const readFilters = (request: Request) => {
  const url = new URL(request.url);
  return {
    archetypes: url.searchParams.get("archetypes") ?? undefined,
    costs: url.searchParams.get("costs") ?? undefined,
    defenses: url.searchParams.get("defenses") ?? undefined,
    forces: url.searchParams.get("forces") ?? undefined,
    keywords: url.searchParams.get("keywords") ?? undefined,
    limit: url.searchParams.get("limit") ?? undefined,
    page: Number.parseInt(url.searchParams.get("page") ?? "1", 10),
    products: url.searchParams.get("products") ?? undefined,
    rarities: url.searchParams.get("rarities") ?? undefined,
    take: Number.parseInt(url.searchParams.get("take") ?? "24", 10),
    text: url.searchParams.get("text") ?? undefined,
    types: url.searchParams.get("types") ?? undefined,
  };
};

export async function OPTIONS(request: Request) {
  return simulatorOptionsResponse(request, "GET, OPTIONS");
}

export async function GET(request: Request) {
  const headers = simulatorCorsHeaders(request.headers.get("origin"));
  const session = verifySimulatorToken(getToken(request));
  if (!session) return NextResponse.json({ error: "Token de simulador invalido." }, { status: 401, headers });

  const payload = await loadDeckLabCards(readFilters(request));
  return NextResponse.json(payload, { headers });
}
