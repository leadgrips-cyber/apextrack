import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import crypto from 'crypto';
import { authenticateJwt } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";
import { handleUploadOfferLogo, handleUploadCreative } from "../controllers/upload.controller.js";

const storage = multer.diskStorage({
  destination: path.join(process.cwd(), 'uploads', 'offer-logos'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/png', 'image/jpeg', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PNG, JPG, JPEG, and WEBP images are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 },
});

const creativeStorage = multer.diskStorage({
  destination: path.join(process.cwd(), 'uploads', 'creatives'),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${crypto.randomUUID()}${ext}`);
  },
});

const creativeFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PNG, JPG, WEBP, and GIF images are allowed'));
  }
};

const uploadCreative = multer({
  storage: creativeStorage,
  fileFilter: creativeFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const router = Router();
router.use(authenticateJwt);
router.post('/offer-logo', authorizeRoles('admin'), upload.single('logo'), handleUploadOfferLogo);
router.post('/creative', authorizeRoles('admin'), uploadCreative.single('file'), handleUploadCreative);

export default router;
