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
  readonly search: Locator;
  readonly addDayButton: Locator;
  readonly annotationContent: Locator;
  readonly addAnnotationButton: Locator;
  readonly annotationCount: Locator;
  readonly attentionTitle: Locator;
  readonly addAttentionButton: Locator;
  readonly attentionCount: Locator;
  readonly resolutionModal: Locator;
  readonly resolutionText: Locator;
  readonly resolvePointButton: Locator;
  readonly exportReportButton: Locator;

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
    this.search = page.locator('#sprint-search');
    this.addDayButton = page.locator('#add-day');
    this.annotationContent = page.locator('#annotation-content');
    this.addAnnotationButton = page.getByRole('button', {
      name: '+ Adicionar anotação',
    });
    this.annotationCount = page.locator('#annotation-count');
    this.attentionTitle = page.locator('#attention-title');
    this.addAttentionButton = page.getByRole('button', {
      name: 'Adicionar',
      exact: true,
    });
    this.attentionCount = page.locator('#attention-count');
    this.resolutionModal = page.locator('#resolution-modal');
    this.resolutionText = page.locator('#resolution-text');
    this.resolvePointButton = this.resolutionModal.getByRole('button', {
      name: 'Marcar como resolvido',
    });
    this.exportReportButton = page.getByRole('button', { name: 'Exportar PDF' });
  }

  async createSprint({ name, startDate }: CreateSprintInput) {
    await this.newSprintButton.click();
    await this.sprintName.fill(name);
    await this.sprintStartDate.fill(startDate);
    await this.createSprintButton.click();
    await this.heading(name).waitFor();
  }

  heading(name: string) {
    return this.page.getByRole('heading', { name, exact: true });
  }

  sprintItem(name: string) {
    return this.sprintItems.filter({ hasText: name });
  }

  annotation(content: string) {
    return this.page.locator('.annotation-item').filter({ hasText: content });
  }

  attentionPoint(title: string) {
    return this.page.locator('.attention-item').filter({ hasText: title });
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

  async addAnnotation(content: string) {
    await this.annotationContent.fill(content);
    await this.addAnnotationButton.click();
  }

  async addAttentionPoint(title: string) {
    await this.attentionTitle.fill(title);
    await this.addAttentionButton.click();
  }
}
