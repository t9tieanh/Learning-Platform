
import * as math from "mathjs";
import { quantile } from "d3-array";
import { SentenceObject, SemanticChunk } from "./types";

/**
 * Service class for semantic analysis of sentences.
 */
export class SemanticAnalyzer {
    /**
     * Calculates the cosine similarity between two vectors.
     *
     * This function computes the cosine similarity between two vectors represented as arrays of numbers.
     * Cosine similarity is a measure of similarity between two non-zero vectors of an inner product space that
     * measures the cosine of the angle between them. The cosine of 0° is 1, and it is less than 1 for any other angle.
     * It is thus a judgment of orientation and not magnitude: two vectors with the same orientation have a cosine similarity
     * of 1, two vectors at 90° have a similarity of 0, and two vectors diametrically opposed have a similarity of -1,
     * independent of their magnitude. Cosine similarity is particularly used in positive space, where the outcome is
     * neatly bounded in [0,1].
     *
     * The function returns 0 if either vector has a norm of 0.
     *
     * @param {number[]} vecA - The first vector, represented as an array of numbers.
     * @param {number[]} vecB - The second vector, also represented as an array of numbers.
     * @returns {number} The cosine similarity between vecA and vecB, a value between -1 and 1. Returns 0 if either vector's norm is 0.
     *
     * @example
     * const vectorA = [1, 2, 3];
     * const vectorB = [4, 5, 6];
     * const analyzer = new SemanticAnalyzer();
     * const similarity = analyzer.cosineSimilarity(vectorA, vectorB);
     * console.log(similarity); // Output: similarity score as a number
     */
    private cosineSimilarity(vecA: number[], vecB: number[]): number {
        const dotProduct = math.dot(vecA, vecB) as number;

        const normA = math.norm(vecA) as number;
        const normB = math.norm(vecB) as number;

        if (normA === 0 || normB === 0) {
            return 0;
        }

        const similarity = dotProduct / (normA * normB);
        return similarity;
    }

    /**
     * Enhances an array of SentenceObject items by calculating cosine distances between sentences and identifying significant semantic shifts based on a specified percentile threshold.
     * This function first calculates the cosine distance between each sentence's embedding and its next sentence's embedding. It then identifies which of these distances exceed a specified percentile threshold, indicating significant semantic shifts. The `distance_to_next` property is updated for each SentenceObject, and the indices of sentences where significant shifts occur are returned.
     * This operation is performed in a pure manner, ensuring the input array is not modified.
     *
     * @param {SentenceObject[]} sentenceObjectArray - An array of SentenceObject items, each containing a combined sentence embedding.
     * @param {number} percentileThreshold - The percentile threshold as a number (0-100) to identify significant semantic shifts.
     * @returns {{updatedArray: SentenceObject[], significantShiftIndices: number[]}} An object containing the updated array of SentenceObject items with `distance_to_next` property set, and an array of indices indicating significant semantic shifts.
     */
    calculateCosineDistancesAndSignificantShifts(
        sentenceObjectArray: SentenceObject[],
        percentileThreshold: number
    ): { updatedArray: SentenceObject[]; significantShiftIndices: number[] } {
        // Calculate cosine distances and update the array
        const distances: number[] = [];
        const updatedSentenceObjectArray = sentenceObjectArray.map(
            (item, index, array) => {
                if (
                    index < array.length - 1 &&
                    item.combined_sentence_embedding &&
                    array[index + 1].combined_sentence_embedding
                ) {
                    const embeddingCurrent = item.combined_sentence_embedding!;
                    const embeddingNext = array[index + 1].combined_sentence_embedding!;
                    const similarity = this.cosineSimilarity(
                        embeddingCurrent,
                        embeddingNext
                    );
                    const distance = 1 - similarity;
                    distances.push(distance); // Keep track of calculated distances
                    return { ...item, distance_to_next: distance };
                } else {
                    return { ...item, distance_to_next: undefined };
                }
            }
        );

        // Determine the threshold value for significant shifts
        const sortedDistances = [...distances].sort((a, b) => a - b);
        const quantileThreshold = percentileThreshold / 100;
        const breakpointDistanceThreshold = quantile(
            sortedDistances,
            quantileThreshold
        );

        if (breakpointDistanceThreshold === undefined) {
            throw new Error("Failed to calculate breakpoint distance threshold");
        }

        // Identify indices of significant shifts
        const significantShiftIndices = distances
            .map((distance, index) =>
                distance > breakpointDistanceThreshold ? index : -1
            )
            .filter((index) => index !== -1);

        return {
            updatedArray: updatedSentenceObjectArray,
            significantShiftIndices,
        };
    }

