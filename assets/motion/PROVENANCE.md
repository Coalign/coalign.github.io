# Coalign films

Two silent Remotion compositions authored for this website. No stock footage or generated images are used. The deployed page serves H.264 MP4s and PNG posters; React and Remotion are authoring dependencies only.

## Alignment

- Source: `motion/src/index.jsx`, composition `Alignment`.
- `alignment.mp4`: 1600 × 900, 24fps, 216 frames / nine seconds, designed to loop seamlessly.
- `alignment-poster.png`: frame 126 from the same composition.
- Original illustration: blue and violet context streams converge on a metallic review tile carrying Coalign's upright paired diagonal mark from the canonical `assets/mark.svg`. This film illustrates shared context.

## Development walkthrough

- Source: `motion/src/ReviewWalkthrough.jsx`, composition `ReviewWalkthrough`.
- `review-walkthrough.mp4`: 1280 × 800, 24fps, 378 frames / 15.75 seconds.
- `review-poster.png`: frame 285 from the same composition.
- Continuous source recording: `motion/public/walkthrough/recording.webm`; timing and provenance in `recording.json`. Capture source is `motion/capture-walkthrough.py`.
- Recorded from the actual Coalign/platform development React interface with controlled synthetic API responses. No customer data or live credentials are used. Setup and introductory content are hidden; a dark presentation stylesheet and canonical Coalign logo match the website.
- The cursor, click feedback, source expansion, scrolling, and acceptance action are recorded continuously in the browser. Remotion trims the setup and encodes the recording; there are no screenshot cuts or black fades. The end returns to the initial source view for the loop.
- Review acceptance, commit, and merge remain separate human actions. This is a development demonstration rather than production activity.

Both website videos loop automatically, including under reduced motion as explicitly requested. Hidden tabs pause playback; returning tabs resume. Diagram animation and scroll smoothing respect reduced motion independently.

Reproduce both videos from `motion/` using `npm ci` then `npm run render`. Set `REMOTION_BROWSER_EXECUTABLE` to an existing compatible Chromium binary if required. The renderer reuses the checked-in continuous recording; it does not fetch live application data.

Source licensing: original website motion code and Coalign/platform development UI; repository owners retain applicable rights. Remotion and React packages retain their own licenses.
