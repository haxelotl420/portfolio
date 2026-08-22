export function initTicker() {
  const track = document.querySelector(".hero-ticker .ticker-track");
  const sets = [...(track?.querySelectorAll(".ticker-set") || [])];
  if (!track || sets.length !== 3) return;

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let positions = [];
  let setWidth = 0;
  let speed = 0;
  let raf = 0;
  let last = performance.now();
  const GAP = 26;

  const measure = () => {
    setWidth = sets[0].getBoundingClientRect().width;
    speed = setWidth / 24;
  };

  const render = () => {
    sets.forEach((set, i) => {
      set.style.transform = `translate3d(${positions[i]}px, 0, 0)`;
    });
  };

  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    positions = positions.map(x => x - speed * dt);

    // Keep three copies cycling from right to left. Whenever one fully
    // exits the left edge, place it immediately after the rightmost copy.
    for (let i = 0; i < positions.length; i++) {
      if (positions[i] <= -setWidth) {
        const rightmost = Math.max(...positions);
        positions[i] = rightmost + setWidth + GAP;
      }
    }

    render();
    raf = requestAnimationFrame(frame);
  };

  const start = () => {
    cancelAnimationFrame(raf);
    measure();

    // One group centered, one immediately to its left, one immediately to
    // its right: the ticker is populated across the whole box from frame 1.
    const center = (window.innerWidth - setWidth) / 2;
    positions = [center - setWidth - GAP, center, center + setWidth + GAP];
    render();

    last = performance.now();
    if (!reduceMotion.matches) raf = requestAnimationFrame(frame);
  };

  start();
  window.addEventListener("resize", start, { passive: true });
  reduceMotion.addEventListener?.("change", start);
}
