# SplitBite

SplitBite is an ephemeral group food ordering app. It utilizes temporary rooms without login to collect food orders and split bills in real time.

## Infrastructure
- **Server**: Scala Play Framework 3.0
- **Client**: React JS + Vite + Tailwind CSS (TypeScript)
- **State/Database**: Redis (Alpine)

## Local Development Workflows

### Prerequisites
- Node.js (v18+)
- Java (11/17+)
- sbt (Scala Build Tool)
- Docker & Docker Compose

### 1. Start Redis
```bash
docker compose up -d redis
```

### 2. Start Server (Backend)
```bash
cd server
sbt run
# Server will be running at http://localhost:9000
```

### 3. Start Client (Frontend)
```bash
cd client
npm install
npm run dev
# Vite will spin up a local development server for the UI
```

### Deployment
Use the included `deploy.sh` to build and orchestrate containers.
