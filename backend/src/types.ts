import type { FastifyRequest, FastifyReply } from "fastify";

// API Error response format
export interface ApiError {
  error: string;
  code: string;
  retryable: boolean;
}

// Admin request with verified secret
export interface AdminRequest extends FastifyRequest {
  adminVerified: boolean;
}
