/**
 * Generate images for articles using Gemini's image generation
 * Usage: node scripts/generateArticleImagesGemini.js
 */

const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

// Gemini API key
const GEMINI_API_KEY = 'AIzaSyBVT63fc2phfRiiqwfmZrJvuhg7dZrfOCU';
const MODEL = 'gemini-3-pro-image-preview';

// Connect to Firebase emulator
process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

const app = initializeApp({ projectId: 'nvivo-988' });
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

// Base style for consistent look
const baseStyle = `Modern minimalist medical illustration, clean lines, soft gradients,
professional and sleek, dark background, no text or labels, premium health app aesthetic`;

// Article-specific prompts that reflect the content
const articlePrompts = {
  // Brain Health
  'Why Does My Heart Health Affect My Brain? Understanding the CardioCognitive Link':
    'Connected illustration of a human heart and brain linked by blood vessels and neural pathways, showing the cardiovascular-cognitive connection',
  'Why Did My Brain MRI Show White Matter Hyperintensities?':
    'Brain MRI scan showing white matter areas highlighted, with detailed brain cross-section and imaging visualization',
  'How Stress Actually Impacts Your Heart and Brain':
    'Split illustration showing stress hormones affecting both heart and brain, cortisol molecules and stress response pathways',

  // Heart Health
  'Plaque Is the Disease: Why Do We Target Atherosclerosis, Not Just Risk Factors?':
    'Cross-section of an artery showing plaque buildup on the vessel walls, with layers of the artery visible, cholesterol deposits',
  'Why Do We Talk About the Old Way vs. the NVIVO Way?':
    'Split comparison showing traditional reactive medicine vs modern preventive cardiology approach, stethoscope vs advanced imaging',
  'What Is AI-Guided Prevention, and How Does It Protect My Heart and Brain?':
    'Futuristic AI visualization analyzing heart and brain data, digital neural network surrounding cardiac imagery',
  'Are My Numbers Too Low? Understanding Your Elite Health Targets':
    'Dashboard display showing optimal health metrics and target ranges, clean data visualization with heart health indicators',
  'Are All Plaques the Same? How We Look at Your Plaque Quality':
    'Comparison of different plaque types in arteries - stable calcified vs vulnerable soft plaque cross-sections',
  'Do I Really Need a Stent or Bypass? When Procedures Help and When They Don\'t':
    'Medical illustration of coronary stent placement and bypass surgery, showing when intervention is needed',
  'The Sticky Cholesterol: What Is Lp(a) and Why Do We Test for It?':
    'Molecular visualization of Lp(a) lipoprotein particles in bloodstream, sticky cholesterol molecules adhering to vessel walls',
  'ApoB: The Particle Count That Matters More Than LDL-C':
    'Illustration of ApoB particles in blood vessels, showing particle count vs cholesterol concentration concept',
  'What Is hs-CRP? How We Measure Your Body\'s Vascular Inflammation':
    'Blood vessel with inflammation markers highlighted, CRP molecules indicating vascular inflammation',
  'What Is the PLAC Test (Lp-PLA₂), and Do I Need It?':
    'Enzyme visualization in arterial wall, showing Lp-PLA2 activity in plaque inflammation',
  'Why Am I Wearing a CGM If I\'m Not Diabetic?':
    'Continuous glucose monitor on arm with glucose trend visualization, showing metabolic health monitoring',
  'What Is Insulin Resistance, And Why Does It Matter So Much For My Heart?':
    'Cell illustration showing insulin resistance mechanism, glucose molecules unable to enter cells, pancreas and heart connection',
  'What Is HbA1c And Why Is Our Target <5.7%?':
    'Red blood cells with glucose molecules attached, showing glycated hemoglobin concept and optimal ranges',
  'Deconstructing Your Lipid Panel: LDL, HDL, and Triglycerides':
    'Visual breakdown of lipid particles - LDL, HDL, and triglycerides in bloodstream with labels',
  'Genetics vs. Lifestyle: How Much Does My Family History Really Define My Risk?':
    'DNA helix intertwined with lifestyle elements (exercise, food, sleep), showing nature vs nurture in heart health',
  'Statins: How They Really Work (Myths vs Facts)':
    'Liver cell producing cholesterol with statin molecule blocking the pathway, mechanism of action illustration',
  'A Guide to Statin Side Effects: What\'s Real, What\'s Rare, and What To Do':
    'Medical illustration showing common statin concerns - muscle, liver - with reassuring data visualization',
  'Ezetimibe (Zetia): Reinforcement for Your Statin':
    'Intestinal absorption illustration showing ezetimibe blocking cholesterol uptake, gut-liver pathway',
  'What Is an Aortic Dilatation and Should I Be Worried?':
    'Anatomical illustration of aorta showing normal vs dilated sections, aortic root and ascending aorta',
  'Fish Oil vs. Vascepa: Understanding Omega-3s and Triglycerides':
    'Comparison of fish oil capsule and prescription omega-3, with triglyceride molecules being reduced',

  // Imaging
  'Why a CCTA? What Your Heart Scan Actually Shows You':
    'CT scan visualization of a heart with coronary arteries highlighted, showing medical imaging perspective with scan lines',
  'CCTA vs. a Simple Calcium Score: What\'s the Difference?':
    'Side-by-side comparison of calcium score scan vs detailed CCTA, showing different levels of cardiac imaging detail',
  'What Is My CAD-RADS Score and What Does It Mean for My Heart?':
    'Coronary artery diagram with stenosis percentages marked, CAD-RADS classification visual scale',
  'Why Do You Scan My Other Arteries? What Your Carotid Imaging Shows Us':
    'Carotid artery ultrasound visualization showing plaque and intima-media thickness measurement',
  'What Is an Echocardiogram with Strain?':
    'Heart ultrasound image with strain mapping overlay, showing cardiac muscle function visualization',
  'Why a 24-Hour Heart Monitor Matters: How Rhythm Monitoring Helps Prevent Stroke':
    'Holter monitor device with ECG rhythm strip showing heart rhythm patterns, atrial fibrillation detection',
  'Why Am I Wearing This 2-Week Heart Monitor? Finding Silent Arrhythmias':
    'Extended cardiac monitor patch on chest with continuous rhythm recording, detecting hidden arrhythmias',

  // Lifestyle
  'Good Fat, Bad Fat: The Real Story on Saturated Fat, Seed Oils, and Olive Oil':
    'Visual comparison of different fat types - olive oil, butter, seed oils - with molecular structure hints',
  'The "Cardio" Prescription: The Power of Zone 2 Exercise':
    'Person doing moderate cardio exercise with heart rate zone visualization, Zone 2 training concept',
  'Why Is "Lifting for Longevity" Non-Negotiable For My Long-Term Health?':
    'Strength training silhouette with muscle and bone health visualization, showing longevity benefits',
  'The "8-Hour Mandate": Why Sleep Is Your Most Powerful Preventive Tool':
    'Peaceful sleeping figure with restorative processes illustrated - heart recovery, brain cleaning, cellular repair',
  'The 8-Hour Mandate: Why Sleep Is Your Most Powerful Preventive Tool':
    'Peaceful sleeping figure with restorative processes illustrated - heart recovery, brain cleaning, cellular repair',
  'What Is the NVIVO Nutrition Plan—And Do I Have to Give Up Carbs Forever?':
    'Balanced plate with healthy proteins, vegetables, and smart carbohydrates, Mediterranean-style eating',
  'How Much Protein Do I Need For Metabolic Health And Healthy Aging?':
    'Protein-rich foods with muscle and metabolic health visualization, amino acids building blocks',
  'Carbohydrate Reduction: How to Cut Back on Bread, Pasta, and Rice':
    'Visual showing refined carbs being replaced with vegetables and whole foods, blood sugar stability',
  'Can Five Minutes Of Breathing Really Help My Heart And Blood Pressure?':
    'Person in breathing exercise pose with calming heart rate and blood pressure visualization',
  'Alcohol and Heart Health: A Sobering Look at the Data':
    'Wine glass with heart health data visualization, showing the true relationship between alcohol and cardiovascular health',
  'VO₂ Max: The "Engine Size" That Predicts Longevity':
    'Athletic figure with oxygen utilization visualization, VO2 max measurement concept with longevity correlation',
  'How to Use Your "My Journal" App: The Power of Logging':
    'Digital health journal interface with tracking metrics - food, exercise, sleep, mood - all connected',
  'How to Read Your "NVIVO Insights" (Dashboard AI)':
    'AI-powered health dashboard visualization with personalized insights, data analytics for heart and brain health',
};

