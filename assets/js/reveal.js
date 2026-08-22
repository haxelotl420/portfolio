export function initReveal() {
  const items = [...document.querySelectorAll(".reveal")];
  if (!items.length) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  items.forEach((item, index) => {
    if (item.classList.contains("hero-copy") ||
        item.classList.contains("services-title")) {
      item.dataset.revealDirection = "left";
    } else if (item.classList.contains("hero-frame")) {
      item.dataset.revealDirection = "right";
    } else {
      item.dataset.revealDirection = index % 2 ? "right" : "left";
    }
    item.style.setProperty("--reveal-delay", `${(index % 3) * 90}ms`);
  });

  if (reduce) {
    items.forEach((item) => item.classList.add("visible"));
    return;
  }

  document.documentElement.classList.add("reveal-enabled");

  if (!("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const item = entry.target;

      if (entry.isIntersecting) {
        // Remove first, then add on the next frame so every re-entry
        // reliably starts the side-spawn animation from its initial pose.
        item.classList.remove("visible");
        requestAnimationFrame(() => {
          requestAnimationFrame(() => item.classList.add("visible"));
        });
      } else {
        item.classList.remove("visible");
      }
    });
  }, {
    threshold: 0.08,
    rootMargin: "0px 0px -10% 0px"
  });

  items.forEach((item) => observer.observe(item));
}
