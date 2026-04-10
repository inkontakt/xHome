# xHome

This repository now contains the full app workspace under a single canonical folder on the server:

`/home/xhome/xHome`

The Astro frontend lives at the repository root. Supporting app assets and the WordPress stack live in subfolders so the project can be operated from one place.

## Project Structure

```text
/
├── public/
├── resources/
│   ├── exports/
│   └── templates/
├── src/
├── wordpress-cms/
│   ├── .env.example
│   └── docker-compose.yml
├── .env.example
├── package.json
└── README.md
```

## Commands

Run Astro from the repository root:

| Command | Action |
| :------ | :----- |
| `npm install` | Installs frontend dependencies |
| `npm run dev` | Starts the Astro dev server |
| `npm run build` | Builds the frontend into `dist/` |
| `npm run preview` | Previews the built frontend |
| `npm run lint` | Runs ESLint |
| `npm run check-types` | Runs TypeScript checks |

Run WordPress from `wordpress-cms/`:

| Command | Action |
| :------ | :----- |
| `docker compose up -d` | Starts WordPress and MySQL |
| `docker compose down` | Stops the WordPress stack |

## Notes

- The real frontend `.env` and `wordpress-cms/.env` stay local on the server and are not committed.
- `resources/templates/` stores the source Orion template archive.
- `resources/exports/` stores exported JSON files used for app reference data.
