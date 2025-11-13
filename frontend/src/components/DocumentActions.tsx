import { useState } from "react";
import {
  FileTextIcon,
  MagicWandIcon,
  DownloadIcon,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { useToast } from "@/hooks/use-toast";
import {
  useGenerateSummary,
  useSimplifyText,
  useExportNotes,
} from "@/hooks/useDocument";
import { ScrollArea } from "./ui/scroll-area";

interface DocumentActionsProps {
  sessionId: string;
  onAction?: (action: "summary" | "simplify" | "export") => void;
}

export function DocumentActions({ sessionId, onAction }: DocumentActionsProps) {
  const [summaryDialogOpen, setSummaryDialogOpen] = useState(false);
  const [simplifyDialogOpen, setSimplifyDialogOpen] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [textToSimplify, setTextToSimplify] = useState("");
  const [simplifiedText, setSimplifiedText] = useState("");
  const { toast } = useToast();

  // Summary mutation
  const summaryMutation = useGenerateSummary({
    onSuccess: (data) => {
      setSummaryText(data.summary);
      setSummaryDialogOpen(true);
      onAction?.("summary");
      toast({
        title: "Summary Generated",
        description: "Document summary has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Summary Failed",
        description: error.message || "Failed to generate summary",
        variant: "destructive",
      });
    },
  });

  // Simplify mutation
  const simplifyMutation = useSimplifyText({
    onSuccess: (data) => {
      setSimplifiedText(data.simplified);
      toast({
        title: "Text Simplified",
        description: "Your text has been simplified successfully",
      });
      onAction?.("simplify");
    },
    onError: (error) => {
      toast({
        title: "Simplification Failed",
        description: error.message || "Failed to simplify text",
        variant: "destructive",
      });
    },
  });

  // Export mutation
  const exportMutation = useExportNotes({
    onSuccess: () => {
      onAction?.("export");
      toast({
        title: "Export Successful",
        description: "Your Q&A notes have been downloaded",
      });
    },
    onError: (error) => {
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export notes",
        variant: "destructive",
      });
    },
  });

  const handleGenerateSummary = () => {
    summaryMutation.mutate(sessionId);
  };

  const handleSimplifyText = () => {
    if (!textToSimplify.trim()) {
      toast({
        title: "No Text Provided",
        description: "Please enter some text to simplify",
        variant: "destructive",
      });
      return;
    }

    simplifyMutation.mutate({
      sessionId,
      text: textToSimplify,
    });
  };

  const handleExportNotes = () => {
    exportMutation.mutate(sessionId);
  };

  const handleOpenSimplifyDialog = () => {
    setSimplifyDialogOpen(true);
    setTextToSimplify("");
    setSimplifiedText("");
  };

  return (
    <TooltipProvider>
      <div className="w-full max-w-4xl mx-auto fade-in">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {/* Summarize Card */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer group card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-all duration-300">
                      <FileTextIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <CardTitle className="text-lg">Summarize</CardTitle>
                  </div>
                  <CardDescription className="mt-2">
                    Generate AI-powered summary of your document
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleGenerateSummary}
                    disabled={summaryMutation.isPending}
                    className="w-full button-press hover-lift"
                    variant="outline"
                  >
                    {summaryMutation.isPending ? (
                      <>
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileTextIcon className="mr-2 h-4 w-4" />
                        Generate Summary
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Get a concise summary of your entire document</p>
            </TooltipContent>
          </Tooltip>

          {/* Simplify Card */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer group card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 group-hover:bg-amber-200 dark:group-hover:bg-amber-900/50 transition-all duration-300">
                      <MagicWandIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <CardTitle className="text-lg">Simplify</CardTitle>
                  </div>
                  <CardDescription className="mt-2">
                    Simplify complex text into plain language
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleOpenSimplifyDialog}
                    className="w-full button-press hover-lift"
                    variant="outline"
                  >
                    <MagicWandIcon className="mr-2 h-4 w-4" />
                    Simplify Text
                  </Button>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Convert complex text to easy-to-understand language</p>
            </TooltipContent>
          </Tooltip>

          {/* Export Card */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer group card-hover">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 group-hover:bg-green-200 dark:group-hover:bg-green-900/50 transition-all duration-300">
                      <DownloadIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <CardTitle className="text-lg">Export</CardTitle>
                  </div>
                  <CardDescription className="mt-2">
                    Download your Q&A conversation as markdown
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={handleExportNotes}
                    disabled={exportMutation.isPending}
                    className="w-full button-press hover-lift"
                    variant="outline"
                  >
                    {exportMutation.isPending ? (
                      <>
                        <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <DownloadIcon className="mr-2 h-4 w-4" />
                        Export Q&A
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download your conversation history as a markdown file</p>
            </TooltipContent>
          </Tooltip>
        </div>

        {/* Summary Dialog */}
        <Dialog open={summaryDialogOpen} onOpenChange={setSummaryDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileTextIcon className="w-5 h-5 text-blue-600" />
                Document Summary
              </DialogTitle>
              <DialogDescription>
                AI-generated summary of your document
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh] pr-4">
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">
                    {summaryText}
                  </p>
                </div>
                <div className="flex justify-end">
                  <Badge variant="secondary" className="text-xs">
                    Generated by AI
                  </Badge>
                </div>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Simplify Dialog */}
        <Dialog open={simplifyDialogOpen} onOpenChange={setSimplifyDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <MagicWandIcon className="w-5 h-5 text-amber-600" />
                Simplify Text
              </DialogTitle>
              <DialogDescription>
                Enter complex text to convert it into plain language
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <div className="space-y-4">
                {/* Input Section */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Text to Simplify
                  </label>
                  <Textarea
                    value={textToSimplify}
                    onChange={(e) => setTextToSimplify(e.target.value)}
                    placeholder="Paste complex text here..."
                    className="min-h-[120px] resize-none"
                    disabled={simplifyMutation.isPending}
                  />
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleSimplifyText}
                  disabled={
                    !textToSimplify.trim() || simplifyMutation.isPending
                  }
                  className="w-full"
                >
                  {simplifyMutation.isPending ? (
                    <>
                      <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                      Simplifying...
                    </>
                  ) : (
                    <>
                      <MagicWandIcon className="mr-2 h-4 w-4" />
                      Simplify
                    </>
                  )}
                </Button>

                {/* Output Section */}
                {simplifiedText && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">
                        Simplified Text
                      </label>
                      <Badge variant="secondary" className="text-xs">
                        Generated by AI
                      </Badge>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">
                        {simplifiedText}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
