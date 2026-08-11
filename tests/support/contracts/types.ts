import type { z } from 'zod';
import type { apiErrorSchema } from './api.contract';
import type { annotationSchema, attentionPointSchema, sprintDaySchema, sprintSchema } from './sprint.contract';

export type ApiError = z.infer<typeof apiErrorSchema>;
export type SprintDay = z.infer<typeof sprintDaySchema>;
export type Annotation = z.infer<typeof annotationSchema>;
export type AttentionPoint = z.infer<typeof attentionPointSchema>;
export type Sprint = z.infer<typeof sprintSchema>;

export interface ApiResult<T> {
  status: number;
  body: T;
  headers: Record<string, string>;
}
