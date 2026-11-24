# Sistema Lava-Jato

Projeto da disciplina de Desenvolvimento Web.

## Como Executar com Docker

### 1. Pré-requisitos
- Ter o Docker Desktop instalado e em execução no computador.
- Copiar o `.env.example` para `.env` e definir um `JWT_SECRET`.

### 2. Construir a Imagem (Opcional se usar compose com --build)
```bash
docker build -t dev_web_atv_final-app .
```

### 3. Iniciar os Contêineres
Abra o terminal na pasta do projeto e execute:

```bash
docker compose up -d --build
```

### 4. Acessar a Aplicação
- **Aplicação Web:** [http://localhost:3000](http://localhost:3000)

### 5. Conectar ao Banco de Dados (PostgreSQL 18)
Para conectar via DBeaver, pgAdmin ou extensão do VS Code:
- **Host:** `localhost`
- **Porta:** `2222`
- **Banco de Dados:** `lavajato_db`
- **Usuário:** `postgres`
- **Senha:** `postgres`

### 6. Parar os Contêineres
```bash
docker compose down
```

Para visualizar os logs em tempo real:
```bash
docker compose logs -f
```

## Comandos do Prisma ORM

### 1. Migrations (alterações no banco)
As migrations pendentes são aplicadas automaticamente quando o contêiner `app` sobe.

Depois de alterar o `prisma/schema.prisma`, gere uma nova migration (rodando dentro do contêiner):
```bash
docker compose run --rm --no-deps app npx prisma migrate dev --name descricao_da_mudanca
```
Isso cria a pasta em `prisma/migrations/`, aplica no banco e regenera o client. Commite essa pasta junto com o schema.

### 2. Abrir o Painel Visual do Banco (Prisma Studio)
Abre uma interface no navegador para visualizar e editar os dados das tabelas:
```bash
npx prisma studio
```

### 3. Atualizar o Cliente do Prisma
Gera novamente os tipos e funções do cliente após alterar o schema:
```bash
npx prisma generate
```

### 4. Dados iniciais (seed)
Cria o administrador (definido por `ADMIN_EMAIL`/`ADMIN_SENHA` no `.env`) e alguns serviços de exemplo. Pode rodar mais de uma vez sem duplicar:
```bash
docker compose exec app npx prisma db seed
```

## Autenticação

Perfis: `ADMIN`, `FUNCIONARIO` e `CLIENTE`. Rotas protegidas exigem o header `Authorization: Bearer <token>`.

| Método | Rota | Acesso | Descrição |
|---|---|---|---|
| POST | `/api/auth/registrar` | público | Cadastro de cliente (`nome`, `email`, `senha`, `telefone`). Retorna `usuario` e `token` |
| POST | `/api/auth/login` | público | Login (`email`, `senha`). Retorna `usuario` e `token` (válido por 12h) |
| GET | `/api/auth/me` | logado | Dados do usuário logado |
| GET/POST | `/api/funcionarios` | ADMIN | Lista / cadastra funcionário (`nome`, `email`, `senha`, `cargo`) |
| GET | `/api/clientes` | ADMIN, FUNCIONARIO | Lista clientes |
| GET | `/api/veiculos` | ADMIN, FUNCIONARIO | Lista veículos |
| GET | `/api/agendamentos` | ADMIN, FUNCIONARIO | Lista agendamentos |

Para proteger uma rota nova:
```js
const { autenticar, autorizar } = require('../middlewares/auth');
router.post('/', autenticar, autorizar('ADMIN'), controller.criar);
```
Dentro do controller, o usuário logado fica em `req.usuario` (`{ id, perfil }`).
