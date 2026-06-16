import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from "../types/auth.js";
import * as svc from "../services/signup-questions.service.js";
import { CreateQuestionPayload, UpdateQuestionPayload } from "../types/signup-questions.js";

export async function handleListPublic(req: Request, res: Response, next: NextFunction) {
  try {
    const role = req.query.role as string | undefined;
    if (role !== 'publisher' && role !== 'advertiser') {
      res.status(400).json({ message: 'role must be publisher or advertiser' });
      return;
    }
    const questions = await svc.listPublic(role);
    res.json({ questions });
  } catch (error) {
    next(error);
  }
}

export async function handleListAll(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const questions = await svc.listAll();
    res.json({ questions });
  } catch (error) {
    next(error);
  }
}

export async function handleCreate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const body = req.body as CreateQuestionPayload;
    const question = await svc.create(body);
    res.status(201).json({ question });
  } catch (error) {
    if (error instanceof Error && !error.message.includes('not found')) {
      res.status(400).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function handleUpdate(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ message: 'Invalid question id' }); return; }
    const body = req.body as UpdateQuestionPayload;
    const question = await svc.update(id, body);
    res.json({ question });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Question not found') { res.status(404).json({ message: error.message }); return; }
      res.status(400).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function handleDelete(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) { res.status(400).json({ message: 'Invalid question id' }); return; }
    await svc.remove(id);
    res.status(204).send();
  } catch (error) {
    if (error instanceof Error && error.message === 'Question not found') {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function handleSubmitResponses(req: Request, res: Response, next: NextFunction) {
  try {
    const { publisher_id, advertiser_id, responses } = req.body as {
      publisher_id?: string;
      advertiser_id?: string;
      responses?: unknown[];
    };
    if (!Array.isArray(responses)) {
      res.status(400).json({ message: 'responses must be an array' });
      return;
    }
    await svc.submitResponses(publisher_id, advertiser_id, responses as import("../types/signup-questions.js").QuestionResponseInput[]);
    res.status(201).json({ saved: responses.length });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
      return;
    }
    next(error);
  }
}