// Generic fallback prompts by category
const categoryFallbacks = {
  'Heart Health': 'Anatomical heart illustration with healthy blood flow and arterial system',
  'Brain Health': 'Human brain with neural networks and cognitive pathways illuminated',
  'Imaging': 'Medical imaging scan visualization with diagnostic elements and scan lines',
  'Nutrition': 'Healthy food arrangement with heart-healthy ingredients',
  'Exercise': 'Active figure with cardiovascular system highlighted showing benefits of movement',
  'Mental Health': 'Peaceful mind visualization with calming elements and balanced mood indicators',
  'Medications': 'Medical pills and prescription elements with therapeutic symbolism',
  'Lifestyle': 'Balanced lifestyle elements showing healthy daily habits',
};

async function generateImage(title, category) {
  const colorTone = categoryColors[category] || 'warm amber tones';

  // Get article-specific prompt or fall back to category prompt
  const contentPrompt = articlePrompts[title] || categoryFallbacks[category] || 'Health and wellness concept';

  const prompt = `${baseStyle}, ${contentPrompt}, using ${colorTone} as accent colors`;

  console.log(`\n🎨 Generating image for: "${title}"`);
  console.log(`   Category: ${category}`);
  console.log(`   Prompt: ${contentPrompt.substring(0, 80)}...`);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Generate an image: ${prompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();

  // Debug: log full response structure
  console.log('   Response keys:', Object.keys(data));

  // Extract image data from response
  const candidates = data.candidates;
  if (!candidates || candidates.length === 0) {
    console.log('Full response:', JSON.stringify(data, null, 2));
    throw new Error('No candidates in response');
  }

  const parts = candidates[0].content?.parts;
  if (!parts) {
    console.log('Candidate:', JSON.stringify(candidates[0], null, 2));
    throw new Error('No parts in response');
  }

  // Find the image part
  const imagePart = parts.find(p => p.inlineData);
  if (!imagePart) {
    console.log('Parts:', JSON.stringify(parts, null, 2));
    throw new Error('No image data in response - parts found: ' + parts.map(p => Object.keys(p)).join(', '));
  }

  return imagePart.inlineData;
}

async function saveImage(imageData, filename) {
  const outputDir = path.join(__dirname, '../generated-images-gemini');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filepath = path.join(outputDir, filename);
  const buffer = Buffer.from(imageData.data, 'base64');
  fs.writeFileSync(filepath, buffer);
  console.log(`   ✅ Saved to: ${filepath}`);
  return filepath;
}

async function main() {
  console.log('🚀 Gemini Article Image Generator');
  console.log('==================================\n');
  console.log(`Model: ${MODEL}`);

  // Fetch ALL articles from Firestore
  const articlesRef = db.collection('articles');
  const snapshot = await articlesRef.get();

  if (snapshot.empty) {
    console.error('❌ No articles found in database');
    process.exit(1);
  }

  // Get all unique articles (dedupe by title)
  const seenTitles = new Set();
  const allArticles = [];
  snapshot.forEach(doc => {
    const article = { id: doc.id, ...doc.data() };
    if (!seenTitles.has(article.title)) {
      seenTitles.add(article.title);
      allArticles.push(article);
    }
  });

  // Sort by category for organized processing
  allArticles.sort((a, b) => a.category.localeCompare(b.category));

  console.log(`\n📚 Processing ${allArticles.length} unique articles:\n`);
  allArticles.forEach((a, i) => {
    console.log(`${i + 1}. [${a.category}] ${a.title.substring(0, 60)}...`);
  });

  const selectedArticles = allArticles;

  // Generate images
  let successCount = 0;
  let errorCount = 0;
  const total = selectedArticles.length;

  for (let i = 0; i < selectedArticles.length; i++) {
    const article = selectedArticles[i];
    console.log(`\n[${i + 1}/${total}]`);

    try {
      const imageData = await generateImage(article.title, article.category);

      // Save locally
      const safeFilename = article.id + '.png';
      const filepath = await saveImage(imageData, safeFilename);

      // Convert to base64 data URL for Firestore (temporary solution)
      const base64 = imageData.data;
      const mimeType = imageData.mimeType || 'image/png';
      const dataUrl = `data:${mimeType};base64,${base64}`;

      // Update Firestore with the data URL
      await db.collection('articles').doc(article.id).update({
        imageUrl: dataUrl,
      });

      console.log(`   📝 Updated Firestore for: ${article.title.substring(0, 50)}...`);
      successCount++;

      // Small delay to avoid rate limiting (500ms between requests)
      if (i < selectedArticles.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
      errorCount++;
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log(`✨ Done! Generated ${successCount}/${total} images (${errorCount} errors)`);
  console.log('📁 Images saved to: generated-images-gemini/');
  console.log('🔥 Firestore updated with image data URLs');
  process.exit(0);
}

main().catch(console.error);
