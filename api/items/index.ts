import { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { createItemSchema } from "../../shared/schema";
import { storage } from "../../server/storage";

const JWT_SECRET = process.env.SESSION_SECRET || "gallery-secret";

function authMiddleware(req: VercelRequest): boolean {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return false;
  }

  try {
    jwt.verify(token, JWT_SECRET);
    return true;
  } catch (err) {
    return false;
  }
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (!authMiddleware(req)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const items = await storage.listItems();
      return res.json(items);
    } catch (err) {
      console.error("Error listing items:", err);
      return res.status(500).json({ message: "Failed to fetch items" });
    }
  }

  if (req.method === "POST") {
    try {
      const input = createItemSchema.parse(req.body);
      const item = await storage.createItem(input);
      return res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error(
        "Error creating item:",
        err instanceof Error ? err.message : err
      );
      return res.status(500).json({
        message: err instanceof Error ? err.message : "Failed to create item",
      });
    }
  }

  res.status(405).json({ message: "Method not allowed" });
}
