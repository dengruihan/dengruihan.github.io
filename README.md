# RuiHan Deng — Personal Website

A scroll-driven one-page portfolio built with Vite, GSAP ScrollTrigger, and Lenis smooth scrolling. Content is sourced from the [previous Vue portfolio](https://github.com/dengruihan/dengruihan.github.io).

## Sections

- **Hero** — pinned wetland descent with parallax layers
- **About** — story, goals, quick facts
- **Skills** — scroll-scrubbed capability bars
- **Journey** — education and awards timeline
- **Projects** — horizontal scroll gallery (desktop) with stat counters
- **Blog** — dispatch cards with full-screen overlay reader
- **Updates & Contact** — latest transmissions and footer

## Development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
npm run preview
```

## Deploy

Push to `main` to trigger the GitHub Actions workflow (`.github/workflows/deploy.yml`). Enable GitHub Pages with **GitHub Actions** as the source in repository settings.

For a project site (e.g. `username.github.io/repo-name`), set `GITHUB_PAGES_BASE` to `/repo-name/` in the deploy workflow.

## Data

Content lives in `public/data/`:

- `about.json`
- `skills.json`
- `projects.json`
- `blog.json`

Update these files to change site content without touching layout code.

## Accessibility

- Respects `prefers-reduced-motion` (disables Lenis, pins, and scrubs)
- Skip link, semantic landmarks, visible focus states
- Mobile fallback: vertical project cards instead of horizontal pin
