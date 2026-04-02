import { 
  users, type User, type InsertUser,
  resources, type Resource, type InsertResource
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  // User related methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Resource related methods
  createResource(resource: InsertResource): Promise<Resource>;
  getAllResources(): Promise<Resource[]>;
  getResourceById(id: number): Promise<Resource | undefined>;
  getResourcesBySemester(semester: string): Promise<Resource[]>;
  getResourcesBySemesterAndBranch(semester: string, branch: string): Promise<Resource[]>;
  getResourcesBySemesterBranchSubject(semester: string, branch: string, subject: string): Promise<Resource[]>;
  getResourcesByCategory(semester: string, branch: string, subject: string, category: string): Promise<Resource[]>;
  updateResource(id: number, resource: Partial<Resource>): Promise<Resource | undefined>;
  deleteResource(id: number): Promise<boolean>;
  getTopResources(limit: number): Promise<Resource[]>;
  incrementViewCount(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User related methods
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const result = await db.insert(users).values({
      ...insertUser,
      password: hashedPassword,
    }).returning();
    return result[0];
  }

  // Resource related methods
  async createResource(insertResource: InsertResource): Promise<Resource> {
    // Explicitly handle date for persistence
    const result = await db.insert(resources).values({
      ...insertResource,
      author: insertResource.author || null,
      pages: insertResource.pages || null,
      uploadedBy: insertResource.uploadedBy || null,
      uploadedAt: new Date()
    }).returning();
    return result[0];
  }

  async getAllResources(): Promise<Resource[]> {
    const all = await db.select().from(resources);
    // Sort by uploadedAt descendant to show newest first
    return all.sort((a, b) => {
      const dateA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
      const dateB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
      return dateB - dateA;
    });
  }

  async getResourceById(id: number): Promise<Resource | undefined> {
    const result = await db.select().from(resources).where(eq(resources.id, id));
    return result[0];
  }

  async getResourcesBySemester(semester: string): Promise<Resource[]> {
    return await db.select().from(resources).where(eq(resources.semester, semester));
  }

  async getResourcesBySemesterAndBranch(semester: string, branch: string): Promise<Resource[]> {
    return await db.select().from(resources).where(
      and(
        eq(resources.semester, semester),
        eq(resources.branch, branch)
      )
    );
  }

  async getResourcesBySemesterBranchSubject(semester: string, branch: string, subject: string): Promise<Resource[]> {
    return await db.select().from(resources).where(
      and(
        eq(resources.semester, semester),
        eq(resources.branch, branch),
        eq(resources.subject, subject)
      )
    );
  }

  async getResourcesByCategory(semester: string, branch: string, subject: string, category: string): Promise<Resource[]> {
    return await db.select().from(resources).where(
      and(
        eq(resources.semester, semester),
        eq(resources.branch, branch),
        eq(resources.subject, subject),
        eq(resources.category, category)
      )
    );
  }

  async updateResource(id: number, resource: Partial<Resource>): Promise<Resource | undefined> {
    const result = await db.update(resources)
      .set({
        ...resource,
        author: "author" in resource ? (resource.author || null) : undefined,
        pages: "pages" in resource ? (resource.pages || null) : undefined,
        uploadedBy: "uploadedBy" in resource ? (resource.uploadedBy || null) : undefined,
      })
      .where(eq(resources.id, id))
      .returning();
    
    return result[0];
  }

  async deleteResource(id: number): Promise<boolean> {
    const result = await db.delete(resources).where(eq(resources.id, id)).returning();
    return result.length > 0;
  }

  async getTopResources(limit: number): Promise<Resource[]> {
    const top = await db.select().from(resources);
    return top.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, limit);
  }

  async incrementViewCount(id: number): Promise<void> {
    const resource = await this.getResourceById(id);
    if (resource) {
      await db.update(resources)
        .set({ viewCount: (resource.viewCount || 0) + 1 })
        .where(eq(resources.id, id));
    }
  }
}

// Create and export a single instance of the storage
export const storage = new DatabaseStorage();
