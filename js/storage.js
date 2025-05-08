/**
 * Storage module for the Habit Tracker app
 * Handles saving and retrieving data from localStorage
 */

/**
 * Get current user from localStorage
 * @returns {Object|null} - Current user object or null if not logged in
 */
export const getCurrentUser = () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  };
  
  /**
   * Set current user in localStorage
   * @param {Object} user - User object
   * @returns {boolean} - True if successful, false otherwise
   */
  export const setCurrentUser = (user) => {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Error setting current user:', error);
      return false;
    }
  };
  
  /**
   * Clear current user from localStorage (logout)
   * @returns {boolean} - True if successful, false otherwise
   */
  export const clearCurrentUser = () => {
    try {
      localStorage.removeItem('currentUser');
      return true;
    } catch (error) {
      console.error('Error clearing current user:', error);
      return false;
    }
  };
  
  /**
   * Get users from localStorage
   * @returns {Array} - Array of user objects
   */
  export const getUsers = () => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
  };
  
  /**
   * Save users to localStorage
   * @param {Array} users - Array of user objects
   * @returns {boolean} - True if successful, false otherwise
   */
  export const saveUsers = (users) => {
    try {
      localStorage.setItem('users', JSON.stringify(users));
      return true;
    } catch (error) {
      console.error('Error saving users:', error);
      return false;
    }
  };
  
  /**
   * Register a new user
   * @param {Object} user - User object with username and password
   * @returns {Object|null} - Newly created user or null if username already exists
   */
  export const registerUser = (user) => {
    const users = getUsers();
    
    // Check if username already exists
    const existingUser = users.find(u => u.username === user.username);
    if (existingUser) {
      return null;
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username: user.username,
      password: user.password, // In a real app, you would hash this
      createdAt: new Date().toISOString()
    };
    
    // Add to users array
    users.push(newUser);
    
    // Save to localStorage
    saveUsers(users);
    
    return newUser;
  };
  
  /**
   * Login a user
   * @param {string} username - Username
   * @param {string} password - Password
   * @returns {Object|null} - User object or null if login failed
   */
  export const loginUser = (username, password) => {
    const users = getUsers();
    
    // Find user by username and password
    const user = users.find(u => u.username === username && u.password === password);
    
    return user || null;
  };
  
  /**
   * Save habits to localStorage for current user
   * @param {Array} habits - Array of habit objects
   * @returns {boolean} - True if successful, false otherwise
   */
  export const saveHabits = (habits) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    try {
      localStorage.setItem(`habits_${currentUser.id}`, JSON.stringify(habits));
      return true;
    } catch (error) {
      console.error('Error saving habits:', error);
      return false;
    }
  };
  
  /**
   * Get habits from localStorage for current user
   * @returns {Array} - Array of habit objects or empty array if none found
   */
  export const getHabits = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    
    const habits = localStorage.getItem(`habits_${currentUser.id}`);
    return habits ? JSON.parse(habits) : [];
  };
  
  /**
   * Clear all habits from localStorage for current user
   * @returns {boolean} - True if successful, false otherwise
   */
  export const clearHabits = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    try {
      localStorage.removeItem(`habits_${currentUser.id}`);
      return true;
    } catch (error) {
      console.error('Error clearing habits:', error);
      return false;
    }
  };
  
  /**
   * Save stats to localStorage for current user
   * @param {Object} stats - Stats object
   * @returns {boolean} - True if successful, false otherwise
   */
  export const saveStats = (stats) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    try {
      localStorage.setItem(`stats_${currentUser.id}`, JSON.stringify(stats));
      return true;
    } catch (error) {
      console.error('Error saving stats:', error);
      return false;
    }
  };
  
  /**
   * Get stats from localStorage for current user
   * @returns {Object} - Stats object or default stats if none found
   */
  export const getStats = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return { activeHabits: 0, completedToday: 0, highestStreak: 0, completionRate: 0 };
    
    const stats = localStorage.getItem(`stats_${currentUser.id}`);
    return stats ? JSON.parse(stats) : { activeHabits: 0, completedToday: 0, highestStreak: 0, completionRate: 0 };
  };
  
  /**
   * Save last updated date to localStorage for current user
   * @param {string} date - Date string in YYYY-MM-DD format
   * @returns {boolean} - True if successful, false otherwise
   */
  export const saveLastUpdated = (date) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return false;
    
    try {
      localStorage.setItem(`lastUpdated_${currentUser.id}`, date);
      return true;
    } catch (error) {
      console.error('Error saving last updated date:', error);
      return false;
    }
  };
  
  /**
   * Get last updated date from localStorage for current user
   * @returns {string|null} - Date string or null if not found
   */
  export const getLastUpdated = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return null;
    
    return localStorage.getItem(`lastUpdated_${currentUser.id}`);
  };
  
  /**
   * Save theme preference to localStorage
   * @param {string} theme - Theme name ('light' or 'dark')
   * @returns {boolean} - True if successful, false otherwise
   */
  export const saveThemePreference = (theme) => {
    try {
      localStorage.setItem('themePreference', theme);
      return true;
    } catch (error) {
      console.error('Error saving theme preference:', error);
      return false;
    }
  };
  
  /**
   * Get theme preference from localStorage
   * @returns {string} - Theme name ('light' or 'dark') or system default
   */
  export const getThemePreference = () => {
    return localStorage.getItem('themePreference') || 'system';
  };