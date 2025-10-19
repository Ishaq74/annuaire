// Seed data for Annuaire d'Annecy
// Ce fichier contient des données d'exemple pour peupler la base de données

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// IDs fixes pour référence (utilisez les mêmes que dans le code)
const MAGAZINE_CATEGORY_ID = 'd20b7566-105a-47f3-947f-dab773bef43e';
const HEBERGEMENTS_CATEGORY_ID = 'ad66f5d9-5f9f-4e2d-8d1f-6d2e5d5f6f5f';

async function seed() {
  // Connexion à la base de données
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client, { schema });

  console.log('🌱 Starting database seeding...');

  try {
    // =====================================================
    // CATEGORIES
    // =====================================================
    console.log('📁 Seeding categories...');
    
    const magazineCategory = await db.insert(schema.categories).values({
      id: MAGAZINE_CATEGORY_ID,
      slug: 'magazine',
      iconName: 'openmoji:newspaper',
      isActive: true,
      displayOrder: 1,
    }).returning();

    const hebergementsCategory = await db.insert(schema.categories).values({
      id: HEBERGEMENTS_CATEGORY_ID,
      slug: 'hebergements',
      iconName: 'openmoji:bed',
      isActive: true,
      displayOrder: 2,
    }).returning();

    // Sous-catégories Magazine
    const actualitesCategory = await db.insert(schema.categories).values({
      parentId: MAGAZINE_CATEGORY_ID,
      slug: 'actualites',
      iconName: 'openmoji:newspaper',
      isActive: true,
      displayOrder: 1,
    }).returning();

    const cultureCategory = await db.insert(schema.categories).values({
      parentId: MAGAZINE_CATEGORY_ID,
      slug: 'culture',
      iconName: 'openmoji:artist-palette',
      isActive: true,
      displayOrder: 2,
    }).returning();

    const bonPlansCategory = await db.insert(schema.categories).values({
      parentId: MAGAZINE_CATEGORY_ID,
      slug: 'bon-plans',
      iconName: 'openmoji:money-bag',
      isActive: true,
      displayOrder: 3,
    }).returning();

    // Sous-catégories Hébergements
    const hotelsCategory = await db.insert(schema.categories).values({
      parentId: HEBERGEMENTS_CATEGORY_ID,
      slug: 'hotels',
      iconName: 'openmoji:hotel',
      isActive: true,
      displayOrder: 1,
    }).returning();

    const chambresHotesCategory = await db.insert(schema.categories).values({
      parentId: HEBERGEMENTS_CATEGORY_ID,
      slug: 'chambres-hotes',
      iconName: 'openmoji:house',
      isActive: true,
      displayOrder: 2,
    }).returning();

    // =====================================================
    // CATEGORY TRANSLATIONS
    // =====================================================
    console.log('🌍 Seeding category translations...');

    // Magazine (FR, EN, ES)
    await db.insert(schema.categoryTranslations).values([
      {
        categoryId: MAGAZINE_CATEGORY_ID,
        langCode: 'fr',
        name: 'Magazine',
        seoSlug: 'magazine',
        description: 'Découvrez les dernières actualités, bons plans et histoires qui font la richesse d\'Annecy et de sa région.',
      },
      {
        categoryId: MAGAZINE_CATEGORY_ID,
        langCode: 'en',
        name: 'Magazine',
        seoSlug: 'magazine',
        description: 'Discover the latest news, deals and stories that make Annecy and its region so special.',
      },
      {
        categoryId: MAGAZINE_CATEGORY_ID,
        langCode: 'es',
        name: 'Revista',
        seoSlug: 'revista',
        description: 'Descubre las últimas noticias, ofertas e historias que hacen de Annecy y su región algo especial.',
      },
    ]);

    // Hébergements (FR, EN, ES)
    await db.insert(schema.categoryTranslations).values([
      {
        categoryId: HEBERGEMENTS_CATEGORY_ID,
        langCode: 'fr',
        name: 'Hébergements',
        seoSlug: 'hebergements',
        description: 'Trouvez le logement idéal pour votre séjour à Annecy.',
      },
      {
        categoryId: HEBERGEMENTS_CATEGORY_ID,
        langCode: 'en',
        name: 'Accommodations',
        seoSlug: 'accommodations',
        description: 'Find the perfect place to stay in Annecy.',
      },
      {
        categoryId: HEBERGEMENTS_CATEGORY_ID,
        langCode: 'es',
        name: 'Alojamientos',
        seoSlug: 'alojamientos',
        description: 'Encuentra el alojamiento perfecto para tu estancia en Annecy.',
      },
    ]);

    // Actualités
    await db.insert(schema.categoryTranslations).values([
      {
        categoryId: actualitesCategory[0].id,
        langCode: 'fr',
        name: 'Actualités',
        seoSlug: 'actualites',
        description: 'Les dernières nouvelles d\'Annecy et de sa région.',
      },
      {
        categoryId: actualitesCategory[0].id,
        langCode: 'en',
        name: 'News',
        seoSlug: 'news',
        description: 'Latest news from Annecy and its region.',
      },
    ]);

    // Culture
    await db.insert(schema.categoryTranslations).values([
      {
        categoryId: cultureCategory[0].id,
        langCode: 'fr',
        name: 'Culture',
        seoSlug: 'culture',
        description: 'Événements culturels, expositions et spectacles à Annecy.',
      },
      {
        categoryId: cultureCategory[0].id,
        langCode: 'en',
        name: 'Culture',
        seoSlug: 'culture',
        description: 'Cultural events, exhibitions and shows in Annecy.',
      },
    ]);

    // Bon Plans
    await db.insert(schema.categoryTranslations).values([
      {
        categoryId: bonPlansCategory[0].id,
        langCode: 'fr',
        name: 'Bon Plans',
        seoSlug: 'bon-plans',
        description: 'Les meilleures offres et astuces pour profiter d\'Annecy.',
      },
      {
        categoryId: bonPlansCategory[0].id,
        langCode: 'en',
        name: 'Deals',
        seoSlug: 'deals',
        description: 'Best offers and tips to enjoy Annecy.',
      },
    ]);

    // Hôtels
    await db.insert(schema.categoryTranslations).values([
      {
        categoryId: hotelsCategory[0].id,
        langCode: 'fr',
        name: 'Hôtels',
        seoSlug: 'hotels',
        description: 'Hôtels à Annecy pour tous les budgets.',
      },
      {
        categoryId: hotelsCategory[0].id,
        langCode: 'en',
        name: 'Hotels',
        seoSlug: 'hotels',
        description: 'Hotels in Annecy for all budgets.',
      },
    ]);

    // Chambres d'hôtes
    await db.insert(schema.categoryTranslations).values([
      {
        categoryId: chambresHotesCategory[0].id,
        langCode: 'fr',
        name: 'Chambres d\'hôtes',
        seoSlug: 'chambres-hotes',
        description: 'Séjournez chez l\'habitant pour une expérience authentique.',
      },
      {
        categoryId: chambresHotesCategory[0].id,
        langCode: 'en',
        name: 'Bed & Breakfast',
        seoSlug: 'bed-breakfast',
        description: 'Stay with locals for an authentic experience.',
      },
    ]);

    // =====================================================
    // AUTHORS
    // =====================================================
    console.log('✍️ Seeding authors...');

    const author1 = await db.insert(schema.authors).values({
      slug: 'marie-dubois',
      name: 'Marie Dubois',
      profileImageUrl: 'https://i.pravatar.cc/300?img=1',
      socialLinks: [
        { platform: 'twitter', url: 'https://twitter.com/mariedubois' },
        { platform: 'linkedin', url: 'https://linkedin.com/in/mariedubois' },
      ],
    }).returning();

    const author2 = await db.insert(schema.authors).values({
      slug: 'pierre-martin',
      name: 'Pierre Martin',
      profileImageUrl: 'https://i.pravatar.cc/300?img=12',
      socialLinks: [
        { platform: 'twitter', url: 'https://twitter.com/pierremartin' },
        { platform: 'instagram', url: 'https://instagram.com/pierremartin' },
      ],
    }).returning();

    const author3 = await db.insert(schema.authors).values({
      slug: 'sophie-bernard',
      name: 'Sophie Bernard',
      profileImageUrl: 'https://i.pravatar.cc/300?img=5',
      socialLinks: [
        { platform: 'linkedin', url: 'https://linkedin.com/in/sophiebernard' },
      ],
    }).returning();

    // =====================================================
    // AUTHOR TRANSLATIONS
    // =====================================================
    console.log('🌍 Seeding author translations...');

    await db.insert(schema.authorTranslations).values([
      {
        authorId: author1[0].id,
        langCode: 'fr',
        bio: 'Journaliste passionnée par Annecy depuis 10 ans. Spécialiste de la culture et des événements locaux.',
        seoSlug: 'marie-dubois',
      },
      {
        authorId: author1[0].id,
        langCode: 'en',
        bio: 'Journalist passionate about Annecy for 10 years. Specialist in culture and local events.',
        seoSlug: 'marie-dubois',
      },
      {
        authorId: author2[0].id,
        langCode: 'fr',
        bio: 'Photographe et blogueur voyage. Explore les recoins cachés d\'Annecy et partage ses découvertes.',
        seoSlug: 'pierre-martin',
      },
      {
        authorId: author2[0].id,
        langCode: 'en',
        bio: 'Photographer and travel blogger. Explores hidden corners of Annecy and shares discoveries.',
        seoSlug: 'pierre-martin',
      },
      {
        authorId: author3[0].id,
        langCode: 'fr',
        bio: 'Experte en tourisme et hébergement. Conseille les visiteurs pour trouver le logement parfait.',
        seoSlug: 'sophie-bernard',
      },
      {
        authorId: author3[0].id,
        langCode: 'en',
        bio: 'Tourism and accommodation expert. Helps visitors find the perfect place to stay.',
        seoSlug: 'sophie-bernard',
      },
    ]);

    // =====================================================
    // ARTICLES
    // =====================================================
    console.log('📝 Seeding articles...');

    const article1 = await db.insert(schema.articles).values({
      categoryId: actualitesCategory[0].id,
      authorId: author1[0].id,
      featuredImageUrl: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800',
      publicationDate: new Date('2024-01-15'),
      readTimeMinutes: 5,
      viewCount: 1250,
      isFeatured: true,
      status: 'published',
    }).returning();

    const article2 = await db.insert(schema.articles).values({
      categoryId: cultureCategory[0].id,
      authorId: author2[0].id,
      featuredImageUrl: 'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=800',
      publicationDate: new Date('2024-01-20'),
      readTimeMinutes: 8,
      viewCount: 890,
      isFeatured: true,
      status: 'published',
    }).returning();

    const article3 = await db.insert(schema.articles).values({
      categoryId: bonPlansCategory[0].id,
      authorId: author3[0].id,
      featuredImageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
      publicationDate: new Date('2024-02-01'),
      readTimeMinutes: 6,
      viewCount: 1580,
      isFeatured: false,
      status: 'published',
    }).returning();

    const article4 = await db.insert(schema.articles).values({
      categoryId: actualitesCategory[0].id,
      authorId: author1[0].id,
      featuredImageUrl: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=800',
      publicationDate: new Date('2024-02-10'),
      readTimeMinutes: 4,
      viewCount: 520,
      isFeatured: false,
      status: 'published',
    }).returning();

    // =====================================================
    // ARTICLE TRANSLATIONS
    // =====================================================
    console.log('🌍 Seeding article translations...');

    await db.insert(schema.articleTranslations).values([
      {
        articleId: article1[0].id,
        langCode: 'fr',
        name: 'Le Festival du Film d\'Animation revient en juin 2024',
        description: 'Le célèbre festival annécien annonce son programme pour l\'édition 2024 avec des avant-premières mondiales.',
        content: '<h2>Un événement incontournable</h2><p>Le Festival International du Film d\'Animation d\'Annecy revient du 9 au 15 juin 2024 avec une programmation exceptionnelle. Plus de 500 films seront présentés, incluant des avant-premières mondiales et des rétrospectives de grands studios.</p><p>Cette année, le festival met l\'honneur sur l\'animation japonaise avec une sélection spéciale des œuvres du Studio Ghibli.</p>',
        featuredImageAlt: 'Festival du film d\'animation d\'Annecy',
        seoSlug: 'festival-film-animation-2024',
      },
      {
        articleId: article1[0].id,
        langCode: 'en',
        name: 'Animation Film Festival Returns in June 2024',
        description: 'The famous Annecy festival announces its program for the 2024 edition with world premieres.',
        content: '<h2>An Unmissable Event</h2><p>The Annecy International Animation Film Festival returns from June 9 to 15, 2024 with an exceptional program. Over 500 films will be presented, including world premieres and retrospectives from major studios.</p><p>This year, the festival honors Japanese animation with a special selection of works from Studio Ghibli.</p>',
        featuredImageAlt: 'Annecy Animation Film Festival',
        seoSlug: 'animation-film-festival-2024',
      },
      {
        articleId: article2[0].id,
        langCode: 'fr',
        name: 'Découverte : 5 lieux secrets autour du lac d\'Annecy',
        description: 'Explorez les endroits méconnus qui font le charme du lac d\'Annecy, loin des sentiers battus.',
        content: '<h2>Des trésors cachés</h2><p>Le lac d\'Annecy regorge de lieux magnifiques encore préservés du tourisme de masse. Nous avons sélectionné pour vous 5 spots secrets où profiter de la nature en toute tranquillité.</p><ul><li>La plage de la Brune à Veyrier-du-Lac</li><li>Le belvédère du col de la Forclaz</li><li>Les Jardins de l\'Europe au lever du soleil</li><li>La cascade d\'Angon</li><li>Le bout du lac à Doussard</li></ul>',
        featuredImageAlt: 'Lac d\'Annecy vue panoramique',
        seoSlug: 'lieux-secrets-lac-annecy',
      },
      {
        articleId: article2[0].id,
        langCode: 'en',
        name: 'Discovery: 5 Secret Spots Around Lake Annecy',
        description: 'Explore the hidden gems that make Lake Annecy so charming, off the beaten path.',
        content: '<h2>Hidden Treasures</h2><p>Lake Annecy is full of beautiful places still preserved from mass tourism. We have selected 5 secret spots for you to enjoy nature in peace.</p><ul><li>La Brune beach in Veyrier-du-Lac</li><li>Col de la Forclaz viewpoint</li><li>Jardins de l\'Europe at sunrise</li><li>Angon waterfall</li><li>End of the lake in Doussard</li></ul>',
        featuredImageAlt: 'Lake Annecy panoramic view',
        seoSlug: 'secret-spots-lake-annecy',
      },
      {
        articleId: article3[0].id,
        langCode: 'fr',
        name: 'Où manger pour moins de 15€ à Annecy',
        description: 'Notre sélection des meilleurs restaurants abordables de la ville pour un repas savoureux sans se ruiner.',
        content: '<h2>Bien manger sans se ruiner</h2><p>Annecy n\'est pas qu\'une ville pour les budgets élevés ! Découvrez nos adresses préférées pour un déjeuner ou dîner délicieux à petit prix.</p><h3>Nos coups de cœur :</h3><ul><li><strong>Le Bouillon</strong> - Cuisine française traditionnelle, menu à 12€</li><li><strong>Chez Mamie</strong> - Plats du jour savoyards, 14€</li><li><strong>La Petite Cuisine</strong> - Formule midi à 13€</li></ul>',
        featuredImageAlt: 'Restaurant à Annecy',
        seoSlug: 'manger-pas-cher-annecy',
      },
      {
        articleId: article3[0].id,
        langCode: 'en',
        name: 'Where to Eat for Less Than 15€ in Annecy',
        description: 'Our selection of the best affordable restaurants in the city for a delicious meal without breaking the bank.',
        content: '<h2>Eat Well Without Breaking the Bank</h2><p>Annecy is not just a city for high budgets! Discover our favorite addresses for a delicious lunch or dinner at a low price.</p><h3>Our Favorites:</h3><ul><li><strong>Le Bouillon</strong> - Traditional French cuisine, 12€ menu</li><li><strong>Chez Mamie</strong> - Savoyard daily specials, 14€</li><li><strong>La Petite Cuisine</strong> - Lunch special at 13€</li></ul>',
        featuredImageAlt: 'Restaurant in Annecy',
        seoSlug: 'eat-cheap-annecy',
      },
      {
        articleId: article4[0].id,
        langCode: 'fr',
        name: 'Nouvelle piste cyclable inaugurée autour du lac',
        description: 'Une piste cyclable de 10 km vient d\'être inaugurée, facilitant le tour du lac à vélo.',
        content: '<h2>Mobilité douce</h2><p>La ville d\'Annecy poursuit ses efforts en faveur de la mobilité douce avec l\'inauguration d\'une nouvelle piste cyclable de 10 km reliant Annecy à Sévrier.</p><p>Cette infrastructure permet désormais de faire le tour complet du lac en vélo en toute sécurité.</p>',
        featuredImageAlt: 'Piste cyclable lac d\'Annecy',
        seoSlug: 'nouvelle-piste-cyclable-lac',
      },
    ]);

    // =====================================================
    // ARTICLE RELATED ARTICLES
    // =====================================================
    console.log('🔗 Seeding article relations...');

    await db.insert(schema.articleRelatedArticles).values([
      {
        articleId: article1[0].id,
        relatedArticleId: article2[0].id,
        displayOrder: 1,
      },
      {
        articleId: article2[0].id,
        relatedArticleId: article3[0].id,
        displayOrder: 1,
      },
      {
        articleId: article3[0].id,
        relatedArticleId: article1[0].id,
        displayOrder: 1,
      },
    ]);

    // =====================================================
    // COMMENTS
    // =====================================================
    console.log('💬 Seeding comments...');

    const comment1 = await db.insert(schema.comments).values({
      articleId: article1[0].id,
      authorName: 'Jean Dupont',
      authorEmail: 'jean.dupont@example.com',
      content: 'Très intéressant ! J\'ai hâte de découvrir cette édition du festival.',
      status: 'approved',
    }).returning();

    await db.insert(schema.comments).values({
      articleId: article1[0].id,
      parentCommentId: comment1[0].id,
      authorName: 'Marie Dubois',
      authorEmail: 'marie.dubois@example.com',
      content: 'Merci Jean ! Le programme sera exceptionnel cette année.',
      status: 'approved',
    });

    await db.insert(schema.comments).values({
      articleId: article2[0].id,
      authorName: 'Sophie Laurent',
      authorEmail: 'sophie.laurent@example.com',
      content: 'Merci pour ces bonnes adresses ! La cascade d\'Angon est magnifique.',
      status: 'approved',
    });

    await db.insert(schema.comments).values({
      articleId: article3[0].id,
      authorName: 'Thomas Bernard',
      authorEmail: 'thomas.bernard@example.com',
      content: 'Le Bouillon est excellent, je recommande vivement !',
      status: 'approved',
    });

    // =====================================================
    // PLACES (Hébergements)
    // =====================================================
    console.log('🏨 Seeding places...');

    const place1 = await db.insert(schema.places).values({
      categoryId: hotelsCategory[0].id,
      mainImageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
      isFeatured: true,
      status: 'published',
    }).returning();

    const place2 = await db.insert(schema.places).values({
      categoryId: hotelsCategory[0].id,
      mainImageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
      isFeatured: false,
      status: 'published',
    }).returning();

    const place3 = await db.insert(schema.places).values({
      categoryId: chambresHotesCategory[0].id,
      mainImageUrl: 'https://images.unsplash.com/photo-1587985064135-0366536eac41?w=800',
      isFeatured: true,
      status: 'published',
    }).returning();

    // =====================================================
    // PLACE TRANSLATIONS
    // =====================================================
    console.log('🌍 Seeding place translations...');

    await db.insert(schema.placeTranslations).values([
      {
        placeId: place1[0].id,
        langCode: 'fr',
        name: 'Hôtel Lac & Spa',
        description: 'Hôtel 4 étoiles avec vue panoramique sur le lac d\'Annecy. Spa, piscine chauffée et restaurant gastronomique.',
        seoSlug: 'hotel-lac-spa',
      },
      {
        placeId: place1[0].id,
        langCode: 'en',
        name: 'Lake & Spa Hotel',
        description: '4-star hotel with panoramic views of Lake Annecy. Spa, heated pool and gourmet restaurant.',
        seoSlug: 'lake-spa-hotel',
      },
      {
        placeId: place2[0].id,
        langCode: 'fr',
        name: 'Hôtel du Centre',
        description: 'Hôtel confortable en plein cœur de la vieille ville. Idéal pour découvrir Annecy à pied.',
        seoSlug: 'hotel-du-centre',
      },
      {
        placeId: place2[0].id,
        langCode: 'en',
        name: 'Downtown Hotel',
        description: 'Comfortable hotel in the heart of the old town. Perfect for exploring Annecy on foot.',
        seoSlug: 'downtown-hotel',
      },
      {
        placeId: place3[0].id,
        langCode: 'fr',
        name: 'La Maison des Alpes',
        description: 'Chambre d\'hôtes chaleureuse dans un chalet savoyard authentique. Petit-déjeuner fait maison inclus.',
        seoSlug: 'maison-des-alpes',
      },
      {
        placeId: place3[0].id,
        langCode: 'en',
        name: 'Alpine House',
        description: 'Cozy bed & breakfast in an authentic Savoyard chalet. Homemade breakfast included.',
        seoSlug: 'alpine-house',
      },
    ]);

    // =====================================================
    // ACCOMMODATION DETAILS
    // =====================================================
    console.log('🛏️ Seeding accommodation details...');

    await db.insert(schema.detailsAccommodation).values([
      {
        placeId: place1[0].id,
        pricePerNight: '180.00',
        capacity: 2,
        checkInTime: '15:00:00',
        checkOutTime: '11:00:00',
        amenities: ['wifi', 'parking', 'spa', 'piscine', 'restaurant', 'climatisation', 'vue_lac'],
      },
      {
        placeId: place2[0].id,
        pricePerNight: '95.00',
        capacity: 2,
        checkInTime: '14:00:00',
        checkOutTime: '11:00:00',
        amenities: ['wifi', 'petit_dejeuner', 'centre_ville'],
      },
      {
        placeId: place3[0].id,
        pricePerNight: '120.00',
        capacity: 4,
        checkInTime: '16:00:00',
        checkOutTime: '10:00:00',
        amenities: ['wifi', 'parking', 'petit_dejeuner', 'jardin', 'vue_montagne', 'cheminee'],
      },
    ]);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📊 Summary:');
    console.log('   - 7 categories created');
    console.log('   - 3 authors created');
    console.log('   - 4 articles created');
    console.log('   - 4 comments created');
    console.log('   - 3 places created');
    console.log('   - All with multilingual translations (fr, en, es where applicable)');

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    throw error;
  } finally {
    await client.end();
  }
}

// Exécuter le seed
seed()
  .then(() => {
    console.log('🎉 Seeding process finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  });
