import { createContext, useContext, useState, ReactNode } from 'react';

interface DesignVariants {
  header: 1 | 2 | 3 | 4;
  nav: 1 | 2 | 3 | 4;
  cardiac: 1 | 2 | 3 | 4;
  cognitive: 1 | 2 | 3 | 4;
}

interface DesignVariantContextType {
  variants: DesignVariants;
  setHeaderVariant: (v: 1 | 2 | 3 | 4) => void;
  setNavVariant: (v: 1 | 2 | 3 | 4) => void;
  setCardiacVariant: (v: 1 | 2 | 3 | 4) => void;
  setCognitiveVariant: (v: 1 | 2 | 3 | 4) => void;
  setAllVariants: (v: 1 | 2 | 3 | 4) => void;
}

const defaultVariants: DesignVariants = {
  header: 4,
  nav: 4,
  cardiac: 1,
  cognitive: 1,
};

const DesignVariantContext = createContext<DesignVariantContextType | null>(null);

export function DesignVariantProvider({ children }: { children: ReactNode }) {
  const [variants, setVariants] = useState<DesignVariants>(() => {
    // Try to load from localStorage
    const stored = localStorage.getItem('designVariants');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure new properties exist
        return { ...defaultVariants, ...parsed };
      } catch {
        return defaultVariants;
      }
    }
    return defaultVariants;
  });

  const saveVariants = (newVariants: DesignVariants) => {
    setVariants(newVariants);
    localStorage.setItem('designVariants', JSON.stringify(newVariants));
  };

  const setHeaderVariant = (v: 1 | 2 | 3 | 4) => {
    saveVariants({ ...variants, header: v });
  };

  const setNavVariant = (v: 1 | 2 | 3 | 4) => {
    saveVariants({ ...variants, nav: v });
  };

  const setCardiacVariant = (v: 1 | 2 | 3 | 4) => {
    saveVariants({ ...variants, cardiac: v });
  };

  const setCognitiveVariant = (v: 1 | 2 | 3 | 4) => {
    saveVariants({ ...variants, cognitive: v });
  };

  const setAllVariants = (v: 1 | 2 | 3 | 4) => {
    saveVariants({ header: v, nav: v, cardiac: v, cognitive: v });
  };

  return (
    <DesignVariantContext.Provider
      value={{
        variants,
        setHeaderVariant,
        setNavVariant,
        setCardiacVariant,
        setCognitiveVariant,
        setAllVariants,
      }}
    >
      {children}
    </DesignVariantContext.Provider>
  );
}

export function useDesignVariants() {
  const context = useContext(DesignVariantContext);
  if (!context) {
    throw new Error('useDesignVariants must be used within a DesignVariantProvider');
  }
  return context;
}

export default DesignVariantContext;
