-- =====================================================
-- SCHEMA SQL COMPLET - Annuaire d'Annecy
-- =====================================================
-- Ce fichier contient le schéma complet de la base de données
-- avec toutes les tables, relations et champs utilisés dans l'application.
-- 
-- Base de données: PostgreSQL (via Supabase)
-- =====================================================

-- =====================================================
-- TABLE: categories
-- =====================================================
-- Stocke les catégories hiérarchiques (Magazine, Hébergements, etc.)
-- Utilise un modèle de traduction séparé pour supporter le multilingue
-- =====================================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    icon_name VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_categories_parent_id ON categories(parent_id);
CREATE INDEX idx_categories_is_active ON categories(is_active);
CREATE INDEX idx_categories_display_order ON categories(display_order);

-- =====================================================
-- TABLE: category_translations
-- =====================================================
-- Traductions multilingues pour les catégories
-- Permet d'avoir le nom, slug SEO et description dans différentes langues
-- =====================================================
CREATE TABLE category_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
    lang_code VARCHAR(5) NOT NULL, -- ex: 'fr', 'en', 'es'
    name VARCHAR(255) NOT NULL,
    seo_slug VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(category_id, lang_code)
);

-- Index pour les requêtes de traduction
CREATE INDEX idx_category_translations_category_id ON category_translations(category_id);
CREATE INDEX idx_category_translations_lang_code ON category_translations(lang_code);
CREATE INDEX idx_category_translations_seo_slug ON category_translations(seo_slug);

-- =====================================================
-- TABLE: authors
-- =====================================================
-- Stocke les auteurs/contributeurs des articles
-- Les auteurs peuvent avoir une bio et des liens sociaux
-- =====================================================
CREATE TABLE authors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    profile_image_url TEXT,
    social_links JSONB, -- Format: [{"platform": "twitter", "url": "https://..."}]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour les recherches
CREATE INDEX idx_authors_slug ON authors(slug);

-- =====================================================
-- TABLE: author_translations
-- =====================================================
-- Traductions multilingues pour les auteurs
-- Permet d'avoir la bio et le slug SEO dans différentes langues
-- =====================================================
CREATE TABLE author_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
    lang_code VARCHAR(5) NOT NULL,
    bio TEXT,
    seo_slug VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(author_id, lang_code)
);

-- Index pour les requêtes de traduction
CREATE INDEX idx_author_translations_author_id ON author_translations(author_id);
CREATE INDEX idx_author_translations_lang_code ON author_translations(lang_code);
CREATE INDEX idx_author_translations_seo_slug ON author_translations(seo_slug);

-- =====================================================
-- TABLE: articles
-- =====================================================
-- Stocke les articles du magazine
-- Les articles sont liés à une catégorie et un auteur
-- =====================================================
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    author_id UUID NOT NULL REFERENCES authors(id) ON DELETE RESTRICT,
    featured_image_url TEXT,
    publication_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
    read_time_minutes INTEGER DEFAULT 5,
    view_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_articles_category_id ON articles(category_id);
CREATE INDEX idx_articles_author_id ON articles(author_id);
CREATE INDEX idx_articles_publication_date ON articles(publication_date);
CREATE INDEX idx_articles_is_featured ON articles(is_featured);
CREATE INDEX idx_articles_status ON articles(status);
CREATE INDEX idx_articles_view_count ON articles(view_count);
CREATE INDEX idx_articles_deleted_at ON articles(deleted_at);

-- =====================================================
-- TABLE: article_translations
-- =====================================================
-- Traductions multilingues pour les articles
-- Contient le titre, description, contenu et métadonnées SEO
-- =====================================================
CREATE TABLE article_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    lang_code VARCHAR(5) NOT NULL,
    name VARCHAR(500) NOT NULL, -- Titre de l'article
    description TEXT, -- Résumé/extrait de l'article
    content TEXT, -- Contenu complet de l'article (HTML)
    featured_image_alt VARCHAR(255),
    seo_slug VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(article_id, lang_code)
);

-- Index pour les requêtes de traduction
CREATE INDEX idx_article_translations_article_id ON article_translations(article_id);
CREATE INDEX idx_article_translations_lang_code ON article_translations(lang_code);
CREATE INDEX idx_article_translations_seo_slug ON article_translations(seo_slug);

-- =====================================================
-- TABLE: article_related_articles
-- =====================================================
-- Table de jonction pour les articles liés/recommandés
-- Permet de suggérer des articles connexes
-- =====================================================
CREATE TABLE article_related_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    related_article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(article_id, related_article_id),
    CHECK (article_id != related_article_id) -- Un article ne peut pas être lié à lui-même
);

-- Index pour les requêtes de relations
CREATE INDEX idx_article_related_articles_article_id ON article_related_articles(article_id);
CREATE INDEX idx_article_related_articles_related_article_id ON article_related_articles(related_article_id);
CREATE INDEX idx_article_related_articles_display_order ON article_related_articles(display_order);

-- =====================================================
-- TABLE: comments
-- =====================================================
-- Commentaires sur les articles avec support de fils de discussion
-- Les commentaires peuvent avoir des réponses (via parent_comment_id)
-- =====================================================
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'spam'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Index pour les requêtes de commentaires
CREATE INDEX idx_comments_article_id ON comments(article_id);
CREATE INDEX idx_comments_parent_comment_id ON comments(parent_comment_id);
CREATE INDEX idx_comments_status ON comments(status);
CREATE INDEX idx_comments_created_at ON comments(created_at);
CREATE INDEX idx_comments_deleted_at ON comments(deleted_at);

