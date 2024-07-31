import { z } from "zod";

export const EnvSchema = z.object({
  DATABASE_URL: z.string(),
});

export const ProcessEnv = EnvSchema.parse(process.env);
