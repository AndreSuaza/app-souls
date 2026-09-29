"use server";

import { auth } from "@/auth";
import { saveUserDeck } from "@/lib/deck-management";
import type { SaveDeckInput } from "@/schemas";
import { AuthError } from "next-auth";

export async function saveDeck(input: SaveDeckInput) {
  try {
    const session = await auth();
    return await saveUserDeck(input, session?.user);
  } catch (error) {
    if (error instanceof AuthError) {
      return {
        success: false,
        message:
          error.cause?.err?.message ??
          "No se pudo validar la sesion activa. Vuelve a iniciar sesión.",
      };
    }

    console.error("[saveDeck]", error);

    return {
      success: false,
      message: "No se pudo guardar el mazo. Intentalo nuevamente.",
    };
  }
}
