/**
 * Utility functions for the Habit Tracker app
 */

/**
 * Format a date as YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  /**
   * Format a date in a human-readable format (e.g., "May 15, 2023")
   * @param {Date} date - Date to format
   * @returns {string} Formatted date string
   */
  export const formatDisplayDate = (date) => {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  /**
   * Calculate the completion rate for a set of habits
   * @param {Array} habits - Array of habit objects
   * @returns {number} Completion rate as a percentage
   */
  export const calculateCompletionRate = (habits) => {
    if (!habits || habits.length === 0) return 0;
    
    // Count the total number of days tracked across all habits
    const totalDays = habits.reduce((total, habit) => {
      return total + habit.lastSevenDays.length;
    }, 0);
    
    // Count the total number of completed days
    const completedDays = habits.reduce((total, habit) => {
      return total + habit.lastSevenDays.filter(day => day).length;
    }, 0);
    
    return totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
  };
  
  /**
   * Generate a unique ID
   * @returns {string} Unique ID
   */
  export const generateId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  };
  
  /**
   * Sort habits by different criteria
   * @param {Array} habits - Array of habit objects
   * @param {string} sortBy - Sort criterion ('name', 'streak', 'progress')
   * @param {boolean} ascending - Sort direction
   * @returns {Array} Sorted habits
   */
  export const sortHabits = (habits, sortBy = 'name', ascending = true) => {
    return [...habits].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'streak':
          comparison = a.streak - b.streak;
          break;
        case 'progress':
          // Calculate completion percentage for the last 7 days
          const aProgress = a.lastSevenDays.filter(day => day).length / a.lastSevenDays.length;
          const bProgress = b.lastSevenDays.filter(day => day).length / b.lastSevenDays.length;
          comparison = aProgress - bProgress;
          break;
        default:
          comparison = 0;
      }
      
      return ascending ? comparison : -comparison;
    });
  };
  
  /**
   * Filter habits by various criteria
   * @param {Array} habits - Array of habit objects
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered habits
   */
  export const filterHabits = (habits, filters = {}) => {
    return habits.filter(habit => {
      // Filter by completion status
      if (filters.completedOnly && !habit.completed) {
        return false;
      }
      
      if (filters.incompleteOnly && habit.completed) {
        return false;
      }
      
      // Filter by category
      if (filters.category && habit.category !== filters.category) {
        return false;
      }
      
      return true;
    });
  };
  
  /**
   * Detect if the user's system prefers dark mode
   * @returns {boolean} True if dark mode is preferred
   */
  export const systemPrefersDarkMode = () => {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  };
  
  /**
   * Toggle between light and dark mode with smooth transitions
   * @param {boolean} isDark - Whether to set dark mode
   */
  export const toggleDarkMode = (isDark) => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  };