/** Strips HTML tags and normalizes whitespace for short previews (e.g. sidebar). */
export function htmlToPlainText(html: string): string {
  if (!html?.trim()) return ''

  if (typeof document !== 'undefined') {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    return doc.body.textContent?.replace(/\s+/g, ' ').trim() ?? ''
  }

  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}
