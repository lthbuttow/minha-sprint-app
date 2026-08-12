import { test as base } from '@playwright/test';
import { SprintService } from './services/sprint.service';
import 'dotenv/config';

type Fixtures = { sprints: SprintService };

const accessToken = process.env.TEST_AUTH_TOKEN;

if (!accessToken) {
  throw new Error('TEST_AUTH_TOKEN deve estar definido no arquivo .env para executar os testes de API.');
}

export const test = base.extend<Fixtures>({
  sprints: async ({ request }, use) => {
    await use(new SprintService(request, accessToken));
  },
});

export { expect } from '@playwright/test';
