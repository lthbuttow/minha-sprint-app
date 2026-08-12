import { type Locator, type Page } from '@playwright/test';

type CreateSprintInput = {
  name: string;
  startDate: string;
};

export class SprintPage {
  readonly content: Locator;
  readonly sidebar: Locator;
  readonly sprintItems: Locator;
  readonly newSprintButton: Locator;
  readonly sprintModal: Locator;
  readonly sprintName: Locator;
  readonly sprintStartDate: Locator;
  readonly createSprintButton: Locator;
  readonly dayCount: Locator;
  readonly daySummaries: Locator;
  readonly toast: Locator;

  constructor(private readonly page: Page) {
    this.content = page.locator('#app-content');
    this.sidebar = page.locator('#sprint-sidebar');
    this.sprintItems = page.locator('#sprint-list .sprint-menu-item');
    this.newSprintButton = page.locator('#new-sprint-button');
    this.sprintModal = page.locator('#sprint-modal');
    this.sprintName = page.locator('#sprint-name');
    this.sprintStartDate = page.locator('#sprint-start-date');
    this.createSprintButton = page.getByRole('button', {
      name: 'Criar sprint de 11 dias',
    });
    this.dayCount = page.locator('#day-count');
    this.daySummaries = page.locator('#days-list [data-day-id]');
    this.toast = page.locator('#toast');
  }

  async createSprint({ name, startDate }: CreateSprintInput) {
    await this.newSprintButton.click();
    await this.sprintName.fill(name);
    await this.sprintStartDate.fill(startDate);
    await this.createSprintButton.click();
  }

  heading(name: string) {
    return this.page.getByRole('heading', { name, exact: true });
  }

  firstDaySummary() {
    return this.daySummaries.first();
  }

  async saveFirstDaySummary(summary: string) {
    const firstDaySummary = this.firstDaySummary();
    await firstDaySummary.click();
    await firstDaySummary.pressSequentially(summary);
    await firstDaySummary.press('Tab');
  }
}
