<div align="center">

Valkarn — Immersive Saga Website Template

A hand-built, dependency-free website template for a story world: comic/graphic-novel
sagas, game universes, film franchises, book series, or any brand that wants an
immersive entrance instead of a hero banner.

The front page is a **five-gate scroll experience** — the camera pushes through one
carved archway into the next as you scroll — and every inner page follows the same
grammar: a cinematic dark hero, a painted brush-stroke transition into a light
editorial body, and a giant "next gate" link at the foot of the page instead of a
conventional footer.

</div>

---

## What's inside

| Page           | File              | What it does                                                                     |
| -------------- | ----------------- | -------------------------------------------------------------------------------- |
| Gates (home)   | `index.html`      | Five-scene scroll experience, dust particles, side gate-nav, ambient audio       |
| The World      | `universe.html`   | Editorial intro, volume carousel with filters, character carousel                |
| The Chronicles | `chronicles.html` | 74-volume grid, series tabs with counts, collection spotlight, series tabs panel |
| The Characters | `characters.html` | Card grids, family filters, slide-in character sheets                            |
| The Makers     | `makers.html`     | Creator cards, 48-year timeline, pull quote                                      |
| The Fellowship | `fellowship.html` | Join panel + form, news teasers, stat strip                                      |
| News           | `news.html`       | Article listing with category filters                                            |
| Article        | `article.html`    | Article detail (reads `?a=slug`)                                                 |
| Volume         | `volume.html`     | Volume detail (reads `?v=slug`), related carousel                                |
| 404            | `404.html`        | Styled not-found page                                                            |

```
valkarn/
├── index.html … 404.html        ← the ten pages
├── assets/
│   ├── css/main.css             ← the whole design system, commented by section
│   ├── js/app.js                ← loader, menu, reveals, tabs, carousels, sheets, audio, transitions
│   ├── js/gates.js              ← the home gate experience
│   ├── js/detail.js             ← fills volume/article pages from the query string
│   ├── fonts/*.woff2            ← Cinzel + Mulish, self-hosted (SIL Open Font License)
│   └── img/                     ← paintings, portraits, 74 generated covers, textures
├── robots.txt · sitemap.xml · site.webmanifest · .nojekyll
└── README.md · PUBLISHING-GUIDE.md · LICENSE
```

## Features

- **Gate experience** — wheel, touch, arrow keys, `Home`/`End` and the side nav all drive
  the same index; scenes scale, blur and cross-fade in Z, with a drifting dust canvas and
  a light pulse on each transition. Deep-linkable (`index.html#gate-3`).
- **Loading sequence** — twin progress rails, live counter, and an _Enter_ button that
  hands control to the visitor (also the gesture that unlocks audio).
- **Ambient sound** — synthesised with the Web Audio API (filtered noise wind + two
  detuned drones + a slow filter LFO). No audio file to ship; the choice is remembered
  in `localStorage`.
- **Page transitions** — a brush-stroke mask wipes over the screen before navigation and
  clears on arrival.
- **Reveal system** — per-character and per-line text reveals, clip-path badges, button
  label wipes, sword-divider draws. All driven by one small scanner in `app.js`.
- **Components** — tabs with counts, filterable grids, drag-scroll carousels, 3D card
  tilt, slide-in preview sheets, meta lists, forms.
- **Built to behave** — skip link, focus styles, `aria` states on menu/tabs/sheets,
  keyboard navigation, `prefers-reduced-motion` honoured throughout, no layout shift
  from lazy images.

## Quick start

1. Download or clone the folder.
2. Open `index.html` — that's it for a quick look.
   For the full experience (fonts, fetches, no `file://` quirks) serve it locally:

   ```bash
   python3 -m http.server 8080       # then visit http://localhost:8080
   # or
   npx serve .
   ```

3. Publish it: see **PUBLISHING-GUIDE.md** for the drag-and-drop GitHub Pages route.

## Making it yours

**Colours** — top of `assets/css/main.css`:

```css
--dark: #22201d; /* ink / hero background   */
--off-white: #efeeed; /* page background         */
--gold: #b8a88a; /* accent, progress, rules */
--dark-grey: #474747; /* body copy               */
```

**Type** — `--display` (Cinzel) for headings, `--body` (Mulish) for everything else.
Drop replacement `.woff2` files into `assets/fonts/` and edit the `@font-face` block.

**Layout** — everything sits on a 26-track grid (`--container`): a centred 1440px band of
24 columns plus two outer gutters. Helpers: `.c-main` (3→25), `.c-wide` (2→26),
`.c-full`, `.c-half-l`, `.c-half-r`.

**Copy and imagery** — the pages are plain HTML; edit them directly. Replace the images in
`assets/img/` keeping the same filenames and nothing else needs to change:

| File                 | Used for                             | Suggested size  |
| -------------------- | ------------------------------------ | --------------- |
| `gate-01…05.jpg`     | gate scenes + page heroes            | 1600×900        |
| `char-*.jpg`         | character portraits                  | 820×1250        |
| `author-*.jpg`       | creator portraits                    | 820×1250        |
| `covers/*.jpg`       | volume covers                        | 460×681         |
| `news-0*.jpg`        | article thumbnails                   | 960×600         |
| `loader-collage.jpg` | loading backdrop (keep it very pale) | 1400×800        |
| `brush-light.png`    | hero → body transition               | 2880×460, alpha |
| `og-image.jpg`       | social card                          | 1200×630        |

**Gates** — to add or remove one, copy an `<article class="gate">` block in `index.html`,
add a matching `<div class="stage__scene">` and a `<li>` in `.anchor-nav`. The script
counts them; nothing else to configure.

**Forms** — `<form data-demo-form>` is intercepted and faked. Remove the attribute and add
your own `action` (Formspree, Netlify Forms, your API) to make it real.

**Detail pages** — cards link to `volume.html?v=slug` and `article.html?a=slug`;
`assets/js/detail.js` holds the data map and swaps in the right title, cover and copy.
Replace it with real per-item pages whenever you outgrow it.

## Browser support

Current Chrome, Edge, Firefox and Safari (desktop + mobile). Uses `clip-path`, CSS masks,
`svh` units, `color-mix()` and the Web Audio API. Without JavaScript the pages still
render with all content visible — only the animations are lost.

## Performance notes

- Fonts are self-hosted and preloaded; only latin + latin-ext subsets are shipped.
- Every below-the-fold image is `loading="lazy"` with explicit dimensions.
- The gate experience runs one `requestAnimationFrame` loop and touches transforms only.
- Total weight of the full site is about 14 MB, almost all of it artwork (74 covers,
  23 paintings). Every JPEG is progressive, quality 78–80, and sized for its slot;
  re-export at your own target if you need it lighter.

## Credits and licence

Code: MIT (see `LICENSE`). Fonts: [Cinzel](https://fonts.google.com/specimen/Cinzel) and
[Mulish](https://fonts.google.com/specimen/Mulish), SIL Open Font License 1.1.
Artwork: generated for this template and free to use inside it.

Every name, title, quote and date in the copy is fictional. _Valkarn_, its characters,
its publisher "Northwind Editions" and the events described do not exist — replace them
with your own story before launch.

<div align="center">
If this template is useful, please leave a star ⭐ on GitHub to show your support!
</div>
