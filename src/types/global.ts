// ==========================================
// ENHANCED STATS CARD INTERFACES
// ==========================================

/**
 * Trend direction for statistical changes
 */
export type TrendDirection = "up" | "down" | "neutral";

/**
 * Color variants for components (using Tailwind classes)
 */
export type ColorVariant = 
  | "text-emerald-500" 
  | "text-blue-500" 
  | "text-purple-500" 
  | "text-orange-500" 
  | "text-red-500" 
  | "text-yellow-500" 
  | "text-pink-500" 
  | "text-indigo-500" 
  | "text-green-500"
  | "text-cyan-500"
  | "text-gray-500";

/**
 * Props for the Enhanced Stats Card Component
 */
export interface StatsCardProps {
  /** Icon element to display (React node) */
  icon: React.ReactNode;
  
  /** Title/label for the statistic */
  title: string;
  
  /** The main value to display */
  value: string | number;
  
  /** Color theme for the card (Tailwind text color class) */
  color: ColorVariant;
  
  /** Optional unit to display after the value */
  unit?: string;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Trend direction for the statistic */
  trend?: TrendDirection;
  
  /** Trend value/percentage change */
  trendValue?: string;
  
  /** Additional description text */
  description?: string;
  
  /** Whether to animate the number counting effect */
  animated?: boolean;
  
  /** Optional click handler */
  onClick?: () => void;
  
  /** Optional loading state */
  isLoading?: boolean;
  
  /** Optional error state */
  hasError?: boolean;
}

/**
 * Sample data structure for stats cards
 */
export interface StatsCardData {
  id: string;
  icon: string | React.ReactNode;
  title: string;
  value: string | number;
  color: ColorVariant;
  unit?: string;
  trend?: TrendDirection;
  trendValue?: string;
  description?: string;
  category?: string;
  lastUpdated?: Date;
}

// ==========================================
// ENHANCED ACHIEVEMENT BADGES INTERFACES
// ==========================================

/**
 * Badge rarity levels
 */
export type BadgeRarity = "common" | "rare" | "epic" | "legendary";

/**
 * Achievement badge status
 */
export type BadgeStatus = "locked" | "unlocked" | "in_progress";

/**
 * Basic achievement structure from your API/database
 */
export interface Achievement {
  achievements: {
    name: string;
    description?: string;
    category?: string;
    points?: number;
    unlockedAt?: string | Date;
  };
}

/**
 * User statistics for achievement calculations
 */
export interface UserStats {
  activeHabits: number;
  longestStreak: number;
  totalLearningDays: number;
  completedTasks: number;
  learningPaths: string[];
  currentStreak: number;
  totalPoints: number;
  level: number;
}

/**
 * Individual achievement badge configuration
 */
export interface AchievementBadgeData {
  /** Unique identifier for the badge */
  id?: string;
  
  /** Display name of the achievement */
  name: string;
  
  /** Description of how to earn this badge */
  description: string;
  
  /** Icon component or emoji */
  icon: React.ReactNode;
  
  /** Whether the badge has been unlocked */
  unlocked: boolean;
  
  /** Rarity level affecting visual appearance */
  rarity?: BadgeRarity;
  
  /** Date when the badge was unlocked */
  unlockedAt?: string | Date;
  
  /** Category/group this badge belongs to */
  category?: string;
  
  /** Points awarded for unlocking this badge */
  points?: number;
  
  /** Current progress towards unlocking (0-100) */
  progress?: number;
  
  /** Maximum value needed to unlock */
  maxProgress?: number;
  
  /** Current value towards the goal */
  currentValue?: number;
  
  /** Custom unlock condition function */
  unlockCondition?: (stats: UserStats, achievements: Achievement[]) => boolean;
  
  /** Custom progress calculation function */
  progressCalculation?: (stats: UserStats, achievements: Achievement[]) => number;
  
  /** Whether this badge is hidden until unlocked */
  isSecret?: boolean;
  
  /** Prerequisites (other badges that must be unlocked first) */
  prerequisites?: string[];
  
  /** Custom color overrides */
  customColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

/**
 * Props for individual Achievement Badge Component
 */
export interface AchievementBadgeProps {
  /** Badge data configuration */
  badge: AchievementBadgeData;
  
  /** Index in the list (for staggered animations) */
  index: number;
  
  /** Callback when badge is unlocked */
  onUnlock?: (badge: AchievementBadgeData) => void;
  
  /** Override progress value */
  progress?: number;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Whether to show detailed view */
  detailed?: boolean;
  
  /** Click handler */
  onClick?: (badge: AchievementBadgeData) => void;
  
  /** Whether animations are enabled */
  animated?: boolean;
  
  /** Size variant */
  size?: "small" | "medium" | "large";
}

/**
 * Props for the main Achievement Badges Container
 */
export interface AchievementBadgesProps {
  /** Array of achievement badges */
  badges: AchievementBadgeData[];
  
  /** User's current statistics */
  stats: UserStats;
  
  /** User's unlocked achievements */
  achievements: Achievement[];
  
  /** Grid layout columns */
  columns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  
  /** Whether to show progress summary */
  showSummary?: boolean;
  
  /** Whether to group badges by category */
  groupByCategory?: boolean;
  
