import React, { useState } from 'react';
import { useTrophySystem } from '../hooks/useTrophySystem';
import { TrophyCabinet } from './TrophyCabinet';
import './TrophySystemTest.css';

export const TrophySystemTest: React.FC = () => {
  const { addPoints, checkAchievements } = useTrophySystem();
  const [simulatedPoints, setSimulatedPoints] = useState(0);

  // Simulate different game actions
  const simulateCorrectAnswer = () => {
    const points = Math.floor(Math.random() * 50) + 10; // Random points between 10-60
    addPoints(points, 'Correct answer');
    setSimulatedPoints(prev => prev + points);
  };

  const simulatePerfectScore = () => {
    checkAchievements({
      perfectScores: { europe: true }
    });
  };

  const simulateSpeedRun = () => {
    checkAchievements({
      speed: 25 // Simulate completing in 25 seconds
    });
  };

  const simulateStreak = () => {
    checkAchievements({
      streak: 7 // Simulate 7-day streak
    });
  };

  return (
    <div className="trophy-system-test">
      <h1>Trophy System Test Panel</h1>
      
      <div className="test-controls">
        <h2>Simulate Game Actions</h2>
        <div className="button-group">
          <button onClick={simulateCorrectAnswer}>
            Simulate Correct Answer (+10-60 points)
          </button>
          <button onClick={simulatePerfectScore}>
            Simulate Perfect Score (Europe)
          </button>
          <button onClick={simulateSpeedRun}>
            Simulate Speed Run (25s)
          </button>
          <button onClick={simulateStreak}>
            Simulate 7-Day Streak
          </button>
        </div>
        
        <div className="stats">
          <p>Total Points Earned in This Session: {simulatedPoints}</p>
        </div>
      </div>

      <div className="trophy-cabinet-container">
        <TrophyCabinet />
      </div>
    </div>
  );
}; 