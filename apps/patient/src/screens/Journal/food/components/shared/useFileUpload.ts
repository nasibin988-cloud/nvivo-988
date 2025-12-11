/**
 * useFileUpload - Shared hook for file upload handling
 * Used by PhotoAnalysisModal, MenuScannerModal, and FoodComparison
 */

import { useRef, useCallback } from 'react';

interface UseFileUploadOptions {
  /** Callback when file is successfully read as base64 */
  onFileRead: (base64: string) => void;
  /** Accepted file types (default: 'image/*') */
  accept?: string;
}

interface UseFileUploadReturn {
  /** Ref to attach to hidden file input */
  fileInputRef: React.RefObject<HTMLInputElement>;
  /** Handler for file input change event */
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Programmatically open file dialog */
  openFileDialog: () => void;
}

/**
 * Hook for handling file uploads with base64 conversion
 * Encapsulates the common pattern of FileReader → base64 conversion
 */
export function useFileUpload({ onFileRead }: UseFileUploadOptions): UseFileUploadReturn {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>): void => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      if (base64) {
        onFileRead(base64);
      }
    };
    reader.readAsDataURL(file);

    // Reset input so same file can be selected again
    if (event.target) {
      event.target.value = '';
    }
  }, [onFileRead]);

  const openFileDialog = useCallback((): void => {
    fileInputRef.current?.click();
  }, []);

  return {
    fileInputRef,
    handleFileUpload,
    openFileDialog,
  };
}
