# HAXED — Video Editor Portfolio

Portfolio statico vanilla, costruito senza bundler o dipendenze npm.

## Struttura

```text
portfolio-video-editor/
├── index.html
├── favicon.ico
├── robots.txt
├── sitemap.xml
├── README.md
└── assets/
    ├── css/
    │   ├── reset.css
    │   ├── variables.css
    │   └── main.css
    ├── js/
    │   ├── reveal.js
    │   ├── progress-bar.js
    │   ├── nav.js
    │   └── main.js
    ├── fonts/
    └── img/
        ├── portfolio/
        ├── about/
        └── og-image.jpg
```

## Avvio locale

I moduli JavaScript ES devono essere serviti tramite HTTP.

Con Python:

```bash
python3 -m http.server 8000
```

Poi apri:

```text
http://localhost:8000/
```

Non è consigliato aprire `index.html` con `file://`.

## Dove modificare il sito

- **Contenuti e testi:** `index.html`
- **Palette, dimensioni globali, font stack:** `assets/css/variables.css`
- **Layout e componenti:** `assets/css/main.css`
- **Reveal on scroll:** `assets/js/reveal.js`
- **Barra di avanzamento:** `assets/js/progress-bar.js`
- **Menu mobile e navigazione attiva:** `assets/js/nav.js`
- **Inizializzazione JS:** `assets/js/main.js`
- **Immagine social:** `assets/img/og-image.jpg`
- **Immagini dei progetti/profilo:** `assets/img/portfolio/` e `assets/img/about/`

## Font

Il progetto usa Manrope e DM Mono da Google Fonts come riferimento tipografico. Il collegamento è mantenuto in `main.css` per rendere il progetto immediatamente eseguibile.

Per una versione completamente self-hosted, scarica i relativi `.woff2`, mettili in `assets/fonts/` e sostituisci l'import Google Fonts con `@font-face`.

## Nota

Le quattro immagini dei case study sono volutamente trattate come visual editoriali generati in CSS: non rappresentano lavori reali. Sostituisci questi blocchi con immagini/video reali quando inserisci il portfolio definitivo.


## White mode / Dark mode

Il pulsante in alto a sinistra alterna tra white mode e dark mode con una piccola animazione.
La scelta viene salvata nel `localStorage`, quindi viene mantenuta anche al refresh.

La texture di fondo è generata in CSS: una griglia molto leggera + una micro-grana, senza immagini aggiuntive.

## Come inserire i tuoi lavori

Vai nella sezione `#work` di `index.html`.

Ogni progetto è un blocco:

```html
<article class="project project-half reveal">
  <div class="project-visual media-visual">
    <img
      src="assets/img/portfolio/mio-progetto.jpg"
      alt="Frame del progetto Mio Progetto"
    >
  </div>

  <div class="project-info">
    <div>
      <span class="project-type">COMMERCIAL / 2026</span>
      <h3>Mio Progetto</h3>
    </div>
    <span class="project-arrow">↗</span>
  </div>
</article>
```

Metti quindi le immagini in:

```text
assets/img/portfolio/
```

### Se vuoi usare un video

Puoi sostituire l'immagine con:

```html
<video
  src="assets/img/portfolio/mio-progetto.mp4"
  poster="assets/img/portfolio/mio-progetto.jpg"
  muted
  loop
  playsinline
  controls
></video>
```

Per un portfolio pubblico è generalmente meglio usare un'immagine di copertina leggera e aprire poi il progetto completo, invece di caricare quattro video pesanti direttamente nella griglia.

### Struttura consigliata

```text
assets/img/portfolio/
├── northbound.jpg
├── second-nature.jpg
├── night-shift.jpg
└── low-frequency.jpg
```

Puoi sostituire direttamente i quattro visual CSS attuali con questi file senza cambiare la griglia.

### Tema

La **white mode originale è il tema CSS di base** del progetto: i suoi colori e le sue superfici restano definiti normalmente in `variables.css` e `main.css`.

La **dark mode** viene attivata aggiungendo `.dark-mode` al `<body>`. Il sito parte in dark mode e il pulsante in alto a sinistra alterna realmente tra `dark` e `light`. La scelta viene salvata in `localStorage` con la chiave `haxed-theme`.

Il menu superiore non usa `mix-blend-mode`: i suoi colori sono espliciti per ciascun tema, così non diventa nero/trasparente quando cambia lo sfondo.

### Cambio tema

`assets/js/theme.js` gestisce esclusivamente il cambio dark/light come script vanilla indipendente dai moduli ES. Questo rende il pulsante funzionante anche quando `main.js` o il server dei moduli non sono disponibili.

- tema standard: **dark**
- scelta alternativa: **light**
- preferenza salvata in `localStorage`
- `main.js` resta l'entry point per reveal, progress bar e navigazione

### Transizione tema

Il cambio tema usa la **View Transition API** quando disponibile: il browser mantiene in scena la pagina precedente e rivela la nuova modalità con una maschera circolare che parte dal pulsante del tema. In questo modo testi, immagini e layout non spariscono durante il cambio.

Su browser senza View Transition API il tema cambia normalmente, senza sovrapporre un pannello che nasconda il contenuto.

### Animazioni allo scroll

Gli elementi con classe `.reveal` ora entrano lateralmente quando arrivano nel viewport: alcuni da sinistra, altri da destra, con una lieve rotazione/scala che si assesta nella posizione definitiva. L'animazione non modifica il layout e rispetta `prefers-reduced-motion`.

### Texture e atmosfera

La griglia è ora più leggibile anche nella white mode. Entrambi i temi hanno inoltre un bagliore arancione ambientale molto morbido, realizzato esclusivamente sul livello di sfondo (`body::after`), con movimento lentissimo. Il contenuto resta sopra il bagliore e non viene alterato.

### Glow interattivo del cursore

Su dispositivi con mouse/puntatore viene mostrata una grande luce arancione morbida che segue il cursore con inerzia. È composta da due livelli radiali per creare un effetto più sferico/profondo. Il layer è `pointer-events: none` e sta dietro al contenuto, quindi non altera testi, immagini o pulsanti.
