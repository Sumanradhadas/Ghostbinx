import { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
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

  if (req.method === "DELETE") {
    try {
      const id = req.query.id as string;
      if (!id) {
        return res.status(400).json({ message: "Item ID is required" });
      }
      await storage.deleteItem(id);
      res.status(204).end();
      return;
    } catch (err) {
      if ((err as any).status === 404) {
        return res.status(404).json({ message: "Item not found" });
      }
      console.error("Error deleting item:", err);
      return res.status(500).json({ message: "Failed to delete item" });
    }
  }

  res.status(405).json({ message: "Method not allowed" });
}
