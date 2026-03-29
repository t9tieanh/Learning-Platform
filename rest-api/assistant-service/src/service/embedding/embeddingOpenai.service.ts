
import { OpenAIEmbeddings } from "@langchain/openai";
import { SentenceObject } from "../chunking/types";

/**
 * Service class for generating and attaching embeddings to sentences.
 */
export class EmbeddingOpenAIService {
    private embeddings: OpenAIEmbeddings;

    constructor() {
        this.embeddings = new OpenAIEmbeddings();
    }

    /**
     * Generates embeddings for combined sentences within a new array of SentenceObject items, based on the input array, attaching the embeddings to their respective objects.
     *
     * This function takes an array of SentenceObject items, creates a deep copy to maintain purity, and then filters to identify those with a `combined_sentence`.
     * It generates embeddings for these combined sentences in bulk using the OpenAIEmbeddings service. Each embedding is then attached to the corresponding SentenceObject
     * in the copied array as `combined_sentence_embedding`.
     *
     * The function is pure and does not mutate the input array. Instead, it returns a new array with updated properties.
     *
     * @param {SentenceObject[]} sentencesArray - An array of SentenceObject items, each potentially containing a `combined_sentence`.
     * @returns {Promise<SentenceObject[]>} A promise that resolves with a new array of SentenceObject items, with embeddings attached to those items that have a `combined_sentence`.
     *
     * @example
     * const sentencesArray = [
     *   { sentence: 'Sentence one.', index: 0, combined_sentence: 'Sentence one. Sentence two.' },
     *   // other SentenceObject items...
     * ];
     * const embeddingService = new EmbeddingService();
     * const result = await embeddingService.generateAndAttachEmbeddings(sentencesArray);
     * console.log(result);
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
        const combinedSentencesStrings: string[] = sentencesArrayCopy
            .filter((item) => item.combined_sentence !== undefined)
            .map((item) => item.combined_sentence as string);

        // Generate embeddings for the combined sentences
        const embeddingsArray = await this.embeddings.embedDocuments(
            combinedSentencesStrings
        );

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
}
