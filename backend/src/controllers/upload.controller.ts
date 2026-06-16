import { Response, NextFunction } from 'express';
import { AuthRequest } from "../types/auth.js";

export function handleUploadOfferLogo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/offer-logos/${req.file.filename}`;
    res.json({ url });
  } catch (error) {
    next(error);
  }
}

export function handleUploadCreative(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' });
      return;
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/creatives/${req.file.filename}`;
    res.json({ url });
  } catch (error) {
    next(error);
  }
}
