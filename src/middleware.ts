// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import { supabase } from './lib/supabase'; // Assure-toi que le chemin est correct

export const onRequest = defineMiddleware(async (context, next) => {
    const { url, locals, params } = context;

    // 1. Extraire la langue de l'URL
    const lang = params.lang || 'fr';
    locals.lang = lang;
console.log('URL Pathname:', url.pathname);
    // 2. Charger toutes les catégories et leurs traductions (pour le menu et i18nMap)
    const { data: menuCategories, error: menuCategoriesError } = await supabase
        .from('categories')
        .select(`
            id,
            parent_id,
            slug,
            icon_name,
            is_active,
            display_order,  
            category_translations(lang_code, name, seo_slug, description)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

    if (menuCategoriesError) {
        console.error("Erreur de chargement des catégories de menu :", menuCategoriesError);
        locals.site = { menuCategories: [], i18nMap: { articles: {}, categories: {}, authors: {}, places: {} } };
    } else {
        locals.site = locals.site || {};
        locals.site.menuCategories = menuCategories || [];

        // 3. Construire la i18nMap pour la traduction des slugs
        const i18nMap: any = { articles: {}, categories: {}, authors: {}, places: {} };

        menuCategories.forEach(cat => {
            i18nMap.categories[cat.id] = {};
            cat.category_translations.forEach(t => {
                i18nMap.categories[cat.id][t.lang_code] = t.seo_slug || cat.slug;
            });
        });

        const { data: articlesForI18n, error: articlesI18nError } = await supabase
            .from('articles')
            .select('id, article_translations(lang_code, seo_slug)');
        if (!articlesI18nError && articlesForI18n) {
            articlesForI18n.forEach(article => {
                i18nMap.articles[article.id] = {};
                article.article_translations.forEach(t => {
                    i18nMap.articles[article.id][t.lang_code] = t.seo_slug;
                });
            });
        } else if (articlesI18nError) {
            console.error("Erreur de chargement des articles pour i18nMap :", articlesI18nError);
        }

        const { data: authorsForI18n, error: authorsI18nError } = await supabase
            .from('authors')
            .select('id, author_translations(lang_code, seo_slug)');
        if (!authorsI18nError && authorsForI18n) {
            authorsForI18n.forEach(author => {
                i18nMap.authors[author.id] = {};
                author.author_translations.forEach(t => {
                    i18nMap.authors[author.id][t.lang_code] = t.seo_slug;
                });
            });
        } else if (authorsI18nError) {
            console.error("Erreur de chargement des auteurs pour i18nMap :", authorsI18nError);
        }

        const { data: placesForI18n, error: placesI18nError } = await supabase
            .from('places')
            .select('id, place_translations(lang_code, seo_slug)');
        if (!placesI18nError && placesForI18n) {
            placesForI18n.forEach(place => {
                i18nMap.places[place.id] = {};
                place.place_translations.forEach(t => {
                    i18nMap.places[place.id][t.lang_code] = t.seo_slug;
                });
            });
        } else if (placesI18nError) {
            console.error("Erreur de chargement des places pour i18nMap :", placesI18nError);
        }

        locals.site.i18nMap = i18nMap;
    }

    // 4. Déterminer le contexte de la page actuelle
    locals.pageContext = null;

    const pathSegments = url.pathname.split('/').filter(Boolean);

    if (pathSegments.length >= 2 && pathSegments[0] === lang) {
        const rootSlugFromUrl = pathSegments[1];
        console.log('Root Slug:', rootSlugFromUrl);
        const rootCategory = menuCategories?.find(cat =>
            cat.parent_id === null &&
            (cat.slug === rootSlugFromUrl || cat.category_translations.some(t => t.seo_slug === rootSlugFromUrl && t.lang_code === lang))
        );
        console.log('Found Root Category:', rootCategory);

        if (rootCategory) {
            console.log('pageContext set:', locals.pageContext);
            // Distinguer entre magazine et hébergements via l'ID de la catégorie racine
            if (rootCategory.id === 'd20b7566-105a-47f3-947f-dab773bef43e') { // ID du magazine
                // Cas 1: Page d'index du magazine (ex: /fr/magazine)
                if (pathSegments.length === 2) {
                    locals.pageContext = { type: 'category', entityId: rootCategory.id, categoryType: 'magazine-index' };
                }

                // Cas 2: Page de sous-catégorie du magazine (ex: /fr/magazine/actualites)
                if (pathSegments.length >= 3) {
                    const subCategorySlugFromUrl = pathSegments[2];
                    const subCategory = menuCategories?.find(cat =>
                        cat.parent_id === rootCategory.id &&
                        (cat.slug === subCategorySlugFromUrl || cat.category_translations.some(t => t.seo_slug === subCategorySlugFromUrl && t.lang_code === lang))
                    );

                    if (subCategory) {
                        locals.pageContext = { type: 'category', entityId: subCategory.id, parentCategoryId: rootCategory.id, categoryType: 'sub-category' };

                        // Cas 3: Page d'article (ex: /fr/magazine/actualites/mon-article)
                        if (pathSegments.length >= 4) {
                            const articleSlugFromUrl = pathSegments[3];
                            const { data: articleIdData, error: articleIdError } = await supabase
                                .from('articles')
                                .select('id, category_id, article_translations!inner(seo_slug, lang_code)')
                                .eq('article_translations.seo_slug', articleSlugFromUrl)
                                .eq('article_translations.lang_code', lang)
                                .maybeSingle();

                            if (!articleIdError && articleIdData && articleIdData.category_id === subCategory.id) {
                                locals.pageContext = { type: 'article', entityId: articleIdData.id, categoryId: articleIdData.category_id };
                            } else if (articleIdError) {
                                console.error("Erreur de recherche d'article pour pageContext :", articleIdError);
                            }
                        }
                    }
                }
            } else if (rootCategory.id === 'ad66f5d9-5f9f-4e2d-8d1f-6d2e5d5f6f5f') { // Remplace par l'ID réel des hébergements
                // Cas 1: Page d'index des hébergements (ex: /fr/hebergements)
                if (pathSegments.length === 2) {
                    locals.pageContext = { type: 'category', entityId: rootCategory.id, categoryType: 'hebergements-index' };
                }

                // Cas 2: Page de sous-catégorie des hébergements (ex: /fr/hebergements/hotels)
                if (pathSegments.length >= 3) {
                    const subCategorySlugFromUrl = pathSegments[2];
                    const subCategory = menuCategories?.find(cat =>
                        cat.parent_id === rootCategory.id &&
                        (cat.slug === subCategorySlugFromUrl || cat.category_translations.some(t => t.seo_slug === subCategorySlugFromUrl && t.lang_code === lang))
                    );

                    if (subCategory) {
                        locals.pageContext = { type: 'category', entityId: subCategory.id, parentCategoryId: rootCategory.id, categoryType: 'sub-category' };

                        // Cas 3: Page d'un hébergement (ex: /fr/hebergements/hotels/mon-hotel)
                        if (pathSegments.length >= 4) {
                            const placeSlugFromUrl = pathSegments[3];
                            const { data: placeIdData, error: placeIdError } = await supabase
                                .from('places')
                                .select('id, category_id, place_translations!inner(seo_slug, lang_code)')
                                .eq('place_translations.seo_slug', placeSlugFromUrl)
                                .eq('place_translations.lang_code', lang)
                                .maybeSingle();

                            if (!placeIdError && placeIdData && placeIdData.category_id === subCategory.id) {
                                locals.pageContext = { type: 'place', entityId: placeIdData.id, categoryId: placeIdData.category_id };
                            } else if (placeIdError) {
                                console.error("Erreur de recherche de place pour pageContext :", placeIdError);
                            }
                        }
                    }
                }
            }
        }
    }

    // Gestion des pages d'auteur (ex: /fr/auteurs/jane-doe)
    if (pathSegments.length >= 2 && pathSegments[0] === lang && pathSegments[1] === 'auteurs' && pathSegments.length === 3) {
        const authorSlugFromUrl = pathSegments[2];
        const { data: authorIdData, error: authorIdError } = await supabase
            .from('authors')
            .select('id, author_translations!inner(seo_slug, lang_code)')
            .eq('author_translations.seo_slug', authorSlugFromUrl)
            .eq('author_translations.lang_code', lang)
            .maybeSingle();

        if (!authorIdError && authorIdData) {
            locals.pageContext = { type: 'author', entityId: authorIdData.id };
        } else if (authorIdError) {
            console.error("Erreur de recherche d'auteur pour pageContext :", authorIdError);
        }
    }

    return next();
});




