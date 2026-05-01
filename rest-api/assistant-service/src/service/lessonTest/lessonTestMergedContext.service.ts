import { env } from '~/config/env';
import Logger from '~/utils/logger';

const CHARS_PER_TOKEN_HEURISTIC = 4;

/**
 * Builds merged plain-text context for lesson-test chunk groups and parses stored chunk id lists.
 */
export class LessonTestMergedContextService {
  estimateTokens(text: string): number {
    return Math.ceil(text.length / CHARS_PER_TOKEN_HEURISTIC);
  }

  parseChunkIds(chunkIds: unknown): string[] {
    if (!Array.isArray(chunkIds)) return [];
    return chunkIds.filter((x): x is string => typeof x === 'string');
  }

  /**
   * Merged context for one lesson-test chunk group (≤ 3 chunks).
   * Applies heuristic token budget: truncate Content sections first, then summaries.
   */
  buildMergedContextFromChunks(
    chunks: Array<{ id: string; summary: string | null; content: string }>,
    maxContextTokens: number = env.LESSON_TEST_GROUP_CONTEXT_MAX_TOKENS
  ): string {
    const blocks: string[] = [];
    for (let i = 0; i < chunks.length; i++) {
      const c = chunks[i];
      blocks.push(
        `### Chunk ${i + 1}\nchunk_id: ${c.id}\n\nSummary:\n${c.summary ?? ''}\n\nContent:\n${c.content ?? ''}\n`
      );
    }
    let merged = blocks.join('\n---\n');

    if (this.estimateTokens(merged) <= maxContextTokens) {
      return merged;
    }

    const summaries = chunks.map((c, idx) => ({
      header: `### Chunk ${idx + 1}\nchunk_id: ${c.id}\n\nSummary:\n`,
      summary: c.summary ?? '',
      footer: `\n\nContent:\n`,
      content: c.content ?? '',
    }));

    let bodies = summaries.map((s) => ({ ...s }));
    while (this.estimateTokens(this.rebuildMerged(bodies)) > maxContextTokens) {
      let changed = false;
      let longest = -1;
      let maxLen = -1;
      for (let i = 0; i < bodies.length; i++) {
        if (bodies[i].content.length > maxLen) {
          maxLen = bodies[i].content.length;
          longest = i;
        }
      }
      if (longest >= 0 && bodies[longest].content.length > 200) {
        bodies[longest].content =
          bodies[longest].content.slice(0, Math.floor(bodies[longest].content.length * 0.85)) +
          '\n[...truncated]';
        changed = true;
      }
      if (!changed) break;
      merged = this.rebuildMerged(bodies);
    }

    merged = this.rebuildMerged(bodies);
    while (this.estimateTokens(merged) > maxContextTokens) {
      let changed = false;
      for (let i = 0; i < bodies.length; i++) {
        if (bodies[i].summary.length > 80) {
          bodies[i].summary =
            bodies[i].summary.slice(0, Math.floor(bodies[i].summary.length * 0.8)) + '\n[...truncated]';
          changed = true;
          break;
        }
      }
      if (!changed) {
        Logger.warn('[LessonTestMergedContextService] Could not fit merged context under budget after truncation');
        break;
      }
      merged = this.rebuildMerged(bodies);
    }

    return merged;
  }

  private rebuildMerged(
    parts: Array<{ header: string; summary: string; footer: string; content: string }>
  ): string {
    return parts.map((p) => `${p.header}${p.summary}${p.footer}${p.content}`).join('\n---\n');
  }
}

export default new LessonTestMergedContextService();
