-- Drizzle Migration - Annuaire d'Annecy
-- Generated from schema.ts
-- This is the initial migration to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create categories table
CREATE TABLE "categories" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "parent_id" UUID REFERENCES "categories"("id") ON DELETE SET NULL,
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "icon_name" VARCHAR(255),
  "is_active" BOOLEAN DEFAULT true,
  "display_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX "idx_categories_parent_id" ON "categories"("parent_id");
CREATE INDEX "idx_categories_is_active" ON "categories"("is_active");
CREATE INDEX "idx_categories_display_order" ON "categories"("display_order");

-- Create category_translations table
CREATE TABLE "category_translations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "category_id" UUID NOT NULL REFERENCES "categories"("id") ON DELETE CASCADE,
  "lang_code" VARCHAR(5) NOT NULL,
  "name" VARCHAR(255) NOT NULL,
  "seo_slug" VARCHAR(255),
  "description" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE("category_id", "lang_code")
);

CREATE INDEX "idx_category_translations_category_id" ON "category_translations"("category_id");
CREATE INDEX "idx_category_translations_lang_code" ON "category_translations"("lang_code");
CREATE INDEX "idx_category_translations_seo_slug" ON "category_translations"("seo_slug");

-- Create authors table
CREATE TABLE "authors" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "slug" VARCHAR(255) NOT NULL UNIQUE,
  "name" VARCHAR(255) NOT NULL,
  "profile_image_url" TEXT,
  "social_links" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX "idx_authors_slug" ON "authors"("slug");

-- Create author_translations table
CREATE TABLE "author_translations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "author_id" UUID NOT NULL REFERENCES "authors"("id") ON DELETE CASCADE,
  "lang_code" VARCHAR(5) NOT NULL,
  "bio" TEXT,
  "seo_slug" VARCHAR(255),
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE("author_id", "lang_code")
);

CREATE INDEX "idx_author_translations_author_id" ON "author_translations"("author_id");
CREATE INDEX "idx_author_translations_lang_code" ON "author_translations"("lang_code");
CREATE INDEX "idx_author_translations_seo_slug" ON "author_translations"("seo_slug");

-- Create articles table
CREATE TABLE "articles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "category_id" UUID NOT NULL REFERENCES "categories"("id") ON DELETE RESTRICT,
  "author_id" UUID NOT NULL REFERENCES "authors"("id") ON DELETE RESTRICT,
  "featured_image_url" TEXT,
  "publication_date" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "read_time_minutes" INTEGER DEFAULT 5,
  "view_count" INTEGER DEFAULT 0,
  "is_featured" BOOLEAN DEFAULT false,
  "status" VARCHAR(50) DEFAULT 'draft',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

CREATE INDEX "idx_articles_category_id" ON "articles"("category_id");
CREATE INDEX "idx_articles_author_id" ON "articles"("author_id");
CREATE INDEX "idx_articles_publication_date" ON "articles"("publication_date");
CREATE INDEX "idx_articles_is_featured" ON "articles"("is_featured");
CREATE INDEX "idx_articles_status" ON "articles"("status");
CREATE INDEX "idx_articles_view_count" ON "articles"("view_count");
CREATE INDEX "idx_articles_deleted_at" ON "articles"("deleted_at");

-- Create article_translations table
CREATE TABLE "article_translations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "article_id" UUID NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
  "lang_code" VARCHAR(5) NOT NULL,
  "name" VARCHAR(500) NOT NULL,
  "description" TEXT,
  "content" TEXT,
  "featured_image_alt" VARCHAR(255),
  "seo_slug" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE("article_id", "lang_code")
);

CREATE INDEX "idx_article_translations_article_id" ON "article_translations"("article_id");
CREATE INDEX "idx_article_translations_lang_code" ON "article_translations"("lang_code");
CREATE INDEX "idx_article_translations_seo_slug" ON "article_translations"("seo_slug");

-- Create article_related_articles table
CREATE TABLE "article_related_articles" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "article_id" UUID NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
  "related_article_id" UUID NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
  "display_order" INTEGER DEFAULT 0,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE("article_id", "related_article_id"),
  CHECK ("article_id" != "related_article_id")
);

CREATE INDEX "idx_article_related_articles_article_id" ON "article_related_articles"("article_id");
CREATE INDEX "idx_article_related_articles_related_article_id" ON "article_related_articles"("related_article_id");
CREATE INDEX "idx_article_related_articles_display_order" ON "article_related_articles"("display_order");

