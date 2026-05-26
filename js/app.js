// ==========================================
// SPLITWISE+ - MAIN APPLICATION JAVASCRIPT
// Premium Expense Management App
// ==========================================

// ==========================================
// THEME MANAGEMENT
// ==========================================

let isDarkMode = false;

// Initialize theme based on system preference or localStorage
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        isDarkMode = savedTheme === 'dark';
    } else {
        isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    applyTheme();
}

function toggleTheme() {
    isDarkMode = !isDarkMode;
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    applyTheme();
}

function applyTheme() {
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
}

// ==========================================
// SCREEN NAVIGATION
// ==========================================

function showScreen(screenId) {
    // Hide all screens
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.remove('active');
    });

    // Show target screen
    const targetScreen = document.getElementById(screenId);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }

    // Update navigation
    updateNavigation(screenId);

    // Scroll to top
    window.scrollTo(0, 0);
}

function updateNavigation(screenId) {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));

    // Map screens to nav items
    const navMap = {
        'home-screen': 0,
        'friends-screen': 1,
        'groups-screen': 2,
        'add-expense-screen': 3,
        'analytics-screen': 4,
        'profile-screen': 5
    };

    const navIndex = navMap[screenId];
    if (navIndex !== undefined) {
        navItems[navIndex].classList.add('active');
    }
}

// ==========================================
// SPLASH SCREEN
// ==========================================

function showSplashScreen() {
    const splashScreen = document.getElementById('splash-screen');
    const homeScreen = document.getElementById('home-screen');

    // Show splash for 3 seconds, then transition to home
    setTimeout(() => {
        splashScreen.classList.remove('active');
        homeScreen.classList.add('active');
        updateNavigation('home-screen');
    }, 3000);
}

// ==========================================
// FORM HANDLING
// ==========================================

// Handle login form
document.addEventListener('DOMContentLoaded', function () {
    initializeTheme();
    showSplashScreen();

    // Login form
    const loginForm = document.querySelector('#login-screen .auth-form');
    if (loginForm) {
        loginForm.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log('Login submitted');
            showScreen('home-screen');
        });
    }

    // Signup form
    const signupForm = document.querySelector('#signup-screen .auth-form');
    if (signupForm) {
        signupForm.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log('Signup submitted');
            showScreen('home-screen');
        });
    }

    // Add expense form
    const expenseForm = document.querySelector('.expense-form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', function (e) {
            e.preventDefault();
            console.log('Expense added');
            showNotification('Expense added successfully!');
            setTimeout(() => showScreen('home-screen'), 500);
        });
    }

    // Split type tabs
    const splitTabs = document.querySelectorAll('.split-tab');
    splitTabs.forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            splitTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            updateSplitDetails();
        });
    });

    // Receipt upload
    const uploadArea = document.querySelector('.upload-area');
    if (uploadArea) {
        uploadArea.addEventListener('click', () => {
            document.getElementById('receipt-input').click();
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--color-primary)';
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.style.borderColor = 'var(--color-border)';
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            console.log('File dropped');
            uploadArea.style.borderColor = 'var(--color-border)';
        });
    }

    // Payment method selection
    const paymentMethods = document.querySelectorAll('.payment-method input');
    paymentMethods.forEach(method => {
        method.addEventListener('change', function () {
            const qrSection = document.getElementById('qr-section');
            if (this.value === 'qr') {
                qrSection.style.display = 'block';
            } else {
                qrSection.style.display = 'none';
            }
        });
    });

    // Chat sending
    const sendBtn = document.querySelector('.btn-send');
    if (sendBtn) {
        sendBtn.addEventListener('click', handleChatSend);
    }

    // Voice button
    const voiceBtn = document.querySelector('.btn-voice');
    if (voiceBtn) {
        voiceBtn.addEventListener('click', function () {
            showScreen('voice-input-screen');
            startVoiceRecognition();
        });
    }

    // Period selector for analytics
    const periodBtns = document.querySelectorAll('.period-btn');
    periodBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            periodBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            console.log('Period changed to:', this.textContent);
        });
    });

    // Initialize charts
    initializeCharts();
});

