export interface Trophy {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  points: number;
  category: 'achievement' | 'purchasable';
  unlocked?: boolean;
  purchased?: boolean;
}

export interface Achievement extends Trophy {
  category: 'achievement';
  condition: {
    type: 'perfect_score' | 'streak' | 'speed' | 'completion';
    value: number;
    region?: string;
  };
}

export interface PurchasableTrophy extends Trophy {
  category: 'purchasable';
  price: number;
}

export interface UserPoints {
  total: number;
  history: {
    date: string;
    points: number;
    source: string;
  }[];
}

export interface TrophyCabinet {
  achievements: Achievement[];
  purchasableTrophies: PurchasableTrophy[];
  userPoints: UserPoints;
} 