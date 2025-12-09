/**
 * Generate DALL-E images for articles
 * Usage: OPENAI_API_KEY=sk-xxx node scripts/generateArticleImages.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');
const fs = require('fs');
const path = require('path');

// Check for API key
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (!OPENAI_API_KEY) {
  console.error('❌ Please set OPENAI_API_KEY environment variable');
  console.error('Usage: OPENAI_API_KEY=sk-xxx node scripts/generateArticleImages.js');
  process.exit(1);
}

// Connect to Firebase emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = 'localhost:9199';

const app = initializeApp({
  projectId: 'nvivo-988',
  storageBucket: 'nvivo-988.appspot.com'
});
const db = getFirestore(app);

// Category color mapping for prompts
const categoryColors = {
  'Heart Health': 'warm rose and coral tones',
  'Brain Health': 'soft violet and purple tones',
  'Nutrition': 'fresh emerald and green tones',
  'Exercise': 'energetic sky blue and cyan tones',
  'Medications': 'warm orange and amber tones',
  'Mental Health': 'calming pink and magenta tones',
  'Imaging': 'cool cyan and teal tones',
  'Lifestyle': 'natural lime and green tones',
};

// Style prompt for consistent look
const stylePrompt = `Minimalist modern illustration, clean line art with soft gradient fill,
medical/health theme, professional and sleek, dark background friendly,
no text or labels, abstract and artistic, subtle glow effects,
premium app aesthetic like Headspace or Calm`;

async function generateImage(title, category) {
  const colorTone = categoryColors[category] || 'warm amber tones';

  const prompt = `${stylePrompt}, depicting the concept of "${title}",
using ${colorTone} as accent colors, 16:9 aspect ratio`;

  console.log(`\n🎨 Generating image for: "${title}"`);
  console.log(`   Category: ${category}`);

  const response = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: '1792x1024', // 16:9 aspect ratio
      quality: 'standard',
      response_format: 'url',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(`DALL-E API error: ${JSON.stringify(error)}`);
  }

  const data = await response.json();
  return data.data[0].url;
}

async function downloadImage(url, filename) {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();

  const outputDir = path.join(__dirname, '../generated-images');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filepath = path.join(outputDir, filename);
  fs.writeFileSync(filepath, Buffer.from(buffer));
  console.log(`   ✅ Saved to: ${filepath}`);
  return filepath;
}

async function main() {
  console.log('🚀 DALL-E Article Image Generator');
  console.log('==================================\n');

  // Fetch 3 articles from different categories
  const articlesRef = db.collection('articles');
  const snapshot = await articlesRef.limit(20).get();

  if (snapshot.empty) {
    console.error('❌ No articles found in database');
    process.exit(1);
  }

  // Get one article from each of 3 different categories
  const articlesByCategory = {};
  snapshot.forEach(doc => {
    const article = { id: doc.id, ...doc.data() };
    if (!articlesByCategory[article.category]) {
      articlesByCategory[article.category] = article;
    }
  });

  // Pick 3 articles from different categories
  const categories = Object.keys(articlesByCategory);
  const selectedArticles = categories.slice(0, 3).map(cat => articlesByCategory[cat]);

  console.log(`📚 Selected ${selectedArticles.length} articles from different categories:\n`);
  selectedArticles.forEach((a, i) => {
    console.log(`${i + 1}. [${a.category}] ${a.title}`);
  });

  // Generate images
  for (const article of selectedArticles) {
    try {
      const imageUrl = await generateImage(article.title, article.category);
      console.log(`   🔗 Generated URL: ${imageUrl.substring(0, 80)}...`);

      // Download locally for review
      const safeFilename = article.id + '.png';
      await downloadImage(imageUrl, safeFilename);

      // Update Firestore with the URL (temporary - you'd want to upload to Storage in production)
      await db.collection('articles').doc(article.id).update({
        imageUrl: imageUrl,
      });
      console.log(`   📝 Updated Firestore document`);

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.log('\n✨ Done! Check the generated-images folder to preview.');
  console.log('   Images are also updated in Firestore (temporary URLs, valid ~1 hour)');
  process.exit(0);
}

main().catch(console.error);
