import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { FileIcon, UploadIcon } from "@radix-ui/react-icons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useUploadDocument } from "@/hooks/useDocument";

interface FileUploadProps {
  onUploadSuccess: (sessionId: string, filename?: string) => void;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
const ACCEPTED_TYPES = [".pdf", ".docx", ".txt"];
const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const uploadMutation = useUploadDocument({
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: `${data.filename} uploaded successfully`,
      });
      onUploadSuccess(data.sessionId, data.filename);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload document",
        variant: "destructive",
      });
    },
  });

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File Too Large",
        description: `File size must be less than 10MB. Your file is ${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)}MB`,
        variant: "destructive",
      });
      return false;
    }

    // Check file type
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!ACCEPTED_TYPES.includes(fileExtension)) {
      toast({
        title: "Invalid File Type",
        description: `Only ${ACCEPTED_TYPES.join(", ")} files are accepted`,
        variant: "destructive",
      });
      return false;
    }

    // Check MIME type
    if (!ACCEPTED_MIME_TYPES.includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: `Only PDF, DOCX, and TXT files are accepted`,
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleFileSelect = (file: File) => {
    if (validateFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto fade-in card-hover">
      <CardHeader className="slide-down">
        <CardTitle className="text-2xl">Upload Document</CardTitle>
        <CardDescription>
          Upload a PDF, DOCX, or TXT file to get started (max 10MB)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drag and Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleBrowseClick}
          className={`
            relative border-2 border-dashed rounded-lg p-8 sm:p-12 
            transition-all duration-300 cursor-pointer
            hover:border-primary hover:bg-accent/50 hover:scale-[1.01]
            ${
              isDragging
                ? "border-primary bg-accent/50 scale-[1.02] shadow-lg"
                : "border-muted-foreground/25"
            }
            ${uploadMutation.isPending ? "pointer-events-none opacity-50" : ""}
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(",")}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={uploadMutation.isPending}
          />

          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div
              className={`p-4 rounded-full bg-primary/10 transition-transform duration-300 ${
                isDragging ? "scale-110" : ""
              }`}
            >
              <FileIcon className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
            </div>

            <div className="space-y-2">
              <Label className="text-base sm:text-lg font-medium cursor-pointer">
                Drag & drop your document here
              </Label>
              <p className="text-sm text-muted-foreground">
                or click to browse
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
              <Badge
                variant="secondary"
                className="hover:bg-secondary/80 transition-colors duration-200"
              >
                .pdf
              </Badge>
              <Badge
                variant="secondary"
                className="hover:bg-secondary/80 transition-colors duration-200"
              >
                .docx
              </Badge>
              <Badge
                variant="secondary"
                className="hover:bg-secondary/80 transition-colors duration-200"
              >
                .txt
              </Badge>
            </div>
          </div>
        </div>

        {/* Selected File Display */}
        {selectedFile && !uploadMutation.isPending && (
          <div className="flex items-center justify-between p-4 bg-accent/50 rounded-lg scale-in">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <FileIcon className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <Badge variant="outline" className="ml-2 flex-shrink-0">
              Ready
            </Badge>
          </div>
        )}

        {/* Upload Progress */}
        {uploadMutation.isPending && (
          <div className="space-y-3 scale-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileIcon className="w-5 h-5 text-primary loading-pulse" />
                <div>
                  <p className="text-sm font-medium">
                    {selectedFile?.name || "Uploading..."}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Processing document...
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="loading-pulse">
                Uploading
              </Badge>
            </div>
            <Progress value={undefined} className="h-2" />
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploadMutation.isPending}
          className="w-full button-press hover-lift transition-all duration-200"
          size="lg"
        >
          {uploadMutation.isPending ? (
            <>
              <UploadIcon className="mr-2 h-4 w-4 loading-pulse" />
              Uploading...
            </>
          ) : (
            <>
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload Document
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
