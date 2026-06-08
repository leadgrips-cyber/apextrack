import { comparePassword, hashPassword } from "../utils/hash.js";
import { signJwt } from "../utils/jwt.js";
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
  return authRepository.createPublisher(request, passwordHash);
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
