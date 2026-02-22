import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";

export function registerCatalogRoutes(app: FastifyInstance) {
  // GET /api/shades — list active shades (ordered)
  app.get("/api/shades", async () => {
    const shades = await prisma.shade.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        hexColor: true,
        displayOrder: true,
        shopifyVariantId: true,
      },
    });
    return { shades };
  });

  // GET /api/lengths — list active lengths (ordered)
  app.get("/api/lengths", async () => {
    const lengths = await prisma.length.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        label: true,
        inches: true,
        bodyLandmark: true,
        displayOrder: true,
      },
    });
    return { lengths };
  });

  // GET /api/textures — list active textures (ordered)
  app.get("/api/textures", async () => {
    const textures = await prisma.texture.findMany({
      where: { active: true },
      orderBy: { displayOrder: "asc" },
      select: {
        id: true,
        name: true,
        displayOrder: true,
      },
    });
    return { textures };
  });
}
