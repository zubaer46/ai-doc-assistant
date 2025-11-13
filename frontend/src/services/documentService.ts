import axiosInstance from "../lib/axios";
import {
  UploadResponse,
  ChatRequest,
  ChatResponse,
  SummarizeRequest,
  SummarizeResponse,
  SimplifyRequest,
  SimplifyResponse,
  ExportNotesResponse,
  Message,
} from "../types";

/**
 * Upload a document file to the server
 * @param file - File to upload (PDF, DOCX, or TXT)
 * @returns Session ID and preview text
 */
export async function uploadDocument(
  file: File
): Promise<{ sessionId: string; preview: string; filename: string }> {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axiosInstance.post<UploadResponse>(
      "/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return {
      sessionId: response.data.sessionId,
      preview: response.data.preview,
      filename: response.data.filename,
    };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to upload document"
    );
  }
}

/**
 * Send a message/question about the uploaded document
 * @param data - Session ID, question, and conversation history
 * @returns AI response with answer and citations
 */
export async function sendMessage(data: {
  sessionId: string;
  question: string;
  history?: Message[];
}): Promise<ChatResponse> {
  try {
    const requestData: ChatRequest = {
      sessionId: data.sessionId,
      question: data.question,
    };

    const response = await axiosInstance.post<ChatResponse>(
      "/chat",
      requestData
    );

    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to send message");
  }
}

/**
 * Generate a summary of the document
 * @param sessionId - Document session ID
 * @returns Document summary
 */
export async function getSummary(
  sessionId: string
): Promise<{ summary: string }> {
  try {
    const requestData: SummarizeRequest = { sessionId };

    const response = await axiosInstance.post<SummarizeResponse>(
      "/summarize",
      requestData
    );

    return { summary: response.data.summary };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to generate summary"
    );
  }
}

/**
 * Simplify/explain a specific text section
 * @param data - Session ID and text to simplify
 * @returns Simplified explanation
 */
export async function simplifyText(data: {
  sessionId: string;
  text: string;
}): Promise<{ simplified: string }> {
  try {
    const requestData: SimplifyRequest = {
      sessionId: data.sessionId,
      text: data.text,
    };

    const response = await axiosInstance.post<SimplifyResponse>(
      "/simplify",
      requestData
    );

    return { simplified: response.data.simplified };
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to simplify text");
  }
}

/**
 * Export Q&A session as markdown notes
 * @param sessionId - Document session ID
 * @returns Blob containing markdown file
 */
export async function exportNotes(sessionId: string): Promise<Blob> {
  try {
    const response = await axiosInstance.get<ExportNotesResponse>(
      `/export/${sessionId}`
    );

    // Convert markdown string to Blob
    const blob = new Blob([response.data.markdown], {
      type: "text/markdown",
    });

    return blob;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Failed to export notes");
  }
}

/**
 * Delete an uploaded document and its session data
 * @param sessionId - Document session ID
 */
export async function deleteDocument(sessionId: string): Promise<void> {
  try {
    await axiosInstance.delete(`/document/${sessionId}`);
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || "Failed to delete document"
    );
  }
}
