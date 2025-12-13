"use strict";
/**
 * Nutrition Cache Layer
 *
 * Firestore-backed cache for resolved nutrition data.
 * Cache key is normalized food name + serving size.
 * TTL: 30 days for database results, 7 days for AI fallback.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateCacheKey = generateCacheKey;
exports.getCachedNutrition = getCachedNutrition;
exports.setCachedNutrition = setCachedNutrition;
exports.batchGetCachedNutrition = batchGetCachedNutrition;
exports.batchSetCachedNutrition = batchSetCachedNutrition;
exports.invalidateCache = invalidateCache;
exports.getCacheStats = getCacheStats;
exports.cleanupExpiredCache = cleanupExpiredCache;
const firestore_1 = require("firebase-admin/firestore");
const COLLECTION = 'nutrition_cache_v2';
const DB_RESULT_TTL_DAYS = 30;
const AI_FALLBACK_TTL_DAYS = 7;
/**
 * Generate cache key from food name
 * Normalizes to lowercase, removes extra whitespace
 */
function generateCacheKey(foodName, servingGrams) {
    const normalized = foodName
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/g, '');
    // Include serving size in key if significantly different from 100g
    if (servingGrams && Math.abs(servingGrams - 100) > 10) {
        return `${normalized}_${Math.round(servingGrams)}g`;
    }
    return normalized;
}
/**
 * Look up cached nutrition data
 */
async function getCachedNutrition(foodName, servingGrams) {
    const db = (0, firestore_1.getFirestore)();
    const key = generateCacheKey(foodName, servingGrams);
    try {
        const doc = await db.collection(COLLECTION).doc(key).get();
        if (!doc.exists) {
            return null;
        }
        const data = doc.data();
        // Check expiration
        const now = new Date();
        if (data.expiresAt.toDate() < now) {
            // Expired - delete and return null
            await doc.ref.delete();
            return null;
        }
        // Increment hit count (fire and forget)
        doc.ref.update({ hitCount: firestore_1.FieldValue.increment(1) }).catch(() => {
            // Ignore errors on hit count update
        });
        return {
            ...data,
            cachedAt: data.cachedAt.toDate(),
            expiresAt: data.expiresAt.toDate(),
        };
    }
    catch (error) {
        console.error('Cache lookup error:', error);
        return null;
    }
}
/**
 * Store nutrition data in cache
 */
async function setCachedNutrition(foodName, nutrition, source, confidence, servingGrams, foodType) {
    const db = (0, firestore_1.getFirestore)();
    const key = generateCacheKey(foodName, servingGrams);
    // TTL based on source reliability
    const ttlDays = source === 'ai_fallback' ? AI_FALLBACK_TTL_DAYS : DB_RESULT_TTL_DAYS;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);
    const cacheDoc = {
        nutrition,
        source,
        confidence,
        servingGrams,
        cachedAt: FirebaseFirestore.Timestamp.fromDate(now),
        expiresAt: FirebaseFirestore.Timestamp.fromDate(expiresAt),
        hitCount: 0,
        originalQuery: foodName,
        foodType,
    };
    try {
        await db.collection(COLLECTION).doc(key).set(cacheDoc);
    }
    catch (error) {
        console.error('Cache write error:', error);
        // Don't throw - cache failures shouldn't break the flow
    }
}
/**
 * Batch lookup multiple foods from cache
 * Returns map of found items (cache key -> cached data)
 */
async function batchGetCachedNutrition(foods) {
    const db = (0, firestore_1.getFirestore)();
    const results = new Map();
    if (foods.length === 0)
        return results;
    // Generate keys
    const keysToFoods = new Map();
    for (const food of foods) {
        const key = generateCacheKey(food.name, food.servingGrams);
        keysToFoods.set(key, food);
    }
    const keys = Array.from(keysToFoods.keys());
    try {
        // Firestore getAll supports up to 100 documents
        const BATCH_SIZE = 100;
        const now = new Date();
        for (let i = 0; i < keys.length; i += BATCH_SIZE) {
            const batchKeys = keys.slice(i, i + BATCH_SIZE);
            const refs = batchKeys.map(key => db.collection(COLLECTION).doc(key));
            const docs = await db.getAll(...refs);
            for (let j = 0; j < docs.length; j++) {
                const doc = docs[j];
                if (!doc.exists)
                    continue;
                const data = doc.data();
                // Check expiration
                if (data.expiresAt.toDate() < now) {
                    // Expired - skip (could batch delete later)
                    continue;
                }
                const key = batchKeys[j];
                results.set(key, {
                    ...data,
                    cachedAt: data.cachedAt.toDate(),
                    expiresAt: data.expiresAt.toDate(),
                });
            }
        }
        return results;
    }
    catch (error) {
        console.error('Batch cache lookup error:', error);
        return results; // Return partial results
    }
}
/**
 * Batch store nutrition data
 */
