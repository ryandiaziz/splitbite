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

## Running with Docker (Recommended)

You can run the entire stack (Redis, Server, and Client) using Docker Compose. This is the easiest way to get the app running with all services orchestrated.

### 1. Build and Start
```bash
docker compose up --build
```

### 2. Access the Application
- **Frontend**: [http://localhost](http://localhost)
- **Backend API**: [http://localhost:9000](http://localhost:9000)
- **Redis**: Port 6379

### 3. Stopping the Application
```bash
docker compose down
```

## Useful Docker Compose Commands

| Command | Description |
| :--- | :--- |
| `docker compose up -d` | Run in background (detached mode) |
| `docker compose ps` | Check status of running containers |
| `docker compose logs -f` | View real-time logs |
| `docker compose down` | Stop and remove containers |
| `docker compose build` | Rebuild images from Dockerfiles |

### Changing Ports
To change the default ports, edit `docker-compose.yml`. For example, to change the frontend port to 8080, change `- "80:80"` to `- "8080:80"`.

### Deployment
Use the included `deploy.sh` for a clean rebuild and background execution.
