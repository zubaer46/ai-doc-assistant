// Export all document-related hooks
export {
  useUploadDocument,
  useSendMessage,
  useGenerateSummary,
  useSimplifyText,
  useExportNotes,
  useDeleteDocument,
  useDocumentOperations,
} from "./useDocument";

// Export toast-enabled versions
export {
  useUploadDocumentWithToast,
  useSendMessageWithToast,
  useGenerateSummaryWithToast,
  useSimplifyTextWithToast,
  useExportNotesWithToast,
  useDeleteDocumentWithToast,
} from "./useDocumentWithToast";

// Export toast hook
export { useToast } from "./useToast";
export type { Toast, ToastType } from "./useToast";
