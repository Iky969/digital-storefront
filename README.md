# DigiStore — Digital Products Storefront & E-Wallet

Full-stack web app for selling digital goods (Premium Accounts, Game Currency, Vouchers) with an internal e-wallet, instant delivery, and a simulated deposit gateway.

**Stack:** Express + SQLite (better-sqlite3) + JWT · React 18 + Vite + Tailwind CSS v4 + lucide-react

## Quick Start

```bash
# 1. Install all dependencies (root, server, client)
npm run install-all

# 2. Run server + client together
npm start
```

- Server: http://localhost:5000 (API under `/api`)
- Client: http://localhost:3000 (Vite proxies `/api` to the server)

The database (`server/store.db`) is created and seeded automatically on first server start.

## Demo Accounts

| Username | Password  | Role  | Balance   |
|----------|-----------|-------|-----------|
| `admin`  | `admin123`| admin | Rp 1.000.000 |
| `user`   | `user123` | user  | Rp 50.000    |

## Features

- **Auth:** register / login (bcrypt + JWT), live balance in navbar
- **Catalog:** categories filter, product cards with live stock badges
- **E-Wallet:** deposit via DANA / OVO / GoPay / QRIS (simulated), invoice with payment code, confirm to credit balance
- **Instant delivery:** atomic purchase — balance deducted, stock allocated, credentials/voucher delivered in a success modal with 1-click copy; `game_topup` products ask for Game ID and are auto-fulfilled
- **History:** purchases tab + balance mutations tab (cash-in / cash-out)
- **Admin panel:** add products, bulk-paste stock (one item per line), approve pending deposits

## Project Structure

```
server/   index.js, database.js, seed.js, middleware/auth.js,
          routes/{auth,products,wallet,buy,admin}.js
client/   src/{components,pages,context,utils}
```

## Reset Database

Stop the server, then delete `server/store.db*` and restart — it re-seeds automatically.

## Scripts

| Command              | Description                        |
|----------------------|------------------------------------|
| `npm start`          | Run server + client concurrently   |
| `npm run server`     | Server only                        |
| `npm run client`     | Client only                        |
| `npm run seed`       | Seed database manually             |
| `npm run install-all`| Install root + server + client deps|

> Payment gateway is simulated for demo purposes — no real money involved.
