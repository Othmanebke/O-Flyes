// Double authentification par code envoyé par email.
//
// Supabase inscrit dans chaque jeton de session (JWT) la façon dont elle a été ouverte,
// dans le champ « amr » : [{ method: "oauth" }] pour Google/GitHub, [{ method: "otp" }]
// après la saisie d'un code reçu par email. La marque est conservée quand la session se
// renouvelle. Règle d'AIVANA : une session n'a accès aux données que si elle a été
// validée par un code email ; un compte Google ou GitHub seul ne suffit pas.
// La même règle est imposée en base (migration 0008, fonction session_email_verified).

// otp = code saisi ; magiclink = lien cliqué dans l'email ; email/signup = 1re confirmation par email
const VERIFIED_METHODS = ["otp", "magiclink", "email/signup"];

function decodePayload(token: string): Record<string, unknown> | null {
    try {
        const part = token.split(".")[1];
        const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
        const json = typeof atob === "function"
            ? decodeURIComponent(Array.from(atob(b64)).map(c => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join(""))
            : Buffer.from(b64, "base64").toString("utf8");
        return JSON.parse(json);
    } catch {
        return null;
    }
}

// true si la session a été validée par un code email
export function emailVerified(accessToken: string | null | undefined): boolean {
    if (!accessToken) return false;
    const amr = decodePayload(accessToken)?.amr;
    return Array.isArray(amr) && amr.some(e => VERIFIED_METHODS.includes((e as { method?: string })?.method || ""));
}

// Les codes Supabase font de 6 à 10 chiffres selon le réglage « Email OTP Length »
export const CODE_MIN = 6;
export const CODE_MAX = 10;
export const cleanCode = (v: string) => v.replace(/\D/g, "").slice(0, CODE_MAX);

// « othmane@gmail.com » -> « oth•••@gmail.com » (affichage)
export function maskEmail(email: string) {
    const [name, domain] = email.split("@");
    if (!domain) return email;
    return `${name.slice(0, 3)}${name.length > 3 ? "•••" : ""}@${domain}`;
}

// Message clair selon la cause de l'échec d'envoi du code (erreur Supabase Auth)
export function sendErrorMessage(error: { status?: number; code?: string; message?: string } | null | undefined): string {
    const status = error?.status ?? 0;
    const msg = (error?.message || "").toLowerCase();
    if (status === 429 || msg.includes("rate limit") || msg.includes("security purposes")) {
        return "Trop de demandes rapprochées : patientez une minute avant de redemander un code.";
    }
    if (msg.includes("captcha")) return "La vérification anti-robot a échoué. Cochez-la puis réessayez.";
    if (status >= 500) {
        return "Le service d'envoi d'emails ne répond pas pour le moment. Réessayez dans quelques minutes.";
    }
    return "L'envoi a échoué. Vérifiez l'adresse email puis réessayez.";
}
