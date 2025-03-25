import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").default(""),
  lastName: text("last_name").default(""),
  role: text("role").default("Basic").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  role: true,
});

export const temporaryContent = pgTable("temporary_content", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  searchTerm: text("search_term").notNull(),
  searchId: integer("search_id"),
  articleTitle: text("article_title"),
  articleContent: text("article_content"),
  footnotes: text("footnotes"),
  featuredImageUrl: text("featured_image_url"),
  images: text("images").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertTemporaryContentSchema = createInsertSchema(temporaryContent).pick({
  sessionId: true,
  searchTerm: true,
  searchId: true, 
  articleTitle: true,
  articleContent: true,
  footnotes: true,
  featuredImageUrl: true,
  images: true,
  expiresAt: true,
});

export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  articleTitle: text("article_title").notNull(),
  featuredImageUrl: text("featured_image_url"),
  content: text("content").notNull(),
  footnotes: text("footnotes"),
  images: text("images").array().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  downloadSent: boolean("download_sent").default(false).notNull(),
});

export const insertDownloadSchema = createInsertSchema(downloads).pick({
  firstName: true,
  lastName: true,
  email: true,
  articleTitle: true,
  featuredImageUrl: true,
  content: true,
  footnotes: true,
  images: true,
  downloadSent: true,
});

export const searches = pgTable("searches", {
  id: serial("id").primaryKey(),
  searchTerm: text("search_term").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertSearchSchema = createInsertSchema(searches).pick({
  searchTerm: true,
});

export const summaries = pgTable("summaries", {
  id: serial("id").primaryKey(),
  searchId: integer("search_id").notNull(),
  title: text("title").notNull(),
  summary: text("summary").notNull(),
  date: text("date").notNull(),
  sourcesCount: integer("sources_count").notNull(),
});

export const insertSummarySchema = createInsertSchema(summaries).pick({
  searchId: true,
  title: true,
  summary: true,
  date: true,
  sourcesCount: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloads.$inferSelect;

export type InsertSearch = z.infer<typeof insertSearchSchema>;
export type Search = typeof searches.$inferSelect;

export type InsertSummary = z.infer<typeof insertSummarySchema>;
export type Summary = typeof summaries.$inferSelect;

export type InsertTemporaryContent = z.infer<typeof insertTemporaryContentSchema>;
export type TemporaryContent = typeof temporaryContent.$inferSelect;

export const researchRequestSchema = z.object({
  searchTerm: z.string().min(1, "Search term is required"),
});

export type ResearchRequest = z.infer<typeof researchRequestSchema>;

export const blogGenerationRequestSchema = z.object({
  searchTerm: z.string().min(1, "Search term is required"),
  selectedSummaries: z.array(z.object({
    id: z.number(),
    searchTerm: z.string(),
    title: z.string(),
    summary: z.string(),
    date: z.string(),
    sourcesCount: z.number()
  })).min(1, "At least one summary must be selected").max(5, "Maximum of 5 summaries can be selected"),
});

export type BlogGenerationRequest = z.infer<typeof blogGenerationRequestSchema>;

export const downloadRequestSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Valid email address is required"),
  articleTitle: z.string().min(1, "Article title is required"),
  featuredImageUrl: z.string().optional(),
  content: z.string().min(1, "Article content is required"),
  footnotes: z.string().optional(),
  images: z.array(z.string()).min(1, "At least one image is required")
});

export type DownloadRequest = z.infer<typeof downloadRequestSchema>;
