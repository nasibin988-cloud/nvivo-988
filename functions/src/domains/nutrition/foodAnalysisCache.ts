/**
 * Food Analysis Cache - Firestore-backed cache for AI-analyzed foods
 *
 * Caches AI food analysis results to avoid repeated API calls for the same food.
 * Uses normalized food descriptions as keys.
 *
 * Benefits:
 * - Zero AI cost for cache hits
 * - Fast response times
 * - Builds up over time as users log foods
 */

import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import type { FoodAnalysisResult } from '../ai/foodAnalysis';

const COLLECTION_NAME = 'food_analysis_cache';
const CACHE_TTL_DAYS = 30; // Cache entries expire after 30 days

/**
 * Cached food analysis entry
 */
interface CachedFoodAnalysis {
  normalizedKey: string;
  result: FoodAnalysisResult;
  createdAt: Timestamp;
  hitCount: number;
  lastAccessedAt: Timestamp;
}

/**
 * Generate a hash key for cache lookup
 * Uses the normalized description directly (already cleaned by normalizeForLookup)
 */
function generateCacheKey(normalizedDescription: string): string {
  // Simple hash for Firestore document ID (alphanumeric only)
  return normalizedDescription
    .replace(/[^a-z0-9]/g, '_')
    .substring(0, 100); // Firestore ID limit considerations
}

/**
 * Get cached food analysis result if it exists and is not expired
 */
export async function getCachedFoodAnalysis(
  normalizedDescription: string
): Promise<FoodAnalysisResult | null> {
  try {
    const db = getFirestore();
    const cacheKey = generateCacheKey(normalizedDescription);

    const docRef = db.collection(COLLECTION_NAME).doc(cacheKey);
    const doc = await docRef.get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data() as CachedFoodAnalysis;

    // Check if cache entry has expired
    const now = Timestamp.now();
    const expirationDate = new Timestamp(
      data.createdAt.seconds + CACHE_TTL_DAYS * 24 * 60 * 60,
      data.createdAt.nanoseconds
    );

    if (now.toMillis() > expirationDate.toMillis()) {
      // Cache entry expired, delete it
      await docRef.delete();
      return null;
    }

    // Update hit count and last accessed time (fire-and-forget)
    docRef.update({
      hitCount: data.hitCount + 1,
      lastAccessedAt: now,
    }).catch(() => {
      // Ignore update errors - cache hit is still valid
    });

    return data.result;
  } catch (error) {
    console.error('[FoodAnalysisCache] Get error:', error);
    return null; // Fail silently - cache miss is fine
  }
}

/**
 * Store food analysis result in cache
 */
export async function setCachedFoodAnalysis(
  normalizedDescription: string,
  result: FoodAnalysisResult
): Promise<void> {
  try {
    const db = getFirestore();
    const cacheKey = generateCacheKey(normalizedDescription);
    const now = Timestamp.now();

    const cacheEntry: CachedFoodAnalysis = {
      normalizedKey: normalizedDescription,
      result,
      createdAt: now,
      hitCount: 0,
      lastAccessedAt: now,
    };

    await db.collection(COLLECTION_NAME).doc(cacheKey).set(cacheEntry);
    console.log(`[FoodAnalysisCache] Cached: ${normalizedDescription.substring(0, 50)}`);
  } catch (error) {
    console.error('[FoodAnalysisCache] Set error:', error);
    // Fail silently - caching is optional
  }
}

/**
 * Delete a specific cache entry (for testing/admin)
 */
export async function deleteCachedFoodAnalysis(
  normalizedDescription: string
): Promise<void> {
  try {
    const db = getFirestore();
    const cacheKey = generateCacheKey(normalizedDescription);
    await db.collection(COLLECTION_NAME).doc(cacheKey).delete();
  } catch (error) {
    console.error('[FoodAnalysisCache] Delete error:', error);
  }
}

/**
 * Get cache statistics (for monitoring/admin)
 */
export async function getCacheStats(): Promise<{
  totalEntries: number;
  totalHits: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}> {
  try {
    const db = getFirestore();
    const snapshot = await db.collection(COLLECTION_NAME).get();

    if (snapshot.empty) {
      return {
        totalEntries: 0,
        totalHits: 0,
        oldestEntry: null,
        newestEntry: null,
      };
    }

    let totalHits = 0;
    let oldestDate: Date | null = null;
    let newestDate: Date | null = null;

    snapshot.forEach((doc) => {
      const data = doc.data() as CachedFoodAnalysis;
      totalHits += data.hitCount;

      const createdAt = data.createdAt.toDate();
      if (!oldestDate || createdAt < oldestDate) {
        oldestDate = createdAt;
      }
      if (!newestDate || createdAt > newestDate) {
        newestDate = createdAt;
      }
    });

    return {
      totalEntries: snapshot.size,
      totalHits,
      oldestEntry: oldestDate,
      newestEntry: newestDate,
    };
  } catch (error) {
    console.error('[FoodAnalysisCache] Stats error:', error);
    return {
      totalEntries: 0,
      totalHits: 0,
      oldestEntry: null,
      newestEntry: null,
    };
  }
}

/**
 * Clean up expired cache entries (call periodically via scheduled function)
 */
export async function cleanupExpiredCache(): Promise<number> {
  try {
    const db = getFirestore();
    const expirationThreshold = Timestamp.fromDate(
      new Date(Date.now() - CACHE_TTL_DAYS * 24 * 60 * 60 * 1000)
    );

    const snapshot = await db
      .collection(COLLECTION_NAME)
      .where('createdAt', '<', expirationThreshold)
      .get();

    if (snapshot.empty) {
      return 0;
    }

    const batch = db.batch();
    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`[FoodAnalysisCache] Cleaned up ${snapshot.size} expired entries`);
    return snapshot.size;
  } catch (error) {
    console.error('[FoodAnalysisCache] Cleanup error:', error);
    return 0;
  }
}
