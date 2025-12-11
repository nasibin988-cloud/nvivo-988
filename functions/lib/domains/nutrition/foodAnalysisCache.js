"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCachedFoodAnalysis = getCachedFoodAnalysis;
exports.setCachedFoodAnalysis = setCachedFoodAnalysis;
exports.deleteCachedFoodAnalysis = deleteCachedFoodAnalysis;
exports.getCacheStats = getCacheStats;
exports.cleanupExpiredCache = cleanupExpiredCache;
const firestore_1 = require("firebase-admin/firestore");
const COLLECTION_NAME = 'food_analysis_cache';
const CACHE_TTL_DAYS = 30; // Cache entries expire after 30 days
/**
 * Generate a hash key for cache lookup
 * Uses the normalized description directly (already cleaned by normalizeForLookup)
 */
function generateCacheKey(normalizedDescription) {
    // Simple hash for Firestore document ID (alphanumeric only)
    return normalizedDescription
        .replace(/[^a-z0-9]/g, '_')
        .substring(0, 100); // Firestore ID limit considerations
}
/**
 * Get cached food analysis result if it exists and is not expired
 */
async function getCachedFoodAnalysis(normalizedDescription) {
    try {
        const db = (0, firestore_1.getFirestore)();
        const cacheKey = generateCacheKey(normalizedDescription);
        const docRef = db.collection(COLLECTION_NAME).doc(cacheKey);
        const doc = await docRef.get();
        if (!doc.exists) {
            return null;
        }
        const data = doc.data();
        // Check if cache entry has expired
        const now = firestore_1.Timestamp.now();
        const expirationDate = new firestore_1.Timestamp(data.createdAt.seconds + CACHE_TTL_DAYS * 24 * 60 * 60, data.createdAt.nanoseconds);
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
    }
    catch (error) {
        console.error('[FoodAnalysisCache] Get error:', error);
        return null; // Fail silently - cache miss is fine
    }
}
/**
 * Store food analysis result in cache
 */
async function setCachedFoodAnalysis(normalizedDescription, result) {
    try {
        const db = (0, firestore_1.getFirestore)();
        const cacheKey = generateCacheKey(normalizedDescription);
        const now = firestore_1.Timestamp.now();
        const cacheEntry = {
            normalizedKey: normalizedDescription,
            result,
            createdAt: now,
            hitCount: 0,
            lastAccessedAt: now,
        };
        await db.collection(COLLECTION_NAME).doc(cacheKey).set(cacheEntry);
        console.log(`[FoodAnalysisCache] Cached: ${normalizedDescription.substring(0, 50)}`);
    }
    catch (error) {
        console.error('[FoodAnalysisCache] Set error:', error);
        // Fail silently - caching is optional
    }
}
/**
 * Delete a specific cache entry (for testing/admin)
 */
async function deleteCachedFoodAnalysis(normalizedDescription) {
    try {
        const db = (0, firestore_1.getFirestore)();
        const cacheKey = generateCacheKey(normalizedDescription);
        await db.collection(COLLECTION_NAME).doc(cacheKey).delete();
    }
    catch (error) {
        console.error('[FoodAnalysisCache] Delete error:', error);
    }
}
/**
 * Get cache statistics (for monitoring/admin)
 */
async function getCacheStats() {
    try {
        const db = (0, firestore_1.getFirestore)();
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
        let oldestDate = null;
        let newestDate = null;
        snapshot.forEach((doc) => {
            const data = doc.data();
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
    }
    catch (error) {
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
async function cleanupExpiredCache() {
    try {
        const db = (0, firestore_1.getFirestore)();
        const expirationThreshold = firestore_1.Timestamp.fromDate(new Date(Date.now() - CACHE_TTL_DAYS * 24 * 60 * 60 * 1000));
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
    }
    catch (error) {
        console.error('[FoodAnalysisCache] Cleanup error:', error);
        return 0;
    }
}
//# sourceMappingURL=foodAnalysisCache.js.map