import { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { loginRequestSchema } from "../../shared/schema";

const JWT_SECRET = process.env.SESSION_SECRET || "gallery-secret";
const LOGIN_PASSWORD = process.env.GALLERY_PASSWORD;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!LOGIN_PASSWORD) {
    return res.status(500).json({ message: "Server configuration error" });
  }

  try {
    const input = loginRequestSchema.parse(req.body);

    if (input.password !== LOGIN_PASSWORD) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ authenticated: true }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.json({ success: true, token });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        message: err.errors[0].message,
        field: err.errors[0].path.join("."),
      });
    }
    res.status(500).json({ message: "Internal server error" });
  }
}
