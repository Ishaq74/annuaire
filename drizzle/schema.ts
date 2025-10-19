// Drizzle ORM Schema - Annuaire d'Annecy
// Base de données: PostgreSQL
// Ce fichier définit le schéma complet de la base de données avec Drizzle ORM

import { pgTable, uuid, varchar, text, boolean, integer, timestamp, decimal, time, jsonb, unique, check, index } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { sql } from 'drizzle-orm';

// =====================================================
// TABLE: categories
// =====================================================
// Stocke les catégories hiérarchiques (Magazine, Hébergements, etc.)
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  parentId: uuid('parent_id').references(() => categories.id, { onDelete: 'set null' }),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  iconName: varchar('icon_name', { length: 255 }),
  isActive: boolean('is_active').default(true),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  parentIdIdx: index('idx_categories_parent_id').on(table.parentId),
  isActiveIdx: index('idx_categories_is_active').on(table.isActive),
  displayOrderIdx: index('idx_categories_display_order').on(table.displayOrder),
}));

// =====================================================
// TABLE: category_translations
// =====================================================
// Traductions multilingues pour les catégories
export const categoryTranslations = pgTable('category_translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'cascade' }),
  langCode: varchar('lang_code', { length: 5 }).notNull(), // 'fr', 'en', 'es'
  name: varchar('name', { length: 255 }).notNull(),
  seoSlug: varchar('seo_slug', { length: 255 }),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  categoryIdIdx: index('idx_category_translations_category_id').on(table.categoryId),
  langCodeIdx: index('idx_category_translations_lang_code').on(table.langCode),
  seoSlugIdx: index('idx_category_translations_seo_slug').on(table.seoSlug),
  uniq: unique('category_translations_category_id_lang_code_unique').on(table.categoryId, table.langCode),
}));

// =====================================================
// TABLE: authors
// =====================================================
// Stocke les auteurs/contributeurs des articles
export const authors = pgTable('authors', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  profileImageUrl: text('profile_image_url'),
  socialLinks: jsonb('social_links').$type<Array<{ platform: string; url: string }>>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  slugIdx: index('idx_authors_slug').on(table.slug),
}));

// =====================================================
// TABLE: author_translations
// =====================================================
// Traductions multilingues pour les auteurs
export const authorTranslations = pgTable('author_translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id').notNull().references(() => authors.id, { onDelete: 'cascade' }),
  langCode: varchar('lang_code', { length: 5 }).notNull(),
  bio: text('bio'),
  seoSlug: varchar('seo_slug', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  authorIdIdx: index('idx_author_translations_author_id').on(table.authorId),
  langCodeIdx: index('idx_author_translations_lang_code').on(table.langCode),
  seoSlugIdx: index('idx_author_translations_seo_slug').on(table.seoSlug),
  uniq: unique('author_translations_author_id_lang_code_unique').on(table.authorId, table.langCode),
}));

// =====================================================
// TABLE: articles
// =====================================================
// Stocke les articles du magazine
export const articles = pgTable('articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
  authorId: uuid('author_id').notNull().references(() => authors.id, { onDelete: 'restrict' }),
  featuredImageUrl: text('featured_image_url'),
  publicationDate: timestamp('publication_date', { withTimezone: true }).defaultNow(),
  readTimeMinutes: integer('read_time_minutes').default(5),
  viewCount: integer('view_count').default(0),
  isFeatured: boolean('is_featured').default(false),
  status: varchar('status', { length: 50 }).default('draft'), // 'draft', 'published', 'archived'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  categoryIdIdx: index('idx_articles_category_id').on(table.categoryId),
  authorIdIdx: index('idx_articles_author_id').on(table.authorId),
  publicationDateIdx: index('idx_articles_publication_date').on(table.publicationDate),
  isFeaturedIdx: index('idx_articles_is_featured').on(table.isFeatured),
  statusIdx: index('idx_articles_status').on(table.status),
  viewCountIdx: index('idx_articles_view_count').on(table.viewCount),
  deletedAtIdx: index('idx_articles_deleted_at').on(table.deletedAt),
}));

