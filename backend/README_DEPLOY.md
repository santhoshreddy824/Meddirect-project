# Backend deployment & recovery notes

If your backend crashed with errors about `bcrypt`/`bcrypt_lib.node` or `bcryptjs` missing, follow these steps.

## Local (Windows / PowerShell)

1. Open PowerShell and run:

```powershell
cd backend
# remove node_modules and lockfile
Remove-Item -Recurse -Force node_modules
Remove-Item -Force package-lock.json
# install fresh
npm install
# run server
npm run dev
```

2. If you only need to ensure `bcryptjs` is installed:

```powershell
cd backend
npm install bcryptjs
```

## CI / Render (Linux)

1. In Render dashboard, open your backend service.
2. Clear the build cache (there's a "Clear cache and deploy" option) or redeploy after changing envs.
3. Ensure the build step runs a clean install (`npm install`).

You can also force a clean install by adding this to the backend build command (not required if you use the `reinstall` script):

```bash
cd backend && rm -rf node_modules package-lock.json && npm install
```

## Why this happens

- `bcrypt` contains native binaries compiled for the OS/architecture where `npm install` ran. If you `npm install` on Windows and then deploy to Linux (Render), the prebuilt native binary is incompatible and causes `invalid ELF header`.
- We switched to `bcryptjs` (a pure-JS implementation) to avoid native binary issues. Make sure to run a fresh `npm install` so the old native `bcrypt` is not present in `node_modules`.

## Helpful scripts

- `npm run reinstall` (Linux-friendly): removes `node_modules` and `package-lock.json` then runs `npm install`.

If you want, I can add a small CI step or GitHub Action to run `npm ci` for you during push to ensure lockfile and modules are consistent across environments.
