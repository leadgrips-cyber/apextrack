import { AuthRequest } from "./auth.js";

// Request shape after successful Publisher API key authentication.
// Reuses the same `user` payload shape as JWT auth so existing per-request
// conventions (req.user.sub === publisherId) stay consistent across the app.
export interface PublisherApiRequest extends AuthRequest {
  apiKeyScopes?: string[];
}

export interface DateRangeQuery {
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
}
