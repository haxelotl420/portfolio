const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_REQUEST = 5000;

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  },
});

const clean = (value, max) => String(value || "").trim().slice(0, max);

const escapeHtml = (value) => String(value)
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&#039;");

async function handleContact(request, env) {
  const origin = request.headers.get("Origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== new URL(request.url).origin) {
        return json({ ok: false, message: "Richiesta non autorizzata." }, 403);
      }
    } catch {
      return json({ ok: false, message: "Richiesta non autorizzata." }, 403);
    }
  }

  if (request.method === "GET") return json({ ok: false, message: "Metodo non consentito." }, 405);
  if (request.method !== "POST") return json({ ok: false, message: "Metodo non consentito." }, 405);

  let form;
  try {
    form = await request.formData();
  } catch {
    return json({ ok: false, message: "Dati del modulo non validi." }, 400);
  }

  if (clean(form.get("website"), 200)) return json({ ok: true, message: "Richiesta inviata." });

  const name = clean(form.get("name"), MAX_NAME);
  const email = clean(form.get("email"), MAX_EMAIL).toLowerCase();
  const message = clean(form.get("message"), MAX_REQUEST);

  if (!name || !email || !message) return json({ ok: false, message: "Compila tutti i campi richiesti." }, 400);

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  if (!emailPattern.test(email)) return json({ ok: false, message: "Inserisci un indirizzo email valido." }, 400);

  const apiKey = env.BREVO_API_KEY;
  const from = env.BREVO_FROM_EMAIL || "dennisbertozzi@haxed.art";
  const to = env.BREVO_TO_EMAIL || "dennisbertozzi@haxed.art";

  if (!apiKey) {
    console.error("Contact form: BREVO_API_KEY is not configured.");
    return json({ ok: false, message: "Il modulo non è ancora configurato. Riprova più tardi." }, 503);
  }

  const safeName = escapeHtml(name);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message).replaceAll("\n", "<br>");
  const payload = {
    sender: { email: from, name: "HAXED — Dennis Bertozzi" },
    to: [{ email: to, name: "Dennis Bertozzi" }],
    replyTo: { email },
    subject: `Nuova richiesta dal portfolio — ${name}`,
    textContent: [`Nome / Azienda: ${name}`, `Email: ${email}`, "", "Richiesta:", message].join("\n"),
    htmlContent: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#161719"><h2>Nuova richiesta dal portfolio HAXED</h2><p><strong>Nome / Azienda:</strong> ${safeName}</p><p><strong>Email:</strong> ${safeEmail}</p><p><strong>Richiesta:</strong></p><p>${safeMessage}</p></div>`,
  };

  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const details = await response.text();
      console.error("Contact form: Brevo API error", response.status, details);
      return json({ ok: false, message: "Non è stato possibile inviare la richiesta. Riprova tra poco." }, 502);
    }
    return json({ ok: true, message: "Richiesta inviata. Ti risponderò appena possibile." });
  } catch (error) {
    console.error("Contact form: request failed", error);
    return json({ ok: false, message: "Errore di connessione. Riprova tra poco." }, 502);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/contact") return handleContact(request, env);
    return env.ASSETS.fetch(request);
  },
};
