import "dotenv/config";
import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import { GoogleGenAI } from "@google/genai";
import { withRetry } from "../src/utils/retry.js";
import { prisma } from "../src/db.js";
import { authenticate, validateOrigin } from "../src/middleware/auth.js";
import { tenantRateLimit, checkMonthlyQuota } from "../src/middleware/rateLimit.js";
import { logUsage, incrementQuota } from "../src/services/usage.js";
import { registerBillingRoutes } from "../src/routes/billing.js";
import { registerWebhookRoutes, rawBodyPlugin } from "../src/routes/webhooks.js";
import { registerStoreRoutes } from "../src/routes/stores.js";
import type { AuthenticatedRequest } from "../src/types.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const CLASSIFIER_MODEL = process.env.GEMINI_CLASSIFIER_MODEL || "gemini-2.5-flash-image";
const IMAGE_MODEL = process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";
const REQUEST_TIMEOUT = 120_000;

const app = Fastify({ logger: true });

await rawBodyPlugin(app);

app.register(cors, {
  origin: (_origin: any, cb: any) => cb(null, true),
  credentials: true,
  exposedHeaders: ["X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"],
});

app.register(multipart, { limits: { fileSize: 15 * 1024 * 1024 } });

const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

const productImageCache = new Map<string, { buffer: Buffer; mimetype: string; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000;

type FilePart = { fieldname: string; filename: string; mimetype: string; buffer: Buffer };
type ApiError = { error: string; code: string; retryable: boolean };

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
      files[part.fieldname] = { fieldname: part.fieldname, filename: part.filename, mimetype: part.mimetype, buffer };
    } else {
      fields[part.fieldname] = part.value as string;
    }
  }
  return { files, fields };
}

async function fetchProductImage(url: string): Promise<{ buffer: Buffer; mimetype: string }> {
  let parsedUrl: URL;
  try { parsedUrl = new URL(url); } catch { throw { status: 400, message: "Invalid product image URL" }; }
  if (parsedUrl.protocol !== "https:") throw { status: 400, message: "Product image URL must use HTTPS" };

  const cached = productImageCache.get(url);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) return { buffer: cached.buffer, mimetype: cached.mimetype };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "TryOnWidget/1.0" } });
    clearTimeout(timeoutId);
    if (!response.ok) throw { status: 400, message: `Failed to fetch product image: ${response.status}` };
    const contentType = response.headers.get("content-type") || "image/jpeg";
    if (!contentType.startsWith("image/")) throw { status: 400, message: "URL does not point to an image" };
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length > 10 * 1024 * 1024) throw { status: 400, message: "Product image is too large (max 10MB)" };
    productImageCache.set(url, { buffer, mimetype: contentType, timestamp: Date.now() });
    for (const [key, value] of productImageCache.entries()) {
      if (Date.now() - value.timestamp > CACHE_TTL) productImageCache.delete(key);
    }
    return { buffer, mimetype: contentType };
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") throw { status: 504, message: "Timeout fetching product image" };
    throw error;
  }
}

function safeJsonParse(text: string): any | null { try { return JSON.parse(text); } catch { return null; } }
function extractFirstJson(text: string): any | null {
  const start = text.indexOf("{"); const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return safeJsonParse(text.slice(start, end + 1));
}

function categoryPrompt(category: string): string {
  const common = "Preserve the person\\'s face, skin tone, body shape, and lighting. Place the product naturally on the body. Keep the background unchanged.";
  switch (category) {
    case "clothing": return "Make the person wear the clothing item from the product image. " + common;
    case "watch": return "Place the watch on the person\\'s wrist. " + common;
    case "jewelry": return "Place the jewelry on the person appropriately (neck, ears, or wrist). " + common;
    case "sunglasses": return "Place the sunglasses on the person\\'s face. " + common;
    case "shoes": return "Place the shoes on the person\\'s feet. " + common;
    case "bag": return "Place the bag naturally on the person (hand or shoulder). " + common;
    default: return "Place the product on the person in a natural way. " + common;
  }
}

async function classifyProductImage(buffer: Buffer, mimetype: string, _signal?: AbortSignal): Promise<{ category: string; confidence: number; raw: string } | null> {
  if (!ai) return null;
  const prompt = "Classify the product in the image into one of these categories: clothing, watch, jewelry, sunglasses, shoes, bag, other. Return ONLY a JSON object with keys category and confidence (0 to 1).";
  const response = await withRetry(async () => {
    return ai.models.generateContent({
      model: CLASSIFIER_MODEL,
      contents: [{ text: prompt }, { inlineData: { mimeType: mimetype, data: buffer.toString("base64") } }],
      config: { responseModalities: ["TEXT"] },
    });
  }, { maxRetries: 2 });
  const parts = response.candidates?.[0]?.content?.parts || [];
  const text = parts.map((p: any) => p.text).filter(Boolean).join("\n");
  const parsed = safeJsonParse(text) || extractFirstJson(text);
  if (!parsed || typeof parsed.category !== "string") return { category: "other", confidence: 0, raw: text };
  return { category: parsed.category, confidence: Number(parsed.confidence || 0), raw: text };
}

registerStoreRoutes(app);
registerBillingRoutes(app);
registerWebhookRoutes(app);