// ==========================================
// SPLIT TYPE HANDLING
// ==========================================

function updateSplitDetails() {
    const activeTab = document.querySelector('.split-tab.active');
    if (!activeTab) return;

    const splitType = activeTab.dataset.split;
    const amount = parseFloat(document.getElementById('expense-amount').value) || 0;
    const splitList = document.querySelector('.split-list');

    // Get selected members
    const selectedMembers = Array.from(document.querySelectorAll('.checkbox-member input[type="checkbox"]:checked'))
        .map(cb => cb.parentElement.querySelector('.member-chip').textContent);

    if (selectedMembers.length === 0) return;

    const splitListHTML = [];

    switch (splitType) {
        case 'equal':
            const equalAmount = (amount / selectedMembers.length).toFixed(2);
            selectedMembers.forEach(member => {
                splitListHTML.push(`
                    <div class="split-item">
                        <span>${member}</span>
                        <span>₹${equalAmount}</span>
                    </div>
                `);
            });
            break;

        case 'exact':
        case 'percentage':
        case 'custom':
            selectedMembers.forEach(member => {
                splitListHTML.push(`
                    <div class="split-item">
                        <span>${member}</span>
                        <input type="number" placeholder="Enter amount" style="width: 80px;">
                    </div>
                `);
            });
            break;
    }

    if (splitList) {
        splitList.innerHTML = splitListHTML.join('');
    }
}

// ==========================================
// CHAT FUNCTIONALITY
// ==========================================