// =====================================================
// TABLE: article_translations
// =====================================================
// Traductions multilingues pour les articles
export const articleTranslations = pgTable('article_translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  langCode: varchar('lang_code', { length: 5 }).notNull(),
  name: varchar('name', { length: 500 }).notNull(), // Titre de l'article
  description: text('description'), // Résumé/extrait
  content: text('content'), // Contenu complet (HTML)
  featuredImageAlt: varchar('featured_image_alt', { length: 255 }),
  seoSlug: varchar('seo_slug', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  articleIdIdx: index('idx_article_translations_article_id').on(table.articleId),
  langCodeIdx: index('idx_article_translations_lang_code').on(table.langCode),
  seoSlugIdx: index('idx_article_translations_seo_slug').on(table.seoSlug),
  uniq: unique('article_translations_article_id_lang_code_unique').on(table.articleId, table.langCode),
}));

// =====================================================
// TABLE: article_related_articles
// =====================================================
// Table de jonction pour les articles liés/recommandés
export const articleRelatedArticles = pgTable('article_related_articles', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  relatedArticleId: uuid('related_article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  displayOrder: integer('display_order').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  articleIdIdx: index('idx_article_related_articles_article_id').on(table.articleId),
  relatedArticleIdIdx: index('idx_article_related_articles_related_article_id').on(table.relatedArticleId),
  displayOrderIdx: index('idx_article_related_articles_display_order').on(table.displayOrder),
  uniq: unique('article_related_articles_article_id_related_article_id_unique').on(table.articleId, table.relatedArticleId),
  checkSelfRelation: check('article_related_articles_check_self_relation', sql`${table.articleId} != ${table.relatedArticleId}`),
}));

// =====================================================
// TABLE: comments
// =====================================================
// Commentaires sur les articles avec support de fils de discussion
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  articleId: uuid('article_id').notNull().references(() => articles.id, { onDelete: 'cascade' }),
  parentCommentId: uuid('parent_comment_id').references(() => comments.id, { onDelete: 'cascade' }),
  authorName: varchar('author_name', { length: 255 }).notNull(),
  authorEmail: varchar('author_email', { length: 255 }).notNull(),
  content: text('content').notNull(),
  status: varchar('status', { length: 50 }).default('pending'), // 'pending', 'approved', 'rejected', 'spam'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  articleIdIdx: index('idx_comments_article_id').on(table.articleId),
  parentCommentIdIdx: index('idx_comments_parent_comment_id').on(table.parentCommentId),
  statusIdx: index('idx_comments_status').on(table.status),
  createdAtIdx: index('idx_comments_created_at').on(table.createdAt),
  deletedAtIdx: index('idx_comments_deleted_at').on(table.deletedAt),
}));

// =====================================================
// TABLE: places
// =====================================================
// Stocke les lieux (hébergements, restaurants, attractions, etc.)
export const places = pgTable('places', {
  id: uuid('id').primaryKey().defaultRandom(),
  categoryId: uuid('category_id').notNull().references(() => categories.id, { onDelete: 'restrict' }),
  mainImageUrl: text('main_image_url'),
  isFeatured: boolean('is_featured').default(false),
  status: varchar('status', { length: 50 }).default('draft'), // 'draft', 'published', 'archived'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
}, (table) => ({
  categoryIdIdx: index('idx_places_category_id').on(table.categoryId),
  isFeaturedIdx: index('idx_places_is_featured').on(table.isFeatured),
  statusIdx: index('idx_places_status').on(table.status),
  deletedAtIdx: index('idx_places_deleted_at').on(table.deletedAt),
}));

// =====================================================
// TABLE: place_translations
// =====================================================
// Traductions multilingues pour les lieux
export const placeTranslations = pgTable('place_translations', {
  id: uuid('id').primaryKey().defaultRandom(),
  placeId: uuid('place_id').notNull().references(() => places.id, { onDelete: 'cascade' }),
  langCode: varchar('lang_code', { length: 5 }).notNull(),
  name: varchar('name', { length: 500 }).notNull(),
  description: text('description'),
  seoSlug: varchar('seo_slug', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  placeIdIdx: index('idx_place_translations_place_id').on(table.placeId),
  langCodeIdx: index('idx_place_translations_lang_code').on(table.langCode),
  seoSlugIdx: index('idx_place_translations_seo_slug').on(table.seoSlug),
  uniq: unique('place_translations_place_id_lang_code_unique').on(table.placeId, table.langCode),
}));

