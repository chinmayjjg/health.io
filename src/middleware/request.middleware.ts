import crypto from "crypto";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import pinoHttp from "pino-http";
import type { RequestHandler } from "express";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { sanitizeRequest } from "./sanitize.middleware";

const allowedOrigins = new Set([
  env.FRONTEND_URL,
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "https://health-io-frontend-ijnpekln1-chinmayjjgs-projects.vercel.app",
]);

export const requestLogger = pinoHttp({
  logger,
  genReqId: (req, res) => {
    const existingId = req.headers["x-request-id"];
    const requestId = typeof existingId === "string" ? existingId : crypto.randomUUID();
    res.setHeader("x-request-id", requestId);
    return requestId;
  },
  customSuccessMessage: (req, res) =>
    `${req.method} ${req.url} completed with ${res.statusCode}`,
  customErrorMessage: (req, res, error) =>
    `${req.method} ${req.url} failed with ${res.statusCode}: ${error.message}`,
});

export const securityMiddleware: RequestHandler[] = [
  helmet(),
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || origin.endsWith(".vercel.app")) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Request-Id"],
  }),
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  }),
  express.json({
    limit: "1mb",
    verify: (req, _res, buf) => {
      if ((req as any).originalUrl?.startsWith("/api/payments/webhook")) {
        (req as unknown as { rawBody?: Buffer }).rawBody = buf;
      }
    },
  }),
  express.urlencoded({ extended: true, limit: "1mb" }),
  cookieParser(),
  sanitizeRequest,
];
