// Chemin interne uniquement : pas de redirection ouverte vers un autre site
// (ni « //evil.com », ni « /\evil.com » que certains navigateurs lisent comme une URL).
export function safeNext(raw: string | null | undefined, fallback = "/dashboard") {
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  return raw;
}