-- =====================================================
-- TABLE: places
-- =====================================================
-- Stocke les lieux (hébergements, restaurants, attractions, etc.)
-- Les places sont similaires aux articles mais pour les lieux physiques
-- =====================================================
CREATE TABLE places (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    main_image_url TEXT,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'published', 'archived'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_places_category_id ON places(category_id);
CREATE INDEX idx_places_is_featured ON places(is_featured);
CREATE INDEX idx_places_status ON places(status);
CREATE INDEX idx_places_deleted_at ON places(deleted_at);

-- =====================================================
-- TABLE: place_translations
-- =====================================================
-- Traductions multilingues pour les lieux
-- Contient le nom, description et métadonnées SEO
-- =====================================================
CREATE TABLE place_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE,
    lang_code VARCHAR(5) NOT NULL,
    name VARCHAR(500) NOT NULL,
    description TEXT,
    seo_slug VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(place_id, lang_code)
);

-- Index pour les requêtes de traduction
CREATE INDEX idx_place_translations_place_id ON place_translations(place_id);
CREATE INDEX idx_place_translations_lang_code ON place_translations(lang_code);
CREATE INDEX idx_place_translations_seo_slug ON place_translations(seo_slug);

-- =====================================================
-- TABLE: details_accommodation
-- =====================================================
-- Détails spécifiques aux hébergements
-- Extension de la table places pour les informations d'hébergement
-- =====================================================
CREATE TABLE details_accommodation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id UUID NOT NULL REFERENCES places(id) ON DELETE CASCADE UNIQUE,
    price_per_night DECIMAL(10, 2),
    capacity INTEGER,
    check_in_time TIME,
    check_out_time TIME,
    amenities JSONB, -- Format: ["wifi", "parking", "breakfast", etc.]
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index pour les requêtes d'hébergements
CREATE INDEX idx_details_accommodation_place_id ON details_accommodation(place_id);
CREATE INDEX idx_details_accommodation_price_per_night ON details_accommodation(price_per_night);
CREATE INDEX idx_details_accommodation_capacity ON details_accommodation(capacity);

-- =====================================================
-- VUE: article_details_view
-- =====================================================
-- Vue pour faciliter les requêtes d'articles avec toutes leurs informations
-- Inclut les données de l'article, de l'auteur et de la catégorie
-- =====================================================
CREATE OR REPLACE VIEW article_details_view AS
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
FROM 
    articles a
    INNER JOIN article_translations at ON a.id = at.article_id
    INNER JOIN authors au ON a.author_id = au.id
    LEFT JOIN author_translations aut ON au.id = aut.author_id AND aut.lang_code = at.lang_code
    INNER JOIN categories c ON a.category_id = c.id
    LEFT JOIN category_translations ct ON c.id = ct.category_id AND ct.lang_code = at.lang_code;

-- =====================================================
-- COMMENTAIRES SUR L'ARCHITECTURE
-- =====================================================
-- 
-- STRUCTURE MULTILINGUE:
-- Le système utilise une approche de tables de traduction séparées pour supporter
-- le multilingue. Chaque entité principale (categories, articles, authors, places)
-- a une table de traduction associée avec un champ lang_code.
--
-- RELATIONS PRINCIPALES:
-- 1. categories -> category_translations (1:N)
-- 2. authors -> author_translations (1:N)
-- 3. articles -> article_translations (1:N)
-- 4. places -> place_translations (1:N)
-- 5. categories -> articles (1:N via category_id)
-- 6. authors -> articles (1:N via author_id)
-- 7. articles -> comments (1:N via article_id)
-- 8. articles -> article_related_articles (M:N auto-relation)
-- 9. categories -> places (1:N via category_id)
-- 10. places -> details_accommodation (1:1)
--
-- HIÉRARCHIE DES CATÉGORIES:
-- Les catégories utilisent un modèle auto-référentiel via parent_id.
-- Exemple de structure:
--   - Magazine (parent_id = NULL, id = 'd20b7566-105a-47f3-947f-dab773bef43e')
--     - Actualités (parent_id = Magazine.id)
--     - Culture (parent_id = Magazine.id)
--     - Bon Plans (parent_id = Magazine.id)
--   - Hébergements (parent_id = NULL, id = 'ad66f5d9-5f9f-4e2d-8d1f-6d2e5d5f6f5f')
--     - Hôtels (parent_id = Hébergements.id)
--     - Chambres d'hôtes (parent_id = Hébergements.id)
--
-- SOFT DELETE:
-- Les articles, commentaires et places utilisent un champ deleted_at pour le soft delete.
-- Cela permet de conserver l'historique tout en masquant les éléments supprimés.
--
-- CHAMPS JSONB:
-- - authors.social_links: liens vers les réseaux sociaux de l'auteur
-- - details_accommodation.amenities: équipements de l'hébergement
--
-- STATUTS:
-- - Articles: 'draft', 'published', 'archived'
-- - Comments: 'pending', 'approved', 'rejected', 'spam'
-- - Places: 'draft', 'published', 'archived'
--
-- =====================================================
