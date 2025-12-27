import { z } from "zod";

// ============================================
// AUTHENTICATION
// ============================================
export const loginRequestSchema = z.object({
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export interface AuthResponse {
  success: boolean;
  token?: string;
  message?: string;
}

// ============================================
// GALLERY ITEMS
// ============================================
export const createItemSchema = z.object({
  type: z.enum(["text", "image"]),
  title: z.string().min(1),
  content: z.string().min(1),
});

export type CreateItemRequest = z.infer<typeof createItemSchema>;

export interface Item {
  id: string;
  type: "text" | "image";
  title: string;
  content: string;
  createdAt: string;
}

export type ItemResponse = Item;
export type ItemsListResponse = Item[];
