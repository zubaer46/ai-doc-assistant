// Document types
export interface Document {
  sessionId: string;
  filename: string;
  preview: string;
  uploadedAt?: Date;
}

// Message types for chat
export interface Message {
  role: "user" | "model";
  content: string;
}

// API Response types
export interface UploadResponse {
  sessionId: string;
  filename: string;
  preview: string;
  message: string;
}

export interface ChatResponse {
  answer: string;
  citations: string[];
  conversationHistory: Message[];
}

export interface SummarizeResponse {
  summary: string;
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

// API Request types
export interface ChatRequest {
  sessionId: string;
  question: string;
}

export interface SummarizeRequest {
  sessionId: string;
}

export interface SimplifyRequest {
  sessionId: string;
  text: string;
}

// Generic API Response wrapper
export interface ApiResponse<T> {
  data?: T;
  error?: ErrorResponse;
}
