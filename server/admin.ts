import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";
import { eq, sql } from "drizzle-orm";
import { users, downloads } from "@shared/schema";
import { db } from "./db";

// Secret token for admin access
const ADMIN_TOKEN = "AICCSecretAdmin2024";

// Middleware to verify admin token
export function verifyAdminToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }
  
  const token = authHeader.split(' ')[1];
  
  if (token !== ADMIN_TOKEN) {
    return res.status(403).json({ error: "Forbidden: Invalid admin token" });
  }
  
  next();
}

// Function to sync real users from downloads table to users table
async function syncRealUsersFromDownloads() {
  try {
    // Get unique emails from downloads
    const uniqueEmails = await db
      .select({ email: downloads.email, firstName: downloads.firstName, lastName: downloads.lastName })
      .from(downloads)
      .groupBy(downloads.email, downloads.firstName, downloads.lastName);
      
    // For each unique email, check if it exists in users table and add if not
    for (const { email, firstName, lastName } of uniqueEmails) {
      const existingUser = await storage.getUserByUsername(email);
      
      if (!existingUser) {
        // Create a placeholder password for these synced users
        // In a real app, we would send a password reset email
        const defaultPassword = "$2b$10$3euPcmQFCiblsZeEu5s7p.9JDcT/XBSJ1z6kdoS8biSK0L2hrTz2W"; // hashed version of "password"
        
        await storage.createUser({
          username: email,
          password: defaultPassword,
          firstName: firstName || "",
          lastName: lastName || "",
          role: "Basic" // Default role for synced users
        });
        
        console.log(`Added user from downloads: ${email}`);
      }
    }
    
    console.log("User synchronization from downloads completed");
  } catch (error) {
    console.error("Error syncing users from downloads:", error);
  }
}

// Function to set up admin routes
export function setupAdminRoutes(app: any) {
  // Sync real users before setting up routes
  syncRealUsersFromDownloads();
  
  // Get all users
  app.get("/api/admin/users", verifyAdminToken, async (_req: Request, res: Response) => {
    try {
      // Always sync real users first to make sure we have the latest users
      await syncRealUsersFromDownloads();
      
      const allUsers = await db.select().from(users);
      res.json(allUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  // Get user by ID with their content
  app.get("/api/admin/users/:id", verifyAdminToken, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Get user's content (downloads and searches)
      const userContent = await storage.getAllUserContent(user.username);
      
      // Return combined user data and content
      res.json({
        ...user,
        content: userContent
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Create a new user
  app.post("/api/admin/users", verifyAdminToken, async (req: Request, res: Response) => {
    try {
      const { username, password, firstName, lastName, role } = req.body;
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      // Create new user
      const newUser = await storage.createUser({
        username,
        password,
        firstName,
        lastName,
        role
      });
      
      res.status(201).json(newUser);
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Update a user
  app.put("/api/admin/users/:id", verifyAdminToken, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      const { username, firstName, lastName, role } = req.body;
      
      // Check if user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Update user
      const [updatedUser] = await db
        .update(users)
        .set({ 
          username: username || existingUser.username,
          firstName: firstName || existingUser.firstName,
          lastName: lastName || existingUser.lastName,
          role: role || existingUser.role
        })
        .where(eq(users.id, userId))
        .returning();
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Delete a user
  app.delete("/api/admin/users/:id", verifyAdminToken, async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id);
      
      // Check if user exists
      const existingUser = await storage.getUser(userId);
      if (!existingUser) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Delete user
      await db
        .delete(users)
        .where(eq(users.id, userId));
      
      res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Get all downloads
  app.get("/api/admin/downloads", verifyAdminToken, async (_req: Request, res: Response) => {
    try {
      // Get all downloads
      const allDownloads = await db
        .select()
        .from(downloads)
        .orderBy(downloads.createdAt);
      
      res.json(allDownloads);
    } catch (error) {
      console.error("Error fetching downloads:", error);
      res.status(500).json({ error: "Failed to fetch downloads" });
    }
  });

  // Get all searches
  app.get("/api/admin/searches", verifyAdminToken, async (_req: Request, res: Response) => {
    try {
      // Get all searches
      const allSearches = await storage.getRecentSearches(100);
      
      // Get summaries count for each search
      const searchesWithSummariesCount = await Promise.all(
        allSearches.map(async (search) => {
          const summaries = await storage.getSummariesBySearchId(search.id);
          return {
            ...search,
            summariesCount: summaries.length
          };
        })
      );
      
      res.json(searchesWithSummariesCount);
    } catch (error) {
      console.error("Error fetching searches:", error);
      res.status(500).json({ error: "Failed to fetch searches" });
    }
  });
}