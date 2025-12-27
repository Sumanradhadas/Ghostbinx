import { Item, CreateItemRequest } from "@shared/schema";
import * as github from "./github";

export interface IStorage {
  listItems(): Promise<Item[]>;
  createItem(item: CreateItemRequest): Promise<Item>;
  deleteItem(id: string): Promise<void>;
}

export class GitHubStorage implements IStorage {
  async listItems(): Promise<Item[]> {
    return await github.listItems();
  }

  async createItem(item: CreateItemRequest): Promise<Item> {
    return await github.createItem(item);
  }

  async deleteItem(id: string): Promise<void> {
    return await github.deleteItem(id);
  }
}

export const storage = new GitHubStorage();
