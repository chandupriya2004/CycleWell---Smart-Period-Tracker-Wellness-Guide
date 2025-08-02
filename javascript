// Global variables
let currentUser = null;
let userProfile = null;
let periodLogs = [];
let dailyLogs = [];
let currentDate = new Date();
let currentStep = 1;
let activeTab = 'overview';

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
});

function initializeApp() {
    // Simulate loading
    setTimeout(() => {
        document.getElementById('loading-screen').classList.add('hidden');
        
        // Check if user is logged in
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            loadUserProfile();
        } else {
            showAuthContainer();
        }
    }, 2000);
}

function setupEventListeners() {
    // Auth form listeners
    document.getElementById('login-form-element').addEventListener('submit', handleLogin);
    document.getElementById('signup-form-element').addEventListener('submit', handleSignup);
    document.getElementById('show-signup').addEventListener('click', () => toggleAuthForm('signup'));
    document.getElementById('show-login').addEventListener('click', () => toggleAuthForm('login'));
    
    // Password toggle listeners
    document.querySelectorAll('.toggle-password').forEach(btn => {
        btn.addEventListener('click', togglePasswordVisibility);
    });
    
    // Onboarding listeners
    document.getElementById('next-step').addEventListener('click', nextStep);
    document.getElementById('prev-step').addEventListener('click', prevStep);
    document.getElementById('complete-onboarding').addEventListener('click', completeOnboarding);
    
    // Health condition listeners
    document.querySelectorAll('#step-4 input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', handleHealthConditionChange);
    });
    
    // App listeners
    document.getElementById('logout-btn').addEventListener('click', logout);
    
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.currentTarget.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Calendar navigation
    document.getElementById('prev-month').addEventListener('click', () => changeMonth(-1));
    document.getElementById('next-month').addEventListener('click', () => changeMonth(1));
    
    // Form listeners
    document.getElementById('period-form').addEventListener('submit', handlePeriodSubmit);
    document.getElementById('daily-form').addEventListener('submit', handleDailySubmit);
    
    // Water intake slider
    const waterRange = document.getElementById('water-range');
    if (waterRange) {
        waterRange.addEventListener('input', updateWaterDisplay);
    }
    
    // Set today's date for forms
    const today = new Date().toISOString().split('T')[0];
    const dailyDateInput = document.getElementById('daily-date');
    if (dailyDateInput) {
        dailyDateInput.value = today;
    }
}

// Authentication functions
function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    // Simple validation (in real app, this would be server-side)
    if (email && password) {
        currentUser = { email, id: generateId() };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        loadUserProfile();
    } else {
        showError('Please fill in all fields');
    }
}

function handleSignup(e) {
    e.preventDefault();
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    if (password.length < 6) {
        showError('Password must be at least 6 characters');
        return;
    }
    
    if (email && password) {
        currentUser = { email, id: generateId() };
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        showOnboardingContainer();
    } else {
        showError('Please fill in all fields');
    }
}

function toggleAuthForm(form) {
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    if (form === 'signup') {
        loginForm.classList.add('hidden');
        signupForm.classList.remove('hidden');
    } else {
        signupForm.classList.add('hidden');
        loginForm.classList.remove('hidden');
    }
}

function togglePasswordVisibility(e) {
    const input = e.target.closest('.input-group').querySelector('input');
    const icon = e.target.closest('button').querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-off';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('userProfile');
    localStorage.removeItem('periodLogs');
    localStorage.removeItem('dailyLogs');
    currentUser = null;
    userProfile = null;
    periodLogs = [];
    dailyLogs = [];
    showAuthContainer();
}

// Profile and data loading
function loadUserProfile() {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
        userProfile = JSON.parse(savedProfile);
        loadUserData();
        showAppContainer();
    } else {
        showOnboardingContainer();
    }
}

function loadUserData() {
    // Load period logs
    const savedPeriodLogs = localStorage.getItem('periodLogs');
    if (savedPeriodLogs) {
        periodLogs = JSON.parse(savedPeriodLogs).map(log => ({
            ...log,
            startDate: new Date(log.startDate),
            endDate: log.endDate ? new Date(log.endDate) : null,
            createdAt: new Date(log.createdAt)
        }));
    }
    
    // Load daily logs
    const savedDailyLogs = localStorage.getItem('dailyLogs');
    if (savedDailyLogs) {
        dailyLogs = JSON.parse(savedDailyLogs).map(log => ({
            ...log,
            date: new Date(log.date)
        }));
    }
    
    updateDashboard();
}

