(() => {
  const KEY = "haxed-theme";
  const DURATION = 850;

  const getSavedTheme = () => {
    try {
      return localStorage.getItem(KEY);
    } catch (_) {
      return null;
    }
  };

  const saveTheme = (theme) => {
    try {
      localStorage.setItem(KEY, theme);
    } catch (_) {}
  };

  const updateToggle = (theme) => {
    const dark = theme === "dark";
    const toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;

    toggle.setAttribute("aria-pressed", String(dark));
    toggle.setAttribute(
      "aria-label",
      dark ? "Passa alla white mode" : "Passa alla dark mode"
    );
    toggle.setAttribute(
      "title",
      dark ? "Passa alla white mode" : "Passa alla dark mode"
    );
  };

  const applyTheme = (theme) => {
    document.body.classList.toggle("dark-mode", theme === "dark");
    updateToggle(theme);
  };

  const getOrigin = () => {
    const toggle = document.querySelector(".theme-toggle");
    if (!toggle) {
      return {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2
      };
    }

    const rect = toggle.getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2
    };
  };

  const getRadius = (x, y) => Math.max(
    Math.hypot(x, y),
    Math.hypot(window.innerWidth - x, y),
    Math.hypot(x, window.innerHeight - y),
    Math.hypot(window.innerWidth - x, window.innerHeight - y)
  ) + 40;

  const setTransitionOrigin = () => {
    const { x, y } = getOrigin();
    const radius = getRadius(x, y);

    document.documentElement.style.setProperty("--theme-x", `${x}px`);
    document.documentElement.style.setProperty("--theme-y", `${y}px`);
    document.documentElement.style.setProperty("--theme-radius", `${radius}px`);
  };

  const switchTheme = (next) => {
    setTransitionOrigin();

    // Modern browsers: View Transitions keep the complete old page visible
    // while the new page is revealed over it. No blank/hidden content.
    if (typeof document.startViewTransition === "function") {
      const transition = document.startViewTransition(() => {
        applyTheme(next);
      });

      transition.finished.catch(() => {});
      return;
    }

    // Fallback for browsers without View Transitions: use the same theme
    // immediately rather than hiding the page.
    applyTheme(next);
  };

  const init = () => {
    const toggle = document.querySelector(".theme-toggle");
    if (!toggle) return;

    const saved = getSavedTheme();
    applyTheme(saved === "light" ? "light" : "dark");

    let locked = false;

    toggle.addEventListener("click", (event) => {
      event.preventDefault();

      if (locked) return;
      locked = true;

      const next = document.body.classList.contains("dark-mode")
        ? "light"
        : "dark";

      saveTheme(next);
      switchTheme(next);

      window.setTimeout(() => {
        locked = false;
      }, DURATION);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
