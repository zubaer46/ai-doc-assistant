import { Router } from "express";
import {
  uploadDocument,
  chatWithDocument,
  summarizeDocument,
  simplifyTextSection,
  exportNotes,
  deleteDocument,
} from "../controllers/document.controller";
import { uploadMiddleware, handleMulterError } from "../middleware/upload";

const router = Router();

/**
 * POST /api/upload
 * Upload and process a document
 */
router.post(
  "/upload",
  uploadMiddleware.single("file"),
  handleMulterError,
  uploadDocument
);

/**
 * POST /api/chat
 * Ask questions about the uploaded document
 */
router.post("/chat", chatWithDocument);

/**
 * POST /api/summarize
 * Generate a summary of the document
 */
router.post("/summarize", summarizeDocument);

/**
 * POST /api/simplify
 * Simplify/explain specific text from the document
 */
router.post("/simplify", simplifyTextSection);

/**
 * GET /api/export/:sessionId
 * Export Q&A session as markdown notes
 */
router.get("/export/:sessionId", exportNotes);

/**
 * DELETE /api/document/:fileId
 * Delete uploaded document and session data
 */
router.delete("/document/:fileId", deleteDocument);

export default router;
