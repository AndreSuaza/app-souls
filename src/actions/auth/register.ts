"use server";

import { prisma } from "@/lib/prisma";
import { palabrasProhibidas } from "@/models/inappropriateWords.model";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "next-auth/react";

type FormInputs = {
    name: string;
    lastname: string;
    nickname: string;
    image: string;
    email: string;
    password: string;  
    confirmPassword: string;
}

function validarNickname(nickname: string): string | null {
  const trimmed = nickname.trim().toLowerCase();
  
  if (trimmed.length < 3 || trimmed.length > 20) return "El nickname debe tener entre 3 y 20 caracteres.";
  if (!/^[a-zA-Z0-9._]+$/.test(trimmed)) return "Solo se permiten letras, números, puntos y guiones bajos.";
  if (/([a-zA-Z0-9._])\1{3,}/.test(trimmed)) return "No repitas el mismo carácter muchas veces.";
  if (/^\d+$/.test(trimmed)) return "El nickname no puede ser solo números.";
  if (/@|www\./.test(trimmed)) return "No se permiten correos o URLs.";
  if (palabrasProhibidas.some(p => trimmed.includes(p))) return "El nickname contiene palabras restringidas.";

  return null; // ✅ válido
}

export async function userRegistration(formData: FormInputs) {

 try {
    
    // verificar si existe el usuario en la base de datos
    const user = await prisma.user.findUnique({
        where: {
        email: formData.email,
        },
    }); 
    
    if (user) {
      return { success: false, message: "Este correo electrónico ya está registrado." };
    }

    if(formData.password !== formData.confirmPassword) {
      return { success: false, message: "Las contraseñas no coinciden." };
    }

     // hash de la contraseña
    const passwordHash = await bcrypt.hash(formData.password, 10);

    const validateNickname = validarNickname(formData.nickname) 

    if(validateNickname) {
      return { success: false, message: validateNickname };
    }

    // crear el usuario
    await prisma.user.create({
      data: {
        name: formData.name,
        lastname: formData.lastname,
        email: formData.email,
        nickname: formData.nickname,
        password: passwordHash,
      },
    });

    await signIn("credentials", {
      email: formData.email,
      password: formData.password,
      redirect: false,
    });

    return { success: true };

 } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message };
    }
    return { error: "error 500" };
 }

}