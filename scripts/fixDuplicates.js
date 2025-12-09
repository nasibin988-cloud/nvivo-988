const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
const app = initializeApp({ projectId: 'nvivo-988' });
const db = getFirestore(app);

// Map of source (has new image) -> target (needs update)
const duplicates = [
  { source: 'article-030', target: 'article-040' },
  { source: 'article-026', target: 'article-036' },
  { source: 'article-027', target: 'article-037' },
  { source: 'article-028', target: 'article-038' },
];

async function fixDuplicates() {
  for (const { source, target } of duplicates) {
    const sourceDoc = await db.collection('articles').doc(source).get();
    const sourceData = sourceDoc.data();

    if (sourceData && sourceData.imageUrl) {
      await db.collection('articles').doc(target).update({
        imageUrl: sourceData.imageUrl
      });
      console.log(`✅ Copied image from ${source} to ${target}`);
    } else {
      console.log(`❌ No image found in ${source}`);
    }
  }

  console.log('\nDone! All duplicates updated.');
}

fixDuplicates().then(() => process.exit(0));
