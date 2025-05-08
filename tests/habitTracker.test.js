// tests/habitTracker.test.js
const {
    formatDate,
    formatDisplayDate,
    calculateCompletionRate,
    generateId,
    sortHabits,
    filterHabits,
    systemPrefersDarkMode,
    toggleDarkMode
  } = require('../js/utils');
  
  const {
    getCurrentUser,
    setCurrentUser,
    clearCurrentUser,
    getUsers,
    saveUsers,
    registerUser,
    loginUser,
    saveHabits,
    getHabits,
    clearHabits,
    saveStats,
    getStats,
    saveLastUpdated,
    getLastUpdated,
    saveThemePreference,
    getThemePreference
  } = require('../js/storage');
  
  describe('Habit Tracker', () => {
    describe('Pure Functions', () => {
      describe('utils.js', () => {
        test('formatDate should format date as YYYY-MM-DD', () => {
          const date = new Date('2025-05-08');
          expect(formatDate(date)).toBe('2025-05-08');
        });
  
        test('formatDisplayDate should format date in human-readable format', () => {
          const date = new Date('2025-05-08');
          expect(formatDisplayDate(date)).toBe('May 8, 2025');
        });
  
        test('calculateCompletionRate should return 0 for empty habits', () => {
          expect(calculateCompletionRate([])).toBe(0);
        });
  
       
        test('generateId should return a string', () => {
          expect(typeof generateId()).toBe('string');
        });
      });
    });
  
    describe('Storage Module', () => {
      const mockUser = {
        id: '123',
        username: 'testuser',
        password: 'testpass'
      };
  
      beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();
        jest.spyOn(console, 'error').mockImplementation(() => {});
      });
  
      afterEach(() => {
        jest.restoreAllMocks();
      });
  
      test('getCurrentUser should return null if no user is set', () => {
        expect(getCurrentUser()).toBeNull();
      });
  
      test('setCurrentUser should save user to localStorage', () => {
        const result = setCurrentUser(mockUser);
        expect(result).toBe(true);
        expect(JSON.parse(localStorage.getItem('currentUser'))).toEqual(mockUser);
      });
  
      test('clearCurrentUser should remove current user from localStorage', () => {
        setCurrentUser(mockUser);
        const result = clearCurrentUser();
        expect(result).toBe(true);
        expect(localStorage.getItem('currentUser')).toBeNull();
      });
  
      test('getUsers should return empty array if no users are set', () => {
        expect(getUsers()).toEqual([]);
      });
  
      test('saveUsers should save users to localStorage', () => {
        const users = [mockUser];
        const result = saveUsers(users);
        expect(result).toBe(true);
        expect(JSON.parse(localStorage.getItem('users'))).toEqual(users);
      });
  
      test('registerUser should create a new user', () => {
        const newUser = registerUser({ username: 'newuser', password: 'pass' });
        expect(newUser).toMatchObject({
          username: 'newuser',
          password: 'pass'
        });
        expect(getUsers()).toHaveLength(1);
      });
  
      test('loginUser should return null if credentials are incorrect', () => {
        registerUser({ username: 'testuser', password: 'testpass' });
        const result = loginUser('testuser', 'wrongpass');
        expect(result).toBeNull();
      });
  
      test('getHabits should return empty array if no current user', () => {
        expect(getHabits()).toEqual([]);
      });
  
      test('getStats should return default stats if no current user', () => {
        expect(getStats()).toEqual({
          activeHabits: 0,
          completedToday: 0,
          completionRate: 0,
          highestStreak: 0
        });
      });
  
      test('getLastUpdated should return null if no current user', () => {
        expect(getLastUpdated()).toBeNull();
      });
  
      test('getThemePreference should return system default if no preference set', () => {
        expect(getThemePreference()).toBe('system');
      });
    });
  });