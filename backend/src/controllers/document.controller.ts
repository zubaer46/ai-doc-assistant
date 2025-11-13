import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import fs from "fs/promises";
import {
  DocumentSession,
  UploadResponse,
  ChatRequest,
  ChatResponse,
  SummarizeRequest,
  SummarizeResponse,
  SimplifyRequest,
  SimplifyResponse,
  ExportNotesResponse,
  ErrorResponse,
} from "../types";
import { processDocument } from "../utils/documentProcessor";
import {
  askQuestion,
  generateSummary,
  simplifyText,
} from "../utils/openaiService";

// In-memory storage for document sessions
const documentSessions = new Map<string, DocumentSession>();

/**
 * Upload and process a document
 */
export async function uploadDocument(
  req: Request,
  res: Response
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({
        error: "No file uploaded",
        message: "Please upload a file",
      } as ErrorResponse);
      return;
    }

    const file = req.file;
    const sessionId = uuidv4();

    // Extract text from document
    const result = await processDocument(file.path, file.mimetype);

    if (!result.success) {
      // Clean up uploaded file
      await fs.unlink(file.path).catch(() => {});

      res.status(400).json({
        error: "Document processing failed",
        message: result.error || "Failed to extract text from document",
      } as ErrorResponse);
      return;
    }

    // Store session in memory
    const session: DocumentSession = {
      sessionId,
      filename: file.originalname,
      filepath: file.path,
      mimetype: file.mimetype,
      text: result.text,
      uploadedAt: new Date(),
      conversationHistory: [],
    };

    documentSessions.set(sessionId, session);

    // Generate preview (first 200 characters)
    const preview =
      result.text.substring(0, 200) + (result.text.length > 200 ? "..." : "");

    res.status(200).json({
      sessionId,
      filename: file.originalname,
      preview,
      message: "Document uploaded and processed successfully",
    } as UploadResponse);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Server error",
      message: errorMessage,
    } as ErrorResponse);
  }
}

/**
 * Chat with the uploaded document
 */
export async function chatWithDocument(
  req: Request<{}, {}, ChatRequest>,
  res: Response<ChatResponse | ErrorResponse>
): Promise<void> {
  try {
    const { sessionId, question } = req.body;

    // Validate request
    if (!sessionId || !question) {
      res.status(400).json({
        error: "Invalid request",
        message: "sessionId and question are required",
      } as ErrorResponse);
      return;
    }

    // Get session
    const session = documentSessions.get(sessionId);
    if (!session) {
      res.status(404).json({
        error: "Session not found",
        message: "Invalid sessionId or session expired",
      } as ErrorResponse);
      return;
    }

    // Ask question using OpenAI
    const result = await askQuestion(
      question,
      session.text,
      session.conversationHistory
    );

    if (!result.success || !result.data) {
      res.status(500).json({
        error: "AI service error",
        message: result.error || "Failed to generate response",
      } as ErrorResponse);
      return;
    }

    // Update conversation history
    session.conversationHistory.push({
      role: "user",
      content: question,
    });
    session.conversationHistory.push({
      role: "model",
      content: result.data.answer,
    });

    res.status(200).json({
      answer: result.data.answer,
      citations: result.data.citations,
      conversationHistory: session.conversationHistory,
    } as ChatResponse);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Server error",
      message: errorMessage,
    } as ErrorResponse);
  }
}

/**
 * Generate document summary
 */
export async function summarizeDocument(
  req: Request<{}, {}, SummarizeRequest>,
  res: Response<SummarizeResponse | ErrorResponse>
): Promise<void> {
  try {
    const { sessionId } = req.body;

    // Validate request
    if (!sessionId) {
      res.status(400).json({
        error: "Invalid request",
        message: "sessionId is required",
      } as ErrorResponse);
      return;
    }

    // Get session
    const session = documentSessions.get(sessionId);
    if (!session) {
      res.status(404).json({
        error: "Session not found",
        message: "Invalid sessionId or session expired",
      } as ErrorResponse);
      return;
    }

    // Generate summary
    const result = await generateSummary(session.text);

    if (!result.success || !result.data) {
      res.status(500).json({
        error: "AI service error",
        message: result.error || "Failed to generate summary",
      } as ErrorResponse);
      return;
    }

    res.status(200).json({
      summary: result.data,
    } as SummarizeResponse);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Server error",
      message: errorMessage,
    } as ErrorResponse);
  }
}