// Container visibility functions
function showAuthContainer() {
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('onboarding-container').classList.add('hidden');
    document.getElementById('app-container').classList.add('hidden');
}

function showOnboardingContainer() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('onboarding-container').classList.remove('hidden');
    document.getElementById('app-container').classList.add('hidden');
    updateOnboardingProgress();
}

function showAppContainer() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('onboarding-container').classList.add('hidden');
    document.getElementById('app-container').classList.remove('hidden');
    
    // Show daily tip if it's a new day
    showDailyTipIfNeeded();
}

// Onboarding functions
function nextStep() {
    if (validateCurrentStep()) {
        if (currentStep < 4) {
            document.getElementById(`step-${currentStep}`).classList.remove('active');
            currentStep++;
            document.getElementById(`step-${currentStep}`).classList.add('active');
            updateOnboardingProgress();
            updateOnboardingButtons();
        }
    }
}

function prevStep() {
    if (currentStep > 1) {
        document.getElementById(`step-${currentStep}`).classList.remove('active');
        currentStep--;
        document.getElementById(`step-${currentStep}`).classList.add('active');
        updateOnboardingProgress();
        updateOnboardingButtons();
    }
}

function validateCurrentStep() {
    switch (currentStep) {
        case 1:
            const name = document.getElementById('user-name').value;
            const age = document.getElementById('user-age').value;
            if (!name || !age) {
                showError('Please fill in all required fields');
                return false;
            }
            if (age < 10 || age > 60) {
                showError('Please enter a valid age between 10 and 60');
                return false;
            }
            return true;
        case 2:
            const weight = document.getElementById('user-weight').value;
            const height = document.getElementById('user-height').value;
            if (!weight || !height) {
                showError('Please fill in all required fields');
                return false;
            }
            if (weight < 30 || weight > 200) {
                showError('Please enter a valid weight');
                return false;
            }
            if (height < 120 || height > 220) {
                showError('Please enter a valid height');
                return false;
            }
            return true;
        case 3:
            const cycleLength = document.getElementById('cycle-length').value;
            if (!cycleLength) {
                showError('Please enter your typical cycle length');
                return false;
            }
            if (cycleLength < 21 || cycleLength > 35) {
                showError('Cycle length must be between 21 and 35 days');
                return false;
            }
            return true;
        default:
            return true;
    }
}

function updateOnboardingProgress() {
    const progress = (currentStep / 4) * 100;
    document.getElementById('progress-fill').style.width = `${progress}%`;
    document.getElementById('progress-text').textContent = `Step ${currentStep} of 4`;
}

function updateOnboardingButtons() {
    const prevBtn = document.getElementById('prev-step');
    const nextBtn = document.getElementById('next-step');
    const completeBtn = document.getElementById('complete-onboarding');
    
    prevBtn.disabled = currentStep === 1;
    
    if (currentStep === 4) {
        nextBtn.classList.add('hidden');
        completeBtn.classList.remove('hidden');
    } else {
        nextBtn.classList.remove('hidden');
        completeBtn.classList.add('hidden');
    }
}

function handleHealthConditionChange(e) {
    const checkbox = e.target;
    const value = checkbox.value;
    
    if (value === 'None') {
        // If "None" is selected, uncheck all others
        if (checkbox.checked) {
            document.querySelectorAll('#step-4 input[type="checkbox"]').forEach(cb => {
                if (cb.value !== 'None') {
                    cb.checked = false;
                }
            });
        }
    } else {
        // If any other condition is selected, uncheck "None"
        if (checkbox.checked) {
            const noneCheckbox = document.querySelector('#step-4 input[value="None"]');
            if (noneCheckbox) {
                noneCheckbox.checked = false;
            }
        }
    }
}

