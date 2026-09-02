const MAX_NAME = 120;
const MAX_EMAIL = 254;
const MAX_REQUEST = 5000;
const WALL_COOKIE = "haxed_wall_session";
const WALL_TTL_SECONDS = 60 * 60 * 12;
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_WINDOW_MS = 60 * 1000;

const loginAttempts = new Map();

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

const base64UrlEncode = (bytes) => {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

const base64UrlDecode = (value) => {
  const padded = value.replaceAll("-", "+").replaceAll("_", "/") + "===".slice((value.length + 3) % 4);
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const textEncoder = new TextEncoder();

async function signWallSession(expiresAt, secret) {
  const key = await crypto.subtle.importKey(
    "raw",
    textEncoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, textEncoder.encode(String(expiresAt)));
  return `${expiresAt}.${base64UrlEncode(new Uint8Array(signature))}`;
}

async function verifyWallSession(token, secret) {
  if (!secret || !token) return false;

  const [expiresAtText, signatureText] = token.split(".");
  const expiresAt = Number(expiresAtText);
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000) || !signatureText) return false;

  try {
    const key = await crypto.subtle.importKey(
      "raw",
      textEncoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    return await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signatureText),
      textEncoder.encode(String(expiresAt)),
    );
  } catch {
    return false;
  }
}

function getClientKey(request) {
  return request.headers.get("CF-Connecting-IP") || request.headers.get("X-Forwarded-For") || "unknown";
}

function canAttemptLogin(request) {
  const now = Date.now();
  const key = getClientKey(request);
  const current = loginAttempts.get(key);

  if (!current || now - current.startedAt >= LOGIN_WINDOW_MS) {
    loginAttempts.set(key, { startedAt: now, count: 1 });
    return true;
  }

  if (current.count >= MAX_LOGIN_ATTEMPTS) return false;
  current.count += 1;
  return true;
}

function clearLoginAttempts(request) {
  loginAttempts.delete(getClientKey(request));
}

function wallIsEnabled(env) {
  return String(env.WALL_ENABLED || "").toLowerCase() === "true";
}

function safeNextPath(value) {
  const next = String(value || "/");
  if (!next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return "/";
  return next.slice(0, 2000);
}

function wallPage(request, message = "", status = 200) {
  const url = new URL(request.url);
  const next = safeNextPath(`${url.pathname}${url.search}`);
  const safeMessage = escapeHtml(message);
  const messageBlock = safeMessage
    ? `<p class="wall-message" role="alert">${safeMessage}</p>`
    : "";

  return new Response(`<!doctype html>
<html lang="it">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex,nofollow,noarchive">
  <meta name="theme-color" content="#111214">
  <title>HAXED — Work in progress</title>
  <style>
    :root { color-scheme: dark; --bg:#101113; --paper:#f1eee8; --muted:#9b9da1; --line:rgba(241,238,232,.16); --orange:#ff5b35; --sans:Manrope,"Helvetica Neue",Helvetica,Arial,sans-serif; --serif:Georgia,"Times New Roman",serif; }
    * { box-sizing:border-box; }
    html,body { min-height:100%; margin:0; }
    body { min-height:100vh; display:grid; place-items:center; padding:28px; background:var(--bg); color:var(--paper); font-family:var(--sans); overflow:hidden; }
    body::before { content:""; position:fixed; inset:0; pointer-events:none; opacity:.22; background:radial-gradient(circle at 70% 20%, rgba(255,91,53,.22), transparent 34%), linear-gradient(rgba(255,255,255,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.025) 1px, transparent 1px); background-size:auto, 32px 32px, 32px 32px; }
    main { position:relative; width:min(720px,100%); border:1px solid var(--line); padding:clamp(28px,6vw,64px); background:rgba(16,17,19,.88); box-shadow:0 30px 100px rgba(0,0,0,.35); }
    .top { display:flex; align-items:center; justify-content:space-between; gap:20px; margin-bottom:clamp(64px,10vw,110px); font-size:11px; letter-spacing:.16em; text-transform:uppercase; }
    .brand { font-weight:800; letter-spacing:.1em; }
    .status { color:var(--orange); }
    .status::before { content:""; display:inline-block; width:7px; height:7px; margin:0 8px 1px 0; border-radius:50%; background:var(--orange); box-shadow:0 0 14px rgba(255,91,53,.8); }
    .kicker { margin:0 0 16px; color:var(--muted); font-size:11px; letter-spacing:.18em; text-transform:uppercase; }
    h1 { margin:0; font-size:clamp(48px,10vw,100px); line-height:.86; letter-spacing:-.065em; font-weight:800; }
    h1 em { font-family:var(--serif); font-weight:400; letter-spacing:-.05em; }
    .intro { max-width:520px; margin:28px 0 42px; color:var(--muted); font-size:15px; line-height:1.7; }
    form { display:grid; grid-template-columns:1fr auto; gap:10px; }
    input { min-width:0; height:56px; border:1px solid var(--line); outline:0; padding:0 16px; background:rgba(255,255,255,.04); color:var(--paper); font:inherit; }
    input:focus { border-color:var(--orange); box-shadow:0 0 0 3px rgba(255,91,53,.12); }
    button { height:56px; border:0; padding:0 24px; background:var(--orange); color:#101113; cursor:pointer; font:700 12px var(--sans); letter-spacing:.1em; text-transform:uppercase; }
    button:hover { background:#ff704f; }
    .wall-message { margin:14px 0 0; color:var(--orange); font-size:13px; }
    .footer { margin-top:52px; padding-top:16px; border-top:1px solid var(--line); color:var(--muted); font-size:10px; letter-spacing:.13em; text-transform:uppercase; }
    @media (max-width:600px) { body { padding:16px; } main { padding:28px 22px; } .top { margin-bottom:70px; } form { grid-template-columns:1fr; } button { width:100%; } }
  </style>
</head>
<body>
  <main>
    <div class="top"><span class="brand">HAXED</span><span class="status">Work in progress</span></div>
    <p class="kicker">Private preview / 2026</p>
    <h1>Almost<br><em>there.</em></h1>
    <p class="intro">Il portfolio è in lavorazione. Inserisci la password per accedere all'anteprima privata.</p>
    <form action="/__wall/login" method="post">
      <input type="password" name="password" autocomplete="current-password" placeholder="Password" required autofocus>
      <input type="hidden" name="next" value="${escapeHtml(next)}">
      <button type="submit">Entra ↗</button>
    </form>
    ${messageBlock}
    <div class="footer">HAXED / DENNIS BERTOZZI / VIDEO EDITOR</div>
  </main>
</body>
</html>`, {
    status,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store, private",
      "X-Robots-Tag": "noindex, nofollow, noarchive",
      "Referrer-Policy": "no-referrer",
    },
  });
}

