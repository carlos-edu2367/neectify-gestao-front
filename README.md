# Painel Neectify (gestao_front)

SPA Vite + React 19 + TypeScript. Producao: https://painel.neectify.com (Vercel); API: https://api.neectify.com.

## Desenvolvimento

- `npm run dev` — dev server. Com `VITE_API_MOCK=1` (so em dev) usa MSW (service worker em `dev/`, servido apenas pelo dev server).
- `npm test` (vitest), `npm run lint` (oxlint), `npm run typecheck`, `npm run e2e` (Playwright, sobe o dev server com mocks).

## Deploy (Vercel)

- No projeto Vercel defina `VITE_API_URL=https://api.neectify.com`. O build de producao falha se ela estiver vazia.
- **Nunca** defina `VITE_API_MOCK` na Vercel: o build de producao falha se ela existir, e os mocks so rodam em dev.
- Os headers de seguranca (X-Frame-Options, CSP `frame-ancestors 'none'`, nosniff, Referrer-Policy, X-Robots-Tag) e o rewrite SPA estao em `vercel.json`.
