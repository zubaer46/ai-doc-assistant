import { useState, useEffect, useRef, KeyboardEvent } from "react";
import {
  PaperPlaneIcon,
  PersonIcon,
  RocketIcon,
  ReloadIcon,
} from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { useSendMessage } from "@/hooks/useDocument";
import { cn } from "@/lib/utils";
import { TypingIndicator } from "./TypingIndicator";
import { EmptyState } from "./EmptyState";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  timestamp: Date;
}

interface ChatInterfaceProps {
  sessionId: string;
  documentName: string;
}

export function ChatInterface({ sessionId, documentName }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  const sendMessageMutation = useSendMessage({
    onSuccess: (data) => {
      setIsTyping(false);

      // Add AI response to messages
      const aiMessage: Message = {
        role: "assistant",
        content: data.answer,
        citations: data.citations,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    },
    onError: (error) => {
      setIsTyping(false);
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputValue]);

  const handleSendMessage = () => {
    if (!inputValue.trim() || sendMessageMutation.isPending) return;

    const userMessage: Message = {
      role: "user",
      content: inputValue.trim(),
      timestamp: new Date(),
    };

    // Optimistic update: add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);

    // Convert messages to backend format
    const history = messages.map((msg) => ({
      role: msg.role === "assistant" ? ("model" as const) : ("user" as const),
      content: msg.content,
    }));

    // Send message to backend
    sendMessageMutation.mutate({
      sessionId,
      question: userMessage.content,
      history,
    });
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages([]);
    toast({
      title: "Chat Cleared",
      description: "Conversation history has been reset",
    });
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col card-hover">
      <CardHeader className="border-b flex-shrink-0 slide-down">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl sm:text-2xl">
              Chat with Document
            </CardTitle>
            <CardDescription className="mt-1 truncate">
              {documentName}
            </CardDescription>
          </div>
          {messages.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearChat}
              className="ml-4 flex-shrink-0 button-press hover-lift"
            >
              <ReloadIcon className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {/* Messages Area */}
        <ScrollArea
          ref={scrollAreaRef}
          className="flex-1 p-4 sm:p-6 custom-scrollbar"
        >
          {messages.length === 0 && !isTyping ? (
            // Empty State
            <div className="flex items-center justify-center h-full">
              <EmptyState
                icon={<RocketIcon className="h-12 w-12 text-primary" />}
                title="Ask a Question"
                description="Start a conversation about your document. Ask questions, request summaries, or get explanations."
              />
            </div>
          ) : (
            // Messages List
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex gap-3 items-start message-animate",
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  {/* Avatar */}
                  <Avatar className="flex-shrink-0 h-8 w-8 border-2 border-primary/10">
                    <AvatarFallback
                      className={cn(
                        "transition-colors duration-200",
                        message.role === "user"
                          ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white"
                          : "bg-gradient-to-br from-blue-500 to-purple-600 text-white"
                      )}
                    >
                      {message.role === "user" ? (
                        <PersonIcon className="w-4 h-4" />
                      ) : (
                        <RocketIcon className="w-4 h-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  {/* Message Content */}
                  <div
                    className={cn(
                      "flex flex-col gap-2 max-w-[80%] sm:max-w-[70%]",
                      message.role === "user" ? "items-end" : "items-start"
                    )}
                  >
                    <div
                      className={cn(
                        "rounded-lg px-4 py-2 shadow-sm transition-all duration-200 hover:shadow-md",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      <p className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                        {message.content}
                      </p>
                    </div>

                    {/* Citations */}
                    {message.citations && message.citations.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {message.citations.map((citation, idx) => (
                          <Badge
                            key={idx}
                            variant="outline"
                            className="text-xs hover:bg-accent transition-colors duration-200"
                          >
                            {citation}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {/* Timestamp */}
                    <span className="text-xs text-muted-foreground">
                      {formatTimestamp(message.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && <TypingIndicator />}
            </div>
          )}
        </ScrollArea>

        {/* Input Section */}
        <div className="border-t p-4 sm:p-6 bg-background flex-shrink-0">
          <div className="flex gap-2 items-end">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask a question about your document..."
              disabled={sendMessageMutation.isPending}
              className="min-h-[60px] max-h-[200px] resize-none transition-all duration-200 focus:ring-2"
              rows={1}
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || sendMessageMutation.isPending}
              size="icon"
              className="h-[60px] w-[60px] flex-shrink-0 button-press hover-lift transition-all duration-200"
            >
              <PaperPlaneIcon className="h-5 w-5" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift + Enter for new line
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
