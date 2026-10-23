# Private Markets (static demo)

Portugal real-estate portal demo for Vercel — **no backend**. All interactive features use seeded dummy data in `localStorage`.

## Quick start

```bash
cd client
npm install
npm run dev
```

Open http://localhost:2059

## Demo logins

| Role  | Email                         | Password     |
|-------|-------------------------------|--------------|
| Admin | `ana@privatemarket.local`     | `Ana@123456` |
| Agent | `miguel@privatemarket.local`  | `Miguel@123` |
| Buyer | `sofia@privatemarket.local`   | `Sofia@123`  |

## What works offline

- Browse / search / filter listings (8 Portugal properties)
- Geo suggestions (districts, municipalities, addresses)
- Login / register / forgot password (OTP demo: any 4+ digits or `1234`)
- Favourites, saved searches, notifications
- Cart + dummy card payment → My Files download
- Agent: my properties, add/edit listing
- Admin: dashboard, users, properties, products, CMS, FAQ, logs

## Deploy (Vercel)

From repo root (or `client/`):

1. Framework: Vite
2. Root directory: `client` (or use root `vercel.json`)
3. Build: `npm run build`
4. Output: `dist`
5. Env: `VITE_USE_MOCK=true`, `VITE_API_URL=mock`, `VITE_STRIPE_DUMMY=true`

SPA rewrites are in `vercel.json`.

## Reset demo data

In the browser console:

```js
localStorage.removeItem("pm_static_demo_v1");
location.reload();
```

## Legacy Mongo stack

The `server/` folder is the original Express + Mongo API (optional). This static build does not require it.
