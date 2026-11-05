// Vérification côté serveur du captcha Cloudflare Turnstile.
// Sans TURNSTILE_SECRET_KEY (développement local), la vérification est désactivée.
export const captchaEnabled = () => !!process.env.TURNSTILE_SECRET_KEY;

export async function verifyCaptcha(token: string | undefined | null, ip?: string): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  if (!token) return false;
  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body,
      signal: AbortSignal.timeout(5000),
    });
    const data = (await res.json()) as { success?: boolean };
    return !!data.success;
  } catch {
    return false;
  }
}
