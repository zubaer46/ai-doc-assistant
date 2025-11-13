import { useState, useEffect } from "react";
import { FileUpload } from "./components/FileUpload";
import { ChatInterface } from "./components/ChatInterface";
import { DocumentActions } from "./components/DocumentActions";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Toaster } from "./components/ui/toaster";
import { Button } from "./components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./components/ui/card";
import { Separator } from "./components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./components/ui/alert-dialog";
import { ArrowLeftIcon, FileTextIcon, ReloadIcon } from "@radix-ui/react-icons";
import { useToast } from "@/hooks/use-toast";

const SESSION_STORAGE_KEY = "ai-doc-assistant-session";
const DOCUMENT_NAME_STORAGE_KEY = "ai-doc-assistant-document-name";

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [documentUploaded, setDocumentUploaded] = useState(false);
  const [documentName, setDocumentName] = useState<string>("");
  const [showNewDocumentDialog, setShowNewDocumentDialog] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const { toast } = useToast();

  // Load session from localStorage on mount
  useEffect(() => {
    try {
      const savedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
      const savedDocumentName = localStorage.getItem(DOCUMENT_NAME_STORAGE_KEY);

      if (savedSessionId) {
        setSessionId(savedSessionId);
        setDocumentUploaded(true);
        setDocumentName(savedDocumentName || "Document");

        toast({
          title: "Session Restored",
          description: "Your previous session has been restored",
        });
      }
    } catch (error) {
      console.error("Failed to restore session:", error);
    }
  }, [toast]);

  const handleUploadSuccess = (newSessionId: string, filename?: string) => {
    const docName = filename || "Document";

    // Set state
    setSessionId(newSessionId);
    setDocumentUploaded(true);
    setDocumentName(docName);

    // Persist to localStorage
    try {
      localStorage.setItem(SESSION_STORAGE_KEY, newSessionId);
      localStorage.setItem(DOCUMENT_NAME_STORAGE_KEY, docName);
    } catch (error) {
      console.error("Failed to save session:", error);
    }

    // Trigger transition
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);

    // Show success toast
    toast({
      title: "Upload Successful",
      description: `${docName} has been uploaded and is ready for analysis`,
    });

    console.log("Document uploaded with session ID:", newSessionId);
  };

  const handleNewDocumentClick = () => {
    setShowNewDocumentDialog(true);
  };

  const handleConfirmNewDocument = () => {
    // Reset all state
    setSessionId(null);
    setDocumentUploaded(false);
    setDocumentName("");

    // Clear localStorage
    try {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      localStorage.removeItem(DOCUMENT_NAME_STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear session:", error);
    }

    // Close dialog
    setShowNewDocumentDialog(false);

    // Trigger transition
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), 300);

    // Show toast
    toast({
      title: "Session Cleared",
      description: "You can now upload a new document",
    });
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 smooth-transition">
        {/* Sticky Header */}
        <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/95 dark:supports-[backdrop-filter]:bg-gray-950/95 slide-down">
          <div className="container mx-auto px-4 py-4 max-w-7xl">
            <div className="flex items-center justify-between gap-4">
              {/* Left Side - Back Button (when document uploaded) */}
              <div className="flex items-center gap-3">
                {documentUploaded && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNewDocumentClick}
                    className="button-press hover-lift transition-all duration-200 focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  >
                    <ArrowLeftIcon className="mr-2 h-4 w-4" />
                    <span className="hidden sm:inline">New Document</span>
                    <span className="sm:hidden">New</span>
                  </Button>
                )}
              </div>

              {/* Center - Title and Document Info */}
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <FileTextIcon className="w-6 h-6 text-primary hidden sm:block" />
                  <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                    AI Document Assistant
                  </h1>
                </div>
                {documentUploaded && documentName ? (
                  <div className="flex items-center justify-center gap-2 mt-1 fade-in">
                    <span className="text-xs sm:text-sm text-muted-foreground">
                      Current:
                    </span>
                    <span className="text-xs sm:text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-[300px]">
                      {documentName}
                    </span>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Upload, analyze, and interact with your documents using AI
                  </p>
                )}
              </div>

              {/* Right Side - Spacer for balance */}
              <div className="w-[100px] sm:w-[140px]"></div>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl safe-padding">
          <div
            className={`transition-opacity duration-300 ${
              isTransitioning ? "opacity-0" : "opacity-100"
            }`}
          >
            {!documentUploaded ? (
              /* Upload View */
              <div className="flex items-center justify-center min-h-[calc(100vh-12rem)]">
                <FileUpload onUploadSuccess={handleUploadSuccess} />
              </div>
            ) : (
              /* Document Analysis View - Split Layout */
              <div className="space-y-6">
                {/* Actions Panel */}
                <section className="w-full">
                  <DocumentActions
                    sessionId={sessionId!}
                    onAction={(action) => {
                      console.log(`Action triggered: ${action}`);
                      toast({
                        title: "Action Completed",
                        description: `${action} action has been executed`,
                      });
                    }}
                  />
                </section>

                <Separator className="my-6" />

                {/* Chat Interface - Full Width */}
                <section className="w-full">
                  <Card className="border-0 shadow-lg">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-xl">Ask Questions</CardTitle>
                      <CardDescription>
                        Chat with AI about your document
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <div className="mt-4">
                    <ChatInterface
                      sessionId={sessionId!}
                      documentName={documentName}
                    />
                  </div>
                </section>
              </div>
            )}
          </div>
        </main>

        {/* Confirmation Dialog for New Document */}
        <AlertDialog
          open={showNewDocumentDialog}
          onOpenChange={setShowNewDocumentDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <ReloadIcon className="w-5 h-5" />
                Start New Document?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This will clear your current session and conversation history.
                You'll need to upload a new document to continue.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="focus:ring-2 focus:ring-offset-2">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmNewDocument}
                className="focus:ring-2 focus:ring-offset-2"
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Toast Notifications */}
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}

export default App;
