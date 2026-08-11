import { test as base } from '@playwright/test';
import { SprintService } from './services/sprint.service';

type Fixtures = { sprints: SprintService };

export const test = base.extend<Fixtures>({
  sprints: async ({ request }, use) => {
    await use(new SprintService(request));
  },
});

export { expect } from '@playwright/test';
