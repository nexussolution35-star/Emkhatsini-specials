# Bushbuckridge Mall — Modern Website

A modern redesign of the Bushbuckridge Mall website, built as a fast, fully
static site. It keeps the mall's established brand — gold `#fea900`, deep navy
`#071543`, the official logo and real mall photography — and wraps it in a
contemporary design with rich animation.

## Pages

| Page | Purpose |
|------|---------|
| `index.html` | Full-screen hero, trust-brand marquee, animated stats, category cards, World Cup 2026 event feature, exhibition CTA, hours + map |
| `about.html` | Mall story, vision/community/sustainability, leadership (Centre Manager & leasing), photo gallery |
| `stores.html` | Live store directory — 63 stores with search + category filters, shop numbers, phone numbers and hours |
| `exhibition.html` | Activations & exhibitions pitch, 3-step booking process, application form PDF |
| `retail-application.html` | Leasing pitch + online application form (mailto handoff) + official PDF form |
| `contact-us.html` | Contact cards, message form, trading hours, Google Maps embed |

## Features

- **James** — an AI-styled chat assistant (rule-based, runs fully in the
  browser). Answers store lookups ("Where is Pick n Pay?" → Shop 43 + phone),
  trading hours, directions, leasing and exhibition queries with quick-reply
  chips and typing animation. Available on every page.
- **Animations** — Ken Burns hero, scroll-reveal with stagger, animated stat
  counters, seamless brand-logo marquee, hover lifts, floating cards. All
  respect `prefers-reduced-motion`.
- **Real store data** — `assets/js/stores-data.js` holds all 63 stores
  (name, category, shop number, phone, hours, logo, website) scraped from the
  original site and shared by the directory and the chatbot.
- **Self-hosted fonts** — Sora (display) + Inter (body) woff2 in
  `assets/fonts/`; no external font requests.
- **Original assets kept** — store logos, mall photography and application
  PDFs live at their original paths under `wp-content/uploads/`.

## Structure

```
index.html … contact-us.html   the six pages
assets/css/main.css            design system (tokens, components, animations)
assets/css/fonts.css           @font-face for self-hosted Sora + Inter
assets/js/main.js              header, nav, reveal/counter/marquee animations, forms
assets/js/james.js             James chat assistant
assets/js/stores-data.js       store directory data (generated from the scrape)
wp-content/uploads/            logos, photos, PDFs from the original site
```

No build step — open `index.html` or serve the folder with any static host.

> The previous 1:1 static clone of the old WordPress site is preserved in git
> history (commit `1fdf33e`).
