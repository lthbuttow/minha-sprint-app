import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { ApiResult } from '../contracts/types';

export class ApiClient {
  constructor(private readonly request: APIRequestContext) {}

  get<T>(url: string) {
    return this.json<T>(this.request.get(url));
  }

  post<T>(url: string, data: object) {
    return this.json<T>(this.request.post(url, { data }));
  }

  patch<T>(url: string, data: object) {
    return this.json<T>(this.request.patch(url, { data }));
  }

  delete<T>(url: string) {
    return this.jsonOrEmpty<T>(this.request.delete(url));
  }

  getBinary(url: string) {
    return this.binary(this.request.get(url));
  }

  private async json<T>(response: Promise<APIResponse>): Promise<ApiResult<T>> {
    const result = await response;
    return { status: result.status(), body: await result.json() as T, headers: result.headers() };
  }

  private async jsonOrEmpty<T>(response: Promise<APIResponse>): Promise<ApiResult<T | undefined>> {
    const result = await response;
    const body = await result.text();
    return { status: result.status(), body: body ? JSON.parse(body) as T : undefined, headers: result.headers() };
  }

  private async binary(response: Promise<APIResponse>): Promise<ApiResult<Buffer>> {
    const result = await response;
    return { status: result.status(), body: await result.body(), headers: result.headers() };
  }
}
