# Diagramme ERD (Entity Relationship Diagram)
# Schéma de la base de données - Annuaire d'Annecy

## Vue d'ensemble des relations

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         SYSTÈME MULTILINGUE                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐         ┌────────────────────────┐
│   categories     │ 1     N │ category_translations  │
│                  │◄────────┤                        │
│ • id (PK)        │         │ • id (PK)              │
│ • parent_id (FK) │         │ • category_id (FK)     │
│ • slug           │         │ • lang_code            │
│ • icon_name      │         │ • name                 │
│ • is_active      │         │ • seo_slug             │
│ • display_order  │         │ • description          │
└────────┬─────────┘         └────────────────────────┘
         │
         │ Auto-référentielle (hiérarchie)
         │
         └─────►
         
         
┌──────────────────┐         ┌────────────────────────┐
│     authors      │ 1     N │  author_translations   │
│                  │◄────────┤                        │
│ • id (PK)        │         │ • id (PK)              │
│ • slug           │         │ • author_id (FK)       │
│ • name           │         │ • lang_code            │
│ • profile_image  │         │ • bio                  │
│ • social_links   │         │ • seo_slug             │
└────────┬─────────┘         └────────────────────────┘
         │
         │
         │
         ▼
┌──────────────────┐         ┌────────────────────────┐
│    articles      │ 1     N │ article_translations   │
│                  │◄────────┤                        │
│ • id (PK)        │         │ • id (PK)              │
│ • category_id(FK)│         │ • article_id (FK)      │
│ • author_id (FK) │         │ • lang_code            │
│ • featured_image │         │ • name                 │
│ • publication_dt │         │ • description          │
│ • read_time      │         │ • content              │
│ • view_count     │         │ • featured_image_alt   │
│ • is_featured    │         │ • seo_slug             │
│ • status         │         └────────────────────────┘
│ • deleted_at     │
└────────┬─────────┘
         │
         │ 1
         │
         ▼ N
┌──────────────────┐
│    comments      │
│                  │
│ • id (PK)        │
│ • article_id(FK) │
│ • parent_id (FK) │──┐ Auto-référentielle
│ • author_name    │  │ (fils de discussion)
│ • author_email   │  │
│ • content        │◄─┘
│ • status         │
│ • deleted_at     │
└──────────────────┘


┌─────────────────────────────────────┐
│  article_related_articles (M:N)    │
│                                     │
│ • id (PK)                           │
│ • article_id (FK) ───────┐          │
│ • related_article_id(FK)─┼──►articles
│ • display_order          │          │
└─────────────────────────────────────┘


┌──────────────────┐         ┌────────────────────────┐
│     places       │ 1     N │  place_translations    │
│                  │◄────────┤                        │
│ • id (PK)        │         │ • id (PK)              │
│ • category_id(FK)│         │ • place_id (FK)        │
│ • main_image_url │         │ • lang_code            │
│ • is_featured    │         │ • name                 │
│ • status         │         │ • description          │
│ • deleted_at     │         │ • seo_slug             │
└────────┬─────────┘         └────────────────────────┘
         │
         │ 1
         │
         ▼ 1
┌──────────────────────────┐
│  details_accommodation   │
│                          │
│ • id (PK)                │
│ • place_id (FK) UNIQUE   │
│ • price_per_night        │
│ • capacity               │
│ • check_in_time          │
│ • check_out_time         │
│ • amenities (JSONB)      │
└──────────────────────────┘
```

## Relations détaillées

### 1. Hiérarchie des catégories (auto-référentielle)
```
categories.parent_id → categories.id

Exemple:
Magazine (id: xxx, parent_id: NULL)
  ├── Actualités (parent_id: Magazine.id)
  ├── Culture (parent_id: Magazine.id)
  └── Bon Plans (parent_id: Magazine.id)
