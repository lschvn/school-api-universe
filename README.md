# api-universe

## Getting Started

Install Bun :

```bash
npm install -g bun
```

Install Dependencies :

```bash
bun install
```

Run the migrations

```bash
bun db:migrate
```

Run the server

```bash
bun run dev
```

Run the tests

```bash
bun run test:all
```

## Utils

- readBody: Promise<string> - Read the body of a request
- getUserSession: Promise<Number | null> - Get the user id from the session
- setUserSession: Promise<void> - Set the user id in the session
- getRouterParam: string - Get a parameter from the router

## Open API

The Open API documentation is available at `/reference`.
