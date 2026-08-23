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
  let resizeObserver = null;
  const GAP = 26;

  const measure = () => {
    // Measure after fonts/layout are settled. A stale width here can make
    // two copies drift into each other after a font load or viewport change.
    setWidth = sets[0].getBoundingClientRect().width;
    speed = setWidth / 24;
    return setWidth > 0;
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

    // Keep the copies strictly one full set + GAP apart. Using the current
    // rightmost position prevents duplicate copies from ever stacking.
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
    if (!measure()) {
      requestAnimationFrame(start);
      return;
    }

    // Three complete copies are laid out from a single measured width.
    // This avoids the rare overlap caused by starting before web fonts finish.
    const center = (window.innerWidth - setWidth) / 2;
    positions = [
      center - setWidth - GAP,
      center,
      center + setWidth + GAP
    ];
    render();

    last = performance.now();
    if (!reduceMotion.matches) raf = requestAnimationFrame(frame);
  };

  start();

  // Web fonts can change the measured width after the first paint.
  document.fonts?.ready.then(start).catch(() => {});

  // Re-measure if the ticker's actual layout width changes (including
  // mobile browser viewport changes), rather than relying only on resize.
  if ("ResizeObserver" in window) {
    resizeObserver = new ResizeObserver(() => start());
    resizeObserver.observe(sets[0]);
  }

  window.addEventListener("resize", start, { passive: true });
  reduceMotion.addEventListener?.("change", start);
}
