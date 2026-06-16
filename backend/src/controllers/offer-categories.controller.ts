import { NextFunction, Request, Response } from "express";
import * as service from "../services/offer-categories.service.js";

export async function handleListCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const activeOnly = req.query.active === "true";
    const categories = await service.listCategories(activeOnly);
    res.json({ categories });
  } catch (error) {
    next(error);
  }
}

export async function handleCreateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { name } = req.body;
    const category = await service.createCategory(name);
    res.status(201).json({ category });
  } catch (error: any) {
    if (error?.code === "DUPLICATE") {
      res.status(409).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function handleUpdateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { name, is_active } = req.body;
    const category = await service.updateCategory(id, { name, is_active });
    res.json({ category });
  } catch (error: any) {
    if (error?.code === "DUPLICATE") {
      res.status(409).json({ message: error.message });
      return;
    }
    if (error?.message === "Category not found") {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}

export async function handleDeleteCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    await service.deleteCategory(id);
    res.json({ success: true });
  } catch (error: any) {
    if (error?.message === "Category not found") {
      res.status(404).json({ message: error.message });
      return;
    }
    next(error);
  }
}
