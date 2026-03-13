# ⚡ TaskFlow

Gerenciador de tarefas colaborativo em tempo real, inspirado no Trello. Construído com TypeScript end-to-end, WebSockets e uma stack moderna Full Stack.

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

## ✨ Funcionalidades

- 🔐 Autenticação com JWT (registro e login)
- 📋 Criação e gerenciamento de Boards, Listas e Cards
- 🖱️ Drag and Drop de cards entre listas
- ⚡ Atualizações em tempo real via WebSocket (Socket.io)
- 🏷️ Etiquetas coloridas nos cards
- 📅 Data de prazo com indicador de vencimento
- 👤 Atribuição de responsável por card
- 📝 Descrição rica por card
- 🐳 Docker Compose para setup fácil

## 🛠️ Stack

### Frontend
- **React 18** + **TypeScript**
- **Vite** (bundler)
- **TailwindCSS** (estilização)
- **Zustand** (gerenciamento de estado)
- **Socket.io-client** (tempo real)
- **@hello-pangea/dnd** (drag and drop)
- **React Router v6** (navegação)

### Backend
- **Node.js** + **Express** + **TypeScript**
- **Prisma ORM** + **PostgreSQL**
- **Socket.io** (WebSockets)
- **JWT** + **bcryptjs** (autenticação)
- **Zod** (validação)

## 🚀 Rodando o projeto

### Pré-requisitos
- Node.js 20+
- Docker e Docker Compose

### Com Docker (recomendado)

```bash
git clone https://github.com/seu-usuario/taskflow.git
cd taskflow
docker-compose up -d
```

Acesse: **http://localhost:5173**

### Sem Docker

**1. Banco de dados**
Crie um banco PostgreSQL e configure a URL no `.env`.

**2. Backend**
```bash
cd server
cp .env.example .env
# edite o .env com suas credenciais
npm install
npx prisma migrate dev
npm run dev
```

**3. Frontend**
```bash
cd client
npm install
npm run dev
```

## 📁 Estrutura

```
taskflow/
├── client/               # React + TypeScript (frontend)
│   └── src/
│       ├── components/   # Componentes reutilizáveis
│       ├── pages/        # Páginas da aplicação
│       ├── store/        # Estado global (Zustand)
│       ├── services/     # API e Socket.io
│       └── types/        # Tipos TypeScript
├── server/               # Node.js + Express (backend)
│   └── src/
│       ├── controllers/  # Lógica dos endpoints
│       ├── routes/       # Definição das rotas
│       ├── middlewares/  # Auth e error handler
│       └── config/       # Prisma e Socket.io
├── prisma/
│   └── schema.prisma     # Modelos do banco de dados
└── docker-compose.yml
```

## 📡 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/register` | Cadastro |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Usuário atual |
| GET | `/api/boards` | Listar boards |
| POST | `/api/boards` | Criar board |
| GET | `/api/boards/:id` | Board com listas e cards |
| PUT | `/api/boards/:id` | Atualizar board |
| DELETE | `/api/boards/:id` | Deletar board |
| POST | `/api/lists` | Criar lista |
| PUT | `/api/lists/:id` | Atualizar lista |
| DELETE | `/api/lists/:id` | Deletar lista |
| POST | `/api/cards` | Criar card |
| PUT | `/api/cards/:id` | Atualizar card |
| PUT | `/api/cards/:id/move` | Mover card |
| DELETE | `/api/cards/:id` | Deletar card |

## 🔌 Eventos WebSocket

| Evento | Direção | Descrição |
|--------|---------|-----------|
| `join:board` | Cliente → Servidor | Entrar na sala do board |
| `list:created` | Servidor → Cliente | Nova lista criada |
| `list:updated` | Servidor → Cliente | Lista atualizada |
| `list:deleted` | Servidor → Cliente | Lista removida |
| `card:created` | Servidor → Cliente | Novo card criado |
| `card:updated` | Servidor → Cliente | Card atualizado |
| `card:moved` | Servidor → Cliente | Card movido |
| `card:deleted` | Servidor → Cliente | Card removido |

## 📄 Licença

MIT License — sinta-se livre para usar e modificar.
