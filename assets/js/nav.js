export function initNav() {
  const toggle = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".site-nav");
  const links = [...document.querySelectorAll(".site-nav [data-nav]")];
  const sections = links
    .map((link) => document.getElementById(link.dataset.nav))
    .filter(Boolean);

  const closeMenu = () => {
    if (!nav || !toggle) return;
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle?.addEventListener("click", () => {
    if (!nav) return;
    const open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", String(open));
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle(
            "active",
            link.dataset.nav === entry.target.id
          );
        });
      });
    }, { rootMargin: "-35% 0px -55% 0px", threshold: 0 });

    sections.forEach((section) => observer.observe(section));
  }

  window.addEventListener("resize", () => {
    if (window.innerWidth > 850) closeMenu();
  });
}
