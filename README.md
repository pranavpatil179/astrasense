## ASTRASENSE – AI Powered Environmental Risk Detection Dashboard

ASTRASENSE is a modern, multi-page **environmental intelligence** web app that simulates satellite-derived indices (NDVI, NDWI, LST, EVI) and produces **AI-style hazard risk predictions** (flood, drought, vegetation stress, land degradation) with interactive visualization.

## Getting Started

### 1) Configure environment

Create `.env.local`:

```bash
OPENCAGE_API_KEY=your_opencage_key_here
```

You can copy from `.env.example`.

### 2) Install + run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Key features

- **Home**: global search with autocomplete (OpenCage) + 3D globe
- **Dashboard**: indicator cards, AI risk panel, alerts, and analytics charts
- **Map Analysis**: MapLibre map with street/satellite toggle and hazard heatmap overlays
- **Alert Center**: severity filters and animated alert cards
- **About**: explanation of indices + simulated model workflow

## API routes

- `GET /api/geocode?q=...`: OpenCage proxy (keeps API key server-side)
- `GET /api/simulate?lat=...&lng=...&days=...`: simulated indices + hazards + alerts + trends + hotspots

## Notes

- This is a **simulation demo** (not a real satellite ingestion pipeline).
- Satellite map tiles use a public raster service for demo purposes.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
