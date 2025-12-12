/**
 * AnalyzingStep Component
 * Analysis loading state with sexy scanning animation
 */

import { Sparkles } from 'lucide-react';
import { AnalyzingAnimation } from '../../shared';

interface AnalyzingStepProps {
  imageData: string;
}

export default function AnalyzingStep({ imageData }: AnalyzingStepProps): React.ReactElement {
  return (
    <AnalyzingAnimation
      imageData={imageData}
      icon={Sparkles}
      title="Analyzing your meal..."
      subtitle="AI is identifying foods and estimating nutrition"
      colorTheme="violet"
    />
  );
}