    /**
     * Helper to create and add a chunk to the chunks array.
     */
    private addChunk(
        sentenceObjectArray: SentenceObject[],
        start: number,
        end: number,
        chunks: SemanticChunk[]
    ): void {
        const group = sentenceObjectArray.slice(start, end + 1);
        const combinedText = group.map((item) => item.sentence).join(" ");

        const firstSentence = group[0];
        const lastSentence = group[group.length - 1];

        const chunkMetadata: SemanticChunk['metadata'] = {
            sentenceCount: group.length,
            startSentenceIndex: firstSentence.index,
            endSentenceIndex: lastSentence.index,
        };

        if (firstSentence.metadata) {
            chunkMetadata.subtitleIndex = firstSentence.metadata.subtitleIndex;
            chunkMetadata.startTime = firstSentence.metadata.startTime;
        }

        if (lastSentence.metadata) {
            chunkMetadata.endTime = lastSentence.metadata.endTime;
            if (chunkMetadata.startTime && chunkMetadata.endTime) {
                chunkMetadata.timestamp = `${chunkMetadata.startTime} --> ${chunkMetadata.endTime}`;
            }
        }

        chunks.push({
            content: combinedText,
            metadata: chunkMetadata,
        });
    }

    /**
   * Groups sentences into semantic chunks based on specified shift indices.
   * Returns chunks with aggregated metadata from the constituent sentences.
   *
   * This function accumulates sentences into chunks, where each chunk is defined by significant semantic shifts indicated by the provided shift indices. Each chunk comprises sentences that are semantically related, and the boundaries are determined by the shift indices, which point to sentences where a significant semantic shift occurs.
   *
   * Metadata is aggregated from the first and last sentences in each chunk:
   * - subtitleIndex: from the first sentence
   * - startTime: from the first sentence
   * - endTime: from the last sentence
   * - timestamp: combined from first to last
   *
   * Short chunks (with only 1 sentence) are automatically merged with neighboring chunks to ensure better chunk quality.
   *
   * @param {SentenceObject[]} sentenceObjectArray - An array of SentenceObject items, each potentially containing a sentence, its embedding, and additional metadata.
   * @param {number[]} shiftIndices - An array of indices indicating where significant semantic shifts occur, thus where new chunks should start.
   * @returns {SemanticChunk[]} An array of SemanticChunk objects, each containing content and aggregated metadata.
   *
   * @example
   * const sentencesWithEmbeddings = [
   *   { sentence: 'Sentence one.', index: 0, metadata: { subtitleIndex: 1, startTime: '00:00:01', endTime: '00:00:03' } },
   *   // other SentenceObject items...
   * ];
   * const shiftIndices = [2, 5]; // Semantic shifts occur after the sentences at indices 2 and 5
   * const analyzer = new SemanticAnalyzer();
   * const semanticChunks = analyzer.groupSentencesIntoChunks(sentencesWithEmbeddings, shiftIndices);
   * console.log(semanticChunks); // Output: Array of chunks with content and metadata
   */
    groupSentencesIntoChunks(
        sentenceObjectArray: SentenceObject[],
        shiftIndices: number[],
        maxSentencesPerChunk: number = 100
    ): SemanticChunk[] {
        let startIdx = 0; // Initialize the start index
        const chunks: SemanticChunk[] = []; // Create an array to hold the grouped sentences

        // Add one beyond the last index to handle remaining sentences as a final chunk
        const adjustedBreakpoints = [
            ...shiftIndices,
            sentenceObjectArray.length - 1,
        ];

        // Iterate through the breakpoints to slice and accumulate sentences into chunks
        adjustedBreakpoints.forEach((breakpoint) => {
            let currentStart = startIdx;

            // While the current group is larger than maxSentencesPerChunk, split it
            while (breakpoint - currentStart + 1 > maxSentencesPerChunk) {
                const subBreakpoint = currentStart + maxSentencesPerChunk - 1;
                this.addChunk(sentenceObjectArray, currentStart, subBreakpoint, chunks);
                currentStart = subBreakpoint + 1;
            }

            // Add the remaining part of the group
            if (currentStart <= breakpoint) {
                this.addChunk(sentenceObjectArray, currentStart, breakpoint, chunks);
            }

            startIdx = breakpoint + 1; // Update the start index for the next group
        });

        // Post-processing: Merge chunks that are too short (only 1 sentence)
        return this.mergeShortChunks(chunks);
    }