async function handleWallLogin(request, env) {
  if (request.method !== "POST") return wallPage(request, "Metodo non consentito.", 405);
  if (!env.WALL_PASSWORD || !env.WALL_SESSION_SECRET) {
    console.error("Password wall: WALL_PASSWORD or WALL_SESSION_SECRET is not configured.");
    return wallPage(request, "Il private preview non è ancora configurato.", 503);
  }

  if (!canAttemptLogin(request)) {
    return new Response("Troppi tentativi. Riprova tra un minuto.", {
      status: 429,
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store",
        "Retry-After": "60",
      },
    });
  }

  let form;
  try {
    form = await request.formData();
  } catch {
    return wallPage(request, "Richiesta non valida.", 400);
  }

  const password = String(form.get("password") || "");
  const next = safeNextPath(form.get("next"));

  if (!password || password !== env.WALL_PASSWORD) {
    return wallPage(request, "Password non corretta.", 401);
  }

  clearLoginAttempts(request);
  const expiresAt = Math.floor(Date.now() / 1000) + WALL_TTL_SECONDS;
  const token = await signWallSession(expiresAt, env.WALL_SESSION_SECRET);

  return new Response(null, {
    status: 303,
    headers: {
      Location: next,
      "Cache-Control": "no-store",
      "Set-Cookie": `${WALL_COOKIE}=${token}; Max-Age=${WALL_TTL_SECONDS}; Path=/; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}

async function wallGate(request, env) {
  if (!wallIsEnabled(env)) return null;

  const url = new URL(request.url);
  if (url.pathname === "/__wall/login") return handleWallLogin(request, env);

  const cookies = request.headers.get("Cookie") || "";
  const match = cookies.match(new RegExp(`(?:^|;\\s*)${WALL_COOKIE}=([^;]+)`));
  const authenticated = await verifyWallSession(match?.[1], env.WALL_SESSION_SECRET);

  if (!authenticated) return wallPage(request);
  return null;
}

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
    const wallResponse = await wallGate(request, env);
    if (wallResponse) return wallResponse;

    const url = new URL(request.url);
    if (url.pathname === "/api/contact") return handleContact(request, env);
    return env.ASSETS.fetch(request);
  },
};
