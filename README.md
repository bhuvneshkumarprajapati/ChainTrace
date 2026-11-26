# ChainTrace

Blockchain-powered supply chain tracking and product verification platform built with React, Node.js, MongoDB and Solidity.

## Architecture

- `src/`: React and Vite frontend.
- `server/`: Express API, MongoDB persistence and authentication.
- `blockchain/`: Hardhat smart contract project and tests.
- `docker-compose.yml`: development frontend, production frontend and backend services.

## Local development

Install Node.js 22 (use a current patch release), npm and Git. Docker Compose v2 is required for container-based development.

```sh
git clone https://github.com/bhuvneshkumarprajapati/ChainTrace.git
cd ChainTrace
npm ci
npm --prefix server ci
npm --prefix blockchain ci
```

Configure `server/.env` before starting the API. The database connection requires `MONGO_URI`. Configure authentication and blockchain credentials according to the server configuration. Never commit real credentials or private keys. Set `SEPOLIA_RPC_URL` in your shell or Compose environment when using Sepolia with Docker.

```sh
npm --prefix server run dev
# In another terminal:
npm run dev
```

## Docker

After configuring the environment, run:

```sh
docker compose up --build -d
docker compose ps
docker compose logs backend
```

Development frontend: http://localhost:5173

Production frontend: http://localhost:8080

Backend readiness: http://localhost:5000/api/health

Stop containers with `docker compose down`. MongoDB must be reachable from the backend container; localhost inside a container refers to that container.

## Verification

```sh
npm run lint
npm run build
npm --prefix server test
npm --prefix blockchain test
```

Run these checks before opening a pull request. A successful frontend build alone does not establish end-to-end blockchain or database functionality.

## Deployment

The existing frontend URL is https://chain-trace-red.vercel.app (availability and end-to-end functionality must be verified). Vercel can build the root frontend; the backend can be deployed separately from `server/` on Render. Configure the API URL, allowed frontend origins, database and blockchain credentials for the target environment.

## Contributing

Create a branch, make focused changes, run relevant checks, and open a pull request describing the changes and test results. Do not include secrets, generated dependencies or production credentials.

## License

A repository-wide license has not yet been selected. Public visibility alone does not grant permission to reuse or redistribute the code.
