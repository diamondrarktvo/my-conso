# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start development server
npx expo start

# Platform-specific
npx expo start --ios
npx expo start --android
npx expo start --web

# Check for dependency issues
npx expo-doctor

# Fix dependency version mismatches
npx expo install --check

# Quality checks (run all three before committing; CI runs them too)
pnpm typecheck   # tsc --noEmit
pnpm lint        # eslint .
pnpm test        # jest (jest-expo); tests live in __tests__/ next to the code

# Run a single test file / a single test by name
pnpm test src/lib/__tests__/error-handler.test.ts
pnpm test -t "name of the test"

# Native dev builds (the app uses native modules like MMKV/Nitro, so Expo Go won't work)
pnpm dev-client          # start Metro for a dev client
pnpm ios / pnpm android  # expo run:* on a physical device
```

CI ([.github/workflows/ci.yml](.github/workflows/ci.yml)) runs typecheck, lint and test with pnpm 10 / Node 22. Use `pnpm` (lockfile is `pnpm-lock.yaml`).

## Architecture

**My Conso** is a React Native mobile app built with Expo + TypeScript. Entry point is [index.ts](index.ts) → [App.tsx](App.tsx).

### Provider Stack (App.tsx)

Providers are ordered by dependency — each layer depends on those below it:

```
GestureHandlerRootView → SafeAreaProvider → ThemeProvider
→ CacheProvider → KeyboardProvider → ToastProvider → ErrorProvider
→ BottomSheetProvider → RootNavigator
```

### Navigation

[src/navigation/root-navigator.tsx](src/navigation/root-navigator.tsx) renders a single-screen native stack (`Home`, no bottom tabs). Version 1 has no authentication and no backend (local-only).

### Key Providers

- **[cache-provider.tsx](src/providers/cache-provider.tsx)** — Generic TTL cache in MMKV with specialized hooks for preferences, searches, and location
- **[toast-provider.tsx](src/providers/toast-provider.tsx)** — Theme-aware toast notifications
- **[sheet-provider.tsx](src/providers/sheet-provider.tsx)** — Bottom sheet open/close state

### Styling

Uses **Uniwind** (Tailwind CSS v4 for React Native) via [global.css](global.css). Theme tokens use OKLCH color space with CSS variables for light/dark variants. Use the `cn()` helper from [src/utils/tailwind.ts](src/utils/tailwind.ts) to merge Tailwind classes.

`ThemeProvider` ([src/theme/ThemeProvider.tsx](src/theme/ThemeProvider.tsx)) exposes `light | dark | system` mode. Themed primitive components live in [src/components/ui/](src/components/ui/).

### Storage

All persistence uses **MMKV** (not AsyncStorage). Single general-purpose cache instance.

### i18n

`i18next` + `react-i18next` ([src/i18n/i18n.ts](src/i18n/i18n.ts)), locales `fr` (default) and `en` under `src/i18n/locales/<lng>/{common,errors}.json`. The selected language is persisted in the MMKV cache (`CACHE_KEYS.LANGUAGE`) via a custom language detector, so i18n depends on `cache-provider`'s `cacheStorage`. When adding a string, add it to **both** languages.

### Error handling

[src/lib/error-handler.ts](src/lib/error-handler.ts) holds pure functions (`classifyError`, stack-trace parsing for Hermes/JSC; stack details only in dev). UI code should report errors through `ErrorProvider` (`showError`) rather than calling the classifier directly; user-facing messages come from the `errors` i18n namespace.

### Environment

Read env vars only through [src/lib/env.ts](src/lib/env.ts) (`ENV`), never `process.env` directly. Only `EXPO_PUBLIC_*` vars are available client-side; copy `.env.example` to `.env.local`. `app.config.ts` (dynamic) is used alongside `app.json`; build profiles are in `eas.json`.

### Path Alias

`@/*` resolves to the project root (configured in [tsconfig.json](tsconfig.json)).

## Feature Structure

New features go in [src/features/](src/features/) as screen-level modules. Shared UI primitives belong in [src/components/ui/](src/components/ui/); layout wrappers in [src/components/layout/](src/components/layout/).
