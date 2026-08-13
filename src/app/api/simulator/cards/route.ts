import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { simulatorCorsHeaders, simulatorOptionsResponse } from "@/lib/simulator-cors";
import { toSimulatorCardDto } from "@/lib/simulator-deck";
import { verifySimulatorToken } from "@/lib/simulator-token";
import { resolveCardImageUrl } from "@/utils/card-image";

export const runtime = "nodejs";

const getToken = (request: Request) => request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
const mongoObjectIdPattern = /^[a-f\d]{24}$/i;
const trailingMongoObjectIdPattern = /-([a-f\d]{24})$/i;

const expandCardLookupKeys = (keys: string[]) =>
  Array.from(
    new Set(
      keys.flatMap((key) => {
        const trimmedKey = key.trim();
        if (!trimmedKey) return [];
        const trailingObjectId = trailingMongoObjectIdPattern.exec(trimmedKey)?.[1];
        return [
          trimmedKey,
          ...(trailingObjectId ? [trailingObjectId, trimmedKey.slice(0, -trailingObjectId.length - 1)] : []),
        ].filter(Boolean);
      }),
    ),
  );

const readRequestedCardIds = (request: Request) =>
  expandCardLookupKeys(
    new URL(request.url).searchParams
      .getAll("ids")
      .flatMap((value) => value.split(","))
      .slice(0, 120),
  );

export async function OPTIONS(request: Request) {
  return simulatorOptionsResponse(request, "GET, OPTIONS");
}

export async function GET(request: Request) {
  const headers = simulatorCorsHeaders(request.headers.get("origin"));
  const session = verifySimulatorToken(getToken(request));
  if (!session) return NextResponse.json({ error: "Token de simulador invalido." }, { status: 401, headers });

  const cardKeys = readRequestedCardIds(request);
  const cardObjectIds = cardKeys.filter((key) => mongoObjectIdPattern.test(key));
  const cards =
    cardKeys.length > 0
      ? await prisma.card.findMany({
          where: {
            OR: [
              { code: { in: cardKeys } },
              { idd: { in: cardKeys } },
              ...(cardObjectIds.length > 0 ? [{ id: { in: cardObjectIds } }] : []),
            ],
          },
          select: {
            id: true,
            idd: true,
            code: true,
            name: true,
            typeIds: true,
            cost: true,
            force: true,
            defense: true,
            effect: true,
            imageUrl: true,
          },
        })
      : [];
  const typeIds = Array.from(new Set(cards.flatMap((card) => card.typeIds)));
  const types =
    typeIds.length > 0
      ? await prisma.type.findMany({
          where: { id: { in: typeIds } },
          select: { id: true, name: true },
        })
      : [];
  const typeById = new Map(types.map((type) => [type.id, type]));

  return NextResponse.json(
    {
      cards: cards.map((card) =>
        toSimulatorCardDto({
          id: card.id,
          idd: card.idd,
          code: card.code,
          name: card.name,
          types: card.typeIds.flatMap((typeId) => {
            const type = typeById.get(typeId);
            return type ? [{ name: type.name }] : [];
          }),
          cost: card.cost,
          force: card.force,
          defense: card.defense,
          effect: card.effect,
          imageUrl: resolveCardImageUrl(card),
        }),
      ),
    },
    { headers },
  );
}
