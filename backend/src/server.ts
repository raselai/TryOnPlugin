import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { GoogleGenAI } from "@google/genai";
import { withRetry } from "./utils/retry.js";
import { prisma } from "./db.js";
import { registerCatalogRoutes } from "./routes/catalog.js";
import { registerAdminRoutes } from "./routes/admin.js";
import { tryOnRateLimit } from "./middleware/rateLimit.js";

const PORT = Number(process.env.PORT || 8787);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const REQUEST_TIMEOUT = 120_000; // 2 minutes

const app = Fastify({ logger: true });

// CORS — allow Shopify store and local dev
app.register(cors, {
  origin: true,
  credentials: true,
});

// Multipart file upload
app.register(multipart, {
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
});

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

type FilePart = {
  fieldname: string;
  filename: string;
  mimetype: string;
  buffer: Buffer;
};

type ApiError = {
  error: string;
  code: string;
  retryable: boolean;
};

function sendError(reply: any, statusCode: number, error: string, code: string, retryable: boolean): ApiError {
  reply.code(statusCode);
  return { error, code, retryable };
}

async function collectFormData(request: any): Promise<{ files: Record<string, FilePart>; fields: Record<string, string> }> {
  const files: Record<string, FilePart> = {};
  const fields: Record<string, string> = {};

  for await (const part of request.parts()) {
    if (part.type === "file") {
      const buffer = await part.toBuffer();
      files[part.fieldname] = {
        fieldname: part.fieldname,
        filename: part.filename,
        mimetype: part.mimetype,
        buffer,
      };
    } else {
      fields[part.fieldname] = part.value as string;
    }
  }

  return { files, fields };
}

function safeJsonParse(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function extractFirstJson(text: string): any | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  return safeJsonParse(text.slice(start, end + 1));
}

/**
 * Texture-specific styling details for more realistic Gemini results.
 */
const TEXTURE_DETAILS: Record<string, string> = {
  straight: "The hair should be sleek, smooth, and flowing with a slight natural sheen. Strands should fall cleanly without frizz.",
  wavy: "The hair should have a natural S-wave pattern with gentle, loose waves. It should look soft and voluminous, not curled with a curling iron.",
  curly: "The hair should have defined, bouncy curls with natural volume. The curl pattern should be consistent and springy with slight variation for realism.",
};

const ANALYSIS_MODEL = process.env.GEMINI_ANALYSIS_MODEL || "gemini-2.5-flash";

/**
 * Step 1: Analyze the photo to detect hair suitability before generating.
 * Returns analysis with gender, hair length, and suitability for extensions.
 */
async function analyzePhoto(aiClient: GoogleGenAI, imageBuffer: Buffer, mimeType: string): Promise<{ suitable: boolean; gender: string; currentHairLength: string; reason?: string }> {
  try {
    const response = await aiClient.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: [
        {
          inlineData: {
            mimeType,
            data: imageBuffer.toString("base64"),
          },
        },
        {
          text: [
            `Analyze this photo for a hair extension try-on tool. Respond in JSON only, no other text.`,
            ``,
            `Determine:`,
            `1. "gender": The apparent gender of the person ("male", "female", "ambiguous")`,
            `2. "currentHairLength": Their current hair length ("very_short", "short", "medium", "long")`,
            `3. "suitable": Whether hair extensions would look natural on this person (true/false)`,
            `4. "reason": If not suitable, a brief user-friendly reason why`,
            ``,
            `Hair extensions are NOT suitable when:`,
            `- The person has very short or buzzcut male hair (extensions cannot blend naturally)`,
            `- No person or face is clearly visible in the photo`,
            `- The photo is too dark or blurry to process`,
            ``,
            `Hair extensions ARE suitable when:`,
            `- The person has medium to long hair of any gender`,
            `- The person has short hair but long enough to blend (at least a few inches)`,
            `- Men with longer hairstyles (man buns, shoulder-length, etc.)`,
            ``,
            `Respond with ONLY valid JSON: {"gender":"...","currentHairLength":"...","suitable":true/false,"reason":"..."}`,
          ].join("\n"),
        },
      ],
    });

    const text = response.candidates?.[0]?.content?.parts?.find((p: any) => p.text)?.text || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (err) {
    // If analysis fails, allow generation to proceed
    console.warn("[TryOn] Photo analysis failed, proceeding with generation:", err);
  }
  return { suitable: true, gender: "unknown", currentHairLength: "unknown" };
}

/**
 * Step 2: Build the hair extension prompt, informed by photo analysis.
 */
