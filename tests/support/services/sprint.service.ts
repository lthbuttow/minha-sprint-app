import type { APIRequestContext } from "@playwright/test";
import type {
  Annotation,
  ApiError,
  AttentionPoint,
  Sprint,
  SprintDay,
} from "../contracts/types";
import { ApiClient } from "./api-client";

export class SprintService {
  private readonly client: ApiClient;

  constructor(request: APIRequestContext, token: string) {
    this.client = new ApiClient(request, token);
  }

  create(data: object) {
    return this.client.post<Sprint | ApiError>('/api/sprints', data);
  }

  list() {
    return this.client.get<Sprint[]>('/api/sprints');
  }

  get(sprintId: number | string) {
    return this.client.get<Sprint | ApiError>(`/api/sprints/${sprintId}`);
  }

  update(sprintId: number, data: object) {
    return this.client.patch<Sprint | ApiError>(`/api/sprints/${sprintId}`, data);
  }

  addDay(sprintId: number, data: object) {
    return this.client.post<SprintDay | ApiError>(`/api/sprints/${sprintId}/days`, data);
  }

  updateDay(sprintId: number, dayId: number, data: object) {
    return this.client.patch<SprintDay | ApiError>(
      `/api/sprints/${sprintId}/days/${dayId}`,
      data,
    );
  }

  removeDay(sprintId: number, dayId: number) {
    return this.client.delete<ApiError>(`/api/sprints/${sprintId}/days/${dayId}`);
  }

  addAnnotation(sprintId: number, data: object) {
    return this.client.post<Annotation | ApiError>(`/api/sprints/${sprintId}/annotations`, data);
  }

  updateAnnotation(sprintId: number, annotationId: number, data: object) {
    return this.client.patch<Annotation | ApiError>(
      `/api/sprints/${sprintId}/annotations/${annotationId}`,
      data,
    );
  }

  removeAnnotation(sprintId: number, annotationId: number) {
    return this.client.delete<ApiError>(
      `/api/sprints/${sprintId}/annotations/${annotationId}`,
    );
  }

  addAttentionPoint(sprintId: number, data: object) {
    return this.client.post<AttentionPoint | ApiError>(
      `/api/sprints/${sprintId}/attention-points`,
      data,
    );
  }

  resolveAttentionPoint(sprintId: number, pointId: number, data: object) {
    return this.client.patch<AttentionPoint | ApiError>(
      `/api/sprints/${sprintId}/attention-points/${pointId}`,
      data,
    );
  }

  report(sprintId: number) {
    return this.client.getBinary(`/api/sprints/${sprintId}/report.pdf`);
  }
}
