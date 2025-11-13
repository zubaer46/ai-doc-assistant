import OpenAI from "openai";
import {
  ConversationMessage,
  QuestionAnswerResult,
  AIServiceResult,
} from "../types";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "",
});

/**
 * Analyze and store document context for further processing
 * @param documentText - The full text content of the document
 * @returns Analysis result with success status
 */
export async function analyzeDocument(
  documentText: string
): Promise<AIServiceResult<string>> {
  try {
    if (!documentText || documentText.trim().length === 0) {
      return {
        success: false,
        error: "Document text is empty",
      };
    }

    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OPENAI_API_KEY is not configured",
      };
    }

    const prompt = `Analyze the following document and provide a brief overview of its structure and main topics:

${documentText}

Please provide:
1. Document type and structure
2. Main topics covered
3. Key sections identified`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant that analyzes documents and provides structured insights.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const analysis = completion.choices[0]?.message?.content || "";

    return {
      success: true,
      data: analysis,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      error: `Failed to analyze document: ${errorMessage}`,
    };
  }
}

/**
 * Ask a question about the document with conversation history
 * @param question - The user's question
 * @param documentText - The full document text for context
 * @param conversationHistory - Previous conversation messages
 * @returns Answer with citations
 */
export async function askQuestion(
  question: string,
  documentText: string,
  conversationHistory: ConversationMessage[] = []
): Promise<AIServiceResult<QuestionAnswerResult>> {
  try {
    if (!question || question.trim().length === 0) {
      return {
        success: false,
        error: "Question cannot be empty",
      };
    }

    if (!documentText || documentText.trim().length === 0) {
      return {
        success: false,
        error: "Document text is empty",
      };
    }

    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OPENAI_API_KEY is not configured",
      };
    }

    // Build messages array
    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `You are an AI assistant helping users understand a document. Answer questions based on the document content provided.

DOCUMENT CONTENT:
${documentText}

INSTRUCTIONS:
1. Answer the question accurately based on the document content
2. Include specific citations by referencing paragraph numbers or sections
3. If the answer spans multiple sections, cite all relevant parts
4. If the information is not in the document, clearly state that
5. Format citations as [Paragraph X] or [Section Y]

Please provide your answer with citations in the format:
ANSWER: [Your detailed answer here]
CITATIONS: [List of specific paragraph numbers or sections referenced]`,
      },
    ];

    // Add conversation history
    conversationHistory.forEach((msg) => {
      messages.push({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.content,
      });
    });

    // Add current question
    messages.push({
      role: "user",
      content: question,
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 1500,
    });

    const fullResponse = completion.choices[0]?.message?.content || "";

    // Parse answer and citations
    const answerMatch = fullResponse.match(
      /ANSWER:\s*([\s\S]*?)(?=CITATIONS:|$)/i
    );
    const citationsMatch = fullResponse.match(/CITATIONS:\s*([\s\S]*?)$/i);

    const answer = answerMatch ? answerMatch[1].trim() : fullResponse;
    const citationsText = citationsMatch ? citationsMatch[1].trim() : "";

    // Extract citation references
    const citations: string[] = [];
    if (citationsText) {
      const citationMatches = citationsText.match(/\[([^\]]+)\]/g);
      if (citationMatches) {
        citationMatches.forEach((match) => {
          const citation = match.replace(/[\[\]]/g, "").trim();
          if (citation && !citations.includes(citation)) {
            citations.push(citation);
          }
        });
      }
    }

    // If no citations found in structured format, extract from answer
    if (citations.length === 0) {
      const inlineMatches = answer.match(/\[([^\]]+)\]/g);
      if (inlineMatches) {
        inlineMatches.forEach((match) => {
          const citation = match.replace(/[\[\]]/g, "").trim();
          if (citation && !citations.includes(citation)) {
            citations.push(citation);
          }
        });
      }
    }

    return {
      success: true,
      data: {
        answer: answer,
        citations: citations,
      },
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      error: `Failed to answer question: ${errorMessage}`,
    };
  }
}

/**
 * Generate a concise summary of the document
 * @param documentText - The full document text
 * @returns Document summary
 */
export async function generateSummary(
  documentText: string
): Promise<AIServiceResult<string>> {
  try {
    if (!documentText || documentText.trim().length === 0) {
      return {
        success: false,
        error: "Document text is empty",
      };
    }

    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OPENAI_API_KEY is not configured",
      };
    }

    const prompt = `Please provide a concise summary of the following document. Include:
1. Main purpose or objective
2. Key points (3-5 bullet points)
3. Important conclusions or takeaways

Document:
${documentText}

Summary:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant that creates clear and concise document summaries.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    const summary = completion.choices[0]?.message?.content || "";

    return {
      success: true,
      data: summary,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      error: `Failed to generate summary: ${errorMessage}`,
    };
  }
}

/**
 * Simplify and explain complex text sections
 * @param text - The complex text to simplify
 * @param documentText - Full document for additional context
 * @returns Simplified explanation
 */
export async function simplifyText(
  text: string,
  documentText: string
): Promise<AIServiceResult<string>> {
  try {
    if (!text || text.trim().length === 0) {
      return {
        success: false,
        error: "Text to simplify cannot be empty",
      };
    }

    if (!process.env.OPENAI_API_KEY) {
      return {
        success: false,
        error: "OPENAI_API_KEY is not configured",
      };
    }

    const prompt = `You are helping users understand complex documents. Please simplify and explain the following text section in plain, easy-to-understand language.

FULL DOCUMENT CONTEXT:
${documentText}

COMPLEX TEXT TO SIMPLIFY:
${text}

INSTRUCTIONS:
1. Explain in simple terms that anyone can understand
2. Break down technical jargon or complex concepts
3. Use analogies or examples if helpful
4. Keep the explanation concise but complete
5. Maintain accuracy while simplifying

Simplified Explanation:`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant that explains complex text in simple, easy-to-understand language.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const simplifiedText = completion.choices[0]?.message?.content || "";

    return {
      success: true,
      data: simplifiedText,
    };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";
    return {
      success: false,
      error: `Failed to simplify text: ${errorMessage}`,
    };
  }
}
