import { comparePassword, hashPassword } from "../utils/hash.js";
import { signJwt } from "../utils/jwt.js";
import { query } from "../db/index.js";
import {
  AdminRecord,
  AuthResponse,
  AuthTokenPayload,
  LoginRequest,
  PublisherRecord,
  RegisterRequest,
  UserRole,
} from "../types/auth.js";
import * as authRepository from "../repositories/auth.repository.js";
import { sendVerificationEmail } from "./verification.service.js";
import { sendTemplateEmail } from "./mailer.service.js";

function buildAuthPayload(userId: string, role: UserRole, email: string): AuthTokenPayload {
  return { sub: userId, role, email, issuedAt: Math.floor(Date.now() / 1000), expiresAt: 0 };
}

export async function login(request: LoginRequest): Promise<AuthResponse> {
  let user: PublisherRecord | AdminRecord | null = null;

  if (request.role === 'admin') {
    user = await authRepository.findAdminByEmail(request.email);
  } else {
    user = await authRepository.findPublisherByEmail(request.email);
  }

  if (!user) {
    throw new Error('Invalid credentials');
  }

  if (!user.is_active) {
    throw new Error('Account is disabled');
  }

  const passwordHash = (user as PublisherRecord | AdminRecord).password_hash;
  const isPasswordValid = await comparePassword(request.password, passwordHash);

  if (!isPasswordValid) {
    throw new Error('Invalid credentials');
  }

  // Publisher-specific status checks — must happen AFTER password verification
  // to avoid leaking account existence information
  if (request.role === 'publisher') {
    const pubUser = user as PublisherRecord;
    const status = pubUser.account_status;

    if (status === 'PENDING') {
      const err = Object.assign(
        new Error('Your account is pending approval. Please wait for an administrator to review your application.'),
        { code: 'ACCOUNT_PENDING' }
      );
      throw err;
    }
    if (status === 'REJECTED' || status === 'DEACTIVATED') {
      const err = Object.assign(
        new Error('Your application has been rejected. Please contact support for more information.'),
        { code: 'ACCOUNT_REJECTED' }
      );
      throw err;
    }
    if (status === 'SUSPENDED') {
      const err = Object.assign(
        new Error('Your account has been suspended. Please contact support.'),
        { code: 'ACCOUNT_SUSPENDED' }
      );
      throw err;
    }
    if (status !== 'ACTIVE') {
      throw new Error('Account is disabled');
    }
  }

  // Check email verification for publishers when required
  if (request.role === 'publisher') {
    const pubUser = user as PublisherRecord;
    if (!pubUser.email_verified) {
      const netResult = await query<{ email_verification_required: boolean }>(
        `SELECT email_verification_required FROM network_settings WHERE id = 1 LIMIT 1`
      );
      const required = netResult.rows[0]?.email_verification_required ?? false;
      if (required) {
        const err = new Error('Please verify your email address before logging in') as Error & {
          code: string;
          email: string;
        };
        err.code = 'EMAIL_NOT_VERIFIED';
        err.email = request.email;
        throw err;
      }
    }
  }

  if (request.role === 'admin') {
    await authRepository.markAdminLastLogin(user.id);
  } else {
    await authRepository.markPublisherLastLogin(user.id);
  }

  const payload = buildAuthPayload(user.id, request.role, request.email);
  const token = signJwt({ sub: payload.sub, role: payload.role, email: payload.email });

  return {
    accessToken: token,
    tokenType: 'Bearer',
    expiresIn: Number(process.env.JWT_EXPIRES_IN_SECONDS || 3600),
  };
}

export async function register(request: RegisterRequest): Promise<PublisherRecord> {
  const existing = await authRepository.findPublisherByEmail(request.email);
  if (existing) {
    throw new Error('Publisher account already exists');
  }

  const passwordHash = await hashPassword(request.password);
  const publisher = await authRepository.createPublisher(request, passwordHash);

  // Non-blocking: send verification + signup notification; failures must not block account creation
  const firstName = (request.fullName ?? '').split(' ')[0] ?? '';
  sendVerificationEmail('publisher', publisher.id, publisher.email, firstName).catch(() => {});
  sendTemplateEmail(publisher.email, 'affiliate_signup', { first_name: firstName, email: publisher.email }).catch(() => {});

  return publisher;
}

export async function updateProfile(
  payload: AuthTokenPayload,
  profileMetadata: Record<string, string | null>
): Promise<PublisherRecord> {
  if (payload.role !== 'publisher') {
    throw new Error('Only publisher profiles can be updated');
  }

  return authRepository.updatePublisherProfileMetadata(payload.sub, profileMetadata);
}

export async function logout(): Promise<void> {
  // JWT is stateless by default. Logout is handled by the client discarding the token.
  return Promise.resolve();
}

export function getCurrentUser(payload: AuthTokenPayload): Promise<PublisherRecord | AdminRecord | null> {
  if (payload.role === 'admin') {
    return authRepository.findAdminByEmail(payload.email);
  }

  return authRepository.findPublisherByEmail(payload.email);
}
