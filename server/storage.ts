import { 
  type User, 
  type InsertUser, 
  type Search, 
  type InsertSearch, 
  type Summary, 
  type InsertSummary, 
  type Download, 
  type InsertDownload, 
  type TemporaryContent, 
  type InsertTemporaryContent, 
  users, 
  searches, 
  summaries, 
  downloads, 
  temporaryContent 
} from "@shared/schema";
import { eq, and, lt, gt, sql, desc } from "drizzle-orm";
import { db } from "./db";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Search related methods
  createSearch(search: InsertSearch): Promise<Search>;
  getRecentSearches(limit?: number): Promise<Search[]>;
  
  // Summary related methods
  createSummary(summary: InsertSummary): Promise<Summary>;
  getSummariesBySearchId(searchId: number): Promise<Summary[]>;
  
  // Download related methods
  createDownload(download: InsertDownload): Promise<Download>;
  updateDownloadStatus(id: number, downloadSent: boolean): Promise<Download | undefined>;
  getPendingDownloads(): Promise<Download[]>;
  getDownloadsByEmail(email: string): Promise<Download[]>;
  
  // User content methods
  getAllUserContent(email: string): Promise<{
    downloads: Download[];
    searches: { search: Search; summaries: Summary[] }[];
  }>;
  
  // Temporary content caching methods
  saveTemporaryContent(content: InsertTemporaryContent): Promise<TemporaryContent>;
  getTemporaryContentBySessionId(sessionId: string): Promise<TemporaryContent | undefined>;
  updateTemporaryContent(id: number, partialContent: Partial<InsertTemporaryContent>): Promise<TemporaryContent | undefined>;
  moveTemporaryContentToUser(sessionId: string, email: string, firstName?: string, lastName?: string): Promise<boolean>;
  cleanupExpiredContent(): Promise<number>; // Returns number of items cleaned up
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createSearch(insertSearch: InsertSearch): Promise<Search> {
    const [search] = await db
      .insert(searches)
      .values(insertSearch)
      .returning();
    return search;
  }

  async getRecentSearches(limit: number = 10): Promise<Search[]> {
    return await db
      .select()
      .from(searches)
      .orderBy(desc(searches.createdAt))
      .limit(limit);
  }

  async createSummary(insertSummary: InsertSummary): Promise<Summary> {
    const [summary] = await db
      .insert(summaries)
      .values(insertSummary)
      .returning();
    return summary;
  }

  async getSummariesBySearchId(searchId: number): Promise<Summary[]> {
    return await db
      .select()
      .from(summaries)
      .where(eq(summaries.searchId, searchId));
  }

  async createDownload(download: InsertDownload): Promise<Download> {
    const [newDownload] = await db
      .insert(downloads)
      .values(download)
      .returning();
    return newDownload;
  }

  async updateDownloadStatus(id: number, downloadSent: boolean): Promise<Download | undefined> {
    const [updated] = await db
      .update(downloads)
      .set({ downloadSent })
      .where(eq(downloads.id, id))
      .returning();
    return updated || undefined;
  }

  async getPendingDownloads(): Promise<Download[]> {
    return await db
      .select()
      .from(downloads)
      .where(eq(downloads.downloadSent, false));
  }

  async getDownloadsByEmail(email: string): Promise<Download[]> {
    return await db
      .select()
      .from(downloads)
      .where(eq(downloads.email, email))
      .orderBy(desc(downloads.createdAt));
  }

  async getAllUserContent(email: string): Promise<{
    downloads: Download[];
    searches: { search: Search; summaries: Summary[] }[];
  }> {
    // Get all downloads for this user
    const userDownloads = await this.getDownloadsByEmail(email);
    
    // We still get all searches but now they're only used in the backend,
    // not directly exposed in the API response
    const allSearches = await db
      .select()
      .from(searches)
      .orderBy(desc(searches.createdAt));
    
    // Get all search results with their summaries
    const searchesWithSummaries: { search: Search; summaries: Summary[] }[] = [];
    
    // For each search, get all related summaries
    for (const search of allSearches) {
      const summariesForSearch = await this.getSummariesBySearchId(search.id);
      
      // If there are summaries, include this search in the results
      if (summariesForSearch.length > 0) {
        searchesWithSummaries.push({
          search,
          summaries: summariesForSearch
        });
      }
    }
    
    return {
      downloads: userDownloads,
      searches: searchesWithSummaries
    };
  }

  // Temporary content caching methods
  async saveTemporaryContent(content: InsertTemporaryContent): Promise<TemporaryContent> {
    const [savedContent] = await db
      .insert(temporaryContent)
      .values(content)
      .returning();
    return savedContent;
  }
  
  async getTemporaryContentBySessionId(sessionId: string): Promise<TemporaryContent | undefined> {
    const [content] = await db
      .select()
      .from(temporaryContent)
      .where(and(
        eq(temporaryContent.sessionId, sessionId),
        gt(temporaryContent.expiresAt, sql`NOW()`) // Compare with current timestamp using SQL expression
      ));
    return content || undefined;
  }
  
  async updateTemporaryContent(id: number, partialContent: Partial<InsertTemporaryContent>): Promise<TemporaryContent | undefined> {
    const [updated] = await db
      .update(temporaryContent)
      .set(partialContent)
      .where(eq(temporaryContent.id, id))
      .returning();
    return updated || undefined;
  }
  
  async moveTemporaryContentToUser(
    sessionId: string, 
    email: string, 
    firstName: string = "Anonymous", 
    lastName: string = "User"
  ): Promise<boolean> {
    try {
      // Get the temporary content for this session
      const tempContent = await this.getTemporaryContentBySessionId(sessionId);
      if (!tempContent) return false;
      
      // If there's a search ID, find the search and its summaries
      if (tempContent.searchId) {
        // Search and summaries are already in the database with their IDs
        // Nothing to do here, as they're not tied to a user
      }
      
      // If there's an article, create a download record
      if (tempContent.articleTitle && tempContent.articleContent) {
        // Create a download entry that references this content
        const downloadData: InsertDownload = {
          firstName: firstName,
          lastName: lastName,
          email: email,
          articleTitle: tempContent.articleTitle,
          content: tempContent.articleContent,
          footnotes: tempContent.footnotes,
          images: tempContent.images || [],
          featuredImageUrl: tempContent.featuredImageUrl,
          downloadSent: false,
        };
        
        await this.createDownload(downloadData);
      }
      
      // Successfully transferred the temporary content
      return true;
    } catch (error) {
      console.error("Failed to move temporary content to user:", error);
      return false;
    }
  }
  
  async cleanupExpiredContent(): Promise<number> {
    // Delete all expired temporary content
    const result = await db
      .delete(temporaryContent)
      .where(lt(temporaryContent.expiresAt, sql`NOW()`))
      .returning();
    
    return result.length;
  }
}

export const storage = new DatabaseStorage();