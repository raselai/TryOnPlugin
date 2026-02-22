import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";
import { adminAuth } from "../middleware/adminAuth.js";

export function registerAdminRoutes(app: FastifyInstance) {
  // Admin login check
  app.post("/api/admin/login", { preHandler: [adminAuth] }, async () => {
    return { ok: true };
  });

  // --- Shade CRUD ---

  app.get("/api/admin/shades", { preHandler: [adminAuth] }, async () => {
    const shades = await prisma.shade.findMany({ orderBy: { displayOrder: "asc" } });
    return { shades };
  });

  app.post("/api/admin/shades", { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as { name: string; hexColor: string; displayOrder?: number; shopifyVariantId?: string };
    if (!body.name || !body.hexColor) {
      reply.code(400);
      return { error: "name and hexColor are required" };
    }
    const shade = await prisma.shade.create({
      data: {
        name: body.name,
        hexColor: body.hexColor,
        displayOrder: body.displayOrder ?? 0,
        shopifyVariantId: body.shopifyVariantId,
      },
    });
    return { shade };
  });

  app.put("/api/admin/shades/:id", { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { name?: string; hexColor?: string; displayOrder?: number; shopifyVariantId?: string; active?: boolean };
    try {
      const shade = await prisma.shade.update({ where: { id }, data: body });
      return { shade };
    } catch {
      reply.code(404);
      return { error: "Shade not found" };
    }
  });

  app.delete("/api/admin/shades/:id", { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.shade.delete({ where: { id } });
      return { success: true };
    } catch {
      reply.code(404);
      return { error: "Shade not found" };
    }
  });

  // --- Length CRUD ---

  app.get("/api/admin/lengths", { preHandler: [adminAuth] }, async () => {
    const lengths = await prisma.length.findMany({ orderBy: { displayOrder: "asc" } });
    return { lengths };
  });

  app.post("/api/admin/lengths", { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as { label: string; inches: number; bodyLandmark: string; displayOrder?: number };
    if (!body.label || !body.inches || !body.bodyLandmark) {
      reply.code(400);
      return { error: "label, inches, and bodyLandmark are required" };
    }
    const length = await prisma.length.create({
      data: {
        label: body.label,
        inches: body.inches,
        bodyLandmark: body.bodyLandmark,
        displayOrder: body.displayOrder ?? 0,
      },
    });
    return { length };
  });

  app.put("/api/admin/lengths/:id", { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { label?: string; inches?: number; bodyLandmark?: string; displayOrder?: number; active?: boolean };
    try {
      const length = await prisma.length.update({ where: { id }, data: body });
      return { length };
    } catch {
      reply.code(404);
      return { error: "Length not found" };
    }
  });

  app.delete("/api/admin/lengths/:id", { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.length.delete({ where: { id } });
      return { success: true };
    } catch {
      reply.code(404);
      return { error: "Length not found" };
    }
  });

  // --- Texture CRUD ---

  app.get("/api/admin/textures", { preHandler: [adminAuth] }, async () => {
    const textures = await prisma.texture.findMany({ orderBy: { displayOrder: "asc" } });
    return { textures };
  });

  app.post("/api/admin/textures", { preHandler: [adminAuth] }, async (request, reply) => {
    const body = request.body as { name: string; displayOrder?: number };
    if (!body.name) {
      reply.code(400);
      return { error: "name is required" };
    }
    const texture = await prisma.texture.create({
      data: {
        name: body.name,
        displayOrder: body.displayOrder ?? 0,
      },
    });
    return { texture };
  });

  app.put("/api/admin/textures/:id", { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    const body = request.body as { name?: string; displayOrder?: number; active?: boolean };
    try {
      const texture = await prisma.texture.update({ where: { id }, data: body });
      return { texture };
    } catch {
      reply.code(404);
      return { error: "Texture not found" };
    }
  });

  app.delete("/api/admin/textures/:id", { preHandler: [adminAuth] }, async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.texture.delete({ where: { id } });
      return { success: true };
    } catch {
      reply.code(404);
      return { error: "Texture not found" };
    }
  });
}
