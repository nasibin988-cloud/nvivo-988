/**
 * useBarcodeScanner Hook
 * Manages barcode scanning and product lookup via OpenFoodFacts API
 */

import { useState, useCallback } from 'react';
import type { BarcodeProduct } from '../types';

// Mock barcode database for demo (would be replaced with actual API calls)
const MOCK_BARCODE_DB: Record<string, BarcodeProduct> = {
  '5000159407236': {
    barcode: '5000159407236',
    name: 'Cadbury Dairy Milk',
    brand: 'Cadbury',
    servingSize: '45g bar',
    calories: 240,
    protein: 3,
    carbs: 26,
    fat: 14,
    fiber: 0,
    sugar: 25,
    sodium: 65,
    imageUrl: undefined,
    source: 'openfoodfacts',
  },
  '038000138416': {
    barcode: '038000138416',
    name: 'Kellogg\'s Special K Original',
    brand: 'Kellogg\'s',
    servingSize: '31g (1 cup)',
    calories: 120,
    protein: 6,
    carbs: 23,
    fat: 0.5,
    fiber: 3,
    sugar: 4,
    sodium: 220,
    imageUrl: undefined,
    source: 'openfoodfacts',
  },
  '041270884181': {
    barcode: '041270884181',
    name: 'Chobani Greek Yogurt',
    brand: 'Chobani',
    servingSize: '150g',
    calories: 120,
    protein: 14,
    carbs: 13,
    fat: 0,
    fiber: 0,
    sugar: 11,
    sodium: 55,
    imageUrl: undefined,
    source: 'openfoodfacts',
  },
  '016000275287': {
    barcode: '016000275287',
    name: 'Nature Valley Granola Bar',
    brand: 'Nature Valley',
    servingSize: '42g (2 bars)',
    calories: 190,
    protein: 4,
    carbs: 29,
    fat: 7,
    fiber: 2,
    sugar: 12,
    sodium: 160,
    imageUrl: undefined,
    source: 'openfoodfacts',
  },
  '021130126026': {
    barcode: '021130126026',
    name: 'Kirkland Organic Chicken Breast',
    brand: 'Kirkland Signature',
    servingSize: '112g',
    calories: 130,
    protein: 26,
    carbs: 0,
    fat: 3,
    fiber: 0,
    sugar: 0,
    sodium: 70,
    imageUrl: undefined,
    source: 'usda',
  },
};

interface UseBarcodeScannnerReturn {
  isScanning: boolean;
  isLookingUp: boolean;
  product: BarcodeProduct | null;
  error: string | null;
  recentScans: BarcodeProduct[];
  startScanning: () => void;
  stopScanning: () => void;
  lookupBarcode: (barcode: string) => Promise<BarcodeProduct | null>;
  clearProduct: () => void;
  simulateScan: (barcode: string) => void;
}

export function useBarcodeScanner(): UseBarcodeScannnerReturn {
  const [isScanning, setIsScanning] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [product, setProduct] = useState<BarcodeProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentScans, setRecentScans] = useState<BarcodeProduct[]>([]);

  // Start camera for scanning
  const startScanning = useCallback(() => {
    setIsScanning(true);
    setError(null);
    setProduct(null);
  }, []);

  // Stop scanning
  const stopScanning = useCallback(() => {
    setIsScanning(false);
  }, []);

  // Look up barcode via API
  const lookupBarcode = useCallback(async (barcode: string): Promise<BarcodeProduct | null> => {
    setIsLookingUp(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));

      // Check mock database first
      const mockProduct = MOCK_BARCODE_DB[barcode];
      if (mockProduct) {
        setProduct(mockProduct);
        setRecentScans(prev => {
          const filtered = prev.filter(p => p.barcode !== barcode);
          return [mockProduct, ...filtered].slice(0, 10);
        });
        setIsLookingUp(false);
        return mockProduct;
      }

      // In production, would call OpenFoodFacts API:
      // const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      // const data = await response.json();

      // Product not found
      setError('Product not found. Try entering nutrition manually.');
      setIsLookingUp(false);
      return null;
    } catch {
      setError('Failed to look up product. Please try again.');
      setIsLookingUp(false);
      return null;
    }
  }, []);

  // Clear current product
  const clearProduct = useCallback(() => {
    setProduct(null);
    setError(null);
  }, []);

  // Simulate a scan (for demo purposes)
  const simulateScan = useCallback((barcode: string) => {
    setIsScanning(false);
    lookupBarcode(barcode);
  }, [lookupBarcode]);

  return {
    isScanning,
    isLookingUp,
    product,
    error,
    recentScans,
    startScanning,
    stopScanning,
    lookupBarcode,
    clearProduct,
    simulateScan,
  };
}
