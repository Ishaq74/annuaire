# Drizzle ORM - Schema et Migration

Ce dossier contient le schéma Drizzle ORM et les fichiers de migration pour la base de données PostgreSQL de l'Annuaire d'Annecy.

## Fichiers

- **`schema.ts`** - Schéma complet Drizzle ORM avec toutes les tables et relations
- **`seed.ts`** - Données d'exemple pour peupler la base de données
- **`0000_initial.sql`** - Migration SQL initiale pour créer toutes les tables

## Installation

Pour utiliser ces fichiers dans votre projet, vous devrez installer Drizzle ORM et ses dépendances :

```bash
npm install drizzle-orm postgres
npm install -D drizzle-kit
```

## Configuration

### 1. Créer un fichier `drizzle.config.ts` à la racine du projet

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './drizzle/schema.ts',
  out: './drizzle/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

### 2. Ajouter les variables d'environnement

Créez un fichier `.env` :

```env
DATABASE_URL=postgresql://user:password@host:port/database
```

## Utilisation

### Générer les migrations

```bash
npx drizzle-kit generate:pg
```

### Appliquer les migrations

```bash
npx drizzle-kit push:pg
```

Ou utilisez directement le fichier SQL :

```bash
psql $DATABASE_URL -f drizzle/0000_initial.sql
```

### Peupler la base de données (seed)

```bash
npx tsx drizzle/seed.ts
```

Ou avec ts-node :

```bash
npx ts-node drizzle/seed.ts
```

## Structure du schéma

### Tables principales

1. **categories** - Catégories hiérarchiques
2. **category_translations** - Traductions des catégories
3. **authors** - Auteurs/contributeurs
4. **author_translations** - Traductions des auteurs
5. **articles** - Articles du magazine
6. **article_translations** - Traductions des articles
7. **article_related_articles** - Relations entre articles
8. **comments** - Commentaires avec threading
9. **places** - Lieux (hébergements, etc.)
10. **place_translations** - Traductions des lieux
11. **details_accommodation** - Détails des hébergements

### Vue

- **article_details_view** - Vue combinant articles avec traductions, auteurs et catégories

## Utilisation dans le code

### Import du schéma

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './drizzle/schema';

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client, { schema });
```

### Requêtes avec relations

```typescript
// Récupérer un article avec ses traductions et son auteur
const article = await db.query.articles.findFirst({
  where: eq(articles.id, articleId),
  with: {
    translations: true,
    author: {
      with: {
        translations: true,
      },
    },
    category: {
      with: {
        translations: true,
      },
    },
  },
});
```

### Requêtes simples

```typescript
// Récupérer tous les articles publiés
const publishedArticles = await db
  .select()
  .from(articles)
  .where(eq(articles.status, 'published'))
  .orderBy(desc(articles.publicationDate));
```

### Insert avec traductions

```typescript
// Créer un article avec traductions
const newArticle = await db.transaction(async (tx) => {
  const [article] = await tx
    .insert(articles)
    .values({
      categoryId: categoryId,
      authorId: authorId,
      status: 'published',
    })
    .returning();

  await tx.insert(articleTranslations).values([
    {
      articleId: article.id,
      langCode: 'fr',
      name: 'Titre en français',
      description: 'Description en français',
      content: '<p>Contenu en français</p>',
      seoSlug: 'titre-en-francais',
    },
    {
      articleId: article.id,
      langCode: 'en',
      name: 'Title in English',
      description: 'Description in English',
      content: '<p>Content in English</p>',
      seoSlug: 'title-in-english',
    },
  ]);

  return article;
});
```

## Données de seed

Le fichier `seed.ts` crée :

- **7 catégories** : Magazine (avec Actualités, Culture, Bon Plans) et Hébergements (avec Hôtels, Chambres d'hôtes)
- **3 auteurs** avec leurs profils et liens sociaux
- **4 articles** avec traductions en français et anglais
- **4 commentaires** dont certains avec réponses
- **3 places** (hébergements) avec détails
- Toutes les traductions multilingues (fr, en, et parfois es)

### IDs de référence

Les catégories racines ont des IDs fixes pour référence :

```typescript
const MAGAZINE_CATEGORY_ID = 'd20b7566-105a-47f3-947f-dab773bef43e';
const HEBERGEMENTS_CATEGORY_ID = 'ad66f5d9-5f9f-4e2d-8d1f-6d2e5d5f6f5f';
```

## Migration depuis Supabase

Si vous migrez depuis Supabase, vous pouvez :

1. Exporter vos données actuelles
2. Appliquer la migration SQL
3. Importer vos données ou utiliser le seed

Ou utiliser Drizzle directement avec Supabase :

```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const client = postgres(process.env.SUPABASE_DATABASE_URL!);
const db = drizzle(client, { schema });
```

## Scripts recommandés dans package.json

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate:pg",
    "db:push": "drizzle-kit push:pg",
    "db:studio": "drizzle-kit studio",
    "db:seed": "tsx drizzle/seed.ts"
  }
}
```

## Support

Pour plus d'informations sur Drizzle ORM :
- [Documentation officielle](https://orm.drizzle.team/)
- [Exemples PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)
- [Relations](https://orm.drizzle.team/docs/rqb)

## Notes importantes

1. **UUID** : Toutes les tables utilisent des UUIDs comme clés primaires
2. **Timestamps** : Tous les timestamps incluent le timezone
3. **Soft Delete** : Articles, commentaires et places utilisent `deleted_at`
4. **Multilingual** : Architecture de traduction séparée avec `lang_code`
5. **JSONB** : Utilisé pour `social_links` et `amenities`
6. **Indexes** : Tous les index importants sont définis pour les performances
7. **Contraintes** : Foreign keys, unique constraints et check constraints sont appliqués

## Prochaines étapes

Dans la prochaine PR, vous pourrez :
1. Configurer Drizzle dans le projet
2. Migrer de Supabase à PostgreSQL avec Drizzle
3. Utiliser les données du seed pour tester
4. Implémenter les requêtes avec Drizzle ORM
