# Documentation de la Base de Données - Annuaire d'Annecy

## Vue d'ensemble

Ce document accompagne le fichier `schema.sql` qui contient le schéma complet de la base de données PostgreSQL (via Supabase) utilisée par l'application Annuaire d'Annecy.

## Tables principales

### 1. **categories**
Stocke les catégories hiérarchiques utilisées pour organiser le contenu.

**Champs principaux:**
- `id` (UUID) - Identifiant unique
- `parent_id` (UUID) - Référence à la catégorie parente (NULL pour les catégories racines)
- `slug` (VARCHAR) - Identifiant textuel unique
- `icon_name` (VARCHAR) - Nom de l'icône associée
- `is_active` (BOOLEAN) - Statut d'activation
- `display_order` (INTEGER) - Ordre d'affichage

**Relation:** Auto-référentielle via `parent_id`

### 2. **category_translations**
Traductions multilingues pour les catégories.

**Champs principaux:**
- `category_id` (UUID) - Référence à la catégorie
- `lang_code` (VARCHAR) - Code de langue ('fr', 'en', 'es', etc.)
- `name` (VARCHAR) - Nom traduit
- `seo_slug` (VARCHAR) - Slug SEO traduit
- `description` (TEXT) - Description traduite

**Relation:** N:1 avec `categories`

### 3. **authors**
Stocke les auteurs/contributeurs des articles.

**Champs principaux:**
- `id` (UUID) - Identifiant unique
- `slug` (VARCHAR) - Identifiant textuel unique
- `name` (VARCHAR) - Nom de l'auteur
- `profile_image_url` (TEXT) - URL de l'image de profil
- `social_links` (JSONB) - Liens vers les réseaux sociaux

**Format social_links:**
```json
[
  {"platform": "twitter", "url": "https://twitter.com/..."},
  {"platform": "linkedin", "url": "https://linkedin.com/in/..."}
]
```

### 4. **author_translations**
Traductions multilingues pour les auteurs.

**Champs principaux:**
- `author_id` (UUID) - Référence à l'auteur
- `lang_code` (VARCHAR) - Code de langue
- `bio` (TEXT) - Biographie traduite
- `seo_slug` (VARCHAR) - Slug SEO traduit

**Relation:** N:1 avec `authors`

### 5. **articles**
Stocke les articles du magazine.

**Champs principaux:**
- `id` (UUID) - Identifiant unique
- `category_id` (UUID) - Référence à la catégorie
- `author_id` (UUID) - Référence à l'auteur
- `featured_image_url` (TEXT) - URL de l'image principale
- `publication_date` (TIMESTAMP) - Date de publication
- `read_time_minutes` (INTEGER) - Temps de lecture estimé
- `view_count` (INTEGER) - Nombre de vues
- `is_featured` (BOOLEAN) - Article à la une
- `status` (VARCHAR) - Statut ('draft', 'published', 'archived')
- `deleted_at` (TIMESTAMP) - Date de suppression (soft delete)

**Relations:**
- N:1 avec `categories` via `category_id`
- N:1 avec `authors` via `author_id`

### 6. **article_translations**
Traductions multilingues pour les articles.

**Champs principaux:**
- `article_id` (UUID) - Référence à l'article
- `lang_code` (VARCHAR) - Code de langue
- `name` (VARCHAR) - Titre de l'article
- `description` (TEXT) - Résumé/extrait
- `content` (TEXT) - Contenu complet (HTML)
- `featured_image_alt` (VARCHAR) - Texte alternatif de l'image
- `seo_slug` (VARCHAR) - Slug SEO traduit

**Relation:** N:1 avec `articles`

### 7. **article_related_articles**
Table de jonction pour les articles liés/recommandés.

**Champs principaux:**
- `article_id` (UUID) - Article principal
- `related_article_id` (UUID) - Article lié
- `display_order` (INTEGER) - Ordre d'affichage

**Relation:** M:N auto-référentielle sur `articles`

### 8. **comments**
Commentaires sur les articles avec support de fils de discussion.

**Champs principaux:**
- `id` (UUID) - Identifiant unique
- `article_id` (UUID) - Référence à l'article
- `parent_comment_id` (UUID) - Référence au commentaire parent (NULL pour les commentaires de niveau 1)
- `author_name` (VARCHAR) - Nom de l'auteur du commentaire
- `author_email` (VARCHAR) - Email de l'auteur
- `content` (TEXT) - Contenu du commentaire
- `status` (VARCHAR) - Statut ('pending', 'approved', 'rejected', 'spam')
- `deleted_at` (TIMESTAMP) - Date de suppression (soft delete)

**Relations:**
- N:1 avec `articles` via `article_id`
- Auto-référentielle via `parent_comment_id` (pour les réponses)

### 9. **places**
Stocke les lieux (hébergements, restaurants, attractions, etc.).

**Champs principaux:**
- `id` (UUID) - Identifiant unique
- `category_id` (UUID) - Référence à la catégorie
- `main_image_url` (TEXT) - URL de l'image principale
- `is_featured` (BOOLEAN) - Lieu à la une
- `status` (VARCHAR) - Statut ('draft', 'published', 'archived')
- `deleted_at` (TIMESTAMP) - Date de suppression (soft delete)