-- Create comments table
CREATE TABLE "comments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "article_id" UUID NOT NULL REFERENCES "articles"("id") ON DELETE CASCADE,
  "parent_comment_id" UUID REFERENCES "comments"("id") ON DELETE CASCADE,
  "author_name" VARCHAR(255) NOT NULL,
  "author_email" VARCHAR(255) NOT NULL,
  "content" TEXT NOT NULL,
  "status" VARCHAR(50) DEFAULT 'pending',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

CREATE INDEX "idx_comments_article_id" ON "comments"("article_id");
CREATE INDEX "idx_comments_parent_comment_id" ON "comments"("parent_comment_id");
CREATE INDEX "idx_comments_status" ON "comments"("status");
CREATE INDEX "idx_comments_created_at" ON "comments"("created_at");
CREATE INDEX "idx_comments_deleted_at" ON "comments"("deleted_at");

-- Create places table
CREATE TABLE "places" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "category_id" UUID NOT NULL REFERENCES "categories"("id") ON DELETE RESTRICT,
  "main_image_url" TEXT,
  "is_featured" BOOLEAN DEFAULT false,
  "status" VARCHAR(50) DEFAULT 'draft',
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "deleted_at" TIMESTAMP WITH TIME ZONE
);

CREATE INDEX "idx_places_category_id" ON "places"("category_id");
CREATE INDEX "idx_places_is_featured" ON "places"("is_featured");
CREATE INDEX "idx_places_status" ON "places"("status");
CREATE INDEX "idx_places_deleted_at" ON "places"("deleted_at");

-- Create place_translations table
CREATE TABLE "place_translations" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "place_id" UUID NOT NULL REFERENCES "places"("id") ON DELETE CASCADE,
  "lang_code" VARCHAR(5) NOT NULL,
  "name" VARCHAR(500) NOT NULL,
  "description" TEXT,
  "seo_slug" VARCHAR(255) NOT NULL,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE("place_id", "lang_code")
);

CREATE INDEX "idx_place_translations_place_id" ON "place_translations"("place_id");
CREATE INDEX "idx_place_translations_lang_code" ON "place_translations"("lang_code");
CREATE INDEX "idx_place_translations_seo_slug" ON "place_translations"("seo_slug");

-- Create details_accommodation table
CREATE TABLE "details_accommodation" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "place_id" UUID NOT NULL REFERENCES "places"("id") ON DELETE CASCADE UNIQUE,
  "price_per_night" DECIMAL(10, 2),
  "capacity" INTEGER,
  "check_in_time" TIME,
  "check_out_time" TIME,
  "amenities" JSONB,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX "idx_details_accommodation_place_id" ON "details_accommodation"("place_id");
CREATE INDEX "idx_details_accommodation_price_per_night" ON "details_accommodation"("price_per_night");
CREATE INDEX "idx_details_accommodation_capacity" ON "details_accommodation"("capacity");

-- Create article_details_view
CREATE OR REPLACE VIEW "article_details_view" AS
SELECT 
  a.id AS article_id,
  a.category_id,
  a.author_id,
  a.featured_image_url,
  a.publication_date,
  a.read_time_minutes,
  a.view_count,
  a.is_featured,
  a.status,
  a.created_at AS article_created_at,
  a.updated_at AS article_updated_at,
  a.deleted_at AS article_deleted_at,
  at.id AS translation_id,
  at.lang_code,
  at.name AS article_name,
  at.description AS article_description,
  at.content AS article_content,
  at.featured_image_alt,
  at.seo_slug AS article_seo_slug,
  au.id AS author_id_ref,
  au.name AS author_name,
  au.slug AS author_slug,
  au.profile_image_url AS author_profile_image_url,
  au.social_links AS author_social_links,
  aut.bio AS author_bio,
  aut.seo_slug AS author_seo_slug,
  c.id AS category_id_ref,
  c.slug AS category_slug,
  c.icon_name AS category_icon_name,
  c.parent_id AS category_parent_id,
  ct.name AS category_name,
  ct.seo_slug AS category_seo_slug,
  ct.description AS category_description
FROM articles a
INNER JOIN article_translations at ON a.id = at.article_id
INNER JOIN authors au ON a.author_id = au.id
LEFT JOIN author_translations aut ON au.id = aut.author_id AND aut.lang_code = at.lang_code
INNER JOIN categories c ON a.category_id = c.id
LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.lang_code = at.lang_code;
