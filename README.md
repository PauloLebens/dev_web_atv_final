# Sistema Lava-Jato

Projeto da disciplina de Desenvolvimento Web.

## Como Executar com Docker

### 1. Pré-requisitos
- Ter o Docker Desktop instalado e em execução no computador.

### 2. Construir a Imagem (Opcional se usar compose com --build)
```bash
docker build -t dev_web_atv_final-app .
```

### 3. Iniciar os Contêineres
Abra o terminal na pasta do projeto e execute:

```bash
docker compose up -d
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
