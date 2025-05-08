/**
 * UI module for the Habit Tracker app
 * Handles DOM manipulation and UI event binding
 */

import { formatDisplayDate, sortHabits, filterHabits, systemPrefersDarkMode, toggleDarkMode } from './utils.js';
import { 
  getAllHabits, 
  addHabit, 
  removeHabit, 
  updateHabit, 
  toggleHabitCompletion, 
  checkAndResetForNewDay,
  updateStats
} from './habitTracker.js';
import { 
  getCurrentUser, 
  setCurrentUser, 
  clearCurrentUser, 
  getStats, 
  getThemePreference, 
  saveThemePreference,
  registerUser,
  loginUser
} from './storage.js';

// Elements
const currentDateEl = document.getElementById('currentDate');
const habitsListEl = document.getElementById('habitsList');
const addHabitBtn = document.getElementById('addHabitBtn');
const habitModal = document.getElementById('habitModal');
const modalBackdrop = document.getElementById('modalBackdrop');
const habitForm = document.getElementById('habitForm');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const userProfileBtn = document.getElementById('userProfileBtn');
const logoutBtn = document.getElementById('logoutBtn');
const themeToggleBtn = document.getElementById('themeToggle');
const statsButton = document.getElementById('statsButton');
const toast = document.getElementById('toast');
const toastMessage = document.getElementById('toastMessage');
const appContainer = document.querySelector('.app-container');
const authSection = document.querySelector('.auth-section');
const closeModalButtons = document.querySelectorAll('.close-btn');

// State
let sortState = { by: 'name', ascending: true };
let filterState = {};
let editingHabitId = null;

/**
 * Get appropriate greeting based on time of day
 * @returns {string} Greeting message
 */
const getGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour < 12) {
    return 'Good morning';
  } else if (hour < 18) {
    return 'Good afternoon';
  } else {
    return 'Good evening';
  }
};

/**
 * Initialize the UI and bind event listeners
 */
