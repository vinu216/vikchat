# VikChat — Talk to Strangers, Make Friends

A random stranger chat app built with React, Hono, and Tailwind CSS.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run frontend + backend together
npm run dev
```

- Frontend (Vite): http://localhost:5173  
- Backend (Hono API): http://localhost:3001

---

## 🏗️ Production Build & Run

```bash
npm run start:prod
```

This builds the React app into `dist/frontend/` and starts the Hono server.  
Open: **http://localhost:3001**

---

## 📁 Project Structure

```
vikchat/
├── src/
│   ├── react-app/       # React frontend (pages, components, hooks)
│   └── server/
│       └── index.ts     # Hono backend (chat API + serves frontend)
├── vite.config.ts
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🌐 Deploy to VPS

```bash
npm install
npm run start:prod          # Runs on PORT env var (default 3001)
```

**Nginx reverse proxy:**
```nginx
location / { proxy_pass http://localhost:3001; }
```

**PM2:**
```bash
npm run build
pm2 start "tsx src/server/index.ts" --name vikchat
```

**Railway / Render / Fly.io:**  
Set `PORT` env var, start command: `npm run start:prod`

---

## ⚙️ Environment Variables

| Variable | Default | Description  |
|----------|---------|--------------|
| `PORT`   | `3001`  | Server port  |
