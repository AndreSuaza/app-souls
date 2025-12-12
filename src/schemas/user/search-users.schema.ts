import { z } from "zod";

export const SearchUsersSchema = z.object({
  search: z
    .string()
    .trim()
    .min(1, "La búsqueda no puede estar vacía")
    .max(50, "La búsqueda es demasiado larga"),
});

export type SearchUsersInput = z.infer<typeof SearchUsersSchema>;