export const initUI = () => {
  // Check for theme preference
  initializeTheme();
  
  // Display current date
  if (currentDateEl) {
    const today = new Date();
    const greeting = getGreeting();
    currentDateEl.innerHTML = `
      <span class="greeting">${greeting}</span>
      ${formatDisplayDate(today)}
    `;
  }
  
  // Check if we need to reset habits for a new day
  checkAndResetForNewDay();
  
  // Check authentication state
  const currentUser = getCurrentUser();
  updateUIForAuthState(currentUser);
  
  // Setup event listeners
  setupEventListeners();
  
  // Bind modal close buttons
  closeModalButtons.forEach(button => {
    button.addEventListener('click', () => {
      habitModal.classList.remove('show');
loginModal.classList.remove('show');
registerModal.classList.remove('show');
modalBackdrop.classList.remove('show');
    });
  });
  
  // Add habit button - open modal
  addHabitBtn.addEventListener('click', () => {
    habitForm.reset(); // Reset form
    document.getElementById('modalTitle').textContent = 'Add New Habit';
    document.getElementById('habitId').value = '';
    editingHabitId = null;
    
    // Show modal
    modalBackdrop.classList.add('show');
    habitModal.classList.add('show');
  });
  
  
  // Cancel habit button
  document.getElementById('cancelHabit').addEventListener('click', () => {
    modalBackdrop.classList.remove('show');
habitModal.classList.remove('show');
  });
  const select = document.getElementById('habitCategory');

function updateCategoryStyle() {
  const value = select.value;
  select.className = 'category-select'; // Reset base class

  if (value) {
    select.classList.add(`category-${value}`);
  }
}

updateCategoryStyle(); // Run once
select.addEventListener('change', updateCategoryStyle); // On change


  // Habit form submission
  habitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('habitName').value;
    const category = document.getElementById('habitCategory').value;
    const goal = document.getElementById('habitGoal').value;
    const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
    
    if (editingHabitId) {
      // Update existing habit
      updateHabit(editingHabitId, {
        name,
        category,
        goal,
        difficulty
      });
      
      showToast(`Habit "${name}" updated successfully`, 'success');
    } else {
      // Add new habit
      addHabit({
        name,
        category,
        goal,
        difficulty
      });
      
      showToast(`Habit "${name}" added successfully`, 'success');
    }
    
    // Hide modal
    habitModal.classList.remove('show');
    modalBackdrop.classList.remove('show');
    
    // Update UI
    renderHabits();
    
    // Update stats
    renderStats();
  });
  
  // Auth buttons on the welcome screen
  const showLoginBtn = document.getElementById('showLoginBtn');
  const showRegisterBtn = document.getElementById('showRegisterBtn');

  if (showLoginBtn && showRegisterBtn) {
    showLoginBtn.addEventListener('click', openLoginModal);
    showRegisterBtn.addEventListener('click', openRegisterModal);
  }
  
  // Handle login form submission
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    const user = loginUser(username, password);
    
    if (user) {
      // Set current user
      setCurrentUser(user);
      
      // Close modal
      loginModal.classList.remove('show');
      modalBackdrop.classList.remove('show');
      
      // Update UI
      updateUIForAuthState(user);
      
      // Render habits
      renderHabits();
      
      // Render stats
      renderStats();
      
      // Show toast
      showToast(`Welcome back, ${user.username}!`, 'success');
    } else {
      showToast('Invalid username or password', 'error');
    }
  });
  
  // Handle register form submission
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }
    
    const user = registerUser({ username, password });
    
    if (user) {
      // Set current user
      setCurrentUser(user);
      
      // Close modal
      registerModal.classList.remove('show');
      modalBackdrop.classList.remove('show');
      
      // Update UI
      updateUIForAuthState(user);
      
      // Show toast
      showToast(`Welcome, ${user.username}!`, 'success');
    } else {
      showToast('Username already exists', 'error');
    }
  });
  
  // Handle logout button click
  logoutBtn.addEventListener('click', () => {
    // Clear current user
    clearCurrentUser();
    
    // Update UI
    updateUIForAuthState(null);
    
    // Show toast
    showToast('You have been logged out', 'info');
  });
  
  // User profile button click - open login modal
  userProfileBtn.addEventListener('click', openLoginModal);
  
  // Theme toggle click
  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    toggleDarkMode(!isDark);
    saveThemePreference(!isDark ? 'dark' : 'light');
    
    // Update button icon
    if (!isDark) {
      themeToggleBtn.innerHTML = '<i class="ri-sun-line"></i>';
      themeToggleBtn.title = 'Switch to light mode';
    } else {
      themeToggleBtn.innerHTML = '<i class="ri-moon-line"></i>';
      themeToggleBtn.title = 'Switch to dark mode';
    }
  });
  
  // Modal switch links
  document.getElementById('switchToRegister').addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.classList.remove('show');
    registerModal.classList.add('show');
  });
  
  document.getElementById('switchToLogin').addEventListener('click', (e) => {
    e.preventDefault();
    registerModal.classList.remove('show');
    loginModal.classList.add('show');
  });
  
  // Sort and filter dropdowns
  document.getElementById('sortButton').addEventListener('click', () => {
    toggleDropdown('sortDropdown');
  });

  document.getElementById('filterButton').addEventListener('click', () => {
    toggleDropdown('filterDropdown');
  });

  // Sort dropdown options
  document.querySelectorAll('#sortDropdown a').forEach(option => {
    option.addEventListener('click', handleSortOption);
  });

  // Filter dropdown options
  document.querySelectorAll('#filterDropdown a').forEach(option => {
    option.addEventListener('click', handleFilterOption);
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', handleClickOutside);
  
  // Stats button
  statsButton.addEventListener('click', () => {
    // Scroll to stats overview section
    document.querySelector('.stats-overview').scrollIntoView({ behavior: 'smooth' });
    
    // Highlight stats by briefly adding a highlight class
    const statsGrid = document.querySelector('.stats-grid');
    statsGrid.classList.add('highlight-stats');
    
    // Remove the highlight class after animation
    setTimeout(() => {
      statsGrid.classList.remove('highlight-stats');
    }, 1500);
    
    // Show toast
    showToast('Viewing your habit statistics', 'info');
  });
};

/**
 * Toggle a dropdown menu
 * @param {string} dropdownId - ID of the dropdown to toggle
 */
const toggleDropdown = (dropdownId) => {
  // Close all dropdowns first
  document.querySelectorAll('.dropdown-content').forEach(dropdown => {
    if (dropdown.id !== dropdownId) {
      dropdown.classList.remove('show');
    }
  });
  
  // Toggle the selected dropdown
  const dropdown = document.getElementById(dropdownId);
  dropdown.classList.toggle('show');
  
  // Mark the active option
  if (dropdownId === 'sortDropdown') {
    const sortOptions = dropdown.querySelectorAll('a');
    sortOptions.forEach(option => {
      if (option.dataset.sort === sortState.by && 
          ((option.dataset.direction === 'asc' && sortState.ascending) ||
           (option.dataset.direction === 'desc' && !sortState.ascending))) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  } else if (dropdownId === 'filterDropdown') {
    const filterOptions = dropdown.querySelectorAll('a');
    filterOptions.forEach(option => {
      // Add logic to mark active filter
      if ((option.dataset.filter === 'completed' && filterState.completedOnly) ||
          (option.dataset.filter === 'incomplete' && filterState.incompleteOnly) ||
          (option.dataset.filterCategory && filterState.category === option.dataset.filterCategory) ||
          (option.dataset.filter === 'all' && !filterState.completedOnly && 
           !filterState.incompleteOnly && !filterState.category)) {
        option.classList.add('active');
      } else {
        option.classList.remove('active');
      }
    });
  }
};

/**
 * Handle sort option selection
 * @param {Event} e - Click event
 */
const handleSortOption = (e) => {
  e.preventDefault();
  
  const sortBy = e.target.dataset.sort;
  const ascending = e.target.dataset.direction === 'asc';
  
  // Update sort state
  sortState.by = sortBy;
  sortState.ascending = ascending;
  
  // Re-render habits with new sort
  renderHabits();
  
  // Close dropdown
  document.getElementById('sortDropdown').classList.remove('show');
};

/**
 * Handle filter option selection
 * @param {Event} e - Click event
 */
const handleFilterOption = (e) => {
  e.preventDefault();
  
  const filterType = e.target.dataset.filter;
  const categoryFilter = e.target.dataset.filterCategory;
  
  // Reset filters
  filterState = {};
  
  // Apply selected filter
  if (filterType === 'completed') {
    filterState.completedOnly = true;
  } else if (filterType === 'incomplete') {
    filterState.incompleteOnly = true;
  } else if (categoryFilter) {
    filterState.category = categoryFilter;
  }
  // 'all' filter just leaves filterState as an empty object
  
  // Re-render habits with new filter
  renderHabits();
  
  // Close dropdown
  document.getElementById('filterDropdown').classList.remove('show');
};

/**
 * Close dropdowns when clicking outside
 * @param {Event} e - Click event
 */
const handleClickOutside = (e) => {
  if (!e.target.matches('.dropdown button') && !e.target.matches('.dropdown i')) {
    document.querySelectorAll('.dropdown-content').forEach(dropdown => {
      dropdown.classList.remove('show');
    });
  }
};


  // Open the login modal
const openLoginModal = () => {
  loginForm.reset();
  registerModal.classList.remove('show');
  modalBackdrop.classList.add('show');
  loginModal.classList.add('show');
};

const openRegisterModal = () => {
  registerForm.reset();
  loginModal.classList.remove('show');
  modalBackdrop.classList.add('show');
  registerModal.classList.add('show');
};

/**
 * Update UI based on authentication state
 * @param {Object|null} user - Current user or null if not logged in
 */
const updateUIForAuthState = (user) => {
  if (user) {
    // User is logged in
    authSection.classList.add('hidden');
    appContainer.classList.remove('hidden');
    addHabitBtn.classList.remove('hidden');
    userProfileBtn.classList.add('hidden');
    logoutBtn.classList.remove('hidden');
    
    // Update greeting
    const greeting = getGreeting();
    currentDateEl.innerHTML = `
      <span class="greeting">${greeting}, <span class="user-welcome">${user.username}</span>!</span>
      ${formatDisplayDate(new Date())}
    `;
    
    // Render habits
    renderHabits();
    
    // Render stats
    renderStats();
  } else {
    // User is not logged in
    authSection.classList.remove('hidden');
    appContainer.classList.add('hidden');
    addHabitBtn.classList.add('hidden');
    userProfileBtn.classList.remove('hidden');
    logoutBtn.classList.add('hidden');
    
    // Update greeting to generic
    const greeting = getGreeting();
    currentDateEl.innerHTML = `
      <span class="greeting">${greeting}!</span>
      ${formatDisplayDate(new Date())}
    `;
  }
};

/**
 * Initialize theme based on user preference or system preference
 */
const initializeTheme = () => {
  const themePreference = getThemePreference();
  
  if (themePreference === 'dark' || (themePreference === 'system' && systemPrefersDarkMode())) {
    toggleDarkMode(true);
    themeToggleBtn.innerHTML = '<i class="ri-sun-line"></i>';
    themeToggleBtn.title = 'Switch to light mode';
  } else {
    toggleDarkMode(false);
    themeToggleBtn.innerHTML = '<i class="ri-moon-line"></i>';
    themeToggleBtn.title = 'Switch to dark mode';
  }
};

/**
 * Render all habits in the UI
 * @param {string} sortBy - Criterion to sort by
 * @param {boolean} ascending - Sort direction
 * @param {Object} filters - Filters to apply
 */
const renderHabits = () => {
  const habits = getAllHabits();
  
  // Sort and filter habits
  const sortedFilteredHabits = filterHabits(
    sortHabits(habits, sortState.by, sortState.ascending),
    filterState
  );
  
  // Clear habits list
  habitsListEl.innerHTML = '';
  
  if (sortedFilteredHabits.length === 0) {
    // Show empty state
    habitsListEl.innerHTML = `
      <div class="empty-state">
        <i class="ri-calendar-todo-line" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.3;"></i>
        <h3>No habits to display</h3>
        <p>Click on + to add a new habit and start tracking your progress!</p>
      </div>
    `;
    return;
  }
  
  // Create and append habit cards
  sortedFilteredHabits.forEach(habit => {
    const habitCard = createHabitCard(habit);
    habitsListEl.appendChild(habitCard);
  });
};

/**
 * Create a habit card DOM element
 * @param {Object} habit - Habit object
 * @returns {HTMLElement} Habit card element
 */
const createHabitCard = (habit) => {
  const card = document.createElement('div');
  card.className = 'habit-card';
  card.dataset.id = habit.id;
  
  // Calculate progress percentage
  const progress = habit.lastSevenDays.filter(day => day).length / 7 * 100;
  
  card.innerHTML = `
    <div class="habit-header">
      <h3 class="habit-title">${habit.name}</h3>
      <span class="habit-category">${habit.category}</span>
    </div>
    ${habit.goal ? `<div class="habit-goal">Goal: ${habit.goal}</div>` : ''}
    <div class="habit-stats">
      <div class="habit-streak">
        <i class="ri-fire-fill"></i> Streak: ${habit.streak} day${habit.streak !== 1 ? 's' : ''}
      </div>
      <div class="habit-completion">
        <i class="ri-bar-chart-fill"></i> Progress: ${Math.round(progress)}%
      </div>
    </div>
    <div class="habit-actions">
      <label class="habit-check">
        <input type="checkbox" ${habit.completed ? 'checked' : ''}>
        <span class="habit-check-label">Completed Today</span>
      </label>
      <div class="habit-buttons">
        <button class="habit-edit btn-icon" aria-label="Edit habit">
          <i class="ri-edit-line"></i>
        </button>
        <button class="habit-delete btn-icon" aria-label="Delete habit">
          <i class="ri-delete-bin-line"></i>
        </button>
      </div>

    </div>
  `;
  
  // Attach event listeners to card
  attachHabitCardListeners(card, habit);
  
  return card;
};

/**
 * Attach event listeners to a habit card
 * @param {HTMLElement} habitCard - Habit card element
 * @param {Object} habit - Habit object
 */
const attachHabitCardListeners = (habitCard, habit) => {
  // Toggle completion checkbox
  const checkbox = habitCard.querySelector('input[type="checkbox"]');
  checkbox.addEventListener('change', () => {
    toggleHabitCompletion(habit.id);
    
    // Update UI
    renderHabits();
    renderStats();
    
    // Show toast
    const message = checkbox.checked ? 
      `Great job! "${habit.name}" marked as completed.` : 
      `"${habit.name}" marked as not completed.`;
    const type = checkbox.checked ? 'success' : 'info';
    
    showToast(message, type);
  });
  
  // Edit button
  const editButton = habitCard.querySelector('.habit-edit');
  editButton.addEventListener('click', () => {
    // Populate the form with habit data
    document.getElementById('habitName').value = habit.name;
    document.getElementById('habitCategory').value = habit.category;
    document.getElementById('habitGoal').value = habit.goal || '';
    document.querySelector(`input[name="difficulty"][value="${habit.difficulty}"]`).checked = true;
    document.getElementById('habitId').value = habit.id;
    
    // Set the modal title to edit mode
    document.getElementById('modalTitle').textContent = 'Edit Habit';
    
    // Store the habit ID being edited
    editingHabitId = habit.id;
    
    // Show the modal
    modalBackdrop.classList.add('show');
habitModal.classList.add('show');
  });
  
  // Delete button
  const deleteButton = habitCard.querySelector('.habit-delete');
  deleteButton.addEventListener('click', () => {
    if (confirm(`Are you sure you want to delete "${habit.name}"?`)) {
      removeHabit(habit.id);
      
      // Update UI
      renderHabits();
      renderStats();
      
      // Show toast
      showToast(`"${habit.name}" deleted successfully`, 'warning');
    }
  });

};

/**
 * Render statistics in the UI
 */
const renderStats = () => {
  const stats = getStats();
  
  document.getElementById('activeHabits').textContent = stats.activeHabits;
  document.getElementById('completedToday').textContent = stats.completedToday;
  document.getElementById('highestStreak').textContent = stats.highestStreak;
  document.getElementById('completionRate').textContent = `${stats.completionRate}%`;
  
  // Add a dynamic message based on completion rate
  const progressMessage = getProgressMessage(stats);
  
  // Select the date element to append the message to
  const dateElement = document.getElementById('currentDate');
  
  // Check if a message element already exists
  let messageElement = document.querySelector('.user-progress');
  
  if (!messageElement) {
    // Create the message element if it doesn't exist
    messageElement = document.createElement('span');
    messageElement.className = 'user-progress';
    dateElement.appendChild(messageElement);
  }
  
  messageElement.textContent = progressMessage;
};

/**
 * Get a motivational message based on stats
 * @param {Object} stats - User stats
 * @returns {string} - Motivational message
 */
const getProgressMessage = (stats) => {
  const { completedToday, activeHabits, completionRate } = stats;
  
  if (activeHabits === 0) {
    return 'Add your first habit to start tracking!';
  }
  
  if (completedToday === activeHabits && activeHabits > 0) {
    return 'Amazing! All habits completed today!';
  }
  
  if (completionRate >= 80) {
    return 'Excellent progress! Keep it up!';
  }
  
  if (completionRate >= 50) {
    return 'Good progress! You\'re on the right track.';
  }
  
  const remaining = activeHabits - completedToday;
  if (completedToday > 0) {
    return `You've completed ${completedToday} habit${completedToday !== 1 ? 's' : ''} today. ${remaining} to go!`;
  }
  
  return 'Time to build some good habits today!';
};

/**
 * Setup all event listeners
 */
const setupEventListeners = () => {
  // Close modal when clicking backdrop (updated)
  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeAllModals();
    }
  });
}

/**
 * Show a toast notification
 * @param {string} message - Message to display
 * @param {string} type - Type of toast (success, warning, info)
 */
const showToast = (message, type = 'success') => {
  // Set message
  toastMessage.textContent = message;
  
  // Set type
  toast.className = 'toast show';
  toast.classList.add(type);
  
  // Show toast
  setTimeout(() => {
    // Hide toast after 3 seconds
    toast.classList.remove('show');
    
    // Remove type class after animation
    setTimeout(() => {
      toast.classList.remove(type);
    }, 300);
  }, 3000);
};