function completeOnboarding() {
    if (validateCurrentStep()) {
        // Collect all onboarding data
        const name = document.getElementById('user-name').value;
        const age = parseInt(document.getElementById('user-age').value);
        const weight = parseFloat(document.getElementById('user-weight').value);
        const height = parseInt(document.getElementById('user-height').value);
        const cycleLength = parseInt(document.getElementById('cycle-length').value);
        
        const healthConditions = [];
        document.querySelectorAll('#step-4 input[type="checkbox"]:checked').forEach(cb => {
            healthConditions.push(cb.value);
        });
        
        userProfile = {
            name,
            age,
            weight,
            height,
            typicalCycleLength: cycleLength,
            healthConditions: healthConditions.length > 0 ? healthConditions : ['None'],
            createdAt: new Date(),
            updatedAt: new Date()
        };
        
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        showSuccess('Profile created successfully!');
        
        setTimeout(() => {
            showAppContainer();
            updateDashboard();
        }, 1500);
    }
}

// Dashboard functions
function updateDashboard() {
    updateGreeting();
    updateCycleInfo();
    updateCalendar();
    updateWellnessRecommendations();
}

function updateGreeting() {
    const hour = new Date().getHours();
    const name = userProfile?.name?.split(' ')[0] || 'there';
    let greeting;
    
    if (hour < 12) greeting = `Good morning, ${name}! ☀️`;
    else if (hour < 17) greeting = `Good afternoon, ${name}! 🌤️`;
    else greeting = `Good evening, ${name}! 🌙`;
    
    document.getElementById('greeting').textContent = greeting;
    document.getElementById('user-email').textContent = currentUser.email;
}

function updateCycleInfo() {
    if (periodLogs.length === 0) {
        document.getElementById('quick-stats').classList.add('hidden');
        document.getElementById('no-data-message').classList.remove('hidden');
        document.getElementById('cycle-overview').classList.add('hidden');
        return;
    }
    
    const cycleInfo = calculateCycleInfo();
    if (!cycleInfo) return;
    
    document.getElementById('quick-stats').classList.remove('hidden');
    document.getElementById('no-data-message').classList.add('hidden');
    document.getElementById('cycle-overview').classList.remove('hidden');
    
    // Update quick stats
    document.getElementById('current-day').textContent = `Day ${cycleInfo.currentDay}`;
    document.getElementById('current-phase').textContent = cycleInfo.phase;
    document.getElementById('days-to-next').textContent = cycleInfo.daysUntilNext;
    
    // Update phase card styling
    const phaseCard = document.getElementById('phase-card');
    phaseCard.className = `stat-card phase-card ${cycleInfo.phase.toLowerCase()}`;
    
    // Update fertility status
    const fertilityStatus = getFertilityStatus(cycleInfo);
    document.getElementById('fertility-status').textContent = `${fertilityStatus.status.charAt(0).toUpperCase() + fertilityStatus.status.slice(1)} Fertility`;
    document.getElementById('fertility-message').textContent = fertilityStatus.message;
    
    const fertilityCard = document.getElementById('fertility-card');
    fertilityCard.className = `stat-card fertility-card ${fertilityStatus.status}`;
    
    // Update cycle overview
    updateCycleOverview(cycleInfo);
}

function updateCycleOverview(cycleInfo) {
    document.getElementById('cycle-day-badge').textContent = `Day ${cycleInfo.currentDay}`;
    document.getElementById('phase-title').textContent = `${cycleInfo.phase} Phase`;
    document.getElementById('phase-days-left').textContent = `${cycleInfo.daysUntilNext} days until next phase`;
    
    // Update progress bar
    const progress = getPhaseProgress(cycleInfo.currentDay, cycleInfo.phase);
    document.getElementById('phase-progress').style.width = `${Math.max(progress, 10)}%`;
    
    // Update cycle card styling
    const cycleCard = document.querySelector('.cycle-card');
    cycleCard.className = `cycle-card ${cycleInfo.phase.toLowerCase()}`;
    
    // Update timeline
    document.querySelectorAll('.timeline-phase').forEach(phase => {
        phase.classList.remove('active');
    });
    document.querySelector(`[data-phase="${cycleInfo.phase.toLowerCase()}"]`).classList.add('active');
    
    // Update predictions
    document.getElementById('next-period-date').textContent = formatDate(cycleInfo.nextPeriodDate);
    document.getElementById('fertile-window').textContent = 
        `${formatDate(cycleInfo.ovulationWindow.start)} - ${formatDate(cycleInfo.ovulationWindow.end)}`;
}

