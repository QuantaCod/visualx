import {
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const datasetsTable = pgTable(
  "datasets",
  {
    id: integer("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    shortDescription: text("short_description").notNull(),
    longDescriptionHtml: text("long_description_html").notNull().default(""),
    chartType: text("chart_type").notNull().default("bar"),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    data: jsonb("data").$type<unknown>().notNull().default([]),
    metaDescription: text("meta_description").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("datasets_slug_idx").on(t.slug),
  }),
);

export const articlesTable = pgTable(
  "articles",
  {
    id: integer("id").primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    excerpt: text("excerpt").notNull(),
    contentHtml: text("content_html").notNull(),
    coverImage: text("cover_image").notNull().default(""),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    metaDescription: text("meta_description").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    slugIdx: uniqueIndex("articles_slug_idx").on(t.slug),
  }),
);

export const likesTable = pgTable(
  "likes",
  {
    id: integer("id").primaryKey(),
    targetType: text("target_type").notNull(), // 'dataset' | 'article'
    targetId: integer("target_id").notNull(),
    fingerprint: text("fingerprint").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (t) => ({
    uniqLike: uniqueIndex("likes_unique_idx").on(
      t.targetType,
      t.targetId,
      t.fingerprint,
    ),
    targetIdx: index("likes_target_idx").on(t.targetType, t.targetId),
  }),
);

export const insertDatasetSchema = createInsertSchema(datasetsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDataset = z.infer<typeof insertDatasetSchema>;
export type Dataset = typeof datasetsTable.$inferSelect;

export const insertArticleSchema = createInsertSchema(articlesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertArticle = z.infer<typeof insertArticleSchema>;
export type Article = typeof articlesTable.$inferSelect;

export type Like = typeof likesTable.$inferSelect;
