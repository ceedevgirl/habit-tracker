/**
 * Jest tests for Habit Tracker app (pure functions and storage.js)
 */
import { 
    formatDate, 
    formatDisplayDate, 
    calculateCompletionRate, 
    generateId, 
    sortHabits, 
    filterHabits, 
    systemPrefersDarkMode, 
    toggleDarkMode 
  } from '../js/utils.js';
  import { calculateStreak } from '../js/habitTracker.js';
  import { 
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
  } from '../js/storage.js';
  
  // Mock localStorage
  const mockLocalStorage = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => store[key] = value.toString(),
      removeItem: (key) => delete store[key],
      clear: () => store = {}
    };
  })();
  Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
  
  // Mock window.matchMedia for systemPrefersDarkMode
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
  });
  
  // Mock document.documentElement for toggleDarkMode
  const mockSetAttribute = jest.fn();
  Object.defineProperty(document, 'documentElement', {
    value: {
      setAttribute: mockSetAttribute,
    },
  });
  
  // Mock user for user-specific storage keys
  const mockUser = {
    id: 'test-user-123',
    username: 'testuser',
    password: 'testpass',
    createdAt: new Date().toISOString()
  };
  
  describe('Habit Tracker', () => {
    beforeEach(() => {
      // Clear localStorage before each test
      mockLocalStorage.clear();
    });
  
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
  
        test('calculateCompletionRate should calculate correct percentage', () => {
          const habits = [
            { lastSevenDays: [true, true, false, false, false, false, false] }, // 2/7
            { lastSevenDays: [true, false, false, false, false, false, false] }, // 1/7
          ];
          // Total: 3 completed out of 14 days = 21.43% (rounded to 21)
          expect(calculateCompletionRate(habits)).toBe(21);
        });
  
        test('generateId should return a string', () => {
          const id = generateId();
          expect(typeof id).toBe('string');
          expect(id.length).toBeGreaterThan(0);
        });
  
        test('sortHabits should sort by name ascending', () => {
          const habits = [
            { name: 'Zumba', streak: 2, lastSevenDays: [true] },
            { name: 'Aerobics', streak: 1, lastSevenDays: [false] },
            { name: 'Yoga', streak: 3, lastSevenDays: [true] },
          ];
          const sorted = sortHabits(habits, 'name', true);
          expect(sorted.map(h => h.name)).toEqual(['Aerobics', 'Yoga', 'Zumba']);
        });
  
        test('sortHabits should sort by streak descending', () => {
          const habits = [
            { name: 'Zumba', streak: 2, lastSevenDays: [true] },
            { name: 'Aerobics', streak: 1, lastSevenDays: [false] },
            { name: 'Yoga', streak: 3, lastSevenDays: [true] },
          ];
          const sorted = sortHabits(habits, 'streak', false);
          expect(sorted.map(h => h.name)).toEqual(['Yoga', 'Zumba', 'Aerobics']);
        });
  
        test('sortHabits should sort by progress ascending', () => {
          const habits = [
            { name: 'Zumba', lastSevenDays: [true, false], streak: 1 }, // 50%
            { name: 'Aerobics', lastSevenDays: [true, true], streak: 2 }, // 100%
            { name: 'Yoga', lastSevenDays: [false, false], streak: 0 }, // 0%
          ];
          const sorted = sortHabits(habits, 'progress', true);
          expect(sorted.map(h => h.name)).toEqual(['Yoga', 'Zumba', 'Aerobics']);
        });
  
        test('filterHabits should filter completed habits', () => {
          const habits = [
            { name: 'Zumba', completed: true },
            { name: 'Aerobics', completed: false },
            { name: 'Yoga', completed: true },
          ];
          const filtered = filterHabits(habits, { completedOnly: true });
          expect(filtered.map(h => h.name)).toEqual(['Zumba', 'Yoga']);
        });
  
        test('filterHabits should filter incomplete habits', () => {
          const habits = [
            { name: 'Zumba', completed: true },
            { name: 'Aerobics', completed: false },
            { name: 'Yoga', completed: true },
          ];
          const filtered = filterHabits(habits, { incompleteOnly: true });
          expect(filtered.map(h => h.name)).toEqual(['Aerobics']);
        });
  
        test('filterHabits should filter by category', () => {
          const habits = [
            { name: 'Zumba', category: 'health' },
            { name: 'Aerobics', category: 'fitness' },
            { name: 'Yoga', category: 'health' },
          ];
          const filtered = filterHabits(habits, { category: 'health' });
          expect(filtered.map(h => h.name)).toEqual(['Zumba', 'Yoga']);
        });
  
        test('systemPrefersDarkMode should return true for dark preference', () => {
          expect(systemPrefersDarkMode()).toBe(true);
        });
  
        test('toggleDarkMode should set theme attribute', () => {
          toggleDarkMode(true);
          expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'dark');
  
          toggleDarkMode(false);
          expect(mockSetAttribute).toHaveBeenCalledWith('data-theme', 'light');
        });
      });
  
      describe('habitTracker.js', () => {
        test('calculateStreak should return habit streak', () => {
          const habit = { streak: 5 };
          expect(calculateStreak(habit)).toBe(5);
        });
      });
    });
  
    describe('Storage Module', () => {
      test('getCurrentUser should return null if no user is set', () => {
        expect(getCurrentUser()).toBeNull();
      });
  
      test('setCurrentUser should save user to localStorage', () => {
        const result = setCurrentUser(mockUser);
        expect(result).toBe(true);
        expect(JSON.parse(mockLocalStorage.getItem('currentUser'))).toEqual(mockUser);
      });
  
      test('setCurrentUser should handle errors and return false', () => {
        mockLocalStorage.setItem = jest.fn().mockImplementation(() => {
          throw new Error('Storage error');
        });
        const result = setCurrentUser(mockUser);
        expect(result).toBe(false);
      });
  
      test('clearCurrentUser should remove current user from localStorage', () => {
        setCurrentUser(mockUser);
        const result = clearCurrentUser();
        expect(result).toBe(true);
        expect(mockLocalStorage.getItem('currentUser')).toBeNull();
      });
  
      test('clearCurrentUser should handle errors and return false', () => {
        mockLocalStorage.removeItem = jest.fn().mockImplementation(() => {
          throw new Error('Storage error');
        });
        const result = clearCurrentUser();
        expect(result).toBe(false);
      });
  
      test('getUsers should return empty array if no users are set', () => {
        expect(getUsers()).toEqual([]);
      });
  
      test('saveUsers should save users to localStorage', () => {
        const users = [mockUser];
        const result = saveUsers(users);
        expect(result).toBe(true);
        expect(JSON.parse(mockLocalStorage.getItem('users'))).toEqual(users);
      });
  
      test('saveUsers should handle errors and return false', () => {
        mockLocalStorage.setItem = jest.fn().mockImplementation(() => {
          throw new Error('Storage error');
        });
        const result = saveUsers([mockUser]);
        expect(result).toBe(false);
      });
  
      test('registerUser should create a new user', () => {
        const newUser = { username: 'newuser', password: 'newpass' };
        const result = registerUser(newUser);
        expect(result).toMatchObject({
          username: 'newuser',
          password: 'newpass',
          id: expect.any(String),
          createdAt: expect.any(String)
        });
        expect(getUsers()).toHaveLength(1);
      });
  
      test('registerUser should return null if username exists', () => {
        registerUser({ username: 'testuser', password: 'testpass' });
        const result = registerUser({ username: 'testuser', password: 'newpass' });
        expect(result).toBeNull();
        expect(getUsers()).toHaveLength(1);
      });
  
      test('loginUser should return user if credentials are correct', () => {
        registerUser({ username: 'testuser', password: 'testpass' });
        const result = loginUser('testuser', 'testpass');
        expect(result).toMatchObject({
          username: 'testuser',
          password: 'testpass'
        });
      });
  
      test('loginUser should return null if credentials are incorrect', () => {
        registerUser({ username: 'testuser', password: 'testpass' });
        expect(loginUser('testuser', 'wrongpass')).toBeNull();
        expect(loginUser('wronguser', 'testpass')).toBeNull();
      });
  
      test('saveHabits should save habits for current user', () => {
        setCurrentUser(mockUser);
        const habits = [{ id: '1', name: 'Read' }];
        const result = saveHabits(habits);
        expect(result).toBe(true);
        expect(JSON.parse(mockLocalStorage.getItem(`habits_${mockUser.id}`))).toEqual(habits);
      });
  
      test('saveHabits should return false if no current user', () => {
        const result = saveHabits([{ id: '1', name: 'Read' }]);
        expect(result).toBe(false);
        expect(mockLocalStorage.getItem('habits_undefined')).toBeNull();
      });
  
      test('saveHabits should handle errors and return false', () => {
        setCurrentUser(mockUser);
        mockLocalStorage.setItem = jest.fn().mockImplementation(() => {
          throw new Error('Storage error');
        });
        const result = saveHabits([{ id: '1', name: 'Read' }]);
        expect(result).toBe(false);
      });
  
      test('getHabits should return habits for current user', () => {
        setCurrentUser(mockUser);
        const habits = [{ id: '1', name: 'Read' }];
        saveHabits(habits);
        expect(getHabits()).toEqual(habits);
      });
  
      test('getHabits should return empty array if no current user', () => {
        expect(getHabits()).toEqual([]);
      });
  
      test('clearHabits should remove habits for current user', () => {
        setCurrentUser(mockUser);
        saveHabits([{ id: '1', name: 'Read' }]);
        const result = clearHabits();
        expect(result).toBe(true);
        expect(mockLocalStorage.getItem(`habits_${mockUser.id}`)).toBeNull();
      });
  
      test('clearHabits should return false if no current user', () => {
        const result = clearHabits();
        expect(result).toBe(false);
      });
  
      test('saveStats should save stats for current user', () => {
        setCurrentUser(mockUser);
        const stats = { activeHabits: 2, completedToday: 1 };
        const result = saveStats(stats);
        expect(result).toBe(true);
        expect(JSON.parse(mockLocalStorage.getItem(`stats_${mockUser.id}`))).toEqual(stats);
      });
  
      test('saveStats should return false if no current user', () => {
        const result = saveStats({ activeHabits: 2 });
        expect(result).toBe(false);
      });
  
      test('getStats should return stats for current user', () => {
        setCurrentUser(mockUser);
        const stats = { activeHabits: 2, completedToday: 1 };
        saveStats(stats);
        expect(getStats()).toEqual(stats);
      });
  
      test('getStats should return default stats if no current user', () => {
        expect(getStats()).toEqual({
          activeHabits: 0,
          completedToday: 0,
          highestStreak: 0,
          completionRate: 0
        });
      });
  
      test('saveLastUpdated should save date for current user', () => {
        setCurrentUser(mockUser);
        const date = '2025-05-08';
        const result = saveLastUpdated(date);
        expect(result).toBe(true);
        expect(mockLocalStorage.getItem(`lastUpdated_${mockUser.id}`)).toBe(date);
      });
  
      test('saveLastUpdated should return false if no current user', () => {
        const result = saveLastUpdated('2025-05-08');
        expect(result).toBe(false);
      });
  
      test('getLastUpdated should return date for current user', () => {
        setCurrentUser(mockUser);
        const date = '2025-05-08';
        saveLastUpdated(date);
        expect(getLastUpdated()).toBe(date);
      });
  
      test('getLastUpdated should return null if no current user', () => {
        expect(getLastUpdated()).toBeNull();
      });
  
      test('saveThemePreference should save theme', () => {
        const result = saveThemePreference('dark');
        expect(result).toBe(true);
        expect(mockLocalStorage.getItem('themePreference')).toBe('dark');
      });
  
      test('saveThemePreference should handle errors and return false', () => {
        mockLocalStorage.setItem = jest.fn().mockImplementation(() => {
          throw new Error('Storage error');
        });
        const result = saveThemePreference('dark');
        expect(result).toBe(false);
      });
  
      test('getThemePreference should return theme or system default', () => {
        saveThemePreference('dark');
        expect(getThemePreference()).toBe('dark');
        mockLocalStorage.clear();
        expect(getThemePreference()).toBe('system');
      });
    });
  });