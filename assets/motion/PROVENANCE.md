# Coalign films

Two silent Remotion compositions authored for this website. No stock footage or generated images are used. The deployed page serves H.264 MP4s and PNG posters; React and Remotion are authoring dependencies only.

## Alignment

- Source: `motion/src/index.jsx`, composition `Alignment`.
- `alignment.mp4`: 1600 × 900, 24fps, 216 frames / nine seconds, designed to loop seamlessly.
- `alignment-poster.png`: frame 126 from the same composition.
- Original illustration: blue and violet context streams converge on a metallic review tile carrying Coalign's upright paired diagonal mark from the canonical `assets/mark.svg`. This film illustrates shared context.

## Development walkthrough

- Source: `motion/src/ReviewWalkthrough.jsx`, composition `ReviewWalkthrough`.
- `review-walkthrough.mp4`: 1280 × 800, 24fps, 360 frames / fifteen seconds.
- `review-poster.png`: frame 285 from the same composition.
- Source captures: `motion/public/walkthrough/{overview,source,patch,accepted}.png`, from the actual Coalign/platform development React UI on current main, captured on 2026-10-09. Capture metadata is in `motion/public/walkthrough/capture.json`.
- Controlled synthetic fixtures supply local API responses; no live credentials or customer data are shown. Credential setup and introductory content are hidden for presentation, and the logo matches this website.
- The captured application retains its light UI inside the website’s black frame. Remotion animates a cursor, click rings, and transitions over the captured interface. Its logo overlay uses the same canonical `assets/mark.svg` as the website and hero; `render.mjs` copies this asset into the render workspace. The sequence shows source inspection, patch review, and review acceptance. Commit and merge remain separate human actions. This is a synthetic development demonstration, with no production footage.

Both website videos loop automatically, including under reduced motion as explicitly requested. Hidden tabs pause playback; returning tabs resume. Diagram animation and scroll smoothing respect reduced motion independently.

Reproduce both videos from `motion/` using `npm ci` then `npm run render`. Set `REMOTION_BROWSER_EXECUTABLE` to an existing compatible Chromium binary if required. The renderer reuses checked-in walkthrough captures; it does not fetch live application data.

Source licensing: original website motion code and Coalign/platform development UI; repository owners retain applicable rights. Remotion and React packages retain their own licenses.
