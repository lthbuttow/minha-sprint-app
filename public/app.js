const state = { sprints: [], selectedId: null, resolvingPointId: null, showAllSprints: false };
const $ = (selector) => document.querySelector(selector);

const api = async (path, options = {}) => {
  const response = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error || 'Não foi possível concluir esta ação.');
  }
  return response.status === 204 ? null : response.json();
};

function toast(message) {
  const element = $('#toast');
  element.textContent = message;
  element.classList.add('show');
  window.clearTimeout(toast.timer);
  toast.timer = window.setTimeout(() => element.classList.remove('show'), 2600);
}

function selectedSprint() {
  return state.sprints.find((sprint) => sprint.id === state.selectedId);
}

function formatDate(date) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(`${date}T00:00:00Z`)).replace('.', '');
}

function render() {
  const sprint = selectedSprint();
  $('#empty-state').classList.toggle('hidden', Boolean(sprint));
  $('#app-content').classList.toggle('hidden', !sprint);
  $('#sprint-sidebar').classList.toggle('hidden', !state.sprints.length);
  if (!sprint) return;

  renderSprintList();
  $('#sprint-header').innerHTML = `<div><p class="eyebrow">SPRINT ATUAL</p><h2>${escapeHtml(sprint.name)}</h2><p>${sprint.days.length} dias planejados · criada em ${formatDate(sprint.createdAt.slice(0, 10))}</p></div><button class="export-report" data-export-report type="button">↓ Exportar PDF</button>`;
  $('#day-count').textContent = `${sprint.days.length} dias`;
  renderDays(sprint);
  renderAnnotations(sprint);
  renderAttentionPoints(sprint);
}

function renderSprintList() {
  const query = $('#sprint-search').value.trim().toLocaleLowerCase('pt-BR');
  const matching = state.sprints.filter((sprint) => sprint.name.toLocaleLowerCase('pt-BR').includes(query));
  const visible = state.showAllSprints || query ? matching : matching.slice(0, 10);
  $('#sprints-total').textContent = `${state.sprints.length}`;
  $('#sprint-list').innerHTML = visible.length ? visible.map((item) => `<button class="sprint-menu-item ${item.id === state.selectedId ? 'active' : ''}" data-sprint-id="${item.id}"><span>${escapeHtml(item.name)}</span><small>${item.days.length} dias</small></button>`).join('') : '<p class="quiet">Nenhuma sprint encontrada.</p>';
  const showMore = $('#show-more-sprints');
  showMore.classList.toggle('hidden', Boolean(query) || state.sprints.length <= 10);
  showMore.textContent = state.showAllSprints ? 'Mostrar apenas recentes' : `Ver mais (${state.sprints.length - 10})`;
}

function renderDays(sprint) {
  $('#days-list').innerHTML = sprint.days.map((day, index) => `<div class="day-row"><div class="day-label">Dia ${index + 1}<span>${formatDate(day.date)}</span></div><textarea data-day-id="${day.id}" aria-label="Resumo do dia ${index + 1}" placeholder="O que você fez hoje?">${escapeHtml(day.summary)}</textarea></div>`).join('');
}

function renderAnnotations(sprint) {
  $('#annotation-count').textContent = `${sprint.annotations.length} bloco${sprint.annotations.length === 1 ? '' : 's'}`;
  $('#annotations-list').innerHTML = sprint.annotations.length ? sprint.annotations.map((annotation) => `
    <div class="annotation-item">
      <div class="annotation-head"><span></span><div class="annotation-actions"><button data-edit-annotation-id="${annotation.id}">Editar</button><button data-delete-annotation-id="${annotation.id}">Excluir</button></div></div>
      <p class="annotation-content">${escapeHtml(annotation.content)}</p>
    </div>`).join('') : '<p class="quiet">Adicione blocos para registrar contexto, objetivos e aprendizados.</p>';
}

function renderAttentionPoints(sprint) {
  const open = sprint.attentionPoints.filter((point) => !point.resolved).length;
  $('#attention-count').textContent = open ? `${open} em aberto` : 'Tudo certo';
  $('#attention-list').innerHTML = sprint.attentionPoints.length ? sprint.attentionPoints.map((point) => `
    <div class="attention-item ${point.resolved ? 'resolved' : ''}">
      <div class="attention-title">${escapeHtml(point.title)}</div>
      <div class="attention-meta">${point.resolved ? 'Resolvido' : point.overdue ? '<span class="overdue">Há mais de 3 dias em aberto</span>' : 'Em acompanhamento'}</div>
      ${point.resolution ? `<p class="attention-resolution">${escapeHtml(point.resolution)}</p>` : `<button class="resolve-button" data-resolve-id="${point.id}">Marcar como resolvido</button>`}
    </div>`).join('') : '<p class="quiet">Nenhum ponto de atenção nesta sprint.</p>';
}

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

