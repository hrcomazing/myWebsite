# Portfolio Console Redesign Plan

This repository is currently a static portfolio site. The next design direction is to turn it into an "active aircraft debugging console" experience while preserving the existing portfolio content and credibility sections.

## Repository Snapshot

1. **Framework/build system:** Static site. There is no `package.json`, bundler, framework, or build config. The main entry point is `index.html`.
2. **Main files:** `index.html`, `style.css`, and `script.js`.
3. **Styling architecture:** Single global stylesheet with CSS custom properties, responsive media queries, card/panel classes, fixed background layers, scroll-driven aircraft CSS variables, and `prefers-reduced-motion` support.
4. **Aircraft/image assets:** `assets/publicdomainq-airplane2.png` is used for the plane. Three 1254x1254 PNGs exist but are currently untracked and unused: `88ACEB7B-9A4F-4660-BC16-077C96F825C4.PNG`, `BEE01861-2A62-4CA9-815A-CD593ECD43BC.PNG`, and `D377B3B1-C2FA-43EC-AC6C-66CF4CF1AB20.PNG`.
5. **Existing sections to preserve:** Header/nav, hero positioning copy, trust band, capabilities tabs, selected work, technical depth tabs, approach, evidence, contact, and footer.
6. **Accessibility, performance, and SEO risks:** Large unused PNGs may hurt deploy size if added. External Google Fonts add render/network dependency. Tab controls lack full arrow-key tablist behavior. Focus states are mostly hover-oriented. There is no Open Graph or canonical metadata. Heavy `backdrop-filter` and fixed animated layers may cost performance on mobile.

## Phased Implementation Plan

### Phase 1: Console Shell

- `index.html`: Reframe the hero as an active aircraft debugging console while preserving the current credibility copy.
- Replace the current hero side cards with three functional console modules: terminal, radar/signal panel, and AI diagnostics.
- Keep existing section IDs and nav anchors unchanged.

### Phase 2: Animated Aircraft Background

- `style.css`: Evolve `.flight-layer`, `.scroll-plane`, and `.plane-trail` into a full avionics HUD background with scanlines, route traces, altitude ticks, and restrained radar arcs.
- `script.js`: Extend the existing scroll-based aircraft positioning into stateful telemetry variables such as heading, altitude, signal lock, and fault count.

### Phase 3: Fake Bash Terminal

- `index.html`: Add semantic terminal markup in the hero or immediately below it.
- `script.js`: Add a lightweight typewriter/log-append loop with deterministic fake commands such as `tail -f flightbus.log`, `grep WARN avionics`, and `run_diag --subsystem fms`.
- `style.css`: Style the terminal as compact bash output, not a decorative code block.

### Phase 4: Signal/Radar Tracking Panel

- `index.html`: Add radar panel markup with aircraft callsign, heading, altitude, bus status, packet loss, and lock confidence.
- `script.js`: Animate numeric telemetry with `requestAnimationFrame` or timed updates, gated by reduced-motion settings.
- `style.css`: Use CSS grid, conic/radial radar visuals, and monospace readouts.

### Phase 5: AI Diagnostics Panel

- `index.html`: Add a diagnostics panel showing active hypothesis, likely subsystem, evidence, recommendation, and confidence.
- `script.js`: Rotate through a small fixed set of diagnostic states.
- Keep the copy aligned with the existing practical AI tooling message.

### Phase 6: Avionics Theme and Responsive Layout

- `style.css`: Tighten the palette toward cockpit display colors: deep black, cyan, amber, green, and warning red accents.
- Add visible `:focus-visible` styles.
- Ensure the console becomes stacked, readable panels on mobile.
- Keep `@media (prefers-reduced-motion: reduce)` and expand it to freeze terminal/radar updates.

### Phase 7: SEO and Performance Polish

- `index.html`: Add canonical URL placeholder, Open Graph/Twitter metadata, and improve image dimensions/loading where needed.
- Optimize or remove unused large PNGs before committing.
- Consider self-hosting fonts or adding a system-font fallback mode.

## Current Validation Commands

The repo does not currently define lint, test, or build scripts. For the current static setup, use:

```bash
node --check script.js
python3 -m http.server 8000
```

There is no build step right now. The site ships directly from `index.html`, `style.css`, `script.js`, and `assets/`.
