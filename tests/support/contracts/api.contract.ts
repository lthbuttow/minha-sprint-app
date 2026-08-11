import { z } from 'zod';

export const apiErrorSchema = z.object({
  error: z.string(),
});

export const healthSchema = z.object({
  status: z.string(),
});