**Relation:** N:1 avec `categories` via `category_id`

### 10. **place_translations**
Traductions multilingues pour les lieux.

**Champs principaux:**
- `place_id` (UUID) - Référence au lieu
- `lang_code` (VARCHAR) - Code de langue
- `name` (VARCHAR) - Nom du lieu
- `description` (TEXT) - Description
- `seo_slug` (VARCHAR) - Slug SEO traduit

**Relation:** N:1 avec `places`

### 11. **details_accommodation**
Détails spécifiques aux hébergements.

**Champs principaux:**
- `place_id` (UUID) - Référence au lieu (UNIQUE)
- `price_per_night` (DECIMAL) - Prix par nuit
- `capacity` (INTEGER) - Capacité d'accueil
- `check_in_time` (TIME) - Heure d'arrivée
- `check_out_time` (TIME) - Heure de départ
- `amenities` (JSONB) - Équipements disponibles

**Format amenities:**
```json
["wifi", "parking", "breakfast", "air_conditioning", "pool"]
```

**Relation:** 1:1 avec `places` via `place_id`

## Vues

### article_details_view
Vue qui facilite les requêtes d'articles en joignant toutes les informations nécessaires:
- Données de l'article et sa traduction
- Informations de l'auteur et sa traduction
- Informations de la catégorie et sa traduction

Cette vue est utilisée pour optimiser les requêtes fréquentes et simplifier le code de l'application.

## Architecture multilingue

Le système utilise une approche de **tables de traduction séparées** pour supporter le multilingue:

1. Chaque entité principale a une table de traduction associée
2. Les traductions sont liées via un `lang_code` ('fr', 'en', 'es', etc.)
3. Contrainte UNIQUE sur (`entity_id`, `lang_code`) pour éviter les doublons

**Avantages:**
- Facilite l'ajout de nouvelles langues
- Permet des traductions partielles
- Structure de données claire et maintenable

## Hiérarchie des catégories

Les catégories utilisent un modèle **auto-référentiel** via `parent_id`:

```
Magazine (parent_id = NULL)
├── Actualités
├── Culture
└── Bon Plans

Hébergements (parent_id = NULL)
├── Hôtels
├── Chambres d'hôtes
└── Gîtes
```

**IDs de référence:**
- Magazine: `d20b7566-105a-47f3-947f-dab773bef43e`
- Hébergements: `ad66f5d9-5f9f-4e2d-8d1f-6d2e5d5f6f5f`

## Statuts

### Articles et Places
- `draft` - Brouillon, non publié
- `published` - Publié et visible
- `archived` - Archivé, non visible mais conservé

### Commentaires
- `pending` - En attente de modération
- `approved` - Approuvé et visible
- `rejected` - Rejeté par la modération
- `spam` - Marqué comme spam

## Soft Delete

Les tables suivantes utilisent le **soft delete** via `deleted_at`:
- `articles`
- `comments`
- `places`

**Avantage:** Permet de conserver l'historique et de restaurer les données supprimées.

## Index

Le schéma inclut des index sur les champs fréquemment utilisés dans les requêtes:
- Clés étrangères (`category_id`, `author_id`, etc.)
- Champs de recherche (`slug`, `seo_slug`, etc.)
- Champs de filtrage (`status`, `is_featured`, etc.)
- Champs de tri (`display_order`, `publication_date`, etc.)

## Relations principales

```
categories (1) -----> (N) category_translations
authors (1) --------> (N) author_translations
articles (1) -------> (N) article_translations
places (1) ---------> (N) place_translations

categories (1) -----> (N) articles
categories (1) -----> (N) places
authors (1) --------> (N) articles

articles (1) -------> (N) comments
comments (1) -------> (N) comments [auto-référentielle]

articles (N) <-----> (N) articles [via article_related_articles]

places (1) ---------> (1) details_accommodation
```

## Utilisation dans le code

Les requêtes Supabase dans le code utilisent principalement:
- Jointures avec `!inner` pour les relations obligatoires
- Filtrage par `lang_code` pour le multilingue
- Filtres sur `is_active`, `status`, `deleted_at` pour les données visibles

**Exemple de requête typique:**
```typescript
const { data } = await supabase
  .from('articles')
  .select(`
    id,
    featured_image_url,
    article_translations!inner(name, description, seo_slug, lang_code),
    authors!inner(name, profile_image_url),
    categories!inner(category_translations!inner(name, seo_slug))
  `)
  .eq('article_translations.lang_code', 'fr')
  .eq('status', 'published')
  .is('deleted_at', null);
```

## Notes techniques

- **Base de données:** PostgreSQL via Supabase
- **Type d'ID:** UUID v4 générés automatiquement
- **Timestamps:** `TIMESTAMP WITH TIME ZONE` pour gérer les fuseaux horaires
- **JSONB:** Utilisé pour les données structurées flexibles (social_links, amenities)
- **Contraintes:** Clés étrangères avec `ON DELETE CASCADE` ou `RESTRICT` selon le cas d'usage
