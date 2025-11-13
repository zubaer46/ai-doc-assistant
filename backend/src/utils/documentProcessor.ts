import fs from "fs/promises";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { ProcessDocumentResult, AllowedMimeType } from "../types";

/**
 * Extract text from PDF files using pdf-parse
 * @param filePath - Path to the PDF file
 * @returns Extracted text content
 */
export async function extractTextFromPDF(filePath: string): Promise<string> {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const pdfData = await pdfParse(dataBuffer);

    if (!pdfData.text || pdfData.text.trim().length === 0) {
      throw new Error("PDF document is empty or contains no extractable text");
    }

    return pdfData.text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
    throw new Error("Failed to extract text from PDF: Unknown error");
  }
}

/**
 * Extract text from DOCX files using mammoth
 * @param filePath - Path to the DOCX file
 * @returns Extracted text content
 */
export async function extractTextFromDOCX(filePath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: filePath });

    if (!result.value || result.value.trim().length === 0) {
      throw new Error("DOCX document is empty or contains no extractable text");
    }

    return result.value;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to extract text from DOCX: ${error.message}`);
    }
    throw new Error("Failed to extract text from DOCX: Unknown error");
  }
}

/**
 * Extract text from TXT files using fs/promises
 * @param filePath - Path to the TXT file
 * @returns Extracted text content
 */
export async function extractTextFromTXT(filePath: string): Promise<string> {
  try {
    const text = await fs.readFile(filePath, "utf-8");

    if (!text || text.trim().length === 0) {
      throw new Error("TXT file is empty");
    }

    return text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to read TXT file: ${error.message}`);
    }
    throw new Error("Failed to read TXT file: Unknown error");
  }
}

/**
 * Process a document and extract its text content based on file type
 * @param filePath - Path to the document file
 * @param mimetype - MIME type of the document
 * @returns ProcessDocumentResult object with success status, extracted text, and optional error message
 */
export async function processDocument(
  filePath: string,
  mimetype: string
): Promise<ProcessDocumentResult> {
  try {
    // Validate file exists
    try {
      await fs.access(filePath);
    } catch {
      return {
        success: false,
        text: "",
        error: "File not found",
      };
    }

    let extractedText: string;

    // Route to appropriate extraction function based on MIME type
    switch (mimetype as AllowedMimeType) {
      case "application/pdf":
        extractedText = await extractTextFromPDF(filePath);
        break;

      case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        extractedText = await extractTextFromDOCX(filePath);
        break;

      case "text/plain":
        extractedText = await extractTextFromTXT(filePath);
        break;

      default:
        return {
          success: false,
          text: "",
          error: `Unsupported file type: ${mimetype}`,
        };
    }

    // Return success result
    return {
      success: true,
      text: extractedText.trim(),
    };
  } catch (error) {
    // Handle any errors during processing
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return {
      success: false,
      text: "",
      error: errorMessage,
    };
  }
}
