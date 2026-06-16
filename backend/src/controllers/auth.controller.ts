import { Request, Response, NextFunction } from 'express';
import * as authService from "../services/auth.service.js";
import { AdminRecord, AuthRequest, LoginRequest, PublisherRecord, RegisterRequest } from "../types/auth.js";

function formatUserResponse(user: PublisherRecord | AdminRecord, role: string) {
  const profileMetadata = 'profile_metadata' in user && user.profile_metadata ? user.profile_metadata : {};

  return {
    id: user.id,
    email: user.email,
    role,
    adminRole: role === 'admin' && 'role' in user ? (user as AdminRecord).role : undefined,
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
  } catch (error: unknown) {
    const err = error as { message?: string; code?: string; email?: string };
    if (err.code === 'EMAIL_NOT_VERIFIED') {
      res.status(403).json({
        code: 'EMAIL_NOT_VERIFIED',
        message: err.message ?? 'Please verify your email address',
        email: err.email,
      });
      return;
    }
    if (err.code === 'ACCOUNT_PENDING') {
      res.status(403).json({ code: 'ACCOUNT_PENDING', message: err.message });
      return;
    }
    if (err.code === 'ACCOUNT_REJECTED') {
      res.status(403).json({ code: 'ACCOUNT_REJECTED', message: err.message });
      return;
    }
    if (err.code === 'ACCOUNT_SUSPENDED') {
      res.status(403).json({ code: 'ACCOUNT_SUSPENDED', message: err.message });
      return;
    }
    if (err.message === 'Invalid credentials' || err.message === 'Account is disabled') {
      res.status(401).json({ message: err.message });
      return;
    }
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

export async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email || typeof email !== 'string') {
    res.status(400).json({ message: 'Email is required' });
    return;
  }
  try {
    const { requestPasswordReset } = await import('../services/password-reset.service.js');
    await requestPasswordReset(email.trim().toLowerCase());
  } catch (_) { /* silent — never reveal whether email exists */ }
  res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
}

export async function doResetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    const { token, password } = req.body as { token?: string; password?: string };
    if (!token || typeof token !== 'string') {
      res.status(400).json({ message: 'Reset token is required' });
      return;
    }
    if (!password || typeof password !== 'string') {
      res.status(400).json({ message: 'New password is required' });
      return;
    }
    const { resetPassword } = await import('../services/password-reset.service.js');
    await resetPassword(token, password);
    res.status(200).json({ message: 'Password reset successfully. You can now log in.' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Reset failed';
    res.status(400).json({ message: msg });
  }
}
