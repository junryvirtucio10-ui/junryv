# Grethiel — Portfolio

A static portfolio website using HTML, CSS, and browser JavaScript modules. No build step is required.

## Files

- `index.html` — page content, project links, and footer contact link.
- `assets/css/styles.css` — shared typography, variables, navigation, and layout utilities.
- `assets/css/sections.css` — work gallery and media interactions.
- `assets/css/services.css` — service cards and their animated compositions.
- `assets/css/hero.css`, `process.css`, `about.css` — section-specific styling.
- `assets/js/reels.js` — looping reel carousel with dragging, side-card selection, and keyboard controls.
- `assets/css/proof.css`, `assets/js/proof.js` — published-work proof section, layered carousel, keyboard/swipe controls, and counts from the work gallery.
- `assets/css/footer.css` — closing call to action with the original office photo, gold email button, and responsive layout. The `#contact` anchor leads to the footer; its button opens an email to `grethieljoyc@gmail.com`.
- `assets/css/audio.css` — soundtrack controls and entry dialog.
- `assets/css/motion.css` — scroll reveals and motion preferences.
- `assets/js/main.js` — initializes the feature modules beside it.
- `assets/images/`, `assets/audio/` — files used by the website.
- `archive/original-assets/` — unused originals and earlier exports retained for future editing.
- `scripts/check.mjs` — checks local references, HTML anchors, and JavaScript syntax.

## Preview

Run this from the project folder:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open `http://127.0.0.1:8765` in a browser. Use a local server so the JavaScript modules load correctly.

## Check and format

```sh
node scripts/check.mjs
npx prettier --write index.html 'assets/css/*.css' 'assets/js/*.js' 'scripts/*.mjs'
```

Formatting settings are stored in `.prettierrc.json`.

## Editing and deployment

Edit page text and project links in `index.html`. Adjust a section's appearance in its stylesheet and its interactions in the corresponding JavaScript module.

To add a reel, duplicate one `.reel-card` inside `.reels-carousel .reels-grid` in `index.html`. Update its Facebook URL, thumbnail path, image alt text, accessible label, and reel number. The carousel automatically includes all these cards and builds its count and navigation dots when the page loads. Its center card opens Facebook; side cards move into focus. Keep at least three cards for the looping layout.

Section 05 (`#proof`) highlights published edits. Its counts describe the unique projects in the work gallery, rather than client results or lifetime totals. Add or edit `.proof-card` links in `index.html` to change its carousel. Controls and the carousel count update automatically. Client feedback can replace or supplement these cards once real feedback is available. The closing footer follows Proof.

Deploy `index.html` and the entire `assets/` folder together. The archive and development files are not needed for hosting. Google Fonts and two YouTube thumbnails load from external services. Footer inquiries use the visitor’s email application; soundtrack playback begins after a visitor chooses to play it.