  /** Filter by category */
  categoryFilter?: string;
  
  /** Filter by rarity */
  rarityFilter?: BadgeRarity;
  
  /** Show only unlocked badges */
  showOnlyUnlocked?: boolean;
  
  /** Callback for badge interactions */
  onBadgeClick?: (badge: AchievementBadgeData) => void;
  
  /** Callback for unlock celebrations */
  onBadgeUnlock?: (badge: AchievementBadgeData) => void;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Error state */
  error?: string | null;
}

/**
 * Celebration queue item for managing unlock animations
 */
export interface CelebrationItem {
  id: string;
  badge: AchievementBadgeData;
  timestamp: number;
  type: "unlock" | "progress" | "milestone";
}

/**
 * Achievement statistics summary
 */
export interface AchievementSummary {
  totalBadges: number;
  unlockedBadges: number;
  completionPercentage: number;
  totalPoints: number;
  rarityBreakdown: Record<BadgeRarity, number>;
  categoryBreakdown: Record<string, number>;
  recentUnlocks: AchievementBadgeData[];
  nextToUnlock: AchievementBadgeData[];
}

/**
 * Particle system configuration
 */
export interface ParticleConfig {
  count: number;
  colors: string[];
  duration: number;
  spread: number;
  gravity: number;
  wind: number;
}

/**
 * Animation configuration for components
 */
export interface AnimationConfig {
  duration: number;
  easing: string;
  stagger: number;
  particles: ParticleConfig;
  celebrationDuration: number;
}

// ==========================================
// UTILITY TYPES
// ==========================================

/**
 * Common props that both components might share
 */
export interface BaseComponentProps {
  className?: string;
  'data-testid'?: string;
  id?: string;
}

/**
 * Theme configuration for consistent styling
 */
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    neutral: string;
  };
  gradients: {
    common: string;
    rare: string;
    epic: string;
    legendary: string;
  };
  animations: {
    fast: string;
    normal: string;
    slow: string;
  };
}

/**
 * Responsive breakpoint configuration
 */
export interface ResponsiveConfig {
  sm: number;
  md: number;
  lg: number;
  xl: number;
  '2xl': number;
}

// ==========================================
// COMPONENT STATE INTERFACES
// ==========================================

/**
 * State for stats card component
 */
export interface StatsCardState {
  isHovered: boolean;
  displayValue: number;
  isVisible: boolean;
  isLoading: boolean;
  error: string | null;
}

/**
 * State for achievement badge component
 */
export interface AchievementBadgeState {
  isHovered: boolean;
  showCelebration: boolean;
  isFlipping: boolean;
  particles: Array<{
    id: number;
    x: number;
    y: number;
    vx: number;
    vy: number;
    life: number;
    decay: number;
    size: number;
  }>;
}

/**
 * State for achievement badges container
 */
export interface AchievementBadgesState {
  celebrationQueue: CelebrationItem[];
  filter: {
    category?: string;
    rarity?: BadgeRarity;
    status?: BadgeStatus;
  };
  sortBy: 'name' | 'rarity' | 'unlockDate' | 'progress';
  sortOrder: 'asc' | 'desc';
  isLoading: boolean;
  error: string | null;
}

// ==========================================
// EVENT HANDLERS
// ==========================================

/**
 * Event handlers for stats card
 */
export interface StatsCardEvents {
  onHover?: (isHovered: boolean) => void;
  onClick?: () => void;
  onAnimationComplete?: () => void;
  onError?: (error: string) => void;
}

/**
 * Event handlers for achievement badges
 */
export interface AchievementBadgeEvents {
  onUnlock?: (badge: AchievementBadgeData) => void;
  onProgress?: (badge: AchievementBadgeData, progress: number) => void;
  onHover?: (badge: AchievementBadgeData, isHovered: boolean) => void;
  onClick?: (badge: AchievementBadgeData) => void;
}

// ==========================================
// EXAMPLE USAGE TYPES
// ==========================================

/**
 * Example configuration for a complete dashboard
 */
export interface DashboardConfig {
  statsCards: StatsCardData[];
  achievementBadges: AchievementBadgeData[];
  userStats: UserStats;
  theme: ThemeConfig;
  animations: AnimationConfig;
  responsive: ResponsiveConfig;
}

export interface CircularProgressBarProps {
  progress: number;
  size: number;
  strokeWidth: number;
  className?: string;
}

// ==========================================
// EXPORT ALL TYPES
// ==========================================

// export type {
//   // Stats Card Types
//   StatsCardProps,
//   StatsCardData,
//   StatsCardState,
//   StatsCardEvents,
  
//   // Achievement Badge Types
//   AchievementBadgeData,
//   AchievementBadgeProps,
//   AchievementBadgesProps,
//   AchievementBadgeState,
//   AchievementBadgeEvents,
  
//   // Shared Types
//   TrendDirection,
//   ColorVariant,
//   BadgeRarity,
//   BadgeStatus,
//   Achievement,
//   UserStats,
//   CelebrationItem,
//   AchievementSummary,
  
//   // Configuration Types
//   ParticleConfig,
//   AnimationConfig,
//   ThemeConfig,
//   ResponsiveConfig,
//   DashboardConfig,
  
//   // Base Types
//   BaseComponentProps,
// };