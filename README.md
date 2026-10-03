# Villa 01 — 3D floor plan

Interactive, open-top visualization of the supplied single-floor villa plan. Orbit with a mouse or touch, zoom, reset the opening view, switch to plan view, or walk inside. The browser-ready glTF model lives in `public/villa.glb`. The current model and preview come from the `Villa_Open_Top_Current.blend` source in the main amenagement project (cinema decor revision v19).

## Local development

```sh
npm install
npm run dev
```

## Deploy on Vercel

This is a Vite project. Import the repository into Vercel once and connect the `main` branch. Vercel builds with `npm run build`, publishes `dist/`, and deploys subsequent pushes automatically.

After editing the Blender file, export a new `public/villa.glb` and `public/cover.jpg`, then commit and push them with any website changes. Vercel cannot build a `.blend` file itself; it deploys the checked-in browser assets.

The plan is reconstructed from raster images. Some dimensions, openings and heights are approximate; use it as a visualization rather than a construction drawing.