// Cycle calculation functions
function calculateCycleInfo() {
    if (periodLogs.length === 0) return null;
    
    const sortedLogs = [...periodLogs].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
    const lastPeriod = sortedLogs[0];
    const today = new Date();
    
    const daysSinceLastPeriod = Math.floor((today - lastPeriod.startDate) / (1000 * 60 * 60 * 24));
    const currentDay = (daysSinceLastPeriod % userProfile.typicalCycleLength) + 1;
    
    let phase, daysUntilNext;
    
    if (currentDay >= 1 && currentDay <= 5) {
        phase = 'Menstruation';
        daysUntilNext = 6 - currentDay;
    } else if (currentDay >= 6 && currentDay <= 13) {
        phase = 'Follicular';
        daysUntilNext = 14 - currentDay;
    } else if (currentDay >= 14 && currentDay <= 16) {
        phase = 'Ovulation';
        daysUntilNext = 17 - currentDay;
    } else {
        phase = 'Luteal';
        daysUntilNext = (userProfile.typicalCycleLength + 1) - currentDay;
    }
    
    const nextPeriodDate = new Date(lastPeriod.startDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + userProfile.typicalCycleLength);
    
    const ovulationStart = new Date(nextPeriodDate);
    ovulationStart.setDate(ovulationStart.getDate() - 16);
    
    const ovulationEnd = new Date(nextPeriodDate);
    ovulationEnd.setDate(ovulationEnd.getDate() - 12);
    
    return {
        currentDay,
        phase,
        daysUntilNext,
        nextPeriodDate,
        ovulationWindow: {
            start: ovulationStart,
            end: ovulationEnd
        },
        cycleLength: userProfile.typicalCycleLength
    };
}

function getPhaseProgress(currentDay, phase) {
    switch (phase) {
        case 'Menstruation':
            return Math.min(((currentDay - 1) / 4) * 100, 100);
        case 'Follicular':
            return Math.min(((currentDay - 6) / 7) * 100, 100);
        case 'Ovulation':
            return Math.min(((currentDay - 14) / 2) * 100, 100);
        case 'Luteal':
            return Math.min(((currentDay - 17) / 11) * 100, 100);
        default:
            return 0;
    }
}

function getFertilityStatus(cycleInfo) {
    const { phase, currentDay } = cycleInfo;
    
    if (phase === 'Ovulation') {
        return {
            status: 'high',
            message: 'Peak fertility window - highest chance of conception'
        };
    } else if (phase === 'Follicular' && currentDay >= 10) {
        return {
            status: 'medium',
            message: 'Approaching fertile window'
        };
    } else if (phase === 'Luteal' && currentDay <= 19) {
        return {
            status: 'medium',
            message: 'Post-ovulation - fertility declining'
        };
    } else {
        return {
            status: 'low',
            message: 'Low fertility period'
        };
    }
}

// Tab navigation
function switchTab(tabName) {
    // Update active tab button
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Update active tab pane
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    activeTab = tabName;
    
    // Update content based on tab
    if (tabName === 'calendar') {
        updateCalendar();
    } else if (tabName === 'wellness') {
        updateWellnessRecommendations();
    }
}

