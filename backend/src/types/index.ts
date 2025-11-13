export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}

export type AllowedMimeType =
  | "application/pdf"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "text/plain";

export type AllowedFileExtension = ".pdf" | ".docx" | ".txt";

export const ALLOWED_MIME_TYPES: AllowedMimeType[] = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export const ALLOWED_EXTENSIONS: AllowedFileExtension[] = [
  ".pdf",
  ".docx",
  ".txt",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

// Document processing types
export interface ProcessDocumentResult {
  success: boolean;
  text: string;
  error?: string;
}

// AI service types
export interface ConversationMessage {
  role: "user" | "model";
  content: string;
}

export interface QuestionAnswerResult {
  answer: string;
  citations: string[];
}

export interface AIServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Session storage types
export interface DocumentSession {
  sessionId: string;
  filename: string;
  filepath: string;
  mimetype: string;
  text: string;
  uploadedAt: Date;
  conversationHistory: ConversationMessage[];
}

// API Request/Response types
export interface UploadResponse {
  sessionId: string;
  filename: string;
  preview: string;
  message: string;
}

export interface ChatRequest {
  sessionId: string;
  question: string;
}

export interface ChatResponse {
  answer: string;
  citations: string[];
  conversationHistory: ConversationMessage[];
}

export interface SummarizeRequest {
  sessionId: string;
}

export interface SummarizeResponse {
  summary: string;
}

export interface SimplifyRequest {
  sessionId: string;
  text: string;
}

export interface SimplifyResponse {
  simplified: string;
}

export interface ExportNotesResponse {
  markdown: string;
  filename: string;
}

export interface ErrorResponse {
  error: string;
  message: string;
}
