/**
 * Generate DALL-E images for articles and upload to Firebase Storage
 *
 * Usage: npx ts-node scripts/generateArticleImages.ts
 */

import OpenAI from 'openai';
import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Firebase Admin
const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
if (fs.existsSync(serviceAccountPath)) {
  const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'nvivo-988.firebasestorage.app',
  });
} else {
  admin.initializeApp({
    storageBucket: 'nvivo-988.firebasestorage.app',
  });
}

const bucket = admin.storage().bucket();
const db = admin.firestore();

// Read articles from JSON
const articlesPath = '/Users/bwv988/nvivo/apps/patient/src/data/articles.json';
const articles = JSON.parse(fs.readFileSync(articlesPath, 'utf8'));

// Category to visual style mapping
const categoryStyles: Record<string, string> = {
  'Heart Health': 'medical illustration style, warm red and pink tones, abstract heart and cardiovascular imagery',
  'Brain Health': 'medical illustration style, cool blue and purple tones, abstract brain and neural network imagery',
  'Nutrition': 'modern food photography style, fresh vegetables and healthy ingredients, warm natural lighting',
  'Exercise': 'dynamic fitness photography style, motion blur, energetic atmosphere, blue and orange tones',
  'Medications': 'clean pharmaceutical illustration, pills and molecules, white and teal color scheme',
  'Lifestyle': 'lifestyle photography, balanced wellness scene, soft natural light, earth tones',
  'Sleep': 'peaceful nighttime illustration, soft blues and purples, moon and stars motif',
  'Stress Management': 'calming meditation scene, soft gradients, zen-inspired imagery',
};

async function generateImageForArticle(article: { id: string; title: string; category: string; snippet: string }): Promise<string | null> {
  const style = categoryStyles[article.category] || 'modern medical illustration, clean professional style';

  const prompt = `Create a professional, clean medical illustration for a health article titled "${article.title}".
Style: ${style}.
The image should be abstract and conceptual, NOT showing any human faces or recognizable people.
Use a dark background suitable for a mobile app with glassmorphism design.
The image should be calming, modern, and convey trust and medical expertise.
Do NOT include any text, logos, or watermarks.`;

  console.log(`Generating image for: ${article.title}`);

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    const imageUrl = response.data[0]?.url;
    if (!imageUrl) {
      console.error(`No image URL returned for ${article.id}`);
      return null;
    }

    // Download the image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.buffer();

    // Upload to Firebase Storage
    const fileName = `articles/${article.id}.png`;
    const file = bucket.file(fileName);

    await file.save(imageBuffer, {
      metadata: {
        contentType: 'image/png',
        metadata: {
          articleId: article.id,
          generatedAt: new Date().toISOString(),
        },
      },
    });

    // Make the file publicly accessible
    await file.makePublic();

    // Get the public URL
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    console.log(`Uploaded: ${publicUrl}`);

    return publicUrl;
  } catch (error) {
    console.error(`Error generating image for ${article.id}:`, error);
    return null;
  }
}

async function seedArticlesToFirebase(articlesWithImages: Array<Record<string, unknown>>): Promise<void> {
  console.log('\nSeeding articles to Firestore...');

  const batch = db.batch();
  const articlesCollection = db.collection('articles');

  for (const article of articlesWithImages) {
    const docRef = articlesCollection.doc(article.id as string);
    batch.set(docRef, {
      ...article,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`Seeded ${articlesWithImages.length} articles to Firestore`);
}

async function main(): Promise<void> {
  console.log(`Found ${articles.length} articles to process\n`);

  const updatedArticles: Array<Record<string, unknown>> = [];

  // Process articles in batches of 5 to avoid rate limits
  const batchSize = 5;
  for (let i = 0; i < articles.length; i += batchSize) {
    const batch = articles.slice(i, i + batchSize);

    const results = await Promise.all(
      batch.map(async (article: { id: string; title: string; category: string; snippet: string; imageUrl: string }) => {
        const newImageUrl = await generateImageForArticle(article);
        return {
          ...article,
          imageUrl: newImageUrl || article.imageUrl, // Fallback to original if generation fails
        };
      })
    );

    updatedArticles.push(...results);

    // Wait between batches to avoid rate limiting
    if (i + batchSize < articles.length) {
      console.log(`\nProcessed ${Math.min(i + batchSize, articles.length)}/${articles.length} articles. Waiting 10 seconds...\n`);
      await new Promise(resolve => setTimeout(resolve, 10000));
    }
  }

  // Seed all articles to Firebase
  await seedArticlesToFirebase(updatedArticles);

  // Also save updated JSON locally for reference
  const outputPath = path.join(__dirname, 'articles-with-images.json');
  fs.writeFileSync(outputPath, JSON.stringify(updatedArticles, null, 2));
  console.log(`\nSaved updated articles to ${outputPath}`);

  console.log('\nDone!');
  process.exit(0);
}

main().catch(console.error);
