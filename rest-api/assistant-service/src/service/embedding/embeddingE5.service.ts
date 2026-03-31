import { OpenAIEmbeddings } from "@langchain/openai";
import { SentenceObject } from "../chunking/types";
import Logger from "~/utils/logger";

/**
 * Service class for generating and attaching embeddings to sentences using local e5-base-v2 model.
 */
export class EmbeddingE5Service {
    private embeddings: OpenAIEmbeddings;

    /** Batch size for embedding generation (optimized for e5-base-v2) */
    private static readonly BATCH_SIZE = 32;

    constructor() {
        this.embeddings = new OpenAIEmbeddings({
            modelName: "intfloat/e5-base-v2",
            openAIApiKey: process.env.EMBEDDING_API_KEY || "dummy-key",
            configuration: {
                baseURL: process.env.EMBEDDING_API_URL || "http://localhost:37621/v1",
            },
        });
    }

    /**
     * Generates embeddings for combined sentences within a new array of SentenceObject items.
     * Uses the local e5-base-v2 model which requires the "passage: " prefix for document embeddings.
     *
     * @param {SentenceObject[]} sentencesArray - An array of SentenceObject items.
     * @returns {Promise<SentenceObject[]>} A promise that resolves with a new array of SentenceObject items.
     */
    async generateAndAttachEmbeddings(
        sentencesArray: SentenceObject[]
    ): Promise<SentenceObject[]> {
        // Deep copy the sentencesArray to ensure purity
        const sentencesArrayCopy: SentenceObject[] = sentencesArray.map(
            (sentenceObject) => ({
                ...sentenceObject,
                combined_sentence_embedding: sentenceObject.combined_sentence_embedding
                    ? [...sentenceObject.combined_sentence_embedding]
                    : undefined,
            })
        );

        // Extract combined sentences for embedding
        // Note: intfloat/e5-base-v2 expects "passage: " prefix for indexing documents.
        const combinedSentencesStrings: string[] = sentencesArrayCopy
            .filter((item) => item.combined_sentence !== undefined)
            // Adding prefix specifically for e5 model best practices
            .map((item) => `passage: ${item.combined_sentence}`);

        if (combinedSentencesStrings.length === 0) {
            return sentencesArrayCopy;
        }

        // Generate embeddings for the combined sentences in batches of 32
        const BATCH_SIZE = 32;
        const embeddingsArray: number[][] = [];

        for (let i = 0; i < combinedSentencesStrings.length; i += BATCH_SIZE) {
            const batch = combinedSentencesStrings.slice(i, i + BATCH_SIZE);
            const batchEmbeddings = await this.embeddings.embedDocuments(batch);
            embeddingsArray.push(...batchEmbeddings);
        }

        // Attach embeddings to the corresponding SentenceObject in the copied array
        let embeddingIndex = 0;
        for (let i = 0; i < sentencesArrayCopy.length; i++) {
            if (sentencesArrayCopy[i].combined_sentence !== undefined) {
                sentencesArrayCopy[i].combined_sentence_embedding =
                    embeddingsArray[embeddingIndex++];
            }
        }

        return sentencesArrayCopy;
    }

    /**
     * Generates embeddings for chunk contents and returns them as a mapping of index to embedding vector.
     * Uses the local e5-base-v2 model with "passage: " prefix for document embeddings.
     *
     * @param {string[]} chunkContents - An array of chunk content strings to embed.
     * @returns {Promise<Map<number, number[]>>} A promise resolving to a map of chunk index → embedding vector.
     */
    async generateEmbeddingsForChunkContents(
        chunkContents: string[]
    ): Promise<Map<number, number[]>> {
        if (chunkContents.length === 0) {
            return new Map();
        }

        Logger.info(
            `[EmbeddingE5Service] Generating embeddings for ${chunkContents.length} chunk(s)`
        );

        // Prepare content strings with e5-base-v2 "passage: " prefix
        const contentStringsWithPrefix: string[] = chunkContents.map(
            (content) => `passage: ${content}`
        );

        // Generate embeddings in batches
        const embeddingsArray: number[][] = [];

        for (
            let i = 0;
            i < contentStringsWithPrefix.length;
            i += EmbeddingE5Service.BATCH_SIZE
        ) {
            const batch = contentStringsWithPrefix.slice(
                i,
                i + EmbeddingE5Service.BATCH_SIZE
            );
            Logger.info(
                `[EmbeddingE5Service] Processing batch: ${Math.floor(i / EmbeddingE5Service.BATCH_SIZE) + 1}`
            );
            const batchEmbeddings = await this.embeddings.embedDocuments(batch);
            embeddingsArray.push(...batchEmbeddings);
        }

        // Create a map of chunk index → embedding vector
        const embeddingMap = new Map<number, number[]>();
        for (let i = 0; i < chunkContents.length; i++) {
            embeddingMap.set(i, embeddingsArray[i]);
        }

        Logger.info(
            `[EmbeddingE5Service] Embeddings generated successfully for ${chunkContents.length} chunk(s)`
        );

        return embeddingMap;
    }

    /**
     * Serializes an embedding vector to a JSON string for storage in PostgreSQL TEXT field.
     *
     * @param {number[]} embedding - The embedding vector.
     * @returns {string} JSON-encoded embedding vector.
     */
    serializeEmbedding(embedding: number[]): string {
        return JSON.stringify(embedding);
    }

    /**
     * Deserializes a JSON-encoded embedding string back to a number array.
     *
     * @param {string} embeddingJson - The JSON-encoded embedding string.
     * @returns {number[]} The deserialized embedding vector, or empty array if parsing fails.
     */
    deserializeEmbedding(embeddingJson: string): number[] {
        try {
            const parsed = JSON.parse(embeddingJson);
            if (Array.isArray(parsed)) {
                return parsed;
            }
            Logger.warn(
                `[EmbeddingE5Service] Deserialization failed: expected array, got ${typeof parsed}`
            );
            return [];
        } catch (error) {
            Logger.error(`[EmbeddingE5Service] Failed to deserialize embedding: ${error}`);
            return [];
        }
    }
}
