# My Conso

React Native app built with Expo, generated from `@diamondrarktvo/rn-starter`.

- Bundle id / package: `com.myconso`
- Expo slug: `my-conso`

## Getting started

```bash
pnpm install            # already done by the generator, rerun after pulling
cp .env.example .env.local   # if .env.local does not exist yet
pnpm dev-client         # start Metro for the dev client
pnpm ios                # first native build (iOS)
pnpm android            # first native build (Android)
```

## Environments

| Env | `EXPO_PUBLIC_APP_ENV` | App id suffix |
|---|---|---|
| development | `development` | `.development` |
| preview | `preview` | `.preview` |
| production | `production` | none |

Version 1 has no backend and no authentication: everything runs locally on the device.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` / `pnpm dev-client` | Start Metro (Expo Go / dev client) |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Jest (jest-expo) |
| `pnpm doctor` / `pnpm fix` | Check / fix Expo dependency versions |
| `pnpm build:android:preview` | Internal APK (preview) |
| `pnpm build:android:production` | Play Store bundle (AAB) |
| `pnpm build:android:production-apk` | Production APK for direct install |
| `pnpm build:ios:preview` / `build:ios:production` | iOS builds |
| `pnpm submit:android` / `submit:ios` | Submit the latest build to the stores |

First time with EAS: run `eas init` (sets the project id in `app.config.ts`) and `eas login`.

## Structure

```
src/
  features/     screen-level modules (one folder per feature)
  components/   ui/ (themed primitives), layout/, feedback/ (loading, error)
  providers/    cache, toast, error, sheet
  navigation/   root stack (single Home screen)
  lib/          env, error handling
  i18n/         fr / en
  theme/        theme provider (light | dark | system)
```

Styling uses Uniwind (Tailwind v4): tokens live in `global.css`, merge classes with `cn()`
from `src/utils/tailwind.ts`. See `CLAUDE.md` for the full architecture notes.

## CI

`.github/workflows/ci.yml` runs typecheck, lint and tests on every push and pull request.
