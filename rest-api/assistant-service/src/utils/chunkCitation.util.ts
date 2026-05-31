/**
 * Normalizes and parses chunk citation markers (`@{{uuid}}@`) in quiz explanations.
 */
export class ChunkCitationUtil {
  private static readonly UUID_PATTERN =
    '[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}';

  private readonly bareChunkCitationRegex = new RegExp(
    `@(?!\\{\\{)(${ChunkCitationUtil.UUID_PATTERN})@(?!\\}\\})`,
    'g'
  );

  /**
   * Ensures chunk citations use the frontend-expected `@{{uuid}}@` format.
   * LLMs often emit `@uuid@` despite prompt instructions.
   */
  normalizeChunkCitationMarkers(text: string, knownChunkIds?: string[]): string {
    if (!text) return text;

    const known = knownChunkIds?.length ? new Set(knownChunkIds) : null;

    return text.replace(this.bareChunkCitationRegex, (match, uuid: string) => {
      if (known && !known.has(uuid)) return match;
      return `@{{${uuid}}}@`;
    });
  }

  /** Reads `chunk_id:` lines from merged lesson-test context blocks. */
  extractChunkIdsFromMergedContext(mergedContext: string): string[] {
    const ids: string[] = [];
    const regex = new RegExp(
      `^chunk_id:\\s*(${ChunkCitationUtil.UUID_PATTERN})\\s*$`,
      'gm'
    );
    let match: RegExpExecArray | null;

    while ((match = regex.exec(mergedContext)) !== null) {
      ids.push(match[1]);
    }

    return ids;
  }
}

export default new ChunkCitationUtil();