```

### 2. Categories → Articles/Places
```
categories.id → articles.category_id (1:N)
categories.id → places.category_id (1:N)
```

### 3. Authors → Articles
```
authors.id → articles.author_id (1:N)
```

### 4. Articles → Comments (avec réponses)
```
articles.id → comments.article_id (1:N)
comments.id → comments.parent_comment_id (1:N auto-référentielle)
```

### 5. Articles → Articles liés (M:N)
```
articles.id → article_related_articles.article_id
articles.id → article_related_articles.related_article_id
```

### 6. Places → Accommodation Details (1:1)
```
places.id → details_accommodation.place_id (1:1 UNIQUE)
```

### 7. Traductions (1:N pour chaque entité)
```
categories.id → category_translations.category_id (1:N)
authors.id → author_translations.author_id (1:N)
articles.id → article_translations.article_id (1:N)
places.id → place_translations.place_id (1:N)
```

## Vue: article_details_view

```
┌─────────────────────────────────────────────────────────────┐
│              article_details_view (Vue)                      │
│                                                              │
│  Jointures:                                                  │
│  • articles ⋈ article_translations (on lang_code)           │
│  • articles ⋈ authors ⋈ author_translations (on lang_code) │
│  • articles ⋈ categories ⋈ category_translations (on ...)  │
│                                                              │
│  Simplifie les requêtes fréquentes d'articles avec          │
│  toutes leurs informations traduites                        │
└─────────────────────────────────────────────────────────────┘
```

## Contraintes principales

### Clés primaires (PK)
- Tous les `id` sont des UUID générés automatiquement
- Format: `gen_random_uuid()`

### Clés étrangères (FK)
- `ON DELETE CASCADE`: Suppression en cascade
  - Traductions (supprimées si l'entité parent est supprimée)
  - Comments (supprimés si l'article est supprimé)
  - Article relations (supprimées si un article est supprimé)
  
- `ON DELETE RESTRICT`: Empêche la suppression
  - Articles/Places (ne peuvent être supprimés si la catégorie existe)
  - Articles (ne peuvent être supprimés si l'auteur existe)

- `ON DELETE SET NULL`: Mise à NULL
  - Categories.parent_id (si parent supprimé)

### Contraintes UNIQUE
- `categories.slug`
- `authors.slug`
- `(category_id, lang_code)` pour toutes les tables de traduction
- `details_accommodation.place_id`

### Contraintes CHECK
- `article_related_articles`: article_id ≠ related_article_id
  (Un article ne peut pas être lié à lui-même)

## Champs JSONB

### authors.social_links
```json
[
  {"platform": "twitter", "url": "https://..."},
  {"platform": "linkedin", "url": "https://..."},
  {"platform": "facebook", "url": "https://..."}
]
```

### details_accommodation.amenities
```json
[
  "wifi",
  "parking",
  "breakfast",
  "air_conditioning",
  "pool",
  "pet_friendly"
]
```

## Index importants

### Pour les performances
- `categories`: parent_id, is_active, display_order
- `articles`: category_id, author_id, publication_date, view_count, is_featured, status
- `comments`: article_id, parent_comment_id, status, created_at
- `places`: category_id, is_featured, status
- Toutes les traductions: entity_id, lang_code, seo_slug

## Codes de langue supportés

```
fr  - Français
en  - English
es  - Español
(extensible selon les besoins)
```

## Statuts

### Articles & Places
```
draft     → Brouillon
published → Publié
archived  → Archivé
```

### Comments
```
pending  → En attente
approved → Approuvé
rejected → Rejeté
spam     → Spam
```

## Soft Delete

Tables avec `deleted_at`:
- `articles`
- `comments`
- `places`

Les enregistrements avec `deleted_at NOT NULL` sont considérés comme supprimés
mais restent dans la base pour l'historique.

## Cardinalités

```
categories      1 ──── N  category_translations
authors         1 ──── N  author_translations
articles        1 ──── N  article_translations
places          1 ──── N  place_translations

categories      1 ──── N  articles
categories      1 ──── N  places
authors         1 ──── N  articles

articles        1 ──── N  comments
comments        1 ──── N  comments (auto)

articles        N ──── N  articles (via article_related_articles)

places          1 ──── 1  details_accommodation
```
