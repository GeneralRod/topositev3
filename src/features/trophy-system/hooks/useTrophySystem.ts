import { useState, useEffect } from 'react';
import { TrophyCabinet, UserPoints, Achievement, PurchasableTrophy } from '../types';
import { achievements, purchasableTrophies } from '../data/trophies';

const initialUserPoints: UserPoints = {
  total: 0,
  history: []
};

export const useTrophySystem = () => {
  const [userPoints, setUserPoints] = useState<UserPoints>(initialUserPoints);
  const [unlockedAchievements, setUnlockedAchievements] = useState<Achievement[]>([]);
  const [purchasedTrophies, setPurchasedTrophies] = useState<PurchasableTrophy[]>([]);

  // Add points to user's total
  const addPoints = (points: number, source: string) => {
    setUserPoints(prev => ({
      total: prev.total + points,
      history: [
        ...prev.history,
        {
          date: new Date().toISOString(),
          points,
          source
        }
      ]
    }));
  };

  // Purchase a trophy
  const purchaseTrophy = (trophy: PurchasableTrophy) => {
    if (userPoints.total >= trophy.price) {
      setUserPoints(prev => ({
        ...prev,
        total: prev.total - trophy.price
      }));
      setPurchasedTrophies(prev => [...prev, { ...trophy, purchased: true }]);
      return true;
    }
    return false;
  };

  // Check and unlock achievements
  const checkAchievements = (gameStats: {
    perfectScores?: { [region: string]: boolean };
    speed?: number;
    streak?: number;
  }) => {
    achievements.forEach(achievement => {
      if (unlockedAchievements.find(a => a.id === achievement.id)) return;

      let shouldUnlock = false;
      switch (achievement.condition.type) {
        case 'perfect_score':
          shouldUnlock = gameStats.perfectScores?.[achievement.condition.region || ''] || false;
          break;
        case 'speed':
          shouldUnlock = (gameStats.speed || 0) <= achievement.condition.value;
          break;
        case 'streak':
          shouldUnlock = (gameStats.streak || 0) >= achievement.condition.value;
          break;
      }

      if (shouldUnlock) {
        setUnlockedAchievements(prev => [...prev, { ...achievement, unlocked: true }]);
        addPoints(achievement.points, `Achievement: ${achievement.name}`);
      }
    });
  };

  // Get trophy cabinet state
  const getTrophyCabinet = (): TrophyCabinet => ({
    achievements: unlockedAchievements,
    purchasableTrophies: purchasedTrophies,
    userPoints
  });

  return {
    userPoints,
    unlockedAchievements,
    purchasedTrophies,
    addPoints,
    purchaseTrophy,
    checkAchievements,
    getTrophyCabinet
  };
}; 