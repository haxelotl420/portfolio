export function initPricing() {
  const trigger = document.querySelector("[data-pricing-trigger]");
  const panel = document.querySelector("[data-pricing-panel]");
  const close = document.querySelector("[data-pricing-close]");
  if (!trigger || !panel) return;

  // The pricing UI must sit above every other fixed/sticky element on the page.
  // Injecting these overrides here keeps them last in the cascade without
  // disturbing the existing responsive layout files.
  const style = document.createElement("style");
  style.id = "pricing-layer-fix";
  style.textContent = `
    .pricing-trigger {
      position: fixed !important;
      z-index: 2147483646 !important;
      top: 50% !important;
      right: 18px !important;
      left: auto !important;
      bottom: auto !important;
      transform: translateY(-50%) !important;
      writing-mode: horizontal-tb !important;
      text-orientation: initial !important;
      display: inline-flex !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 10px !important;
      min-height: 44px !important;
      box-sizing: border-box !important;
      padding: 12px 16px 12px 14px !important;
      border: 1px solid var(--ink) !important;
      border-radius: 999px !important;
      background: var(--orange) !important;
      color: var(--ink) !important;
      box-shadow: 0 10px 30px rgba(0,0,0,.16) !important;
      backdrop-filter: none !important;
      -webkit-backdrop-filter: none !important;
      font: 600 10px/1 var(--mono) !important;
      letter-spacing: .08em !important;
      text-transform: uppercase !important;
      cursor: pointer !important;
      transition: transform .25s var(--ease), box-shadow .25s ease, background .25s ease !important;
    }

    .pricing-trigger::before {
      content: "€";
      display: inline-grid;
      place-items: center;
      width: 19px;
      height: 19px;
      border: 1px solid rgba(16,17,19,.55);
      border-radius: 50%;
      font: 500 10px/1 var(--mono);
    }

    .pricing-trigger::after {
      content: "↗";
      font-size: 12px;
      line-height: 1;
      transition: transform .25s ease;
    }

    .pricing-trigger:hover,
    .pricing-trigger[aria-expanded="true"] {
      background: var(--paper) !important;
      color: var(--ink) !important;
      padding-right: 16px !important;
      transform: translateY(calc(-50% - 2px)) !important;
      box-shadow: 0 14px 34px rgba(0,0,0,.2) !important;
    }

    .pricing-trigger:hover::after { transform: translate(2px,-2px); }

    .pricing-panel {
      position: fixed !important;
      z-index: 2147483647 !important;
      inset: 0 !important;
      width: 100% !important;
      height: 100% !important;
      isolation: isolate !important;
      transform: translateZ(0) !important;
    }

    .pricing-panel.is-open {
      z-index: 2147483647 !important;
    }

    .pricing-card {
      position: relative !important;
      z-index: 2147483647 !important;
    }

    body.pricing-open,
    html:has(body.pricing-open) {
      overflow: hidden !important;
    }

    @media (max-width: 850px) {
      .pricing-trigger {
        right: 12px !important;
        min-height: 40px !important;
        padding: 11px 13px 11px 12px !important;
        gap: 8px !important;
        font-size: 9px !important;
      }

      .pricing-trigger::before { width: 17px; height: 17px; font-size: 9px; }
      .pricing-trigger::after { font-size: 11px; }

      .pricing-trigger:hover,
      .pricing-trigger[aria-expanded="true"] {
        padding-right: 13px !important;
      }
    }

    @media (max-width: 520px) {
      .pricing-trigger {
        right: 10px !important;
        min-height: 38px !important;
        padding: 10px 12px 10px 11px !important;
        font-size: 8px !important;
      }

      .pricing-trigger::before { width: 16px; height: 16px; font-size: 8px; }
    }

    @media (hover: none) {
      .pricing-trigger:hover {
        background: var(--orange) !important;
        color: var(--ink) !important;
        transform: translateY(-50%) !important;
        box-shadow: 0 10px 30px rgba(0,0,0,.16) !important;
      }

      .pricing-trigger:hover::after { transform: none; }
    }
  `;
  document.head.appendChild(style);

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
