import type { FastifyRequest, FastifyReply } from "fastify";

const ADMIN_SECRET = process.env.ADMIN_SECRET || "";

export async function adminAuth(request: FastifyRequest, reply: FastifyReply) {
  const secret = request.headers["x-admin-secret"] as string;

  if (!ADMIN_SECRET) {
    reply.code(501).send({ error: "ADMIN_SECRET not configured", code: "NO_ADMIN_SECRET" });
    return;
  }

  if (!secret || secret !== ADMIN_SECRET) {
    reply.code(401).send({ error: "Invalid admin secret", code: "UNAUTHORIZED" });
    return;
  }
}
