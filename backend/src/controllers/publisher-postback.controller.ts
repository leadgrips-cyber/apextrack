import { NextFunction, Response } from 'express';
import { AuthRequest } from "../types/auth.js";
import {
  createPublisherPostback,
  deletePublisherPostback,
  getPublisherPostback,
  listPublisherPostbacks,
  updatePublisherPostback,
} from "../services/publisher-postback.service.js";
import { PublisherPostbackCreatePayload, PublisherPostbackUpdatePayload } from "../types/publisherPostback.js";

export async function handleCreatePublisherPostback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user?.sub;
    if (!publisherId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const payload = req.body as PublisherPostbackCreatePayload;
    const postback = await createPublisherPostback(publisherId, payload);
    res.status(201).json({ postback });
  } catch (error) {
    next(error);
  }
}

export async function handleListPublisherPostbacks(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user?.sub;
    if (!publisherId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const postbacks = await listPublisherPostbacks(publisherId);
    res.json({ postbacks });
  } catch (error) {
    next(error);
  }
}

export async function handleGetPublisherPostback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user?.sub;
    if (!publisherId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const postback = await getPublisherPostback(publisherId, req.params.id);
    res.json({ postback });
  } catch (error) {
    next(error);
  }
}

export async function handleUpdatePublisherPostback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user?.sub;
    if (!publisherId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const payload = req.body as PublisherPostbackUpdatePayload;
    const postback = await updatePublisherPostback(publisherId, req.params.id, payload);
    res.json({ postback });
  } catch (error) {
    next(error);
  }
}

export async function handleDeletePublisherPostback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const publisherId = req.user?.sub;
    if (!publisherId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    await deletePublisherPostback(publisherId, req.params.id);
    res.status(204).end();
  } catch (error) {
    next(error);
  }
}