// =====================================================
// TABLE: details_accommodation
// =====================================================
// Détails spécifiques aux hébergements
export const detailsAccommodation = pgTable('details_accommodation', {
  id: uuid('id').primaryKey().defaultRandom(),
  placeId: uuid('place_id').notNull().references(() => places.id, { onDelete: 'cascade' }).unique(),
  pricePerNight: decimal('price_per_night', { precision: 10, scale: 2 }),
  capacity: integer('capacity'),
  checkInTime: time('check_in_time'),
  checkOutTime: time('check_out_time'),
  amenities: jsonb('amenities').$type<string[]>(), // ["wifi", "parking", "breakfast", etc.]
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
}, (table) => ({
  placeIdIdx: index('idx_details_accommodation_place_id').on(table.placeId),
  pricePerNightIdx: index('idx_details_accommodation_price_per_night').on(table.pricePerNight),
  capacityIdx: index('idx_details_accommodation_capacity').on(table.capacity),
}));

// =====================================================
// RELATIONS - Drizzle ORM
// =====================================================

export const categoriesRelations = relations(categories, ({ one, many }) => ({
  parent: one(categories, {
    fields: [categories.parentId],
    references: [categories.id],
    relationName: 'category_hierarchy',
  }),
  children: many(categories, {
    relationName: 'category_hierarchy',
  }),
  translations: many(categoryTranslations),
  articles: many(articles),
  places: many(places),
}));

export const categoryTranslationsRelations = relations(categoryTranslations, ({ one }) => ({
  category: one(categories, {
    fields: [categoryTranslations.categoryId],
    references: [categories.id],
  }),
}));

export const authorsRelations = relations(authors, ({ many }) => ({
  translations: many(authorTranslations),
  articles: many(articles),
}));

export const authorTranslationsRelations = relations(authorTranslations, ({ one }) => ({
  author: one(authors, {
    fields: [authorTranslations.authorId],
    references: [authors.id],
  }),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  category: one(categories, {
    fields: [articles.categoryId],
    references: [categories.id],
  }),
  author: one(authors, {
    fields: [articles.authorId],
    references: [authors.id],
  }),
  translations: many(articleTranslations),
  comments: many(comments),
  relatedArticles: many(articleRelatedArticles, {
    relationName: 'article_relations',
  }),
  relatedByArticles: many(articleRelatedArticles, {
    relationName: 'related_article_relations',
  }),
}));

export const articleTranslationsRelations = relations(articleTranslations, ({ one }) => ({
  article: one(articles, {
    fields: [articleTranslations.articleId],
    references: [articles.id],
  }),
}));

export const articleRelatedArticlesRelations = relations(articleRelatedArticles, ({ one }) => ({
  article: one(articles, {
    fields: [articleRelatedArticles.articleId],
    references: [articles.id],
    relationName: 'article_relations',
  }),
  relatedArticle: one(articles, {
    fields: [articleRelatedArticles.relatedArticleId],
    references: [articles.id],
    relationName: 'related_article_relations',
  }),
}));

export const commentsRelations = relations(comments, ({ one, many }) => ({
  article: one(articles, {
    fields: [comments.articleId],
    references: [articles.id],
  }),
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: 'comment_replies',
  }),
  replies: many(comments, {
    relationName: 'comment_replies',
  }),
}));

export const placesRelations = relations(places, ({ one, many }) => ({
  category: one(categories, {
    fields: [places.categoryId],
    references: [categories.id],
  }),
  translations: many(placeTranslations),
  accommodationDetails: one(detailsAccommodation, {
    fields: [places.id],
    references: [detailsAccommodation.placeId],
  }),
}));

export const placeTranslationsRelations = relations(placeTranslations, ({ one }) => ({
  place: one(places, {
    fields: [placeTranslations.placeId],
    references: [places.id],
  }),
}));

export const detailsAccommodationRelations = relations(detailsAccommodation, ({ one }) => ({
  place: one(places, {
    fields: [detailsAccommodation.placeId],
    references: [places.id],
  }),
}));
