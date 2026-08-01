const Database = require('better-sqlite3');

const database = new Database(':memory:');
database.pragma('foreign_keys = ON');

database.exec(`
  CREATE TABLE sprints (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    general_notes TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE sprint_days (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sprint_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    summary TEXT NOT NULL DEFAULT '',
    FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE,
    UNIQUE(sprint_id, date)
  );

  CREATE TABLE sprint_annotations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sprint_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE
  );

  CREATE TABLE attention_points (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sprint_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL DEFAULT '',
    resolved INTEGER NOT NULL DEFAULT 0,
    resolution TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    resolved_at TEXT,
    FOREIGN KEY (sprint_id) REFERENCES sprints(id) ON DELETE CASCADE
  );
`);

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function seedDatabase() {
  const today = new Date();
  const seedSprints = [
    { name: 'Sprint 1', notes: 'Consolidar a experiência de compra.', summary: 'Ajustei validações e fluxo de pagamento.', annotation: 'Priorizar a redução de erros no checkout.', point: 'Homologação do gateway', resolved: false },
    { name: 'Sprint 2', notes: 'Dar visibilidade aos principais resultados.', summary: 'Estruturei os cards de indicadores.', annotation: 'Manter os números simples e acionáveis.', point: 'Definir indicador de retenção', resolved: true },
    { name: 'Sprint 3', notes: 'Reduzir o tempo de carregamento das páginas críticas.', summary: 'Medi o carregamento da página inicial.', annotation: 'Comparar métricas antes e depois das mudanças.', point: 'Acesso ao ambiente de medição', resolved: true },
    { name: 'Sprint 4', notes: 'Revisar prioridades do próximo ciclo.', summary: 'Agrupei itens por impacto e esforço.', annotation: 'Reservar espaço para itens técnicos importantes.', point: 'Alinhar prioridades com a equipe', resolved: false },
    { name: 'Sprint 5', notes: 'Registrar decisões relevantes do produto.', summary: 'Documentei o fluxo principal da aplicação.', annotation: 'Escrever para facilitar a entrada de novas pessoas.', point: 'Revisar convenções de API', resolved: true }
  ];

  const insertSprint = database.prepare('INSERT INTO sprints (name, general_notes, created_at) VALUES (?, ?, ?)');
  const insertDay = database.prepare('INSERT INTO sprint_days (sprint_id, date, summary) VALUES (?, ?, ?)');
  const insertAnnotation = database.prepare('INSERT INTO sprint_annotations (sprint_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?)');
  const insertPoint = database.prepare('INSERT INTO attention_points (sprint_id, title, description, resolved, resolution, created_at, resolved_at) VALUES (?, ?, ?, ?, ?, ?, ?)');

  database.transaction(() => {
    seedSprints.forEach((item, index) => {
      const start = new Date(today);
      start.setUTCDate(start.getUTCDate() - (index * 14 + 10));
      const createdAt = new Date(start);
      createdAt.setUTCHours(9, 0, 0, 0);
      const sprintId = insertSprint.run(item.name, item.notes, createdAt.toISOString()).lastInsertRowid;
      for (let day = 0; day < 11; day += 1) {
        const date = new Date(start);
        date.setUTCDate(date.getUTCDate() + day);
        insertDay.run(sprintId, formatDate(date), day < 4 ? item.summary : '');
      }
      insertAnnotation.run(sprintId, '', item.annotation, createdAt.toISOString(), createdAt.toISOString());
      const pointCreatedAt = new Date(today);
      pointCreatedAt.setUTCDate(pointCreatedAt.getUTCDate() - (item.resolved ? index + 1 : 4));
      insertPoint.run(
        sprintId,
        item.point,
        'Ponto cadastrado automaticamente para acompanhar esta sprint.',
        item.resolved ? 1 : 0,
        item.resolved ? 'Ponto tratado durante a sprint.' : null,
        pointCreatedAt.toISOString(),
        item.resolved ? new Date().toISOString() : null
      );
    });
  })();
}

seedDatabase();

module.exports = database;
