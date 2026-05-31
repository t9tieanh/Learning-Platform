/**
 * Normalizes chunk citation markers (`@{{uuid}}@`) for UI rendering.
 */
class ChunkCitationUtil {
  private static readonly UUID_PATTERN =
    '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}'

  private readonly bareChunkCitationRegex = new RegExp(
    `@(?!\\{\\{)(${ChunkCitationUtil.UUID_PATTERN})@(?!\\}\\})`,
    'g'
  )

  /** Normalize LLM citations to the expected `@{{uuid}}@` format for rendering. */
  normalizeChunkCitationText(text: string): string {
    if (!text) return text
    return text.replace(this.bareChunkCitationRegex, '@{{$1}}@')
  }
}

export default new ChunkCitationUtil()
