import { test, expect } from '@playwright/test';
import { apiErrorSchema } from '../support/contracts/api.contract';

test.describe('Autenticação JWT', () => {
  test('bloqueia uma rota protegida sem token', async ({ request }) => {
    const response = await request.get('/api/sprints');

    expect(response.status()).toBe(401);
    apiErrorSchema.parse(await response.json());
  });

  test('emite token para credenciais válidas e rejeita credenciais inválidas', async ({ request }) => {
    const invalid = await request.post('/api/auth/login', { data: { username: 'test-user', password: 'senha-incorreta' } });
    expect(invalid.status()).toBe(401);

    const valid = await request.post('/api/auth/login', { data: { username: 'test-user', password: 'test-password' } });
    expect(valid.status()).toBe(200);
    const body = await valid.json();
    expect(body).toMatchObject({ tokenType: 'Bearer' });
    expect(body.expiresIn).toBeUndefined();
    expect(body.accessToken).toEqual(expect.any(String));
  });
});
