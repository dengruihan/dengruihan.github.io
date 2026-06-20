# RuiHan Deng — Personal Website

A scroll-driven one-page portfolio built with static HTML, CSS, and vanilla JavaScript. Content is sourced from the [previous Vue portfolio](https://github.com/dengruihan/dengruihan.github.io).

## Sections

- **Hero** — wetland-themed introduction
- **About** — story, goals, quick facts
- **Skills** — capability bars with scroll-driven fill
- **Journey** — education and awards timeline
- **Projects** — horizontal scroll gallery (desktop) with project stats
- **Blog** — dispatch cards with full-screen overlay reader
- **Links** — friend link card stack
- **Updates & Contact** — latest transmissions and footer

## Local preview

Serve the repository root with any static file server:

```sh
python3 -m http.server 8080
# or
npx serve .
```

Open `http://localhost:8080` in your browser.

## Deploy

Push to `main` to trigger the GitHub Actions workflow (`.github/workflows/deploy.yml`). Enable GitHub Pages with **GitHub Actions** as the source in repository settings.

No build step is required — the site ships as plain HTML, CSS, JS, and JSON.

## Data

Content lives in `data/`:

- `about.json`
- `skills.json`
- `projects.json`
- `blog.json`
- `links.json`

Update these files to change site content without touching layout code.

## Accessibility

- Respects `prefers-reduced-motion` (disables scroll-driven animations)
- Skip link, semantic landmarks, visible focus states
- Mobile fallback: vertical project cards instead of horizontal gallery
