# Bushbuckridge Mall — Self-Hosted Static Clone

A self-hosted static clone of <https://bushbuckridgemall.co.za/>, built from the
live site's rendered HTML.

## What's here

| Path | Contents |
|------|----------|
| `*.html` (66 files) | One static page per route (home, about, directory, contact, events, and each store's page) |
| `wp-content/` | Theme/plugin CSS, uploaded images, PDFs (mirrored at original paths) |
| `wp-includes/` | WordPress CSS assets |
| `fonts.googleapis.com/`, `fonts.gstatic.com/` | Self-hosted Google Fonts |

## How it was built

1. Fetched full rendered HTML for all 66 routes directly from the live site.
2. Downloaded every self-hosted asset (CSS, images, fonts, PDFs) referenced
   across the pages, recursing into CSS `url()`/`@import`.
3. Stripped `<script>` tags (WordPress/Elementor runtime, GTM/GA, reCAPTCHA)
   and dead WordPress endpoint `<link>`s (RSS/oEmbed/REST/RSD/xmlrpc); the
   rendered layout doesn't depend on JS.
4. Rewrote every self-hosted asset reference and internal navigation link to
   the local `.html` files.

1908 of 1910 local references resolve (the 2 that don't are a `whatsapp://`
share link and a same-page `#respond` anchor — neither is a missing asset).

## Viewing

Open any `.html` file directly in a browser, e.g. `index.html`. No web
server is required — all asset references are document-relative.
