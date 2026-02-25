import type { NewsStatus } from "@/interfaces";

type ResolveNewsStatusInput = {
  publishedAt: Date | null;
  publishNow?: boolean;
  now?: Date;
};

type ResolveNewsStatusResult = {
  status: NewsStatus;
  publishedAt: Date | null;
};

// Resuelve el estado final en base a la fecha y la acción de publicar ahora.
export const resolveNewsStatus = ({
  publishedAt,
  publishNow = false,
  now = new Date(),
}: ResolveNewsStatusInput): ResolveNewsStatusResult => {
  if (publishNow) {
    return { status: "published", publishedAt: now };
  }

  if (!publishedAt) {
    return { status: "draft", publishedAt: null };
  }

  if (publishedAt.getTime() > now.getTime()) {
    return { status: "scheduled", publishedAt };
  }

  return { status: "published", publishedAt };
};
