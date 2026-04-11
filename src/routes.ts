import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { pool } from "./db";
import { randomUUID } from "crypto";
import { 
  semesters, branches, subjects, 
  insertResourceSchema, 
  semesterSchema, branchSchema, subjectSchema, categorySchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth, ensureAuthenticated } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize passport and session
  setupAuth(app);

  // Get structure data (semesters, branches, subjects)
  app.get("/api/structure", (req: Request, res: Response) => {
    res.json({ semesters, branches, subjects });
  });
  
  // Resource Management
  
  // Create a new resource (PDF/textbook) - PROTECTED
  app.post("/api/resources", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const resourceData = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(resourceData);
      
      res.status(201).json(resource);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to create resource" });
      }
    }
  });
  
  // Get all resources
  app.get("/api/resources", async (req: Request, res: Response) => {
    try {
      const resources = await storage.getAllResources();
      res.json(resources);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch resources" });
    }
  });

  // Track resource view
  app.post("/api/resources/:id/view", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (!isNaN(id)) {
        await storage.incrementViewCount(id);
        res.status(204).end();
      } else {
        res.status(400).json({ error: "Invalid ID" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to track view" });
    }
  });

  // Analytics: Get top resources - SILENT ON UNAUTHENTICATED
  app.get("/api/analytics/top", async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.json([]);
      }
      const limit = parseInt(req.query.limit as string) || 10;
      const top = await storage.getTopResources(limit);
      res.json(top);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });
  
  // Get resources by filters (semester, branch, subject, category)
  app.get("/api/resources/filter", async (req: Request, res: Response) => {
    try {
      const { semester, branch, subject, category } = req.query;
      
      // Validate inputs
      try {
        if (semester) semesterSchema.parse(semester);
        if (branch) branchSchema.parse(branch);
        if (subject) subjectSchema.parse(subject);
        if (category) categorySchema.parse(category);
      } catch (error) {
        return res.status(400).json({ error: "Invalid filter parameters" });
      }
      
      let resources;
      if (semester && branch && subject && category) {
        resources = await storage.getResourcesByCategory(semester as string, branch as string, subject as string, category as string);
      } else if (semester && branch && subject) {
        resources = await storage.getResourcesBySemesterBranchSubject(semester as string, branch as string, subject as string);
      } else if (semester && branch) {
        resources = await storage.getResourcesBySemesterAndBranch(semester as string, branch as string);
      } else if (semester) {
        resources = await storage.getResourcesBySemester(semester as string);
      } else {
        resources = await storage.getAllResources();
      }
      res.json(resources);
    } catch (error) {
      res.status(500).json({ error: "Failed to filter resources" });
    }
  });
  
  // Get a specific resource by ID
  app.get("/api/resources/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid resource ID" });
      }
      const resource = await storage.getResourceById(id);
      if (!resource) {
        return res.status(404).json({ error: "Resource not found" });
      }
      res.json(resource);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch resource" });
    }
  });
  
  // Update a resource - PROTECTED
  app.put("/api/resources/:id", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid resource ID" });
      }
      const resourceData = insertResourceSchema.partial().parse(req.body);
      const updatedResource = await storage.updateResource(id, resourceData);
      if (!updatedResource) {
        return res.status(404).json({ error: "Resource not found" });
      }
      res.json(updatedResource);
    } catch (error) {
      if (error instanceof ZodError) {
        const validationError = fromZodError(error);
        res.status(400).json({ error: validationError.message });
      } else {
        res.status(500).json({ error: "Failed to update resource" });
      }
    }
  });
  
  // Delete a resource - PROTECTED
  app.delete("/api/resources/:id", ensureAuthenticated, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid resource ID" });
      }
      const success = await storage.deleteResource(id);
      if (!success) {
        return res.status(404).json({ error: "Resource not found" });
      }
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete resource" });
    }
  });

  // ─── Analytics: Visit Tracking ──────────────────────────────────────────────
  // POST /api/visit
  // First-time visitor: set cookie, insert visitor, increment counter
  // Returning visitor: just return current count
  app.post("/api/visit", async (req: Request, res: Response) => {
    try {
      const existingUserId = req.cookies?.user_id;

      if (!existingUserId) {
        // New visitor — generate UUID, set cookie, insert row, increment counter
        const userId = randomUUID();

        res.cookie("user_id", userId, {
          httpOnly: true,
          secure: true, // Cross-origin cookies MUST be secure
          sameSite: "none", // Required for cross-domain API cookies (Render vs Vercel)
          maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
        });

        // Insert visitor row
        await pool.query(
          "INSERT INTO visitors (id) VALUES ($1) ON CONFLICT DO NOTHING",
          [userId]
        );

        // Atomically increment counter and return new value
        const result = await pool.query(
          "UPDATE site_stats SET total_joined_users = total_joined_users + 1 WHERE id = 1 RETURNING total_joined_users"
        );

        const count = result.rows[0]?.total_joined_users ?? 0;
        return res.json({ joinedUsers: count, isNew: true });
      } else {
        // Returning visitor — just fetch current count
        const result = await pool.query(
          "SELECT total_joined_users FROM site_stats WHERE id = 1"
        );
        const count = result.rows[0]?.total_joined_users ?? 0;
        return res.json({ joinedUsers: count, isNew: false });
      }
    } catch (error) {
      console.error("[/api/visit] Error:", error);
      res.status(500).json({ error: "Failed to track visit" });
    }
  });

  // GET /api/stats — return current joined users count
  app.get("/api/stats", async (_req: Request, res: Response) => {
    try {
      const result = await pool.query(
        "SELECT total_joined_users FROM site_stats WHERE id = 1"
      );
      const count = result.rows[0]?.total_joined_users ?? 0;
      res.json({ joinedUsers: count });
    } catch (error) {
      console.error("[/api/stats] Error:", error);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
