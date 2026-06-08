import { Request, Response, NextFunction } from 'express';
import * as authService from "../services/auth.service.js";
import { AdminRecord, AuthRequest, LoginRequest, PublisherRecord, RegisterRequest } from "../types/auth.js";

function formatUserResponse(user: PublisherRecord | AdminRecord, role: string) {
  const profileMetadata = 'profile_metadata' in user && user.profile_metadata ? user.profile_metadata : {};

  return {
    id: user.id,
    email: user.email,
    role,
    fullName: 'full_name' in user ? user.full_name : undefined,
    loginName: 'login_name' in user ? user.login_name : undefined,
    companyName: 'company_name' in user ? user.company_name : undefined,
    accountStatus: 'account_status' in user ? user.account_status : undefined,
    approvalStatus: 'approval_status' in user ? user.approval_status : undefined,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
    phone: profileMetadata.phone || '',
    website: profileMetadata.website || '',
    telegram: profileMetadata.telegram || '',
    teamsId: profileMetadata.teamsId || '',
    whatsapp: profileMetadata.whatsapp || '',
    address: profileMetadata.address || '',
    city: profileMetadata.city || '',
    stateName: profileMetadata.stateName || '',
    country: profileMetadata.country || '',
    postalCode: profileMetadata.postalCode || '',
  };
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const loginRequest = req.body as LoginRequest;
    const authResponse = await authService.login(loginRequest);
    res.status(200).json(authResponse);
  } catch (error) {
    next(error);
  }
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const registerRequest = req.body as RegisterRequest;
    const publisher = await authService.register(registerRequest);
    res.status(201).json({
      id: publisher.id,
      email: publisher.email,
      loginName: publisher.login_name,
      fullName: publisher.full_name,
      companyName: publisher.company_name,
      affiliateCode: publisher.affiliate_code,
      accountStatus: publisher.account_status,
      approvalStatus: publisher.approval_status,
      createdAt: publisher.created_at,
      updatedAt: publisher.updated_at,
    });
  } catch (error) {
    next(error);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await authService.logout();
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const profileMetadata = req.body as Record<string, string | null>;
    const updatedPublisher = await authService.updateProfile(req.user, profileMetadata);

    res.status(200).json(formatUserResponse(updatedPublisher, req.user.role));
  } catch (error) {
    next(error);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await authService.getCurrentUser(req.user);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.status(200).json(formatUserResponse(user, req.user.role));
  } catch (error) {
    next(error);
  }
}
