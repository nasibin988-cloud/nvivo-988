/**
 * Seed articles to Firebase Firestore
 * This script seeds articles from the old repo's articles.json to Firebase
 *
 * Usage:
 *   cd /Users/bwv988/nvivo/nvivo-988
 *   node scripts/seedArticles.cjs           # Seeds to emulator (default)
 *   node scripts/seedArticles.cjs --prod    # Seeds to production
 */

const fs = require('fs');
const path = require('path');

// Check if targeting production
const isProduction = process.argv.includes('--prod');

// For emulator, set env var BEFORE requiring firebase-admin
if (!isProduction) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  console.log('Targeting EMULATOR at 127.0.0.1:8080');
}

const admin = require('firebase-admin');

// Initialize Firebase Admin
if (isProduction) {
  const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
  if (!fs.existsSync(serviceAccountPath)) {
    console.error('ERROR: serviceAccountKey.json not found for production mode');
    process.exit(1);
  }
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log('Targeting PRODUCTION');
} else {
  admin.initializeApp({
    projectId: 'nvivo-988',
  });
}

const db = admin.firestore();

// For emulator
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log('Using Firestore emulator at:', process.env.FIRESTORE_EMULATOR_HOST);
}

// Read articles from local data folder
const articlesPath = path.join(__dirname, '../apps/patient/src/data/articles.json');
// Local images folder (generated AI thumbnails)
const localImagesDir = path.join(__dirname, '../apps/patient/public/images/articles');

// Get local image path for an article (if it exists)
function getLocalImageUrl(articleId) {
  const localImagePath = path.join(localImagesDir, `${articleId}.png`);
  if (fs.existsSync(localImagePath)) {
    return `/images/articles/${articleId}.png`;
  }
  return null;
}

async function seedArticles() {
  console.log('Reading articles from:', articlesPath);

  const articlesRaw = fs.readFileSync(articlesPath, 'utf8');
  const articles = JSON.parse(articlesRaw);

  console.log(`Found ${articles.length} articles\n`);

  // Check for local images
  const localImagesCount = articles.filter(a => getLocalImageUrl(a.id)).length;
  console.log(`Found ${localImagesCount} local AI-generated images\n`);

  // Get unique categories
  const categories = [...new Set(articles.map(a => a.category))];
  console.log('Categories:', categories.join(', '), '\n');

  // Seed in batches (Firestore batch limit is 500)
  const batchSize = 100;
  let totalSeeded = 0;

  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = db.batch();
    const articleBatch = articles.slice(i, i + batchSize);

    for (const article of articleBatch) {
      const docRef = db.collection('articles').doc(article.id);
      // Use local image if available, otherwise fall back to original
      const localImageUrl = getLocalImageUrl(article.id);
      batch.set(docRef, {
        ...article,
        imageUrl: localImageUrl || article.imageUrl,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Add searchable lowercase fields
        titleLower: article.title.toLowerCase(),
        categoryLower: article.category.toLowerCase(),
      });
    }

    await batch.commit();
    totalSeeded += articleBatch.length;
    console.log(`Seeded ${totalSeeded}/${articles.length} articles`);
  }

  // Also seed categories as a separate collection for quick lookup
  const categoryBatch = db.batch();
  const categoryIcons = {
    'Heart Health': 'Heart',
    'Brain Health': 'Brain',
    'Nutrition': 'Apple',
    'Exercise': 'Dumbbell',
    'Medications': 'Pill',
    'Lifestyle': 'Sun',
    'Sleep': 'Moon',
    'Stress Management': 'Leaf',
  };

  for (const category of categories) {
    const categoryId = category.toLowerCase().replace(/\s+/g, '-');
    const docRef = db.collection('articleCategories').doc(categoryId);
    categoryBatch.set(docRef, {
      id: categoryId,
      name: category,
      icon: categoryIcons[category] || 'FileText',
      articleCount: articles.filter(a => a.category === category).length,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await categoryBatch.commit();
  console.log(`\nSeeded ${categories.length} categories`);

  console.log('\nDone! Articles are now in Firestore.');
  process.exit(0);
}

seedArticles().catch((error) => {
  console.error('Error seeding articles:', error);
  process.exit(1);
});