function handleChatSend() {
    const chatInput = document.querySelector('.chat-input');
    const message = chatInput.value.trim();

    if (!message) return;

    const chatMessages = document.querySelector('.chat-messages');

    // Add user message
    const userMessageDiv = document.createElement('div');
    userMessageDiv.className = 'chat-message user-message';
    userMessageDiv.innerHTML = `<div class="message-bubble"><p>${escapeHtml(message)}</p></div>`;
    chatMessages.appendChild(userMessageDiv);

    chatInput.value = '';

    // Simulate AI response
    setTimeout(() => {
        const aiMessageDiv = document.createElement('div');
        aiMessageDiv.className = 'chat-message ai-message';
        aiMessageDiv.innerHTML = `
            <div class="message-bubble">
                <p>Great! I've filled in the expense details based on what you said.</p>
                <div class="ai-parsed-expense" style="margin-top: 12px;">
                    <div class="parsed-item">
                        <span>Expense:</span>
                        <span>${extractCategory(message)}</span>
                    </div>
                    <div class="parsed-item">
                        <span>Amount:</span>
                        <span>₹${extractAmount(message)}</span>
                    </div>
                    <div class="parsed-item">
                        <span>Members:</span>
                        <span>${extractMembers(message)}</span>
                    </div>
                </div>
                <p style="margin-top: 12px; font-size: 14px;">Ready to save?</p>
            </div>
        `;
        chatMessages.appendChild(aiMessageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function extractAmount(message) {
    const match = message.match(/₹?(\d+(?:,?\d+)*)/);
    return match ? match[1] : '0';
}

function extractMembers(message) {
    const memberMap = {
        'harini': 'Harini',
        'savi': 'Savi',
        'priya': 'Priya',
        'rahul': 'Rahul'
    };

    let members = ['You'];
    for (const [key, value] of Object.entries(memberMap)) {
        if (message.toLowerCase().includes(key)) {
            members.push(value);
        }
    }

    return members.join(', ');
}

function extractCategory(message) {
    const categoryMap = {
        'dinner': 'Dinner',
        'lunch': 'Lunch',
        'breakfast': 'Breakfast',
        'movie': 'Movie',
        'coffee': 'Coffee',
        'shopping': 'Shopping',
        'travel': 'Travel',
        'hotel': 'Hotel'
    };

    for (const [key, value] of Object.entries(categoryMap)) {
        if (message.toLowerCase().includes(key)) {
            return value;
        }
    }

    return 'Expense';
}

// ==========================================
// VOICE INPUT FUNCTIONALITY
// ==========================================

function startVoiceRecognition() {
    console.log('Voice recognition started');
    // This would integrate with Web Speech API in production
}

// ==========================================
// NOTIFICATION SYSTEM
// ==========================================

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        z-index: 1000;
        animation: slideUp 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ==========================================
// CHARTS INITIALIZATION
// ==========================================

function initializeCharts() {
    // Category Chart
    const categoryChart = document.getElementById('category-chart');
    if (categoryChart) {
        const ctx = categoryChart.getContext('2d');
        drawPieChart(ctx, [3200, 2100, 1800, 1550], ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24']);
    }

    // Trend Chart
    const trendChart = document.getElementById('trend-chart');
    if (trendChart) {
        const ctx = trendChart.getContext('2d');
        drawLineChart(ctx);
    }
}

function drawPieChart(ctx, data, colors) {
    const total = data.reduce((a, b) => a + b, 0);
    let currentAngle = 0;

    data.forEach((value, index) => {
        const sliceAngle = (value / total) * Math.PI * 2;

        // Draw slice
        ctx.fillStyle = colors[index];
        ctx.beginPath();
        ctx.moveTo(100, 100);
        ctx.arc(100, 100, 80, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fill();

        currentAngle += sliceAngle;
    });
}

function drawLineChart(ctx) {
    const width = ctx.canvas.width;
    const height = ctx.canvas.height;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const values = [5000, 6200, 5800, 8650, 7200, 6500];

    // Draw axes
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(40, height - 40);
    ctx.lineTo(40, 20);
    ctx.stroke();

    // Draw line
    ctx.strokeStyle = '#7c3aed';
    ctx.lineWidth = 3;
    ctx.beginPath();

    const xSpacing = (width - 60) / (months.length - 1);
    const maxValue = Math.max(...values);
    const yScale = (height - 60) / maxValue;

    values.forEach((value, index) => {
        const x = 40 + index * xSpacing;
        const y = height - 40 - value * yScale;

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#7c3aed';
    values.forEach((value, index) => {
        const x = 40 + index * xSpacing;
        const y = height - 40 - value * yScale;

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
    });
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

// ==========================================
// ANIMATIONS
// ==========================================

// Add smooth scroll behavior
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
});

// ==========================================
// RESPONSIVE HANDLING
// ==========================================

let lastScrollY = 0;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Hide/show bottom nav based on scroll direction
    const bottomNav = document.querySelector('.bottom-nav');
    if (bottomNav) {
        if (scrollY > lastScrollY && scrollY > 100) {
            bottomNav.style.transform = 'translateY(100px)';
        } else {
            bottomNav.style.transform = 'translateY(0)';
        }
    }

    lastScrollY = scrollY;
});

// ==========================================
// LOCAL STORAGE MANAGEMENT
// ==========================================

function saveExpense(expense) {
    const expenses = JSON.parse(localStorage.getItem('expenses')) || [];
    expenses.push({
        ...expense,
        id: Date.now(),
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('expenses', JSON.stringify(expenses));
}

function getExpenses() {
    return JSON.parse(localStorage.getItem('expenses')) || [];
}

function saveFriends(friends) {
    localStorage.setItem('friends', JSON.stringify(friends));
}

function getFriends() {
    return JSON.parse(localStorage.getItem('friends')) || [];
}

// ==========================================
// DEBUG & LOGGING
// ==========================================

console.log('SplitWise+ App Initialized');
console.log('Version: 1.0.0');
console.log('Theme: ' + (isDarkMode ? 'Dark' : 'Light'));