// Calendar functions
function updateCalendar() {
    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    document.getElementById('calendar-month').textContent = 
        `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
    
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const calendarDays = document.getElementById('calendar-days');
    calendarDays.innerHTML = '';
    
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const dayElement = createCalendarDay(date, firstDay.getMonth());
        calendarDays.appendChild(dayElement);
    }
}

function createCalendarDay(date, currentMonth) {
    const dayElement = document.createElement('div');
    dayElement.className = 'calendar-day';
    
    if (date.getMonth() !== currentMonth) {
        dayElement.classList.add('other-month');
    }
    
    if (isToday(date)) {
        dayElement.classList.add('today');
    }
    
    const periodLog = getPeriodLogForDate(date);
    if (periodLog) {
        dayElement.classList.add('period');
        
        const indicator = document.createElement('div');
        indicator.className = `day-indicator ${periodLog.flow}-flow`;
        dayElement.appendChild(indicator);
    }
    
    const dayNumber = document.createElement('div');
    dayNumber.className = 'day-number';
    dayNumber.textContent = date.getDate();
    dayElement.appendChild(dayNumber);
    
    if (periodLog) {
        const dayInfo = document.createElement('div');
        dayInfo.className = 'day-info';
        dayInfo.innerHTML = `
            <div>${periodLog.flow} flow</div>
            ${periodLog.mood ? `<div>${periodLog.mood}</div>` : ''}
        `;
        dayElement.appendChild(dayInfo);
    }
    
    return dayElement;
}

function changeMonth(direction) {
    currentDate.setMonth(currentDate.getMonth() + direction);
    updateCalendar();
}

function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function getPeriodLogForDate(date) {
    return periodLogs.find(log => {
        const startDate = log.startDate;
        const endDate = log.endDate || log.startDate;
        return date >= startDate && date <= endDate;
    });
}

// Form handling
function handlePeriodSubmit(e) {
    e.preventDefault();
    
    const startDate = new Date(document.getElementById('period-start-date').value);
    const endDateValue = document.getElementById('period-end-date').value;
    const endDate = endDateValue ? new Date(endDateValue) : null;
    const flow = document.querySelector('input[name="flow"]:checked').value;
    const mood = document.getElementById('period-mood').value;
    const notes = document.getElementById('period-notes').value;
    
    const symptoms = [];
    document.querySelectorAll('#symptoms-grid input[type="checkbox"]:checked').forEach(cb => {
        symptoms.push(cb.value);
    });
    
    const periodLog = {
        id: generateId(),
        userId: currentUser.id,
        startDate,
        endDate,
        flow,
        symptoms,
        mood,
        notes,
        createdAt: new Date()
    };
    
    periodLogs.push(periodLog);
    localStorage.setItem('periodLogs', JSON.stringify(periodLogs));
    
    showSuccess('Period logged successfully!');
    document.getElementById('period-form').reset();
    
    updateDashboard();
    
    // Switch to overview tab
    setTimeout(() => {
        switchTab('overview');
    }, 1500);
}

function handleDailySubmit(e) {
    e.preventDefault();
    
    const date = new Date(document.getElementById('daily-date').value);
    const mood = document.querySelector('input[name="mood"]:checked').value;
    const waterIntake = parseInt(document.getElementById('water-range').value);
    const notes = document.getElementById('daily-notes').value;
    
    const symptoms = [];
    document.querySelectorAll('#daily-symptoms-grid input[type="checkbox"]:checked').forEach(cb => {
        symptoms.push(cb.value);
    });
    
    const dailyLog = {
        id: generateId(),
        userId: currentUser.id,
        date,
        mood,
        symptoms,
        waterIntake,
        notes
    };
    
    dailyLogs.push(dailyLog);
    localStorage.setItem('dailyLogs', JSON.stringify(dailyLogs));
    
    showSuccess('Daily log saved successfully!');
    document.getElementById('daily-form').reset();
    
    // Reset form to today's date and default water intake
    document.getElementById('daily-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('water-range').value = 8;
    updateWaterDisplay();
}

function updateWaterDisplay() {
    const waterRange = document.getElementById('water-range');
    const waterCount = document.getElementById('water-count');
    if (waterRange && waterCount) {
        waterCount.textContent = waterRange.value;
    }
}

// Wellness recommendations
function updateWellnessRecommendations() {
    if (!userProfile || periodLogs.length === 0) return;
    
    const cycleInfo = calculateCycleInfo();
    if (!cycleInfo) return;
    
    const recommendation = getPersonalizedRecommendation(
        cycleInfo.phase,
        userProfile.age,
        userProfile.weight,
        userProfile.height
    );
    
    if (!recommendation) return;
    
    // Update header info
    document.getElementById('wellness-phase').textContent = cycleInfo.phase;
    document.getElementById('wellness-day').textContent = `Day ${cycleInfo.currentDay}`;
    document.getElementById('wellness-age-group').textContent = getAgeGroup(userProfile.age);
    document.getElementById('wellness-age').textContent = `${userProfile.age} years old`;
    document.getElementById('wellness-weight-category').textContent = getWeightCategory(userProfile.weight, userProfile.height);
    
    // Update motivational quote
    document.getElementById('motivational-text').textContent = recommendation.motivationalQuote;
    
    // Update recommendation sections
    updateRecommendationSection('foods', recommendation.foods.recommended, 'recommended-foods');
    updateRecommendationSection('avoid', recommendation.foods.avoid, 'avoid-foods');
    updateRecommendationSection('precautions', recommendation.precautions, 'precautions-list');
    updateRecommendationSection('remedies', recommendation.homeRemedies, 'remedies-list');
    updateRecommendationSection('tips', recommendation.tips, 'tips-list');
    
    // Update item counts
    document.getElementById('foods-count').textContent = `${recommendation.foods.recommended.length} items`;
    document.getElementById('avoid-count').textContent = `${recommendation.foods.avoid.length} items`;
    document.getElementById('precautions-count').textContent = `${recommendation.precautions.length} items`;
    document.getElementById('remedies-count').textContent = `${recommendation.homeRemedies.length} items`;
    document.getElementById('tips-count').textContent = `${recommendation.tips.length} items`;
    
    // Show health conditions notice if applicable
    if (userProfile.healthConditions && userProfile.healthConditions.length > 0 && 
        !userProfile.healthConditions.includes('None')) {
        const notice = document.getElementById('health-conditions-notice');
        const conditionsList = document.getElementById('conditions-list');
        
        conditionsList.innerHTML = '';
        userProfile.healthConditions.forEach(condition => {
            const tag = document.createElement('span');
            tag.className = 'condition-tag';
            tag.textContent = condition;
            conditionsList.appendChild(tag);
        });
        
        notice.classList.remove('hidden');
    }
}

function updateRecommendationSection(sectionId, items, containerId) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    items.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = 'recommendation-item';
        itemElement.innerHTML = `
            <div class="recommendation-dot"></div>
            <p>${item}</p>
        `;
        container.appendChild(itemElement);
    });
}

function toggleSection(sectionId) {
    const header = document.querySelector(`[onclick="toggleSection('${sectionId}')"]`);
    const content = document.getElementById(`${sectionId}-content`);
    
    if (content.classList.contains('expanded')) {
        content.classList.remove('expanded');
        header.classList.remove('expanded');
    } else {
        content.classList.add('expanded');
        header.classList.add('expanded');
    }
}

function getAgeGroup(age) {
    if (age < 20) return 'Teen';
    if (age > 40) return 'Above 40';
    return 'Adult';
}

function getWeightCategory(weight, height) {
    const bmi = weight / ((height / 100) ** 2);
    if (bmi < 18.5) return 'Underweight';
    if (bmi > 25) return 'Overweight';
    return 'Normal';
}

// Daily tip modal
function showDailyTipIfNeeded() {
    const lastTipDate = localStorage.getItem('lastTipDate');
    const today = new Date().toDateString();
    
    if (lastTipDate !== today) {
        setTimeout(() => {
            showDailyTip();
            localStorage.setItem('lastTipDate', today);
        }, 3000);
    }
}

function showDailyTip() {
    const tip = getDailyTip();
    document.getElementById('daily-tip-text').textContent = tip;
    document.getElementById('daily-tip-modal').classList.remove('hidden');
}

function closeDailyTip() {
    document.getElementById('daily-tip-modal').classList.add('hidden');
}

// Utility functions
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
    });
}

function showSuccess(message) {
    const successElement = document.getElementById('success-message');
    const textElement = document.getElementById('success-text');
    textElement.textContent = message;
    successElement.classList.remove('hidden');
    
    setTimeout(() => {
        successElement.classList.add('hidden');
    }, 3000);
}

function showError(message) {
    const errorElement = document.getElementById('error-message');
    const textElement = document.getElementById('error-text');
    textElement.textContent = message;
    errorElement.classList.remove('hidden');
    
    setTimeout(() => {
        errorElement.classList.add('hidden');
    }, 3000);
}

// Make functions globally available
window.switchTab = switchTab;
window.toggleSection = toggleSection;
window.closeDailyTip = closeDailyTip;
