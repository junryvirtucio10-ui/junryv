# Junry Virtucio — Portfolio

A static portfolio website using HTML, CSS, and browser JavaScript modules. No build step is required.

## Files

- `index.html` — page content, project links, and contact form.
- `assets/css/styles.css` — shared typography, variables, navigation, and layout utilities.
- `assets/css/sections.css` — work, contact, and footer styling.
- `assets/css/services.css` — service cards and their animated compositions.
- `assets/css/hero.css`, `process.css`, `about.css` — section-specific styling.
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

Deploy `index.html` and the entire `assets/` folder together. The archive and development files are not needed for hosting. Google Fonts and two YouTube thumbnails load from external services. The contact form uses the existing FormSubmit endpoint; soundtrack playback begins after a visitor chooses to play it.
