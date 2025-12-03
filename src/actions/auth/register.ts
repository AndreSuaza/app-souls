"use server";

import { sendEmailVerification } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { palabrasProhibidas } from "@/models/inappropriateWords.model";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import { AuthError } from "next-auth";

type FormInputs = {
  name: string;
  lastname: string;
  nickname: string;
  image: string;
  email: string;
  password: string;
  confirmPassword: string;
};

function validarNickname(nickname: string): string | null {
  const trimmed = nickname.trim().toLowerCase();

  if (trimmed.length < 3 || trimmed.length > 20)
    return "El nickname debe tener entre 3 y 20 caracteres.";
  if (!/^[a-zA-Z0-9._]+$/.test(trimmed))
    return "Solo se permiten letras, números, puntos y guiones bajos.";
  if (/([a-zA-Z0-9._])\1{3,}/.test(trimmed))
    return "No repitas el mismo carácter muchas veces.";
  if (/^\d+$/.test(trimmed)) return "El nickname no puede ser solo números.";
  if (/@|www\./.test(trimmed)) return "No se permiten correos o URLs.";
  if (palabrasProhibidas.some((p) => trimmed.includes(p)))
    return "El nickname contiene palabras restringidas.";

  return null; // ✅ válido
}

export async function userRegistration(formData: FormInputs) {
  try {
    // verificar si existe el usuario en la base de datos
    const existsEmail = await prisma.user.findUnique({
      where: {
        email: formData.email,
      },
    });

    if (existsEmail) {
      return {
        success: false,
        message: "Este correo electrónico ya está registrado.",
      };
    }

    // Validar contraseñas
    if (formData.password !== formData.confirmPassword) {
      return { success: false, message: "Las contraseñas no coinciden." };
    }

    // Normalizar nickname
    const normalizedNickname = formData.nickname.trim().toLowerCase();

    // Validar nickname (formato)
    const nicknameError = validarNickname(normalizedNickname);
    if (nicknameError) {
      return { success: false, message: nicknameError };
    }

    // Validar nickname en la base de datos
    const existsNick = await prisma.user.findUnique({
      where: { nickname: normalizedNickname },
    });

    if (existsNick) {
      return {
        success: false,
        message: "Este nickname ya está en uso.",
      };
    }

    // hash de la contraseña
    const passwordHash = await bcrypt.hash(formData.password, 10);

    // crear el usuario
    const userdb = await prisma.user.create({
      data: {
        name: formData.name,
        lastname: formData.lastname,
        email: formData.email,
        nickname: normalizedNickname,
        password: passwordHash,
      },
    });

    // Crear token + enviar email
    if (userdb && userdb.email) {
      const token = nanoid();

      await prisma.verificationToken.create({
        data: {
          identifier: userdb.email,
          token,
          expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      });

      // enviar email de verificación
      await sendEmailVerification(userdb.email, token);
    }

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: error.cause?.err?.message };
    }
    return { error: "error 500" };
  }
}
