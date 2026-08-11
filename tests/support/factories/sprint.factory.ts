const unique = () => Date.now().toString();

export const createSprintPayload = (overrides: Record<string, unknown> = {}) => ({
  name: `Sprint de teste ${unique()}`,
  startDate: '2026-08-03',
  generalNotes: 'Massa criada pela suíte de API.',
  ...overrides,
});

export const createDayPayload = (overrides: Record<string, unknown> = {}) => ({
  date: '2026-09-01',
  summary: 'Resumo criado pela suíte.',
  ...overrides,
});

export const createAnnotationPayload = (overrides: Record<string, unknown> = {}) => ({
  content: `Anotação de teste ${unique()}`,
  ...overrides,
});

export const createAttentionPointPayload = (overrides: Record<string, unknown> = {}) => ({
  title: `Ponto de atenção ${unique()}`,
  description: 'Descrição criada pela suíte.',
  ...overrides,
});