app.get("/health", async () => ({ ok: true, timestamp: new Date().toISOString() }));

app.post("/api/classify", { preHandler: [authenticate, validateOrigin, tenantRateLimit] }, async (request, reply) => {
  const authRequest = request as AuthenticatedRequest;
  const startTime = Date.now();
  try {
    const { files } = await collectFormData(request);
    const productImage = files.productImage;
    if (!productImage) { await logUsage(authRequest.store.id, "classify", "error", { errorCode: "MISSING_FILE" }); return sendError(reply, 400, "productImage is required", "MISSING_FILE", false); }
    const result = await classifyProductImage(productImage.buffer, productImage.mimetype);
    if (!result) { await logUsage(authRequest.store.id, "classify", "error", { errorCode: "NO_API_KEY" }); return sendError(reply, 501, "GEMINI_API_KEY not set", "NO_API_KEY", false); }
    await logUsage(authRequest.store.id, "classify", "success", { processingMs: Date.now() - startTime, productCategory: result.category });
    return result;
  } catch (error: any) {
    app.log.error(error);
    await logUsage(authRequest.store.id, "classify", "error", { processingMs: Date.now() - startTime, errorCode: "CLASSIFY_ERROR" });
    return sendError(reply, 500, "Classification failed", "CLASSIFY_ERROR", true);
  }
});

app.post("/api/tryon", { preHandler: [authenticate, validateOrigin, tenantRateLimit] }, async (request, reply) => {
  const authRequest = request as AuthenticatedRequest;
  const startTime = Date.now();
  const quotaAvailable = await checkMonthlyQuota(request, reply);
  if (!quotaAvailable) { await logUsage(authRequest.store.id, "tryon", "quota_exceeded", { processingMs: Date.now() - startTime }); return; }
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);
  try {
    const { files, fields } = await collectFormData(request);
    const userImage = files.userImage;
    const productImageUrl = fields.productImageUrl;
    let productBuffer: Buffer; let productMimetype: string;
    if (productImageUrl) { const fetched = await fetchProductImage(productImageUrl); productBuffer = fetched.buffer; productMimetype = fetched.mimetype; }
    else if (files.productImage) { productBuffer = files.productImage.buffer; productMimetype = files.productImage.mimetype; }
    else { await logUsage(authRequest.store.id, "tryon", "error", { errorCode: "MISSING_PRODUCT" }); return sendError(reply, 400, "productImageUrl or productImage is required", "MISSING_PRODUCT", false); }
    if (!userImage) { await logUsage(authRequest.store.id, "tryon", "error", { errorCode: "MISSING_USER_IMAGE" }); return sendError(reply, 400, "userImage is required", "MISSING_USER_IMAGE", false); }
    if (!ai) { await logUsage(authRequest.store.id, "tryon", "error", { errorCode: "NO_API_KEY" }); return sendError(reply, 501, "GEMINI_API_KEY not set", "NO_API_KEY", false); }
    const classification = await classifyProductImage(productBuffer, productMimetype, controller.signal);
    const category = classification?.category || "other";
    const confidence = classification?.confidence || 0;
    const prompt = categoryPrompt(confidence >= 0.5 ? category : "other");
    const response = await withRetry(async () => {
      return ai.models.generateContent({
        model: IMAGE_MODEL,
        contents: [
          { inlineData: { mimeType: userImage.mimetype, data: userImage.buffer.toString("base64") } },
          { inlineData: { mimeType: productMimetype, data: productBuffer.toString("base64") } },
          { text: prompt },
        ],
        config: { responseModalities: ["IMAGE"] },
      });
    }, { maxRetries: 2 });
    clearTimeout(timeoutId);
    const parts = response.candidates?.[0]?.content?.parts || [];
    const imagePart = parts.find((p: any) => p.inlineData);
    if (!imagePart?.inlineData?.data) { await logUsage(authRequest.store.id, "tryon", "error", { processingMs: Date.now() - startTime, errorCode: "NO_IMAGE", productCategory: category }); return sendError(reply, 502, "No image returned from model", "NO_IMAGE", true); }
    await incrementQuota(authRequest.store);
    await logUsage(authRequest.store.id, "tryon", "success", { processingMs: Date.now() - startTime, productCategory: category });
    return { category, confidence, prompt, imageBase64: imagePart.inlineData.data, mimeType: imagePart.inlineData.mimeType || "image/png" };
  } catch (error: any) {
    clearTimeout(timeoutId);
    app.log.error(error);
    const processingMs = Date.now() - startTime;
    if (error.name === "AbortError") { await logUsage(authRequest.store.id, "tryon", "error", { processingMs, errorCode: "TIMEOUT" }); return sendError(reply, 504, "Request timed out", "TIMEOUT", true); }
    if (error.status) { await logUsage(authRequest.store.id, "tryon", "error", { processingMs, errorCode: "FETCH_ERROR" }); return sendError(reply, error.status, error.message, "FETCH_ERROR", error.status >= 500); }
    await logUsage(authRequest.store.id, "tryon", "error", { processingMs, errorCode: "TRYON_ERROR" });
    return sendError(reply, 500, "Try-on generation failed", "TRYON_ERROR", true);
  }
});

await app.ready();

export default async function handler(req: any, res: any) {
  app.server.emit("request", req, res);
}
