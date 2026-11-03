// Le modèle entoure parfois son JSON de texte ou de balises markdown :
// on garde uniquement ce qui va de la première à la dernière accolade.
export function extractJsonFromText(text: string): string {
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return text.substring(firstBrace, lastBrace + 1);
  }
  return text;
}
