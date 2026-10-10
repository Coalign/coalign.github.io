# Coalign hero film

An original silent Remotion/Three.js composition authored for this website. No stock footage or generated images are used. The deployed page serves H.264 MP4s and PNG posters; React and Remotion are authoring dependencies only.

## Alignment

- Source: `motion/src/Alignment.jsx`, composition `Alignment`.
- `alignment.mp4`: 1920 × 1080, 60fps, 720 frames / twelve seconds, designed to loop seamlessly.
- `alignment-poster.png`: frame 210 from the same composition.
- Original illustration: a physically rendered beveled chip, studio lighting, extruded canonical `assets/mark.svg` angled with the chip, curved blue-violet context routes, and moving signal trails. This illustrates shared context rather than product activity.

## Archived development walkthrough

The product walkthrough video is removed from the live page and public deployment at the user's request. Its continuous recording and composition source remain in the private development repository for reference, with controlled synthetic data and no customer data or live credentials. It can be rendered separately with `REMOTION_FILM=ReviewWalkthrough npm run render`.

The hero loops automatically, including under reduced motion as requested. Hidden tabs pause playback; returning tabs resume. Diagram animation and scrolling respect reduced motion independently.

Reproduce from `motion/` with `npm ci` and `npm run render`. Set `REMOTION_BROWSER_EXECUTABLE` to a compatible Chromium if required. Three.js uses the ANGLE renderer. Original motion artwork belongs to the repository owner; Remotion, React, Three.js, and React Three Fiber retain their respective licenses.
