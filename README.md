# BREACH.exe — Ashna Islam's interactive portfolio

Static site (HTML/CSS/JS + Phaser 3). No backend, no build step, no API keys.

## Preview on your laptop
Open a terminal in this folder and run ONE of:

    python3 -m http.server 8000      # then open http://localhost:8000
    npx serve .                      # alternative, if you have Node

Use a server rather than double-clicking `index.html`, so it behaves like GitHub Pages.
To replay the intro: use "Replay experience" in the nav, or open the page in a new private window.

## Structure
    index.html            landing gate + the whole portfolio (content is real HTML, crawlable)
    css/base.css          tokens, buttons, reduced-motion rules
    css/gate.css          landing, game, puzzles, terminal styles
    css/portfolio.css     portfolio sections
    js/main.js            gate state machine, sessionStorage, portfolio interactions
    js/audio.js           Web Audio synth (muted by default)
    js/sprites.js         original pixel-art fighters (generated, no image files)
    js/game.js            Phaser game, loaded ONLY in Easy Mode
    js/vendor/phaser.min.js   Phaser 3.90.0 (MIT), loaded ONLY in Easy Mode
    js/puzzles.js         Medium Mode, loaded on demand
    js/terminal.js        fixed-command terminal, loaded on first open
    assets/Ashna_Islam_Resume.pdf   resume download

## Deploy (when you approve)
Copy these files over the repo root (replacing the old index.html), commit, push. All paths are relative, so `/Portfilio_New/` works.

## Editing content
Everything is in `index.html`. Skill hover text = `data-tip` on each `.chip`. Publication dossiers = `.dossier` blocks.

## Known limitations
- Fonts load from Google Fonts; offline they fall back to system fonts.
- Sound is off by default (browsers block autoplay anyway); toggle in any bar.
- Easy Mode needs WebGL or Canvas (any modern browser).
