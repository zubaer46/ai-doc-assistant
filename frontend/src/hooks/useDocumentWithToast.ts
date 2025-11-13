import { useMutation, UseMutationResult } from "@tanstack/react-query";
import {
  uploadDocument,
  sendMessage,
  getSummary,
  simplifyText,
  exportNotes,
  deleteDocument,
} from "../services/documentService";
import { ChatResponse, Message } from "../types";

/**
 * Hook for uploading documents with toast notifications
 */
export function useUploadDocumentWithToast(
  showToast?: (message: string, type: "success" | "error") => void,
  options?: {
    onSuccess?: (data: {
      sessionId: string;
      preview: string;
      filename: string;
    }) => void;
  }
): UseMutationResult<
  { sessionId: string; preview: string; filename: string },
  Error,
  File
> {
  return useMutation({
    mutationFn: (file: File) => uploadDocument(file),
    onSuccess: (data) => {
      showToast?.(
        `Document "${data.filename}" uploaded successfully!`,
        "success"
      );
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      showToast?.(error.message || "Failed to upload document", "error");
    },
  });
}

/**
 * Hook for sending messages with toast notifications
 */
export function useSendMessageWithToast(
  showToast?: (message: string, type: "success" | "error") => void,
  options?: {
    onSuccess?: (data: ChatResponse) => void;
  }
): UseMutationResult<
  ChatResponse,
  Error,
  { sessionId: string; question: string; history?: Message[] }
> {
  return useMutation({
    mutationFn: (data: {
      sessionId: string;
      question: string;
      history?: Message[];
    }) => sendMessage(data),
    onSuccess: (data) => {
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      showToast?.(error.message || "Failed to send message", "error");
    },
  });
}

/**
 * Hook for generating summary with toast notifications
 */
export function useGenerateSummaryWithToast(
  showToast?: (message: string, type: "success" | "error") => void,
  options?: {
    onSuccess?: (data: { summary: string }) => void;
  }
): UseMutationResult<{ summary: string }, Error, string> {
  return useMutation({
    mutationFn: (sessionId: string) => getSummary(sessionId),
    onSuccess: (data) => {
      showToast?.("Summary generated successfully!", "success");
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      showToast?.(error.message || "Failed to generate summary", "error");
    },
  });
}

/**
 * Hook for simplifying text with toast notifications
 */
export function useSimplifyTextWithToast(
  showToast?: (message: string, type: "success" | "error") => void,
  options?: {
    onSuccess?: (data: { simplified: string }) => void;
  }
): UseMutationResult<
  { simplified: string },
  Error,
  { sessionId: string; text: string }
> {
  return useMutation({
    mutationFn: (data: { sessionId: string; text: string }) =>
      simplifyText(data),
    onSuccess: (data) => {
      showToast?.("Text simplified successfully!", "success");
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      showToast?.(error.message || "Failed to simplify text", "error");
    },
  });
}

/**
 * Hook for exporting notes with toast notifications
 */
export function useExportNotesWithToast(
  showToast?: (message: string, type: "success" | "error") => void
): UseMutationResult<Blob, Error, string> {
  return useMutation({
    mutationFn: (sessionId: string) => exportNotes(sessionId),
    onSuccess: (blob) => {
      // Automatically trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `document-notes-${Date.now()}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast?.("Notes exported successfully!", "success");
    },
    onError: (error) => {
      showToast?.(error.message || "Failed to export notes", "error");
    },
  });
}

/**
 * Hook for deleting documents with toast notifications
 */
export function useDeleteDocumentWithToast(
  showToast?: (message: string, type: "success" | "error") => void,
  options?: {
    onSuccess?: () => void;
  }
): UseMutationResult<void, Error, string> {
  return useMutation({
    mutationFn: (sessionId: string) => deleteDocument(sessionId),
    onSuccess: () => {
      showToast?.("Document deleted successfully!", "success");
      options?.onSuccess?.();
    },
    onError: (error) => {
      showToast?.(error.message || "Failed to delete document", "error");
    },
  });
}
