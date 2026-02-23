# CLAUDE.md

This file provides guidance for AI assistants working with the cardaroo-extractify codebase.

## Project Overview

**cardaroo-extractify** (branded as "CardScan") is a React web application that scans business cards using a device camera or file upload, extracts contact information via Azure Document Intelligence API, and saves the data to Salesforce CRM.

## Tech Stack

- **React 18** with TypeScript
- **Vite 5** — build tool and dev server (with SWC for fast refresh)
- **Tailwind CSS 3** + **shadcn/ui** — styling and UI components
- **React Router DOM 6** — client-side routing
- **Azure Document Intelligence API** — business card OCR/field extraction
- **Axios** — HTTP client for Salesforce API calls
- **Tesseract.js 6** — local OCR library (imported but secondary to Azure)
- **TanStack React Query 5** — server state management
- **React Hook Form + Zod** — form handling and validation

## Development Commands

```bash
npm run dev        # Start dev server on port 80 (HTTP)
npm run build      # Production build → dist/
npm run build:dev  # Development build
npm run lint       # Run ESLint
npm run preview    # Preview production build
```

> The dev server runs on **port 80**. You may need elevated privileges or change the port in `vite.config.ts`.

## Directory Structure

```
cardaroo-extractify/
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Root component: providers + routing
│   ├── pages/
│   │   ├── Index.tsx         # Main app page — orchestrates all states
│   │   └── NotFound.tsx      # 404 page
│   ├── components/
│   │   ├── Camera.tsx        # Camera/file upload + Azure API calls
│   │   ├── ExtractedInfo.tsx # Displays extracted contact fields
│   │   ├── NameCard.tsx      # Business card visual display
│   │   ├── Results.tsx       # Results view with action buttons
│   │   ├── Loader.tsx        # Loading spinner
│   │   └── ui/               # shadcn/ui primitives (auto-generated)
│   ├── api/
│   │   └── SaveCardData.js   # Salesforce OAuth + data submission
│   ├── hooks/
│   │   ├── use-toast.ts
│   │   └── use-mobile.tsx
│   ├── lib/
│   │   └── utils.ts          # `cn()` Tailwind class merge utility
│   ├── types/
│   │   └── index.ts          # ContactInfo interface, AppState enum
│   └── utils/
│       └── textExtraction.ts # Parses Azure API response → ContactInfo
├── https-server/             # Standalone Node.js HTTPS server
├── index.html                # HTML entry (references /src/main.tsx)
├── vite.config.ts            # Vite config: proxies, HTTPS toggle, aliases
├── tailwind.config.ts        # Custom colors, fonts, animations
├── tsconfig.json             # Path alias: @/* → ./src/*
├── components.json           # shadcn/ui config
└── .env                      # Azure API key + HTTPS flag
```

## Application Flow

The app uses a state machine in `src/pages/Index.tsx` with four states defined in `src/types/index.ts`:

```
LANDING → CAMERA → PROCESSING → RESULTS → LANDING (new scan)
```

1. **LANDING** — Hero screen with "Open Camera" button
2. **CAMERA** (`Camera.tsx`) — User selects file or uses live camera; image is compressed and sent to Azure
3. **PROCESSING** — `Loader` shown while awaiting Azure async result (polls every 1.5s, max 30 attempts)
4. **RESULTS** (`Results.tsx` + `ExtractedInfo.tsx`) — Displays extracted `ContactInfo`; Salesforce save available

## Key Files

### `src/components/Camera.tsx`
Core logic component. Responsibilities:
- Live camera stream via `getUserMedia`
- File upload fallback
- Image compression to max 1200×1200px at 70% JPEG quality before upload
- Azure Document Intelligence async flow:
  1. `POST` image binary → gets `Operation-Location` URL
  2. Polls `Operation-Location` until `status === "succeeded"`
  3. Extracts fields: `ContactNames`, `CompanyNames`, `JobTitles`, `Emails`, `WorkPhones`, `Websites`, `Addresses`
- Reads `VITE_AZURE_API_KEY` and `VITE_AZURE_ENDPOINT` from `import.meta.env`

### `src/utils/textExtraction.ts`
- `extractTextFromImage(image)` — parses the structured Azure response object into `ContactInfo`
- `parseTextToContactInfo(text)` — stub returning mock data (not connected to real flow)

### `src/api/SaveCardData.js`
- `getSalesforceToken()` — fetches OAuth token via Vite proxy `/salesforce-token`
- `sendCardDataToSalesforce(cardData)` — POSTs card data to `/businesscard` with Bearer token
- Both proxied endpoints are configured in `vite.config.ts`

### `src/types/index.ts`
```typescript
export interface ContactInfo {
  name?: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  address?: string;
}

export enum AppState {
  LANDING = "landing",
  CAMERA = "camera",
  PROCESSING = "processing",
  RESULTS = "results"
}
```

## Environment Variables

Create/update `.env` in the project root:

```
HTTPS=false
VITE_AZURE_API_KEY=<azure-document-intelligence-key>
VITE_AZURE_ENDPOINT=https://<resource-name>.cognitiveservices.azure.com
```

- All `VITE_` prefixed variables are exposed to client-side code via `import.meta.env`
- The `HTTPS` flag controls whether Vite dev server runs over HTTPS (requires `certificate.crt` + `private.key`)

## Vite Proxy Configuration

Defined in `vite.config.ts`, active in **development only**:

| Proxy path | Target |
|---|---|
| `/salesforce-token` | Salesforce OAuth endpoint (login.salesforce.com) |
| `/businesscard` | ISCA business card API endpoint |

These proxies avoid CORS issues during local development. In production, a real server/reverse proxy must handle these routes.

## Styling Conventions

- Use **Tailwind utility classes** exclusively; avoid writing custom CSS except in `index.css` for global tokens
- Use the `cn()` helper from `src/lib/utils.ts` for conditional class merging
- UI components in `src/components/ui/` are **shadcn/ui generated** — prefer regenerating via CLI rather than editing directly
- Color system uses CSS custom properties (HSL) defined in `index.css`; reference via Tailwind semantic tokens (e.g., `text-primary`, `bg-muted`)
- Dark mode: class-based strategy (`dark:` prefix)

## TypeScript Conventions

- Path alias `@/` maps to `src/` — always use this for imports within `src/`
- `noUnusedLocals` and strict mode are **disabled** — don't add unnecessary type assertions or `_` prefixes
- Prefer TypeScript for new files; `SaveCardData.js` is intentionally plain JS
- `ContactInfo` fields are all optional (`?`) — handle missing values gracefully

## shadcn/ui Components

Add new components with:
```bash
npx shadcn-ui@latest add <component-name>
```

Components land in `src/components/ui/` and should not be manually edited unless patching a bug.

## No Test Suite

There are no tests configured. When adding significant logic, consider whether unit tests with Vitest would be appropriate, but do not add a test framework without explicit request.

## Security Notes

- **API keys in `.env`** are bundled into the client build and visible in browser devtools. This is a known limitation of the current architecture.
- `src/api/SaveCardData.js` contains Salesforce OAuth credentials inline — these should be moved to `.env` variables or a backend proxy.
- `certificate.crt` and `private.key` are present in the repo root for local HTTPS — do not commit real production certificates.
- `.env` is listed in `.gitignore`; confirm it stays excluded before committing.
