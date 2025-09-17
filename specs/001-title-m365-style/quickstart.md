# Quickstart

## Prerequisites
- Node.js 18+
- Package manager (npm or pnpm)

## Install & Run (static dev)
```powershell
# install deps
npm install

# start dev server
npm run dev   # e.g., next dev

# build static output
npm run build    # e.g., next build
npm run export   # e.g., next export → outputs to ./out

# preview static output (if supported)
npm run preview
```

## Configuration
- Set site metadata (title, description, base URL) and theme colors in the site config.
- Provide client-side configuration for external access (scopes, client ID) without embedding secrets.

## Usage
- Sign in with your Microsoft account from the landing page.
- Select a person in the left panel to filter images by sharer.
- Click an image to see a larger preview and open in source.

## Notes
- Static-only: no server runtime or databases (Next.js static export).
- A11y baseline: landmarks, single h1, alt text, focus states, color contrast.
- Performance: images optimized; incremental loading for large sets.
