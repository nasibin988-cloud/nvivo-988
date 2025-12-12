/**
 * ScanningStep - Animated loading state during OCR processing
 */

import { FileText } from 'lucide-react';
import { AnalyzingAnimation } from '../../shared';

interface ScanningStepProps {
  imageData: string;
}

export function ScanningStep({ imageData }: ScanningStepProps): React.ReactElement {
  return (
    <AnalyzingAnimation
      imageData={imageData}
      icon={FileText}
      title="Scanning Menu..."
      subtitle="Extracting menu items and nutrition info"
      colorTheme="teal"
    />
  );
}
