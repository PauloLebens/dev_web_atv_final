# Sistema Lava-Jato

Projeto da disciplina de Desenvolvimento Web: sistema de gestão de lava-jato / estética automotiva.

- **Backend (API):** Node.js + Express + Prisma
- **Banco de dados:** PostgreSQL
- **Frontend (telas):** React + Vite
- **Tudo roda dentro do Docker.** Você **não** precisa instalar Node, PostgreSQL nem mais nada além do Docker.

---

## Sumário

1. [Instalar os programas (só na primeira vez)](#1-instalar-os-programas-só-na-primeira-vez)
2. [Pegar o projeto e criar o arquivo `.env` (só na primeira vez)](#2-pegar-o-projeto-e-criar-o-arquivo-env-só-na-primeira-vez)
3. [Ligar o sistema](#3-ligar-o-sistema)
4. [Acessar o sistema no navegador](#4-acessar-o-sistema-no-navegador)
5. [Desligar o sistema](#5-desligar-o-sistema)
6. [Resumo do dia a dia](#6-resumo-do-dia-a-dia)
7. [Deu problema? (soluções)](#7-deu-problema-soluções)
8. [Ver e mexer nos dados do banco](#8-ver-e-mexer-nos-dados-do-banco)
9. [Testar a API sem a tela](#9-testar-a-api-sem-a-tela)
10. [Para quem vai programar](#10-para-quem-vai-programar)

---

## 1. Instalar os programas (só na primeira vez)

### 1.1 Docker Desktop (obrigatório)

O Docker é o programa que "liga" o banco de dados, a API e as telas para você, sem precisar instalar cada coisa.

1. Baixe em: https://www.docker.com/products/docker-desktop/
2. Instale clicando em **Next** até o fim (deixe as opções marcadas como vieram).
3. Se pedir para **reiniciar o computador**, reinicie.
4. Abra o **Docker Desktop** pelo menu Iniciar. Na primeira vez ele pode pedir para aceitar os termos: aceite.
5. Espere até aparecer **"Engine running"** (ou a baleia ficar verde) no canto inferior esquerdo.

> **Windows:** se aparecer uma mensagem sobre **WSL**, clique no link que ela mostra (ou abra o PowerShell e rode `wsl --update`) e reinicie o computador.

> ⚠️ **O Docker Desktop precisa estar aberto** toda vez que você for usar o sistema.

### 1.2 VS Code (recomendado)

Editor para abrir o projeto e usar o terminal com facilidade.
Baixe em: https://code.visualstudio.com/

---

## 2. Pegar o projeto e criar o arquivo `.env` (só na primeira vez)

### 2.1 Abrir a pasta do projeto

1. Coloque a pasta do projeto em algum lugar fácil (ex: `Documentos\lava-jato`).
2. Abra o **VS Code** → menu **File (Arquivo) → Open Folder (Abrir Pasta)** → escolha a pasta do projeto.

### 2.2 Abrir o terminal

No VS Code: menu **Terminal → New Terminal (Novo Terminal)**.
Vai abrir uma janela na parte de baixo. **Todos os comandos deste tutorial são digitados ali** (digite ou cole e aperte **Enter**).

> O terminal já abre "dentro" da pasta do projeto. Se você usar outro terminal (PowerShell, Prompt de Comando), primeiro entre na pasta com `cd caminho\da\pasta`.

### 2.3 Criar o arquivo `.env`

O `.env` guarda as configurações (senhas, etc.). Ele **não vai junto com o projeto** por segurança, então cada pessoa cria o seu:

1. Na lateral esquerda do VS Code, clique com o botão direito no arquivo **`.env.example`** → **Copy (Copiar)**.
2. Clique com o botão direito num espaço vazio da lateral → **Paste (Colar)**. Vai aparecer `.env copy.example`.
3. Clique com o botão direito nele → **Rename (Renomear)** → mude o nome para exatamente: **`.env`**

Ou, se preferir, rode no terminal:

```bash
cp .env.example .env
```

Pronto. Os valores que vêm no `.env.example` já funcionam para usar no seu computador.
Se quiser, troque o `JWT_SECRET` por qualquer texto seu com **mais de 32 caracteres**.

---

## 3. Ligar o sistema

Com o **Docker Desktop aberto**, rode no terminal:

```bash
docker compose up -d --build
```

- Na **primeira vez** demora alguns minutos (ele baixa e prepara tudo). Nas próximas é rápido.
- Quando terminar, aparece algo como `Container lava_jato_frontend Started`.

### Só na primeira vez: criar o administrador e os serviços de exemplo

```bash
docker compose exec app npx prisma db seed
```

Deve aparecer `Admin: admin@lavajato.com` e `The seed command has been executed`.
(Se rodar de novo, não tem problema: ele não duplica nada.)

---

## 4. Acessar o sistema no navegador

| O quê | Endereço | Para quê |
|---|---|---|
| **Telas do sistema** | **http://localhost:5173** | É aqui que se usa o sistema |
| API (backend) | http://localhost:3000/api/health | Se aparecer `"status":"ok"`, a API está funcionando |
| Visualizar o banco | http://localhost:5555 | Só depois de abrir o Prisma Studio (ver seção 8) |

**Login do administrador** (definido no seu `.env`):
- E-mail: `admin@lavajato.com`
- Senha: `admin123`

> Ao salvar um arquivo da pasta `frontend/`, a tela atualiza sozinha. Na API (`src/`), rode `docker compose restart app` depois de alterar.

---

## 5. Desligar o sistema

```bash
docker compose down
```

Seus dados (clientes, agendamentos...) **continuam salvos** para a próxima vez.
Fechar o Docker Desktop também desliga tudo.

---

## 6. Resumo do dia a dia

| Quero... | Comando |
|---|---|
| Ligar | `docker compose up -d` |
| Ligar depois de baixar mudanças dos colegas | `docker compose up -d --build` |
| Ver se está tudo rodando | `docker compose ps` |
| Ver os erros/mensagens | `docker compose logs -f` (para sair: `Ctrl + C`) |
| Reiniciar a API depois de mexer no código | `docker compose restart app` |
| Desligar | `docker compose down` |

Em `docker compose ps`, os 3 itens devem aparecer como **Up**: `lava_jato_app`, `lava_jato_frontend` e `lava_jato_postgres`.

---

## 7. Deu problema? (soluções)

**`docker: command not found` / `'docker' não é reconhecido`**
→ O Docker Desktop não está instalado, ou o terminal foi aberto antes da instalação. Feche e abra o VS Code de novo.

**`Cannot connect to the Docker daemon` / `error during connect`**
→ O Docker Desktop não está aberto. Abra e espere ficar "Engine running".

**`port is already allocated` / `porta já está em uso`**
→ Outro programa usa a porta 3000, 5173, 5555 ou 2222. Feche-o, ou rode `docker ps` para ver se não há outro projeto do Docker usando a mesma porta e pare-o.

**A tela http://localhost:5173 não abre**
→ Espere uns 30 segundos depois de ligar (na primeira vez, mais). Veja o que está acontecendo com:
`docker compose logs frontend`

**A tela abre, mas mostra "Erro ao conectar com a API"**
→ Veja os erros da API: `docker compose logs app`

**Nos logs da API aparece `JWT_SECRET ausente ou muito curto`**
→ O arquivo `.env` não existe ou o `JWT_SECRET` tem menos de 32 caracteres. Refaça o passo 2.3 e rode `docker compose up -d`.

**Login do admin não funciona**
→ Rode o seed (passo 3). O e-mail e a senha são os do **seu** `.env` (`ADMIN_EMAIL` e `ADMIN_SENHA`).

**Quero apagar todos os dados e começar do zero**
```bash
docker compose down -v
docker compose up -d --build
docker compose exec app npx prisma db seed
```
⚠️ O `-v` apaga **todo** o banco de dados (só do seu computador).

---

## 8. Ver e mexer nos dados do banco

### Opção 1 — Prisma Studio (mais fácil, no navegador)

Com o sistema ligado:

```bash
docker compose exec app npx prisma studio --port 5555 --hostname 0.0.0.0 --browser none
```

Abra **http://localhost:5555**. Dá para ver e editar as tabelas como numa planilha.
Para fechar, aperte `Ctrl + C` no terminal.

### Opção 2 — DBeaver, pgAdmin ou extensão do VS Code

- **Host:** `localhost`
- **Porta:** `2222`
- **Banco de dados:** `lavajato_db`
- **Usuário:** `postgres`
- **Senha:** `postgres`

---

## 9. Testar a API sem a tela

Use a extensão **Thunder Client** do VS Code (ou o Insomnia / Postman).

**Exemplo — fazer login:**
- Método: `POST`
- URL: `http://localhost:3000/api/auth/login`
- Body → JSON:
  ```json
  { "email": "admin@lavajato.com", "senha": "admin123" }
  ```
- A resposta traz um `token`. Copie-o.

**Rotas protegidas:** na aba **Headers** (ou **Auth → Bearer**), adicione:
- `Authorization` = `Bearer COLE_O_TOKEN_AQUI`

### Grupos de rotas

Cada arquivo em [`src/routes/`](src/routes/) começa explicando o grupo, e **cada rota tem um comentário** dizendo o que faz, quem pode usar e o que enviar. O índice geral está em [`src/routes/index.js`](src/routes/index.js).

| Grupo | Prefixo | Objetivo |
|---|---|---|
| Autenticação | `/api/auth` | Cadastro de cliente, login, usuário logado |
| Funcionários | `/api/funcionarios` | Admin gerencia a equipe (ativos recebem agendamentos) |
| Clientes | `/api/clientes` | Equipe consulta clientes |
| Serviços | `/api/servicos` | Catálogo público; admin cadastra/edita/precifica |
| Veículos | `/api/veiculos` | Cliente gerencia os seus; equipe consulta |
| Agenda | `/api/agenda` | Admin abre dias/horários; qualquer um consulta horários livres |
| Agendamentos | `/api/agendamentos` | Reserva com carrinho, alocação automática, status e cancelamento |

Perfis de usuário: `ADMIN`, `FUNCIONARIO` e `CLIENTE`.

### Fluxo típico (para testar do começo ao fim)

1. **Admin** faz login e abre a agenda: `POST /api/agenda/lote`
   ```json
   { "de": "2026-12-01", "ate": "2026-12-31", "horarios": ["08:00", "09:00", "10:00", "11:00", "14:00", "15:00", "16:00"] }
   ```
2. **Admin** cadastra um funcionário: `POST /api/funcionarios`
   ```json
   { "nome": "Arthur Moura", "email": "arthur@lavajato.com", "senha": "senha123", "cargo": "Lavador" }
   ```
3. **Cliente** cria a conta: `POST /api/auth/registrar`
   ```json
   { "nome": "Lucas Gustavo", "email": "lucas@email.com", "senha": "senha123", "telefone": "49999999999" }
   ```
4. **Cliente** cadastra o carro: `POST /api/veiculos`
   ```json
   { "placa": "NEZ5610", "modelo": "Amarok", "marca": "Volkswagen", "ano": 2023 }
   ```
5. **Cliente** vê o catálogo (`GET /api/servicos`) e os horários livres:
   `GET /api/agenda/2026-12-01/disponiveis?servicoIds=1`
6. **Cliente** agenda: `POST /api/agendamentos`
   ```json
   { "veiculoPlaca": "NEZ5610", "data": "2026-12-01", "horario": "09:00", "servicoIds": [1] }
   ```
7. **Funcionário** faz login, vê as tarefas (`GET /api/agendamentos?data=2026-12-01`) e avança o status com um clique: `POST /api/agendamentos/1/avancar`
8. **Cliente** acompanha o status: `GET /api/agendamentos/1`

---

## 10. Para quem vai programar

### Estrutura de pastas

```
├── server.js                 # Liga o servidor Express
├── prisma/
│   ├── schema.prisma         # Modelo do banco (tabelas)
│   ├── migrations/           # Histórico de alterações do banco (não editar à mão)
│   └── seed.js               # Dados iniciais (admin + serviços)
├── src/
│   ├── routes/               # Rotas da API (documentadas)
│   ├── controllers/          # Lógica de cada rota
│   ├── services/             # Regras de negócio (ex: horários disponíveis)
│   ├── middlewares/          # Login/permissões e tratamento de erros
│   ├── config/               # Configurações (Prisma, JWT, fuso horário)
│   └── utils/                # Funções de validação
└── frontend/                 # Telas em React
    └── src/
```

### Alterar o banco de dados (schema)

1. Edite o `prisma/schema.prisma`.
2. Gere a migration (troque `descricao_da_mudanca` por algo como `adiciona_campo_x`):
   ```bash
   docker compose exec app npx prisma migrate dev --name descricao_da_mudanca
   ```
3. Reinicie a API: `docker compose restart app`
4. Envie a pasta nova de `prisma/migrations/` junto com o `schema.prisma` para o grupo.

Quando alguém do grupo mandar uma migration nova, basta rodar `docker compose up -d --build`: ela é aplicada automaticamente ao ligar.

### Proteger uma rota nova

```js
const { autenticar, autorizar } = require('../middlewares/auth');

// Só usuários logados com perfil ADMIN
router.post('/', autenticar, autorizar('ADMIN'), controller.criar);
```

Dentro do controller, o usuário logado fica em `req.usuario` (`{ id, perfil }`).
Para devolver um erro: `throw new HttpError(404, 'Mensagem')`. O resto é tratado automaticamente.

### Observações

- Valores em dinheiro (`preco`, `valorTotal`...) chegam como **texto** no JSON (ex: `"120.00"`). No frontend, use `Number(valor)`.
- Datas da agenda: formato `AAAA-MM-DD`; horários: `HH:MM`, no horário de Brasília.
- Ícones do frontend: usar os **Material Symbols** do Google.
