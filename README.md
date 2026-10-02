# Villa 01 — 3D floor plan

Interactive, open-top visualization of the supplied single-floor villa plan. Orbit with a mouse or touch, zoom, reset the opening view, or switch to plan view. The browser-ready glTF model lives in `public/villa.glb`.

## Local development

```sh
npm install
npm run dev
```

## Deploy on Vercel

This is a Vite project. Import the repository into Vercel once and connect the `main` branch. Vercel builds with `npm run build`, publishes `dist/`, and deploys subsequent pushes automatically.

The plan is reconstructed from raster images. Some dimensions, openings and heights are approximate; use it as a visualization rather than a construction drawing.
