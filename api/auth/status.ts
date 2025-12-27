import { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";

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

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  if (!authMiddleware(req)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  res.json({ authenticated: true });
}
