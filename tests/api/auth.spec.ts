import { test, expect } from "@playwright/test";
import {
  apiErrorSchema,
  authTokenSchema,
} from "../support/contracts/api.contract";
import "dotenv/config";

const validCredentials = {
  username: process.env.AUTH_USERNAME!,
  password: process.env.AUTH_PASSWORD!,
};

test.describe("Autenticação JWT", () => {
  test("AUTH-009 bloqueia uma rota protegida sem token @smoke", async ({
    request,
  }) => {
    const response = await request.get("/api/sprints");
    apiErrorSchema.parse(await response.json());
    expect(response.status()).toBe(401);
  });

  test("AUTH-001 emite token para credenciais válidas @smoke", async ({ request }) => {
    const valid = await request.post("/api/auth/login", {
      data: validCredentials,
    });
    const body = authTokenSchema.parse(await valid.json());
    expect(valid.status()).toBe(200);
    expect(body.accessToken).toEqual(expect.any(String));
  });

  test("AUTH-002 rejeita username inválido @smoke", async ({ request }) => {
    const response = await request.post("/api/auth/login", {
      data: { username: "inexistente", password: validCredentials.password },
    });
    apiErrorSchema.parse(await response.json());
    expect(response.status()).toBe(401);
  });

  test("AUTH-003 rejeita password inválida @smoke", async ({ request }) => {
    const response = await request.post("/api/auth/login", {
      data: { username: validCredentials.username, password: "incorreta" },
    });
    apiErrorSchema.parse(await response.json());
    expect(response.status()).toBe(401);
  });

  test("AUTH-004 rejeita username e password inválidos", async ({
    request,
  }) => {
    const response = await request.post("/api/auth/login", {
      data: { username: "inexistente", password: "incorreta" },
    });
    apiErrorSchema.parse(await response.json());
    expect(response.status()).toBe(401);
  });

  test("AUTH-005 rejeita username ausente", async ({ request }) => {
    const response = await request.post("/api/auth/login", {
      data: { password: validCredentials.password },
    });
    apiErrorSchema.parse(await response.json());
    expect(response.status()).toBe(401);
  });

  test("AUTH-006 rejeita password ausente", async ({ request }) => {
    const response = await request.post("/api/auth/login", {
      data: { username: validCredentials.username },
    });
    apiErrorSchema.parse(await response.json());
    expect(response.status()).toBe(401);
  });

  test("AUTH-007 rejeita username vazio", async ({ request }) => {
    const response = await request.post("/api/auth/login", {
      data: { username: "", password: validCredentials.password },
    });
    apiErrorSchema.parse(await response.json());
    expect(response.status()).toBe(401);
  });

  test("AUTH-008 rejeita password vazia", async ({ request }) => {
    const response = await request.post("/api/auth/login", {
      data: { username: validCredentials.username, password: "" },
    });
    apiErrorSchema.parse(await response.json());
    expect(response.status()).toBe(401);
  });

  test("AUTH-010 rejeita token malformado @smoke", async ({ request }) => {
    const response = await request.get("/api/sprints", {
      headers: { Authorization: "Bearer invalido" },
    });
    apiErrorSchema.parse(await response.json());
    expect(response.status()).toBe(401);
  });

  test("AUTH-011 rejeita Authorization sem Bearer", async ({ request }) => {
    const response = await request.get("/api/sprints", {
      headers: { Authorization: "invalido" },
    });
    apiErrorSchema.parse(await response.json());
    expect(response.status()).toBe(401);
  });
});