function hairExtensionPrompt(
  shade: { name: string; hexColor: string },
  lengthInfo: { inches: number; bodyLandmark: string },
  texture: { name: string },
  analysis: { gender: string; currentHairLength: string }
): string {
  const textureName = texture.name.toLowerCase();
  const textureDetail = TEXTURE_DETAILS[textureName] || "";

  const genderGuidance = analysis.gender === "male"
    ? [
        `GENDER-SPECIFIC STYLING (MALE):`,
        `- This person is male. The extensions must look appropriate for a man.`,
        `- Keep the hairstyle masculine — think men's long hair styles (like Jason Momoa, Timothée Chalamet, or Keanu Reeves in long hair), NOT women's hairstyles.`,
        `- No feminine volume, no salon blowout look, no bouncy curls typical of women's styling.`,
        `- The hair should look like a natural men's longer hairstyle — slightly rougher, less polished, more effortless.`,
        `- Maintain the existing masculine hairline and forehead shape.`,
      ].join("\n")
    : [
        `GENDER-SPECIFIC STYLING (FEMALE):`,
        `- Style the extensions in a natural, feminine way appropriate for the person's overall look.`,
        `- The extensions should add length and volume that complements their existing style.`,
      ].join("\n");

  return [
    `You are a professional hair stylist photo editor. Edit this photo to add realistic clip-in hair extensions.`,
    ``,
    `CRITICAL RULE: You are ONLY adding hair extensions to this person's existing hair. You are NOT replacing their hair. You are NOT changing their gender appearance. The person must still look like themselves, just with longer/thicker hair.`,
    ``,
    genderGuidance,
    ``,
    `CURRENT HAIR ANALYSIS:`,
    `- The person's current hair length is approximately: ${analysis.currentHairLength}`,
    `- Extend their existing hair to the target length below. The transition from their natural hair to the extensions must be seamless.`,
    ``,
    `EXTENSION DETAILS:`,
    `- Color: ${shade.name} (hex ${shade.hexColor})`,
    `- Target length: ${lengthInfo.inches} inches, reaching the person's ${lengthInfo.bodyLandmark}`,
    `- Texture: ${textureName}`,
    ``,
    `BLENDING REQUIREMENTS:`,
    `- Blend the extensions seamlessly with the person's existing hair — the transition point should be invisible.`,
    `- Add subtle highlights and lowlights near the blend zone to create a natural color transition.`,
    `- The extension color should interact realistically with the ambient lighting in the photo.`,
    ``,
    `STYLING REQUIREMENTS:`,
    `${textureDetail}`,
    `- The hair should have natural movement and gravity — it should drape and fall realistically.`,
    `- Add subtle shadows where the hair rests on the shoulders and neck.`,
    ``,
    `PRESERVATION REQUIREMENTS (CRITICAL):`,
    `- Do NOT alter the person's face, facial features, skin tone, expression, or gender appearance.`,
    `- Do NOT alter the person's body shape, clothing, or accessories.`,
    `- Do NOT alter the background, lighting direction, or color temperature.`,
    `- The person must be clearly recognizable as the same person in the original photo.`,
    ``,
    `OUTPUT: Return a single photorealistic edited image.`,
  ].join("\n");
}

// Register routes
registerCatalogRoutes(app);
registerAdminRoutes(app);

// Health check (public)
app.get("/health", async () => ({ ok: true, timestamp: new Date().toISOString() }));