/**
 * Simplify/explain specific text
 */
export async function simplifyTextSection(
  req: Request<{}, {}, SimplifyRequest>,
  res: Response<SimplifyResponse | ErrorResponse>
): Promise<void> {
  try {
    const { sessionId, text } = req.body;

    // Validate request
    if (!sessionId || !text) {
      res.status(400).json({
        error: "Invalid request",
        message: "sessionId and text are required",
      } as ErrorResponse);
      return;
    }

    // Get session
    const session = documentSessions.get(sessionId);
    if (!session) {
      res.status(404).json({
        error: "Session not found",
        message: "Invalid sessionId or session expired",
      } as ErrorResponse);
      return;
    }

    // Simplify text
    const result = await simplifyText(text, session.text);

    if (!result.success || !result.data) {
      res.status(500).json({
        error: "AI service error",
        message: result.error || "Failed to simplify text",
      } as ErrorResponse);
      return;
    }

    res.status(200).json({
      simplified: result.data,
    } as SimplifyResponse);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Server error",
      message: errorMessage,
    } as ErrorResponse);
  }
}

/**
 * Export Q&A as markdown notes
 */
export async function exportNotes(
  req: Request<{ sessionId: string }>,
  res: Response<ExportNotesResponse | ErrorResponse>
): Promise<void> {
  try {
    const { sessionId } = req.params;

    // Validate request
    if (!sessionId) {
      res.status(400).json({
        error: "Invalid request",
        message: "sessionId is required",
      } as ErrorResponse);
      return;
    }

    // Get session
    const session = documentSessions.get(sessionId);
    if (!session) {
      res.status(404).json({
        error: "Session not found",
        message: "Invalid sessionId or session expired",
      } as ErrorResponse);
      return;
    }

    // Generate markdown
    let markdown = `# Document Q&A Notes\n\n`;
    markdown += `**Document:** ${session.filename}\n`;
    markdown += `**Date:** ${session.uploadedAt.toLocaleString()}\n\n`;
    markdown += `---\n\n`;

    if (session.conversationHistory.length === 0) {
      markdown += `No questions asked yet.\n`;
    } else {
      // Format Q&A pairs
      for (let i = 0; i < session.conversationHistory.length; i += 2) {
        const question = session.conversationHistory[i];
        const answer = session.conversationHistory[i + 1];

        if (question && answer) {
          markdown += `## Q${Math.floor(i / 2) + 1}: ${question.content}\n\n`;
          markdown += `**Answer:**\n\n${answer.content}\n\n`;
          markdown += `---\n\n`;
        }
      }
    }

    const filename = `${session.filename.replace(/\.[^/.]+$/, "")}_notes.md`;

    res.status(200).json({
      markdown,
      filename,
    } as ExportNotesResponse);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Server error",
      message: errorMessage,
    } as ErrorResponse);
  }
}

/**
 * Delete uploaded document
 */
export async function deleteDocument(
  req: Request<{ fileId: string }>,
  res: Response
): Promise<void> {
  try {
    const { fileId } = req.params;

    // Validate request
    if (!fileId) {
      res.status(400).json({
        error: "Invalid request",
        message: "fileId is required",
      } as ErrorResponse);
      return;
    }

    // Get session
    const session = documentSessions.get(fileId);
    if (!session) {
      res.status(404).json({
        error: "Document not found",
        message: "Invalid fileId or document already deleted",
      } as ErrorResponse);
      return;
    }

    // Delete file from filesystem
    try {
      await fs.unlink(session.filepath);
    } catch (error) {
      // File might already be deleted, continue anyway
      console.error("Error deleting file:", error);
    }

    // Remove from memory
    documentSessions.delete(fileId);

    res.status(200).json({
      message: "Document deleted successfully",
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    res.status(500).json({
      error: "Server error",
      message: errorMessage,
    } as ErrorResponse);
  }
}

// Utility function to get all active sessions (for debugging/admin)
export function getActiveSessions(): number {
  return documentSessions.size;
}
