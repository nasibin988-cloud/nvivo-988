const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
const app = initializeApp({ projectId: 'nvivo-988' });
const db = getFirestore(app);

async function checkArticles() {
  const titles = [
    'How Stress Actually Impacts Your Heart and Brain',
    'Good Fat, Bad Fat: The Real Story on Saturated Fat, Seed Oils, and Olive Oil',
    'The "Cardio" Prescription: The Power of Zone 2 Exercise',
    'Why Is "Lifting for Longevity" Non-Negotiable For My Long-Term Health?'
  ];

  const snapshot = await db.collection('articles').get();

  for (const title of titles) {
    console.log('\n=== ' + title.substring(0, 50) + '... ===');
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.title === title) {
        const hasNewImage = data.imageUrl && data.imageUrl.startsWith('data:image');
        console.log('  ID: ' + doc.id + ' | New image: ' + (hasNewImage ? 'YES' : 'NO (old URL)'));
        if (!hasNewImage) {
          console.log('    Current URL: ' + (data.imageUrl ? data.imageUrl.substring(0, 60) : 'none') + '...');
        }
      }
    });
  }
}

checkArticles().then(() => process.exit(0));
