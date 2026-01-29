import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import axios from "axios";
import fs from "fs";
import path from "path";
import os from "os";

export class DocumentService {
    //Downloads a PDF from a public URL and extracts its text content using LangChain.
    async getPdfContentFromUrl(url: string): Promise<string> {
        let tempFilePath: string | null = null;

        try {
            // Download the file
            const response = await axios.get(url, {
                responseType: "arraybuffer",
            });

            // Save to a temporary file
            const tempDir = os.tmpdir();
            const fileName = `pdf_${Date.now()}_${Math.random().toString(36).substring(7)}.pdf`;
            tempFilePath = path.join(tempDir, fileName);

            await fs.promises.writeFile(tempFilePath, response.data);

            // Load using LangChain's PDFLoader
            const loader = new PDFLoader(tempFilePath, {
                splitPages: false, // Return one document per file if possible, or we join later
            });

            const docs = await loader.load();

            // Extract and join text
            const content = docs.map((doc) => doc.pageContent).join("\n\n");

            return content;
        } catch (error) {
            console.error("Error processing PDF from URL:", error);
            throw new Error(`Failed to process PDF: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            // Cleanup temp file
            if (tempFilePath) {
                try {
                    if (fs.existsSync(tempFilePath)) {
                        await fs.promises.unlink(tempFilePath);
                    }
                } catch (cleanupError) {
                    console.error("Error cleaning up temp PDF file:", cleanupError);
                }
            }
        }
    }
}
