import "./theme.js";
import { initTicker } from "./ticker.js";
import { initReveal } from "./reveal.js";
import { initProgressBar } from "./progress-bar.js";
import { initNav } from "./nav.js";
import { initContactForm } from "./contact-form.js";
import { initPricing } from "./pricing.js";

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

  try { initContactForm(); } catch (error) {
    console.error("Contact form init failed:", error);
  }

  try { initPricing(); } catch (error) {
    console.error("Pricing init failed:", error);
  }
});