async function batchSetCachedNutrition(items) {
    const db = (0, firestore_1.getFirestore)();
    if (items.length === 0)
        return;
    const now = new Date();
    const batch = db.batch();
    for (const item of items) {
        const key = generateCacheKey(item.foodName, item.servingGrams);
        const ttlDays = item.source === 'ai_fallback' ? AI_FALLBACK_TTL_DAYS : DB_RESULT_TTL_DAYS;
        const expiresAt = new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000);
        const cacheDoc = {
            nutrition: item.nutrition,
            source: item.source,
            confidence: item.confidence,
            servingGrams: item.servingGrams,
            cachedAt: FirebaseFirestore.Timestamp.fromDate(now),
            expiresAt: FirebaseFirestore.Timestamp.fromDate(expiresAt),
            hitCount: 0,
            originalQuery: item.foodName,
            foodType: item.foodType,
        };
        batch.set(db.collection(COLLECTION).doc(key), cacheDoc);
    }
    try {
        await batch.commit();
    }
    catch (error) {
        console.error('Batch cache write error:', error);
    }
}
/**
 * Invalidate cache entry
 */
async function invalidateCache(foodName, servingGrams) {
    const db = (0, firestore_1.getFirestore)();
    const key = generateCacheKey(foodName, servingGrams);
    try {
        await db.collection(COLLECTION).doc(key).delete();
    }
    catch (error) {
        console.error('Cache invalidation error:', error);
    }
}
/**
 * Get cache statistics
 */
async function getCacheStats() {
    const db = (0, firestore_1.getFirestore)();
    try {
        const snapshot = await db.collection(COLLECTION).get();
        const stats = {
            totalEntries: 0,
            expiredEntries: 0,
            sourceBreakdown: {},
            avgConfidence: 0,
            totalHits: 0,
        };
        let confidenceSum = 0;
        const now = new Date();
        for (const doc of snapshot.docs) {
            const data = doc.data();
            stats.totalEntries++;
            if (data.expiresAt.toDate() < now) {
                stats.expiredEntries++;
            }
            const source = data.source;
            stats.sourceBreakdown[source] = (stats.sourceBreakdown[source] || 0) + 1;
            confidenceSum += data.confidence;
            stats.totalHits += data.hitCount;
        }
        stats.avgConfidence = stats.totalEntries > 0
            ? Math.round((confidenceSum / stats.totalEntries) * 100) / 100
            : 0;
        return stats;
    }
    catch (error) {
        console.error('Cache stats error:', error);
        throw error;
    }
}
/**
 * Clean up expired cache entries
 * Should be run periodically (e.g., daily scheduled function)
 */
async function cleanupExpiredCache() {
    const db = (0, firestore_1.getFirestore)();
    const now = FirebaseFirestore.Timestamp.fromDate(new Date());
    try {
        const expiredDocs = await db
            .collection(COLLECTION)
            .where('expiresAt', '<', now)
            .limit(500) // Process in batches
            .get();
        if (expiredDocs.empty) {
            return 0;
        }
        const batch = db.batch();
        for (const doc of expiredDocs.docs) {
            batch.delete(doc.ref);
        }
        await batch.commit();
        return expiredDocs.size;
    }
    catch (error) {
        console.error('Cache cleanup error:', error);
        return 0;
    }
}
// Re-export Firestore Timestamp for type compatibility
const firestore_2 = require("firebase-admin/firestore");
var FirebaseFirestore;
(function (FirebaseFirestore) {
    FirebaseFirestore.Timestamp = firestore_2.Timestamp;
})(FirebaseFirestore || (FirebaseFirestore = {}));
//# sourceMappingURL=nutritionCache.js.map