# Carteira Comunitária Bitcoin (Fedimint-inspired)

Projeto MVP com:

- **Backend em Rust (Axum)** simulando um cliente de federação.
- **Frontend em React (Vite)** para interface de carteira.
- Fluxos de teste para **receber/enviar BTC on-chain e Lightning**.

## Estrutura

- `backend/`: API em Rust com estado de carteira comunitária.
- `frontend/`: interface React consumindo a API.

## Rodando localmente

### 1) Backend

```bash
cd backend
cargo run
```

API em `http://localhost:8080`.

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

App em `http://localhost:5173`.

## Endpoints

- `GET /api/wallet/state`
- `POST /api/wallet/receive`
- `POST /api/wallet/send`
