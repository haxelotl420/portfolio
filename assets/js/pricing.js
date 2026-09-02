export function initPricing() {
  const trigger = document.querySelector("[data-pricing-trigger]");
  const panel = document.querySelector("[data-pricing-panel]");
  const close = document.querySelector("[data-pricing-close]");
  if (!trigger || !panel) return;

  const setOpen = (open) => {
    panel.classList.toggle("is-open", open);
    trigger.setAttribute("aria-expanded", String(open));
    panel.setAttribute("aria-hidden", String(!open));
    document.body.classList.toggle("pricing-open", open);
  };

  trigger.addEventListener("click", () => setOpen(!panel.classList.contains("is-open")));
  close?.addEventListener("click", () => setOpen(false));

  panel.addEventListener("click", (event) => {
    if (event.target === panel) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && panel.classList.contains("is-open")) setOpen(false);
  });
}
