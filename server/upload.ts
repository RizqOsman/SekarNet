import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(process.cwd(), 'uploads');
const paymentProofsDir = path.join(uploadsDir, 'payment-proofs');
const supportAttachmentsDir = path.join(uploadsDir, 'support-attachments');
const installationPhotosDir = path.join(uploadsDir, 'installation-photos');

[uploadsDir, paymentProofsDir, supportAttachmentsDir, installationPhotosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure storage for different file types
const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => {
    // Determine destination based on route or file type
    if (req.path.includes('payment-proof')) {
      cb(null, paymentProofsDir);
    } else if (req.path.includes('support')) {
      cb(null, supportAttachmentsDir);
    } else if (req.path.includes('installation')) {
      cb(null, installationPhotosDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter function
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allowed file types
  const allowedTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: ${allowedTypes.join(', ')}`));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files per request
  }
});

// Specific upload configurations
export const paymentProofUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, paymentProofsDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `payment-proof-${uniqueSuffix}${ext}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed for payment proof'));
    }
  },
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for payment proof
    files: 1 // Only 1 file for payment proof
  }
});

export const supportAttachmentUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, supportAttachmentsDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `support-attachment-${uniqueSuffix}${ext}`);
    }
  }),
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for support attachments
    files: 5 // Maximum 5 files for support tickets
  }
});

export const installationPhotoUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, installationPhotosDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      cb(null, `installation-photo-${uniqueSuffix}${ext}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG and PNG files are allowed for installation photos'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for installation photos
    files: 10 // Maximum 10 photos for installation
  }
});

// Helper function to get file URL
export const getFileUrl = (filename: string, type: 'payment-proof' | 'support-attachment' | 'installation-photo' = 'payment-proof') => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  return `${baseUrl}/uploads/${type}/${filename}`;
};

// Helper function to delete file
export const deleteFile = (filepath: string) => {
  try {
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

// Helper function to get file info
export const getFileInfo = (filepath: string) => {
  try {
    if (fs.existsSync(filepath)) {
      const stats = fs.statSync(filepath);
      return {
        exists: true,
        size: stats.size,
        created: stats.birthtime,
        modified: stats.mtime
      };
    }
    return { exists: false };
  } catch (error) {
    console.error('Error getting file info:', error);
    return { exists: false };
  }
};

export default upload; 