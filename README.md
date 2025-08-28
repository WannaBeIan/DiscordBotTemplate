# Discord Bot Template (TypeScript • discord.js • tsup • pino)

Feature-packed, modular, and fast. Works unsharded and sharded. Includes loaders for commands, events, components, jobs, modules; structured logging; optional metrics; optional SQLite/Redis store; basic i18n.

## Quick Start
1. Use this template on GitHub or clone
2. `npm i`
3. Copy `.env.example` → `.env` and set:
   - DISCORD_TOKEN
   - DISCORD_CLIENT_ID
   - DEFAULT_GUILD_ID
4. Developer Portal
   - Intents: Guilds, Guild Members (optional: Message Content, Presence)
   - Scopes: bot, applications.commands
   - Invite with permissions: 2147568640
5. `npm run deploy:guild`
6. `npm run dev`

## Scripts
- `npm run dev` start in watch mode
- `npm run build` build to `dist`
- `npm start` run built app
- `npm run dev:sharded` run sharded in dev
- `npm run start:sharded` run sharded from `dist`
- `npm run deploy:guild` register commands to DEFAULT_GUILD_ID
- `npm run deploy:global` register commands globally

## Create Features
- Duplicate `src/commands/templateCommand.ts` and edit `.setName()`
- Duplicate `src/components/templateComponent.ts` and set `idPrefix`
- Duplicate `src/events/templateEvent.ts` and set `name`
- Add files in `src/jobs` or `src/modules`; loaders pick them up automatically

## Env Options
- `STORE_BACKEND` memory | sqlite | redis
- `METRICS_PORT` open Prometheus metrics on `/metrics`
- `OWNER_IDS` comma separated IDs for owner-only commands

## Security
Never commit `.env`. Use GitHub Secrets for CI actions.
