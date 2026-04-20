/**
 * El chat no renderiza Markdown: convierte respuestas del modelo a texto plano legible.
 */
export function stripMarkdownForDisplay(text: string): string {
  if (!text) return '';
  return (
    text
      // negritas / cursivas estilo **texto** o *texto*
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/\*([^*\n]+)\*/g, '$1')
      // encabezados # ## ###
      .replace(/^#{1,6}\s+/gm, '')
      // código inline
      .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
      // enlaces [texto](url) → texto
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
  );
}