async function refresh(selectedId = state.selectedId) {
  state.sprints = await api('/sprints');
  state.selectedId = state.sprints.some((item) => item.id === selectedId) ? selectedId : state.sprints[0]?.id ?? null;
  render();
}

$('#new-sprint-button').addEventListener('click', () => $('#sprint-modal').showModal());
document.querySelector('[data-open-sprint-modal]').addEventListener('click', () => $('#sprint-modal').showModal());
document.querySelectorAll('.close-modal').forEach((button) => button.addEventListener('click', () => button.closest('dialog').close()));

$('#sprint-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const sprint = await api('/sprints', { method: 'POST', body: { name: $('#sprint-name').value, startDate: $('#sprint-start-date').value, generalNotes: $('#sprint-initial-notes').value } });
    $('#sprint-form').reset();
    $('#sprint-modal').close();
    await refresh(sprint.id);
    toast('Sprint criada. Bom trabalho!');
  } catch (error) { toast(error.message); }
});

$('#sprint-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-sprint-id]');
  if (!button) return;
  state.selectedId = Number(button.dataset.sprintId);
  render();
});

$('#sprint-search').addEventListener('input', renderSprintList);
$('#show-more-sprints').addEventListener('click', () => {
  state.showAllSprints = !state.showAllSprints;
  renderSprintList();
});

$('#sprint-header').addEventListener('click', (event) => {
  if (event.target.closest('[data-export-report]')) window.location.assign(`/api/sprints/${state.selectedId}/report.pdf`);
});

$('#days-list').addEventListener('change', async (event) => {
  const field = event.target.closest('[data-day-id]');
  if (!field) return;
  try {
    await api(`/sprints/${state.selectedId}/days/${field.dataset.dayId}`, { method: 'PATCH', body: { summary: field.value } });
    await refresh();
    toast('Resumo salvo.');
  } catch (error) { toast(error.message); }
});

$('#add-day').addEventListener('click', async () => {
  const sprint = selectedSprint();
  const lastDate = sprint.days.map((day) => day.date).sort().at(-1);
  const date = new Date(`${lastDate}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  try {
    await api(`/sprints/${state.selectedId}/days`, { method: 'POST', body: { date: date.toISOString().slice(0, 10) } });
    await refresh();
    toast('Novo dia adicionado.');
  } catch (error) { toast(error.message); }
});

$('#annotation-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await api(`/sprints/${state.selectedId}/annotations`, { method: 'POST', body: { content: $('#annotation-content').value } });
    event.target.reset();
    await refresh();
    toast('Bloco de anotação adicionado.');
  } catch (error) { toast(error.message); }
});

$('#annotations-list').addEventListener('click', async (event) => {
  const editButton = event.target.closest('[data-edit-annotation-id]');
  const deleteButton = event.target.closest('[data-delete-annotation-id]');
  const id = Number((editButton || deleteButton)?.dataset.editAnnotationId || (editButton || deleteButton)?.dataset.deleteAnnotationId);
  if (!id) return;
  const annotation = selectedSprint().annotations.find((item) => item.id === id);
  try {
    if (deleteButton) {
      if (!window.confirm('Excluir esta anotação?')) return;
      await api(`/sprints/${state.selectedId}/annotations/${id}`, { method: 'DELETE' });
      toast('Anotação excluída.');
    } else {
      const content = window.prompt('Conteúdo da anotação:', annotation.content);
      if (content === null) return;
      await api(`/sprints/${state.selectedId}/annotations/${id}`, { method: 'PATCH', body: { content } });
      toast('Anotação atualizada.');
    }
    await refresh();
  } catch (error) { toast(error.message); }
});

$('#attention-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await api(`/sprints/${state.selectedId}/attention-points`, { method: 'POST', body: { title: $('#attention-title').value } });
    event.target.reset();
    await refresh();
    toast('Ponto de atenção adicionado.');
  } catch (error) { toast(error.message); }
});

$('#attention-list').addEventListener('click', (event) => {
  const button = event.target.closest('[data-resolve-id]');
  if (!button) return;
  state.resolvingPointId = Number(button.dataset.resolveId);
  $('#resolution-modal').showModal();
  $('#resolution-text').focus();
});

$('#resolution-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await api(`/sprints/${state.selectedId}/attention-points/${state.resolvingPointId}`, { method: 'PATCH', body: { resolved: true, resolution: $('#resolution-text').value } });
    event.target.reset();
    $('#resolution-modal').close();
    await refresh();
    toast('Ponto marcado como resolvido.');
  } catch (error) { toast(error.message); }
});

$('#sprint-start-date').value = new Date().toISOString().slice(0, 10);
refresh().catch((error) => toast(`Erro ao carregar: ${error.message}`));
