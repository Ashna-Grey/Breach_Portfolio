<div align="center">

# BREACH.exe

### An interactive cybersecurity portfolio by **Ashna Islam**

*You can beat my firewall. But can you make the hardest decision and hire me?*

**[▶ Play it live](https://ashna-grey.github.io/breach_portfolio/)**  ·  [Resume (PDF)](assets/Ashna_Islam_Resume.pdf)  ·  [LinkedIn](https://www.linkedin.com/in/ashna-islam/)  ·  [Email](mailto:ashnaislam03@gmail.com)

![Landing screen](docs/landing.jpg)

</div>

---

## 30-second summary

I'm a **third-year B.Tech CSE (Cybersecurity)** student at IEM Kolkata, looking for a **software, cybersecurity or ML internship**.

- **Published research:** context-aware Zero Trust access control using Mamdani fuzzy inference, IEEE CIACON 2026, DOI [10.1109/CIACON70148.2026.11688234](https://doi.org/10.1109/CIACON70148.2026.11688234)
- **Projects:** [MiniPay](https://mini-qcsehzbo1-ashna13.vercel.app/login) (full-stack digital wallet) · [Ethereum wallet fraud detection](https://blockchain-lime-one.vercel.app) (hybrid ML pipeline)
- **Academics:** CGPA 9.10 (up to 4th semester), **2nd rank in department** (2025–2026)
- **Experience:** Cybersecurity Intern at WEBEL · Summer Research Intern at IDC Lab (Zero Trust) · Research Project Intern at IEDC Lab (AI & IoT)
- **Leadership:** Chair, IEEE Computer Society Student Branch Chapter (15 technical events, 100+ members)

This repository is the site you see when you open my portfolio: the portfolio itself, plus a small game around the front door, because I like building things.

---

## Three ways in

The site opens as a locked system, **ASHNA.OS**. Pick a difficulty. Every path leads to the same portfolio, and nothing is ever blocked.

| Level | What it is | Look | Time |
|---|---|---|---|
| **01: BREACH.exe** | A 2D pixel-art fighting game built with **Phaser 3**. Land 35 attacks in 10 seconds while ASHNA.OS hits back. Lose, and you can still enter. | Black and green, red damage | ~15 s |
| **02: Hack My Website** | Three beginner security puzzles in a restricted-zone terminal: a Caesar cipher, spotting a brute-force login, finding an authentication flaw. Hints and explanations included. | Red and black | ~2 min |
| **03: The Final Decision** | Skip everything and go straight to the portfolio. | Clean green | 2 s |

*Short on time? Choose Level 03, or click "Just take me to the portfolio."*

![BREACH.exe game](docs/game.jpg)

---

## Inside the portfolio

- **Project showcases:** every featured project opens into a full-screen technical showcase with a hero illustration, problem and solution, an interactive architecture diagram, and technical highlights
  - **MiniPay:** double-entry ledger, atomic transactions, idempotency controls
  - **Ethereum Fraud Detection:** Random Forest, Isolation Forest and rule-based scoring, fused by conflict-aware discounted belief fusion
  - **Zero Trust Access Control:** Mamdani fuzzy inference, sigmoid normalization, exponential time decay, adaptive MFA
  - **Quantum Teleportation (ongoing research):** reinforcement learning over noisy quantum channels
- **Research files:** the published paper and the ongoing research, as classified dossiers
- **Experience & leadership timeline:** internships, study abroad in Thailand, IEEE, Google Gemini community, Toastmasters
- **Skills dashboard:** filter by category, then hover or tap a skill to see where I actually used it (no made-up percentage bars)
- **Hidden terminal:** click the `>_` button and type `help`. Try `sudo hire ashna`.

![Project showcase](docs/project.jpg)

---

## Engineering notes

This is also a sample of how I build.

| Decision | Why |
|---|---|
| **No backend, no build step** | Plain HTML, CSS and JavaScript on GitHub Pages. Nothing to break, nothing to patch. |
| **Phaser loads only for Level 01** | The 1.2 MB game engine is never downloaded by recruiters who choose Level 03. |
| **Project showcases are an accessible dialog** | Focus is trapped and restored, Escape closes, the browser Back button works, and every project has a shareable link (`#project-minipay`). |
| **Honest project pages** | Architecture diagrams are labelled conceptual, proposed work is dashed and marked as not implemented, and reported metrics are labelled as self-reported. |
| **Real-time game clock** | The 10-second round uses real elapsed time, not frame counts, so slow devices play fair. |
| **Input guards** | Held keys are ignored and inputs closer than 45 ms apart are dropped, so macros can't win. |
| **Safe terminal** | The terminal matches input against a fixed command list. It never evaluates user input, and output is written as text, never HTML. |
| **Fictional challenges** | The "hacking" puzzles are client-side and self-contained. Nothing scans, attacks or contacts any real system. |
| **Accessible by default** | Keyboard navigation, focus states, `prefers-reduced-motion` support (rain and animations switch off), skip buttons everywhere, and a crawlable portfolio for people without JavaScript. |
| **Original assets** | Sprites are generated from pixel grids in code, illustrations are inline SVG, and sound is synthesized with the Web Audio API. No copyrighted characters. |

**Stack:** HTML5 · CSS3 · JavaScript · Phaser 3 · SVG · Web Audio API · sessionStorage

---

## Run it locally

```bash
git clone https://github.com/Ashna-Grey/breach_portfolio.git
cd breach_portfolio
python3 -m http.server 8000
```

Then open <http://localhost:8000>. Serve the folder instead of double-clicking `index.html`, so it behaves like GitHub Pages. To replay the intro, use **Replay experience** in the nav bar.

<details>
<summary>Project structure</summary>

```
index.html              landing gate + the whole portfolio (real, crawlable HTML)
css/base.css            design tokens, grid, scanlines, digital rain
css/gate.css            landing, game screen, terminal widget
css/medium.css          Level 02 red-and-black security terminal
css/project.css         immersive project showcase
css/portfolio.css       portfolio sections
js/main.js              gate logic, session state, background effects, interactions
js/game.js              Phaser fighting game (lazy-loaded)
js/puzzles.js           Level 02 challenges (lazy-loaded)
js/projects.js          project showcase data and dialog (lazy-loaded)
js/terminal.js          fixed-command terminal (lazy-loaded)
js/sprites.js           generated pixel-art fighters
js/audio.js             Web Audio sound effects (muted by default)
js/vendor/              Phaser 3.90.0
assets/                 resume PDF, favicon
docs/                   screenshots
```
</details>

---

## Credits & licenses

- [Phaser 3](https://phaser.io), MIT license
- Fonts: Chakra Petch, DM Sans, Share Tech Mono (SIL Open Font License, via Google Fonts)
- All sprites, illustrations, sounds and visuals are original

---

<div align="center">

**Let's talk.**  [ashnaislam03@gmail.com](mailto:ashnaislam03@gmail.com)  ·  [LinkedIn](https://www.linkedin.com/in/ashna-islam/)  ·  [GitHub](https://github.com/Ashna-Grey)

*Kolkata, India*

</div>
