# Floor Lords Crew Migration Notes

Read-only rescue copy captured from `https://www.floorlords.org/`.

## Safety Rules

- Do not delete, unpublish, or modify the current Replit app while this is being verified.
- Do not change DNS until Hermes confirms the Vercel preview works.
- Do not deploy from this package until the external dependencies below are confirmed.

## Captured

- Single-page React/Vite app: `index.html`
- JavaScript and CSS bundle under `assets/`
- Local crew/photo assets under `assets/`
- Root flyer images
- Video assets under `videos/`

## External Dependencies To Keep Alive

- Google Fonts: `fonts.googleapis.com`, `fonts.gstatic.com`
- Instagram link: `https://www.instagram.com/floorlordsboston`

## Verification Notes

- The remaining failed crawl item was `/assets/%23n`, a CSS/SVG anchor artifact, not a real site page.
- `vercel.json` includes a fallback rewrite so direct browser refreshes route back to the single-page app.
