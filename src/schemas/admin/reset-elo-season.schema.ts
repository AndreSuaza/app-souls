import { z } from "zod";

// Reset de Elo global: no requiere parametros, pero valida el payload vacio.
export const ResetEloSeasonSchema = z.object({});

export type ResetEloSeasonInput = z.input<typeof ResetEloSeasonSchema>;
