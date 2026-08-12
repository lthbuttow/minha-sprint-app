import { z } from 'zod';

export const apiErrorSchema = z.object({
  error: z.string(),
});

export const healthSchema = z.object({
  status: z.string(),
});

export const authTokenSchema = z.object({
  accessToken: z.string().min(1),
  tokenType: z.literal('Bearer'),
});
