/**
 * Seed articles to Firebase Firestore
 * This script seeds articles from the old repo's articles.json to Firebase
 *
 * Usage:
 *   cd /Users/bwv988/nvivo/nvivo-988
 *   npx ts-node scripts/seedArticles.ts
 */

import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
} else {
  // Use default credentials (for emulator)
  admin.initializeApp({
    projectId: 'nvivo-988',
  });
}

const db = admin.firestore();

// For emulator
if (process.env.FIRESTORE_EMULATOR_HOST) {
  console.log('Using Firestore emulator');
}

// Read articles from the current repo
const articlesPath = path.join(__dirname, '../apps/patient/src/data/articles.json');

interface Article {
  id: string;
  title: string;
  category: string;
  tags: string[];
  readTime: string;
  isRecommended: boolean;
  imageUrl: string;
  snippet: string;
  content: string;
}

async function seedArticles(): Promise<void> {
  console.log('Reading articles from:', articlesPath);

  const articlesRaw = fs.readFileSync(articlesPath, 'utf8');
  const articles: Article[] = JSON.parse(articlesRaw);

  console.log(`Found ${articles.length} articles\n`);

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
      batch.set(docRef, {
        ...article,
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
  const categoryIcons: Record<string, string> = {
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
