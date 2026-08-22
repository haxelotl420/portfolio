import { initTicker } from "./ticker.js";
import { initReveal } from "./reveal.js";
import { initProgressBar } from "./progress-bar.js";
import { initNav } from "./nav.js";

document.addEventListener("DOMContentLoaded", () => {
  try { initReveal(); } catch (error) {
    console.error("Reveal init failed:", error);
  }

  try { initProgressBar(); } catch (error) {
    console.error("Progress init failed:", error);
  }

  try { initTicker(); } catch (error) {
    console.error("Ticker init failed:", error);
  }

  try { initNav(); } catch (error) {
    console.error("Nav init failed:", error);
  }
});
