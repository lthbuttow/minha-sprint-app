import { expect, test } from "@playwright/test";
import { healthSchema } from "../support/contracts/api.contract";

test("HEALTH-001 retorna o estado saudável da API", async ({ request }) => {
  const response = await request.get("/health");
  const body = healthSchema.parse(await response.json());
  expect(response.status()).toBe(200);
  expect(body.status).toBe("ok");
});
