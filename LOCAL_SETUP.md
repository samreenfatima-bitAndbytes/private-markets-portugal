# Private Market — static demo setup

No MongoDB or Express required. The Vite client ships with a full mock API + seed data.

```bash
cd client
cp .env.example .env   # already mock-ready
npm install
npm run dev            # http://localhost:2059
```

## Demo accounts

| Role  | Email                        | Password    |
|-------|------------------------------|-------------|
| Admin | ana@privatemarket.local      | Ana@123456  |
| Agent | miguel@privatemarket.local   | Miguel@123  |
| Buyer | sofia@privatemarket.local    | Sofia@123   |

OTP flows accept `1234` (or any code with 4+ digits).

## Reset data

```js
localStorage.removeItem("pm_static_demo_v1");
location.reload();
```

## Vercel

Deploy the `client` folder (or repo root with `vercel.json`). Env: `VITE_USE_MOCK=true`, `VITE_API_URL=mock`, `VITE_STRIPE_DUMMY=true`.
