import { z } from 'zod';

export const sprintDaySchema = z.object({
  id: z.number().int(),
  date: z.string(),
  summary: z.string(),
});

export const annotationSchema = z.object({
  id: z.number().int(),
  content: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const attentionPointSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  description: z.string(),
  resolved: z.boolean(),
  resolution: z.string().nullable(),
  createdAt: z.string(),
  resolvedAt: z.string().nullable(),
  overdue: z.boolean(),
});

export const sprintSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  generalNotes: z.string(),
  createdAt: z.string(),
  days: z.array(sprintDaySchema),
  annotations: z.array(annotationSchema),
  attentionPoints: z.array(attentionPointSchema),
});
