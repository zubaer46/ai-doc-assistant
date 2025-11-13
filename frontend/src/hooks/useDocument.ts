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
 * Hook for uploading documents
 * Returns mutation with success/error handling
 */
export function useUploadDocument(options?: {
  onSuccess?: (data: {
    sessionId: string;
    preview: string;
    filename: string;
  }) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<
  { sessionId: string; preview: string; filename: string },
  Error,
  File
> {
  return useMutation({
    mutationFn: (file: File) => uploadDocument(file),
    onSuccess: (data) => {
      console.log("Document uploaded successfully:", data.sessionId);
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error("Upload failed:", error.message);
      options?.onError?.(error);
    },
  });
}

/**
 * Hook for sending messages to chat with document
 * Supports optimistic updates and conversation history
 */
export function useSendMessage(options?: {
  onSuccess?: (data: ChatResponse) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<
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
      console.log("Message sent successfully");
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error("Message failed:", error.message);
      options?.onError?.(error);
    },
  });
}

/**
 * Hook for generating document summary
 */
export function useGenerateSummary(options?: {
  onSuccess?: (data: { summary: string }) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<{ summary: string }, Error, string> {
  return useMutation({
    mutationFn: (sessionId: string) => getSummary(sessionId),
    onSuccess: (data) => {
      console.log("Summary generated successfully");
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error("Summary generation failed:", error.message);
      options?.onError?.(error);
    },
  });
}

/**
 * Hook for simplifying text sections
 */
export function useSimplifyText(options?: {
  onSuccess?: (data: { simplified: string }) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<
  { simplified: string },
  Error,
  { sessionId: string; text: string }
> {
  return useMutation({
    mutationFn: (data: { sessionId: string; text: string }) =>
      simplifyText(data),
    onSuccess: (data) => {
      console.log("Text simplified successfully");
      options?.onSuccess?.(data);
    },
    onError: (error) => {
      console.error("Text simplification failed:", error.message);
      options?.onError?.(error);
    },
  });
}

/**
 * Hook for exporting Q&A notes
 * Automatically triggers file download on success
 */
export function useExportNotes(options?: {
  onSuccess?: (blob: Blob) => void;
  onError?: (error: Error) => void;
}): UseMutationResult<Blob, Error, string> {
  return useMutation({
    mutationFn: (sessionId: string) => exportNotes(sessionId),
    onSuccess: (blob) => {
      console.log("Notes exported successfully");

      // Automatically trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `document-notes-${Date.now()}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      options?.onSuccess?.(blob);
    },
    onError: (error) => {
      console.error("Export failed:", error.message);
      options?.onError?.(error);
    },
  });
}

/**
 * Hook for deleting documents
 * Useful for cleanup and session management
 */
export function useDeleteDocument(options?: {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}): UseMutationResult<void, Error, string> {
  return useMutation({
    mutationFn: (sessionId: string) => deleteDocument(sessionId),
    onSuccess: () => {
      console.log("Document deleted successfully");
      options?.onSuccess?.();
    },
    onError: (error) => {
      console.error("Delete failed:", error.message);
      options?.onError?.(error);
    },
  });
}

/**
 * Utility hook that combines loading states
 * Useful for showing global loading indicators
 */
export function useDocumentOperations() {
  const upload = useUploadDocument();
  const sendMsg = useSendMessage();
  const summary = useGenerateSummary();
  const simplify = useSimplifyText();
  const exportNts = useExportNotes();
  const deleteDoc = useDeleteDocument();

  return {
    upload,
    sendMessage: sendMsg,
    summary,
    simplify,
    exportNotes: exportNts,
    deleteDocument: deleteDoc,
    isLoading:
      upload.isPending ||
      sendMsg.isPending ||
      summary.isPending ||
      simplify.isPending ||
      exportNts.isPending ||
      deleteDoc.isPending,
  };
}
