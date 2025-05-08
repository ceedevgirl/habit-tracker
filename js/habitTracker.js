/**
 * Habit Tracker logic module
 * Handles the core functionality for managing habits
 */

import { formatDate, generateId, calculateCompletionRate } from './utils.js';
import { 
  getHabits, 
  saveHabits, 
  saveStats, 
  getLastUpdated, 
  saveLastUpdated
} from './storage.js';

/**
 * Get all habits for the current user
 * @returns {Array} Array of habit objects
 */
export const getAllHabits = () => {
  return getHabits();
};

/**
 * Add a new habit
 * @param {Object} habit - The habit to add
 * @returns {Array} Updated array of habits
 */
export const addHabit = (habit) => {
  const habits = getHabits();
  
  const newHabit = {
    id: generateId(),
    name: habit.name,
    category: habit.category || 'other',
    goal: habit.goal || '',
    difficulty: habit.difficulty || 'easy',
    streak: 0,
    completed: false,
    lastSevenDays: [false, false, false, false, false, false, false],
    createdAt: new Date().toISOString()
  };
  
  habits.push(newHabit);
  saveHabits(habits);
  updateStats(habits);
  
  return habits;
};

/**
 * Remove a habit
 * @param {string} habitId - ID of the habit to remove
 * @returns {Array} Updated array of habits
 */
export const removeHabit = (habitId) => {
  let habits = getHabits();
  
  habits = habits.filter(habit => habit.id !== habitId);
  saveHabits(habits);
  updateStats(habits);
  
  return habits;
};

/**
 * Update a habit
 * @param {string} habitId - ID of the habit to update
 * @param {Object} updates - Object containing updated habit properties
 * @returns {Array} Updated array of habits
 */
export const updateHabit = (habitId, updates) => {
  const habits = getHabits();
  
  const updatedHabits = habits.map(habit => {
    if (habit.id === habitId) {
      return { ...habit, ...updates };
    }
    return habit;
  });
  
  saveHabits(updatedHabits);
  updateStats(updatedHabits);
  
  return updatedHabits;
};

/**
 * Toggle completion status for a habit for today
 * @param {string} habitId - ID of the habit to toggle
 * @returns {Object} Updated habit
 */
export const toggleHabitCompletion = (habitId) => {
  const habits = getHabits();
  
  const updatedHabits = habits.map(habit => {
    if (habit.id === habitId) {
      const wasCompleted = habit.completed;
      const newCompleted = !wasCompleted;
      
      // Update streak
      let streak = habit.streak;
      
      if (newCompleted && !wasCompleted) {
        // If marking as completed, increment streak
        streak += 1;
      } else if (!newCompleted && wasCompleted) {
        // If marking as incomplete, decrement streak (but not below 0)
        streak = Math.max(0, streak - 1);
      }
      
      // Update last seven days array (shift left and add today's status at the end)
      const lastSevenDays = [...habit.lastSevenDays.slice(1), newCompleted];
      
      return {
        ...habit,
        completed: newCompleted,
        streak,
        lastSevenDays
      };
    }
    return habit;
  });
  
  saveHabits(updatedHabits);
  updateStats(updatedHabits);
  
  // Return the updated habit
  return updatedHabits.find(habit => habit.id === habitId);
};

/**
 * Reset daily habit completion status
 * This should be called at the start of a new day
 * @returns {Array} Updated array of habits
 */
export const resetDailyCompletion = () => {
  const habits = getHabits();
  
  const updatedHabits = habits.map(habit => {
    // Shift the last seven days array left and add false for today
    const lastSevenDays = [...habit.lastSevenDays.slice(1), false];
    
    return {
      ...habit,
      completed: false,
      lastSevenDays
    };
  });
  
  saveHabits(updatedHabits);
  updateStats(updatedHabits);
  
  // Save today's date as last updated
  saveLastUpdated(formatDate(new Date()));
  
  return updatedHabits;
};

/**
 * Update stats based on current habits
 * @param {Array} habits - Array of habit objects
 * @returns {Object} Updated stats
 */
export const updateStats = (habits) => {
  const activeHabits = habits.length;
  const completedToday = habits.filter(habit => habit.completed).length;
  
  // Find the highest streak among all habits
  const highestStreak = habits.reduce((max, habit) => {
    return Math.max(max, habit.streak);
  }, 0);
  
  // Calculate overall completion rate
  const completionRate = calculateCompletionRate(habits);
  
  const stats = {
    activeHabits,
    completedToday,
    highestStreak,
    completionRate
  };
  
  saveStats(stats);
  
  return stats;
};

/**
 * Check if habits need to be reset for a new day
 * @returns {boolean} True if habits were reset, false otherwise
 */
export const checkAndResetForNewDay = () => {
  const lastUpdated = getLastUpdated();
  const today = formatDate(new Date());
  
  // If no last updated date or it's different from today, reset habits
  if (!lastUpdated || lastUpdated !== today) {
    resetDailyCompletion();
    return true;
  }
  
  return false;
};

/**
 * Calculate streak for a habit
 * @param {Object} habit - Habit object
 * @returns {number} Current streak
 */
export const calculateStreak = (habit) => {
  return habit.streak;
};