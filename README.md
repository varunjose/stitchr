# Stitchr

**Your tools. One working app.**

Stitchr is a product concept for assembling existing services into a complete business app without writing code. This repository contains its landing page and interactive product demonstration.

The page follows a lime thread from an initial business idea, through tools and workflow rules, to a unified app. A kitchen is the main story, with switchable online-store and service-business examples. Each example updates the dashboard and sample workflow.

## Run locally

No dependencies or build step are required. The site is plain HTML, CSS, and JavaScript.

```bash
python3 -m http.server 8000 --directory dist
```

Open `http://localhost:8000`.

## What works

- Responsive landing page, navigation, and business storytelling.
- A scroll-driven SVG thread with a needle following the path.
- Three business examples with keyboard-accessible tabs.
- A sample transaction that progresses through payment, database, and notification stages, then updates the example dashboard.
- Independent demo totals for each business case. Switching cases cancels any unfinished sample action and resets that case to its last completed state.
- Native FAQ disclosure controls.
- Reduced-motion support and a visible animation control.
- Local imagery, favicon, and page metadata, with no external scripts, trackers, or font requests.

This is a marketing site and browser-only prototype. It does not connect to Supabase, Stripe, Slack, Shopify, or an AI service. It does not accept real payments, publish business apps, collect email addresses, or claim live customer results. Sample data is held in memory and resets on refresh. The page explicitly labels the preview and illustrative integrations.

## Project structure

```text
dist/
  index.html           Landing-page content and accessible markup
  styles.css           Theme, layout, animation, and responsive styles
  app.js               Business examples, sample workflows, scroll thread
  assets/
    kitchen.webp       Original generated café image
    favicon.svg        Stitchr mark
.github/workflows/
  pages.yml            Optional GitHub Pages deployment
.openai/hosting.json   Sites project identity and static output configuration
README.md
```

## Edit the page

- Change copy and sections in `dist/index.html`.
- Change shared colors in the `:root` block of `dist/styles.css`.
- Edit the `cases` object in `dist/app.js` to change example businesses, dashboard numbers, and transaction stages.
- Keep paths relative so the site works at both a domain root and a GitHub Pages repository path.
- Replace `dist/assets/kitchen.webp` to change the kitchen image. Preserve meaningful alternative text in `index.html` and `app.js`.

## Deploy on GitHub Pages

1. Push this repository to GitHub.
2. Under **Settings → Pages**, select **GitHub Actions** as the source.
3. Run the **Deploy Stitchr to GitHub Pages** workflow, or push a commit to `main`.

The workflow publishes the `dist` directory. No package installation or build is needed. The same directory can be served by any static web host.

## Design decisions

The white, near-black, and lime palette keeps the tools and product story legible. The thread is a functional diagram of the story, not a looping background distraction: it advances and reverses with scrolling. Cards and dashboard UI are real HTML rather than screenshots. The kitchen photograph provides a human reference point for the workflow.

The main calls to action lead to working sections and the interactive demo. There are no fake signup forms, fabricated testimonials, unsupported performance claims, or invented pricing plans.

## Before launching the actual product

Live integrations require server-side OAuth or approved API authentication, protected credentials, provider-specific permissions, durable workflow execution, retries and idempotency, access control, and operational monitoring. Confirm the supported connector list, product availability, pricing, and account policies before changing the preview language or enabling signups.

## Validation

Check JavaScript syntax with `node --check dist/app.js`. The delivered site was also checked for valid local asset references, unique section IDs, matching navigation targets, and accessible relationships for the business-case tabs. Browser visual testing has not been performed in this environment.

## Assets

The kitchen image was generated for this project. Tool tiles use original SVG logos from the official Supabase, Stripe, Slack, and Shopify brand assets. Sources are recorded in `dist/assets/SOURCES.md`. Third-party product names belong to their respective owners.

## Mobile and motion refinements

The mobile dashboard uses readable order cards, a two-column metric layout, and full-width demo controls. The hero introduces the needle before drawing the thread. Section reveals and slow ambient lime lighting reuse the existing theme. Reduced-motion preferences and the animation control disable decorative movement. All brand SVGs are self-hosted.
