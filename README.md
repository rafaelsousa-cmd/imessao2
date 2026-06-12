# Tasks API — Exemplo Imersão DevOps

API de tarefas (CRUD) usada como aplicação de exemplo durante a **1ª Imersão DevOps & Cloud na Prática**.

Stack: Node.js + Express · PostgreSQL · HTML/JS · Docker · GitHub Actions

---

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose

---

## Subindo em desenvolvimento

```bash
# 1. Clone o repositório
git clone <url-do-repo>
cd demo-app

# 2. Suba os containers (API + banco + frontend)
docker compose up
```

| Serviço  | URL                   |
|----------|-----------------------|
| API      | http://localhost:3000 |
| Frontend | http://localhost:8080 |

O schema do banco é criado automaticamente na primeira inicialização.

---

## Endpoints

| Método   | Rota          | Descrição                     |
|----------|---------------|-------------------------------|
| `GET`    | `/health`     | Health check da aplicação     |
| `GET`    | `/tasks`      | Lista todas as tarefas        |
| `POST`   | `/tasks`      | Cria uma tarefa               |
| `PUT`    | `/tasks/:id`  | Atualiza título ou status     |
| `DELETE` | `/tasks/:id`  | Remove uma tarefa             |

### Exemplos com curl

```bash
# Criar tarefa
curl -X POST http://localhost:3000/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Estudar Docker"}'

# Listar tarefas
curl http://localhost:3000/tasks

# Marcar como concluída
curl -X PUT http://localhost:3000/tasks/1 \
  -H "Content-Type: application/json" \
  -d '{"done": true}'

# Deletar tarefa
curl -X DELETE http://localhost:3000/tasks/1
```

---

## Rodando os testes

Os testes usam um banco separado (`tasksdb_test`) para não interferir nos dados de desenvolvimento.

```bash
# Com os containers rodando:
docker compose exec api npm test
```

---

## Estrutura do projeto

```
demo-app/
├── backend/
│   ├── src/
│   │   ├── app.js          # Entrada da aplicação
│   │   ├── db.js           # Conexão e migration inicial
│   │   └── routes/
│   │       └── tasks.js    # Rotas do CRUD
│   ├── tests/
│   │   └── tasks.test.js   # Testes com Jest + Supertest
│   ├── Dockerfile          # Imagem de produção (multi-stage)
│   └── Dockerfile.dev      # Imagem de desenvolvimento (hot-reload)
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   └── Dockerfile          # Nginx servindo os estáticos
├── docker/
│   └── init.sql            # Cria o banco de testes no Postgres
├── .github/
│   └── workflows/
│       └── ci.yml          # Pipeline: test → build → deploy
├── docker-compose.yml      # Ambiente de desenvolvimento
└── docker-compose.prod.yml # Ambiente de produção
```

---

## CI/CD

O pipeline no GitHub Actions executa 3 jobs em sequência a cada push na `main`:

1. **test** — sobe o Postgres, instala dependências e roda `npm test`
2. **build** — faz build das imagens e push para o ECR (só se os testes passarem)
3. **deploy** — acessa a EC2 via SSH e faz `docker compose pull && up`

Para configurar, adicione os seguintes secrets no repositório:

| Secret                 | Descrição                        |
|------------------------|----------------------------------|
| `AWS_ACCESS_KEY_ID`    | Credencial AWS                   |
| `AWS_SECRET_ACCESS_KEY`| Credencial AWS                   |
| `ECR_REGISTRY`         | URL do registry (`<id>.dkr.ecr...`) |
| `EC2_HOST`             | IP público da instância          |
| `EC2_SSH_KEY`          | Chave privada SSH (conteúdo do `.pem`) |
