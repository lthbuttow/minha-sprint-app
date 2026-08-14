# Minha Sprint

API REST pessoal para registrar o resumo diário de uma sprint, anotações gerais e pontos de atenção. A API é protegida por JWT e usa um banco SQLite inteiramente em memória: os dados são descartados ao encerrar o processo.

## Requisitos e execução

Requer Node.js 20 ou superior.

```bash
npm install
cp .env.example .env # defina valores seguros no seu ambiente
npm start
```

Defina `JWT_SECRET` com ao menos 32 caracteres, além de `AUTH_USERNAME` e `AUTH_PASSWORD`. A rota pública `POST /api/auth/login` recebe essas credenciais e retorna um JWT sem expiração. As rotas de negócio em `/api/sprints` exigem `Authorization: Bearer <token>`; `/health` e `/api-docs` permanecem públicos para monitoramento e documentação.

Os testes de API exigem `TEST_AUTH_TOKEN=<seu-jwt>` no `.env`; gere-o por `POST /api/auth/login` e cole o valor de `accessToken`. A suíte reutiliza exclusivamente esse token e não executa login automático.

A aplicação web estará em `http://localhost:3000`; a interface Swagger está em `http://localhost:3000/api-docs`. A especificação fonte está em [resources/swagger.yaml](resources/swagger.yaml).

## Interface web

A página inicial entrega um painel simples para criar e alternar entre sprints, registrar resumos diários, adicionar dias, criar/editar/excluir blocos de anotações gerais e acompanhar ou resolver pontos de atenção. Os arquivos estáticos estão em `public/` e são servidos pelo próprio Express; não há processo de build separado.

Ao iniciar, o banco em memória é preenchido automaticamente com cinco sprints de exemplo. Como o banco é temporário, os dados são recriados a cada reinicialização da aplicação.

## Comportamento

Ao criar uma sprint, são criados 11 dias consecutivos a partir de `startDate` (ou da data atual). Dias podem ser adicionados e removidos independentemente. Um ponto de atenção aberto há mais de três dias completos é devolvido com `overdue: true`. Para resolvê-lo, a resolução é obrigatória.

## Endpoints

| Método | Rota | Finalidade |
| --- | --- | --- |
| POST | `/api/auth/login` | Autentica e emite JWT |
| GET | `/health` | Estado da API |
| GET, POST | `/api/sprints` | Lista ou cria sprints |
| GET, PATCH | `/api/sprints/:sprintId` | Consulta ou atualiza nome/anotações |
| GET | `/api/sprints/:sprintId/report.pdf` | Baixa relatório completo da sprint em PDF |
| POST | `/api/sprints/:sprintId/days` | Adiciona um dia |
| PATCH, DELETE | `/api/sprints/:sprintId/days/:dayId` | Atualiza resumo ou remove dia |
| POST | `/api/sprints/:sprintId/attention-points` | Cria ponto de atenção |
| PATCH | `/api/sprints/:sprintId/attention-points/:pointId` | Resolve ou reabre ponto |

Consulte o Swagger para os schemas JSON completos e todos os códigos de resposta. A API retorna `{ "error": "mensagem" }` para erros de validação (400), recurso inexistente (404) e conflito de data de dia (409).

## Exemplos

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"admin","password":"troque-esta-senha"}'

curl -X POST http://localhost:3000/api/sprints \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"name":"Sprint 12","startDate":"2026-08-03","generalNotes":"Foco em entregas."}'

curl -X PATCH http://localhost:3000/api/sprints/1/days/1 \
  -H 'Authorization: Bearer <token>' \
  -H 'Content-Type: application/json' \
  -d '{"summary":"Implementei a tela de relatório."}'
```

## Estrutura

- `src/routes`: mapeamento HTTP.
- `src/controller`: adaptação entre HTTP e regras de negócio.
- `src/service`: validações e regras da sprint.
- `src/model`: persistência em `better-sqlite3` e mapeamento de dados.
- `resources/swagger.yaml`: contrato OpenAPI 3.0.

## Testes de API

Os testes Playwright separam cada responsabilidade para que os cenários descrevam apenas o comportamento que está sendo verificado:

- `tests/support/services`: serviços que encapsulam as requisições HTTP dos recursos cobertos pela suíte.
- `tests/support/contracts`: schemas Zod e tipos inferidos para validar o contrato das respostas da API.
- `tests/support/factories`: massa de dados válida e específica para cada cenário.
- `tests/api`: fluxos de teste, combinando serviços, factories e contratos.

Por exemplo, um cenário cria uma massa com `createSprintPayload`, chama `sprints.create` e valida a resposta com `sprintSchema.parse`. Assim, mudanças de rota, payload ou contrato ficam isoladas no lugar adequado.

```bash
npm run test:api
```

## Testes de UI

Os cenários de interface usam Playwright e seguem o mesmo padrão de identificação dos testes de API: `UI-<número> descrição`. Eles cobrem os fluxos críticos de autenticação, criação de sprint e registro do resumo diário.

Com a aplicação em execução e as credenciais `AUTH_USERNAME` e `AUTH_PASSWORD` definidas no `.env`, execute:

```bash
npm run test:ui
```

## Teste de performance (k6)

O smoke test consulta continuamente a lista autenticada de sprints por 30 segundos, com 20 usuários virtuais simultâneos, usando o `TEST_AUTH_TOKEN` já configurado no `.env`. Para testar uma API online, substitua `BASE_URL` no `.env` pela URL publicada. Com o k6 instalado, execute:

```bash
npm run test:performance
```

## Execução no GitHub Actions

O workflow [Testes de API](.github/workflows/api-tests.yml) é executado em pushes e pull requests para `main`, além de poder ser iniciado manualmente. Ao final de cada execução, o relatório HTML do Playwright fica disponível como o artefato `relatorio-testes-api`, inclusive quando algum teste falhar.
