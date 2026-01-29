"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AuthError } from "next-auth";

type FormInputs = {
    name: string;
    description: string;
    archetypesId: string;
    cards: string;
    visible: boolean;
    image: string;
}

export async function saveDeck(formData: FormInputs, deckList: string, imgDeck: string) {

   const session = await auth();
   

 try {

   if(!session) { 

      return { success: false, message: "No tienes una sesión activa. Por favor, inicia sesión para continuar"};
   }
 
   if(!session.user.idd) {
      return { success: false, message: "Error en la sesión activa. Por favor, vuelva a iniciar sesión para continuar"};
   }
   // verificar si existe el usuario en la base de datos
   const decksNumber = await prisma.deck.count({
      where: {
      userId: session?.user.id,
      },
   }); 
      
   if(decksNumber<=20) {
      await prisma.deck.create({
         data: {
            userId: session.user.idd,
            name: formData.name,
            description: formData.description,
            archetypeId: formData.archetypesId,
            imagen: imgDeck,
            cards: deckList,
            visible: !formData.visible,
         },
      });

   } else {
      return { success: false, message: "Límite de 20 mazos alcanzado" };
   }

 } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message };
    }
    return { error: "error 500" };
 }

}