// Hero Section Props
export interface HeroSectionProps {
  onVideoOpen: () => void;
}

// Video Modal Props
export interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Feature Item Interface
export interface FeatureItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  image?: string;
}

// Step Item Interface
export interface StepItem {
  step: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

// Testimonial Interface
export interface Testimonial {
  name: string;
  role: string;
  image: string;
  content: string;
  rating: number;
}

// Stats Interface
export interface StatItem {
  number: string;
  label: string;
}

// Feature Badge Interface
export interface FeatureBadge {
  icon: React.ReactNode;
  text: string;
}