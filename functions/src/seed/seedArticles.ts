/**
 * Seed Articles
 *
 * Seeds articles to Firestore for the Learn tab
 */

import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import articlesData from '../data/articles.json';

interface ArticleData {
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

/**
 * Seed articles to Firestore
 */
export async function seedArticles(): Promise<{
  success: boolean;
  count: number;
  message: string;
}> {
  const db = getFirestore();

  console.log('Seeding articles...');

  // Transform articles to use local gemini images
  const articles = (articlesData as ArticleData[]).map((article) => {
    // Replace unsplash URLs with local gemini images
    // article-001 -> /images/articles/article-001.png
    return {
      ...article,
      imageUrl: `/images/articles/${article.id}.png`,
    };
  });

  try {
    // Batch write articles
    const batchSize = 500;
    for (let i = 0; i < articles.length; i += batchSize) {
      const batch = db.batch();
      const chunk = articles.slice(i, i + batchSize);
      for (const article of chunk) {
        const ref = db.collection('articles').doc(article.id);
        batch.set(ref, {
          ...article,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }
      await batch.commit();
    }

    // Count articles per category
    const categoryCounts: Record<string, number> = {};
    for (const article of articles) {
      const cat = article.category;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    // Seed article categories with accurate counts
    const categoryData = [
      { id: 'heart-health', name: 'Heart Health', icon: 'heart', articleCount: categoryCounts['Heart Health'] || 0 },
      { id: 'brain-health', name: 'Brain Health', icon: 'brain', articleCount: categoryCounts['Brain Health'] || 0 },
      { id: 'metabolic-health', name: 'Metabolic Health', icon: 'activity', articleCount: categoryCounts['Metabolic Health'] || 0 },
      { id: 'nutrition', name: 'Nutrition', icon: 'apple', articleCount: categoryCounts['Nutrition'] || 0 },
      { id: 'exercise', name: 'Exercise', icon: 'dumbbell', articleCount: categoryCounts['Exercise'] || 0 },
      { id: 'sleep', name: 'Sleep', icon: 'moon', articleCount: categoryCounts['Sleep'] || 0 },
      { id: 'stress', name: 'Stress Management', icon: 'wind', articleCount: categoryCounts['Stress Management'] || 0 },
    ];

    const catBatch = db.batch();
    for (const cat of categoryData) {
      const ref = db.collection('articleCategories').doc(cat.id);
      catBatch.set(ref, cat);
    }
    await catBatch.commit();

    console.log('Articles seeded:', articles.length);

    return {
      success: true,
      count: articles.length,
      message: `Seeded ${articles.length} articles and ${categoryData.length} categories`,
    };
  } catch (error) {
    console.error('Article seed failed:', error);
    throw error;
  }
}

/**
 * Clear all articles from Firestore
 */
export async function clearArticles(): Promise<void> {
  const db = getFirestore();

  // Clear articles
  const articlesSnapshot = await db.collection('articles').get();
  const articleBatch = db.batch();
  articlesSnapshot.docs.forEach((doc) => articleBatch.delete(doc.ref));
  await articleBatch.commit();

  // Clear categories
  const categoriesSnapshot = await db.collection('articleCategories').get();
  const catBatch = db.batch();
  categoriesSnapshot.docs.forEach((doc) => catBatch.delete(doc.ref));
  await catBatch.commit();

  console.log('Cleared', articlesSnapshot.size, 'articles and', categoriesSnapshot.size, 'categories');
}