    /**
     * Merges chunks that contain only 1 sentence into neighboring chunks.
     * Short chunks are merged with the previous chunk if available, otherwise with the next chunk.
     *
     * @param {SemanticChunk[]} chunks - Array of semantic chunks to process
     * @returns {SemanticChunk[]} Array of chunks with short chunks merged
     */
    private mergeShortChunks(chunks: SemanticChunk[], minSentences: number = 5): SemanticChunk[] {
        if (chunks.length === 0) return chunks;

        const mergedChunks: SemanticChunk[] = [];
        let i = 0;

        while (i < chunks.length) {
            const currentChunk = chunks[i];
            const sentenceCount = currentChunk.metadata?.sentenceCount || 1;

            // If chunk has enough sentences, add it as is
            if (sentenceCount >= minSentences) {
                mergedChunks.push(currentChunk);
                i++;
            } else {
                // Chunk is too short - decide whether to merge with previous or next
                const hasPrevious = mergedChunks.length > 0;
                const hasNext = i + 1 < chunks.length;

                if (hasPrevious && !hasNext) {
                    // Merge with previous (last chunk case)
                    const prevChunk = mergedChunks[mergedChunks.length - 1];
                    mergedChunks[mergedChunks.length - 1] = this.mergeTwoChunks(prevChunk, currentChunk);
                    i++;
                } else if (!hasPrevious && hasNext) {
                    // Merge with next (first chunk case)
                    const nextChunk = chunks[i + 1];
                    mergedChunks.push(this.mergeTwoChunks(currentChunk, nextChunk));
                    i += 2; // Skip the next chunk since we already merged it
                } else if (hasPrevious && hasNext) {
                    // Merge with previous by default (more semantically coherent)
                    const prevChunk = mergedChunks[mergedChunks.length - 1];
                    mergedChunks[mergedChunks.length - 1] = this.mergeTwoChunks(prevChunk, currentChunk);
                    i++;
                } else {
                    // Only one chunk total - keep it even if short
                    mergedChunks.push(currentChunk);
                    i++;
                }
            }
        }

        return mergedChunks;
    }

    /**
     * Merges two chunks into a single chunk with combined content and metadata.
     *
     * @param {SemanticChunk} chunk1 - First chunk
     * @param {SemanticChunk} chunk2 - Second chunk
     * @returns {SemanticChunk} Merged chunk
     */
    private mergeTwoChunks(chunk1: SemanticChunk, chunk2: SemanticChunk): SemanticChunk {
        const combinedContent = `${chunk1.content} ${chunk2.content}`;

        const mergedMetadata: SemanticChunk['metadata'] = {
            subtitleIndex: chunk1.metadata?.subtitleIndex,
            startTime: chunk1.metadata?.startTime,
            endTime: chunk2.metadata?.endTime,
            sentenceCount: (chunk1.metadata?.sentenceCount || 0) + (chunk2.metadata?.sentenceCount || 0),
            startSentenceIndex: chunk1.metadata?.startSentenceIndex,
            endSentenceIndex: chunk2.metadata?.endSentenceIndex,
        };

        // Update timestamp if both times are available
        if (mergedMetadata.startTime && mergedMetadata.endTime) {
            mergedMetadata.timestamp = `${mergedMetadata.startTime} --> ${mergedMetadata.endTime}`;
        }

        return {
            content: combinedContent,
            metadata: mergedMetadata,
        };
    }
}
