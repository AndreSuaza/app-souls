"use server";

import { auth } from "@/auth";
import { deleteUserDeck } from "@/lib/deck-management";
import type { DeleteDeckInput } from "@/schemas";

export async function deleteDeckAction(input: DeleteDeckInput) {
  const session = await auth();
  return deleteUserDeck(input, session?.user);
}
