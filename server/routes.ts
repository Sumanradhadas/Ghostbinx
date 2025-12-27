import type { Express, Request, Response, NextFunction } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import jwt from "jsonwebtoken";
import { validateGitHubAccess } from "./github";

const JWT_SECRET = process.env.SESSION_SECRET || "gallery-secret";
const LOGIN_PASSWORD = process.env.GALLERY_PASSWORD;

if (!LOGIN_PASSWORD) {
  throw new Error("GALLERY_PASSWORD environment variable is required");
}

declare global {
  namespace Express {
    interface Request {
      user?: { authenticated: boolean };
    }
  }
}

// Auth middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    req.user = { authenticated: true };
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Validate GitHub access on startup
  const gitHubAccessValid = await validateGitHubAccess();
  if (!gitHubAccessValid) {
    console.warn("⚠️  GitHub access validation failed - items may not save properly");
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      github: gitHubAccessValid ? "connected" : "disconnected" 
    });
  });

  // Auth routes (no middleware required)
  app.post(api.auth.login.path, async (req, res) => {
    try {
      const input = api.auth.login.input.parse(req.body);

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
      throw err;
    }
  });

  app.get(api.auth.status.path, authMiddleware, (req, res) => {
    res.json({ authenticated: true });
  });

  // Gallery routes (protected)
  app.get(api.items.list.path, authMiddleware, async (req, res) => {
    try {
      const items = await storage.listItems();
      res.json(items);
    } catch (err) {
      console.error("Error listing items:", err);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.post(api.items.create.path, authMiddleware, async (req, res) => {
    try {
      const input = api.items.create.input.parse(req.body);
      const item = await storage.createItem(input);
      res.status(201).json(item);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join("."),
        });
      }
      console.error("Error creating item:", err instanceof Error ? err.message : err);
      res.status(500).json({ 
        message: err instanceof Error ? err.message : "Failed to create item" 
      });
    }
  });

  app.delete(api.items.delete.path, authMiddleware, async (req, res) => {
    try {
      const id = req.params.id;
      if (!id) {
        return res.status(400).json({ message: "Item ID is required" });
      }
      await storage.deleteItem(id);
      res.status(204).send();
    } catch (err) {
      if ((err as any).status === 404) {
        return res.status(404).json({ message: "Item not found" });
      }
      console.error("Error deleting item:", err);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });

  return httpServer;
}