// Hair extension try-on endpoint (public — single store, no auth needed)
app.post("/api/tryon", { preHandler: [tryOnRateLimit] }, async (request, reply) => {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const { files, fields } = await collectFormData(request);
    const userImage = files.userImage;

    if (!userImage) {
      return sendError(reply, 400, "userImage is required", "MISSING_USER_IMAGE", false);
    }

    if (!ai) {
      return sendError(reply, 501, "GEMINI_API_KEY not set", "NO_API_KEY", false);
    }

    // Look up shade, length, texture from catalog
    const shadeId = fields.shadeId;
    const lengthId = fields.lengthId;
    const textureId = fields.textureId;

    if (!shadeId || !lengthId || !textureId) {
      return sendError(reply, 400, "shadeId, lengthId, and textureId are required", "MISSING_SELECTIONS", false);
    }

    const [shade, length, texture] = await Promise.all([
      prisma.shade.findUnique({ where: { id: shadeId } }),
      prisma.length.findUnique({ where: { id: lengthId } }),
      prisma.texture.findUnique({ where: { id: textureId } }),
    ]);

    if (!shade) return sendError(reply, 400, "Invalid shade selected", "INVALID_SHADE", false);
    if (!length) return sendError(reply, 400, "Invalid length selected", "INVALID_LENGTH", false);
    if (!texture) return sendError(reply, 400, "Invalid texture selected", "INVALID_TEXTURE", false);

    // Step 1: Analyze the photo for gender and hair suitability
    const analysis = await analyzePhoto(ai, userImage.buffer, userImage.mimetype);
    app.log.info({ analysis }, "Photo analysis complete");

    if (!analysis.suitable) {
      return sendError(
        reply,
        422,
        analysis.reason || "This photo may not work well with hair extensions. Please try a different photo.",
        "UNSUITABLE_PHOTO",
        false
      );
    }

    // Step 2: Generate with gender-aware prompt
    const prompt = hairExtensionPrompt(shade, length, texture, analysis);

    const response = await withRetry(
      async () => {
        return ai.models.generateContent({
          model: IMAGE_MODEL,
          contents: [
            {
              inlineData: {
                mimeType: userImage.mimetype,
                data: userImage.buffer.toString("base64"),
              },
            },
            { text: prompt },
          ],
          config: {
            responseModalities: ["IMAGE"],
          },
        });
      },
      { maxRetries: 2 }
    );

    clearTimeout(timeoutId);

    // Check for content filtering / safety blocks
    const candidate = response.candidates?.[0];
    const finishReason = candidate?.finishReason;

    if (finishReason === "SAFETY") {
      app.log.warn({ shade: shade.name, finishReason }, "Gemini blocked by safety filter");
      return sendError(reply, 422, "The image could not be processed. Please try a different photo.", "SAFETY_BLOCK", false);
    }

    if (finishReason === "RECITATION") {
      app.log.warn({ shade: shade.name, finishReason }, "Gemini blocked by recitation filter");
      return sendError(reply, 422, "The image could not be processed. Please try a different photo.", "RECITATION_BLOCK", false);
    }

    if (!candidate?.content?.parts) {
      app.log.error({ finishReason, candidateCount: response.candidates?.length }, "No content in Gemini response");
      return sendError(reply, 502, "No result returned from model", "EMPTY_RESPONSE", true);
    }

    const parts = candidate.content.parts;
    const imagePart = parts.find((p: any) => p.inlineData);

    if (!imagePart?.inlineData?.data) {
      // Model returned text instead of an image — log it for debugging
      const textParts = parts.filter((p: any) => p.text).map((p: any) => p.text);
      app.log.warn({ finishReason, textResponse: textParts.join(" ").slice(0, 200) }, "Gemini returned text instead of image");
      return sendError(reply, 502, "No image returned from model. Please try again.", "NO_IMAGE", true);
    }

    const processingMs = Date.now() - startTime;
    app.log.info({ processingMs, shade: shade.name, length: length.inches, texture: texture.name }, "Try-on completed");

    return {
      imageBase64: imagePart.inlineData.data,
      mimeType: imagePart.inlineData.mimeType || "image/png",
      shade: { id: shade.id, name: shade.name, hexColor: shade.hexColor },
      length: { id: length.id, label: length.label, inches: length.inches },
      texture: { id: texture.id, name: texture.name },
      processingMs,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    app.log.error(error);

    if (error.name === "AbortError") {
      return sendError(reply, 504, "Request timed out", "TIMEOUT", true);
    }

    // Gemini API errors
    if (error.status === 429) {
      return sendError(reply, 429, "Too many requests. Please wait a moment and try again.", "RATE_LIMITED", true);
    }

    if (error.status >= 400 && error.status < 500) {
      return sendError(reply, error.status, error.message || "Invalid request to AI model", "API_CLIENT_ERROR", false);
    }

    if (error.status >= 500) {
      return sendError(reply, 502, "AI service is temporarily unavailable. Please try again.", "API_SERVER_ERROR", true);
    }

    return sendError(reply, 500, "Try-on generation failed", "TRYON_ERROR", true);
  }
});

// Graceful shutdown
const shutdown = async () => {
  app.log.info("Shutting down...");
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);

// Prepare Fastify for incoming requests
await app.ready();

// Vercel serverless handler
export default async function handler(req: any, res: any) {
  app.server.emit("request", req, res);
}

// Start local server when not on Vercel
if (!process.env.VERCEL) {
  app.listen({ port: PORT, host: "0.0.0.0" }).then(() => {
    app.log.info(`Server running on port ${PORT}`);
  });
}
