import multer, { FileFilterCallback } from "multer";
import path from "path";
import { Request } from "express";
import {
  ALLOWED_EXTENSIONS,
  ALLOWED_MIME_TYPES,
  MAX_FILE_SIZE,
} from "../types";

// Configure storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, "uploads/");
  },
  filename: (_req, file, cb) => {
    // Generate filename with timestamp and original name
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9-_]/g, "_");
    cb(null, `${sanitizedName}_${timestamp}${ext}`);
  },
});

// File filter function for validation
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
): void => {
  const ext = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;

  // Check file extension
  if (!ALLOWED_EXTENSIONS.includes(ext as any)) {
    cb(
      new Error(
        `Invalid file type. Only ${ALLOWED_EXTENSIONS.join(
          ", "
        )} files are allowed.`
      )
    );
    return;
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(mimetype as any)) {
    cb(new Error(`Invalid MIME type. File must be PDF, DOCX, or TXT.`));
    return;
  }

  cb(null, true);
};

// Create multer instance with configuration
export const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: MAX_FILE_SIZE, // 10MB
  },
  fileFilter: fileFilter,
});

// Error handler middleware for multer errors
export const handleMulterError = (
  err: any,
  _req: Request,
  res: any,
  next: any
): void => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(400).json({
        error: "File too large",
        message: `File size must not exceed ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      });
      return;
    }
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      res.status(400).json({
        error: "Unexpected field",
        message: "Unexpected file field in request",
      });
      return;
    }
    res.status(400).json({
      error: "Upload error",
      message: err.message,
    });
    return;
  }

  if (err) {
    res.status(400).json({
      error: "File validation error",
      message: err.message,
    });
    return;
  }

  next();
};
