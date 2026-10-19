## Description

Digital buisness card


## Quick Start (Docker)

```bash
cp .env.example .env
docker compose up --build
```

## Project setup

```bash
npm install
cp .env.example .env   # Change DATABASE_URL to localhost if Postgres is not running in Docker.
npx prisma generate
npx prisma migrate deploy
npx prisma db seed
npm run start:dev
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
