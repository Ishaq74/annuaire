// src/env.d.ts
// FICHIER COMPLET ET FINAL

interface ImportMetaEnv {
  readonly SUPABASE_URL: string
  readonly SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/// <reference types="astro/client" />

declare namespace App {
    interface Locals {
        lang: 'fr' | 'en' | 'es';

        site: {
            menuCategories: any[];
            // LA CARTE DE TRADUCTION DE TOUS LES SLUGS DU SITE
            i18nMap: {
                categories: Record<string, { fr: string, en: string, es: string }>;
                articles: Record<string, { fr: string, en: string, es: string }>;
                authors: Record<string, { fr: string, en: string, es: string }>;
            };
        };

        // LE CONTEXTE DE LA PAGE ACTUELLE
        pageContext?: {
            type: 'category' | 'article' | 'author';
            entityId: string; // L'ID de la catégorie ou de l'article
            categoryId?: string; // L'ID de la catégorie parente (pour les articles)
        };

        magazineIndexData?: {
            featuredArticles: any[];
            recentArticles: any[];
            sidebarCategoriesArticlesWithCount: any[];
            sidebarPopularArticles: any[];
        };

        magazineCategoryData?: {
            category: any;
            articles: any[];
            popularInCategory: any[];
        };

        articlePageData?: {
            article: any;
            relatedArticles: any[];
            sameCategoryArticles: any[];
            comments: any[];
        };

        authorPageData?: {
            author: any;
            articles: any[];
        };
    }
}