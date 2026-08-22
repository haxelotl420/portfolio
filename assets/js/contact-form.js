export function initContactForm() {
  const form = document.querySelector("#contact-form");
  const status = document.querySelector("#contact-form-status");
  const submit = form?.querySelector("button[type=submit]");

  if (!form || !status || !submit) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    status.textContent = "Invio in corso…";
    status.className = "contact-form-status is-loading";
    submit.disabled = true;

    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.ok) {
        throw new Error(data.message || "Non è stato possibile inviare la richiesta.");
      }

      status.textContent = data.message || "Richiesta inviata.";
      status.className = "contact-form-status is-success";
      form.reset();
    } catch (error) {
      status.textContent = error.message || "Errore di invio. Riprova tra poco.";
      status.className = "contact-form-status is-error";
    } finally {
      submit.disabled = false;
    }
  });
}
