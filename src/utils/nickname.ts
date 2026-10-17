import { palabrasProhibidas } from "@/models/inappropriateWords.model";

export function validateNickname(nickname: string): string | null {
  const trimmed = nickname.trim().toLowerCase();

  if (trimmed.length < 3 || trimmed.length > 10) {
    return "El nickname debe tener entre 3 y 10 caracteres.";
  }
  if (!/^[a-zA-Z0-9._]+$/.test(trimmed)) {
    return "Solo se permiten letras, numeros, puntos y guiones bajos.";
  }
  if (/([a-zA-Z0-9._])\1{3,}/.test(trimmed)) {
    return "No repitas el mismo caracter muchas veces.";
  }
  if (/^\d+$/.test(trimmed)) {
    return "El nickname no puede ser solo numeros.";
  }
  if (/@|www\./.test(trimmed)) {
    return "No se permiten correos o URLs.";
  }
  if (palabrasProhibidas.some((word) => trimmed.includes(word))) {
    return "El nickname contiene palabras restringidas.";
  }

  return null;
}
