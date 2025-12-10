import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@screens': path.resolve(__dirname, './src/screens'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@components': path.resolve(__dirname, './src/components'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@utils': path.resolve(__dirname, './src/utils'),
    },
  },
  optimizeDeps: {
    include: ['firebase/app', 'firebase/auth', 'firebase/firestore'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-query': ['@tanstack/react-query'],
          // Feature chunks
          'feature-journal': [
            './src/screens/Journal/JournalScreen.tsx',
            './src/screens/Journal/tabs/WellnessTab.tsx',
            './src/screens/Journal/tabs/NutritionTab.tsx',
            './src/screens/Journal/tabs/ActivityTab.tsx',
            './src/screens/Journal/tabs/MedicationsTab.tsx',
            './src/screens/Journal/tabs/AssessmentsTab.tsx',
          ],
          'feature-health': [
            './src/screens/Health/HealthScreen.tsx',
          ],
          'feature-care': [
            './src/screens/Care/CareScreen.tsx',
          ],
          'feature-learn': [
            './src/screens/Learn/LearnScreen.tsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 600, // Increase limit slightly
  },
  server: {
    port: 5173,
  },
});
