// ProConnect application JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the application
    initApp();
    
    // Set up navigation
    setupNavigation();
    
    // Initialize all screens
    initMatchingScreen();
    initSkillsScreen();
    initOpportunitiesScreen();
    initAnalyticsScreen();
    
    // Register service worker for PWA
    registerServiceWorker();
});

// App initialization
function initApp() {
    console.log('ProConnect app initialized');
    
    // Tailwind theme setup
    if (window.tailwind) {
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '#0078D4',
                        primaryLight: '#50A0E4',
                        primaryDark: '#106EBE',
                        secondary: '#2BC48A',
                        accent: '#FFB900',
                        danger: '#E74C3C',
                        success: '#27AE60',
                        lightBg: '#FFFFFF',
                        lightSecondary: '#F8F9FA',
                        lightTertiary: '#E9ECEF',
                        textDark: '#212529',
                        textMedium: '#495057',
                        textLight: '#6C757D'
                    }
                }
            }
        };
    }
}

// Setup navigation between screens
function setupNavigation() {
    // Bottom navigation buttons
    document.getElementById('navMatchBtn').addEventListener('click', function() {
        showScreen('matchingScreen');
        highlightNavButton(this);
    });
    
    document.getElementById('navSkillsBtn').addEventListener('click', function() {
        showScreen('skillsScreen');
        highlightNavButton(this);
    });
    
    document.getElementById('navOpportunitiesBtn').addEventListener('click', function() {
        showScreen('opportunitiesScreen');
        highlightNavButton(this);
    });
    
    document.getElementById('navAnalyticsBtn').addEventListener('click', function() {
        showScreen('analyticsScreen');
        highlightNavButton(this);
    });
}

// Function to show a specific screen and hide others
function showScreen(screenId) {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(screen => {
        screen.classList.add('hidden');
    });
    document.getElementById(screenId).classList.remove('hidden');
}

// Function to highlight active navigation button
function highlightNavButton(button) {
    const navButtons = document.querySelectorAll('nav button');
    navButtons.forEach(btn => {
        btn.classList.remove('text-primary');
        btn.classList.add('text-textLight');
    });
    button.classList.remove('text-textLight');
    button.classList.add('text-primary');
}

// Initialize matching screen functionality
function initMatchingScreen() {
    // Swipe functionality
    const skipBtn = document.getElementById('skipBtn');
    const connectBtn = document.getElementById('connectBtn');
    
    if (skipBtn) {
        skipBtn.addEventListener('click', function() {
            simulateSwipe('left');
        });
    }
    
    if (connectBtn) {
        connectBtn.addEventListener('click', function() {
            simulateSwipe('right');
            // In a real app, we'd show a match confirmation
            setTimeout(() => {
                showNotification("It's a match! Connect with Sarah Chen");
            }, 500);
        });
    }
}

// Simulate card swipe animation
function simulateSwipe(direction) {
    const card = document.getElementById('currentCard');
    if (!card) return;
    
    if (direction === 'left') {
        card.classList.add('swipe-left');
    } else {
        card.classList.add('swipe-right');
    }
    
    // Reset card after animation
    setTimeout(() => {
        card.classList.remove('swipe-left', 'swipe-right');
        // In a real app, we would load the next profile here
    }, 300);
}

// Initialize skills screen functionality
function initSkillsScreen() {
    // Sample skills data for demonstration
    const topSkills = [
        { 
            name: 'Project Management', 
            verified: true, 
            endorsements: 45, 
            percentage: 92,
            endorsers: [
                {image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'},
                {image: 'https://images.unsplash.com/photo-1550525811-e5869dd03032'},
                {image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e'}
            ],
            endorsersText: 'Endorsed by David, Emma, John & 42 others'
        },
        { 
            name: 'Product Strategy', 
            verified: true, 
            endorsements: 38, 
            percentage: 85,
            endorsers: [
                {image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2'},
                {image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330'}
            ],
            endorsersText: 'Endorsed by Sarah, Jessica & 36 others'
        },
        { 
            name: 'UI/UX Design', 
            verified: false, 
            endorsements: 19, 
            percentage: 65,
            endorsers: [
                {image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956'}
            ],
            endorsersText: 'Endorsed by Aisha & 18 others'
        }
    ];
    
    const additionalSkills = [
        { name: 'Business Strategy', endorsements: 12 },
        { name: 'Data Analysis', endorsements: 9 },
        { name: 'Leadership', endorsements: 16 },
        { name: 'Public Speaking', endorsements: 7 },
        { name: 'Negotiation', endorsements: 11 },
        { name: 'Team Building', endorsements: 14 }
    ];
    
    // Populate top skills
    const topSkillsList = document.getElementById('topSkillsList');
    if (topSkillsList) {
        topSkillsList.innerHTML = topSkills.map(skill => `
            <div class="bg-lightSecondary p-3 rounded-lg shadow-sm">
                <div class="flex justify-between items-start">
                    <div>
                        <div class="flex items-center">
                            <h4 class="font-medium">${skill.name}</h4>
                            ${skill.verified ? 
                                `<span class="ml-2 bg-success/10 text-success text-xs px-2 py-0.5 rounded-full flex items-center">
                                    <i class="fas fa-check-circle mr-1"></i>Verified
                                </span>` : 
                                `<span class="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full flex items-center">
                                    <i class="fas fa-certificate mr-1"></i>Verify
                                </span>`
                            }
                        </div>
                        <div class="flex items-center mt-1">
                            <div class="w-full max-w-[150px] bg-lightTertiary rounded-full h-1.5 mr-2">
                                <div class="bg-primary h-1.5 rounded-full" style="width: ${skill.percentage}%"></div>
                            </div>
                            <span class="text-xs text-textMedium">${skill.endorsements} endorsements</span>
                        </div>
                    </div>
                    <button class="text-primary text-sm font-medium">Endorse</button>
                </div>
                <div class="flex mt-2 overflow-hidden">
                    <div class="flex -space-x-2 mr-2">
                        ${skill.endorsers.map((endorser, i) => 
                            `<img src="${endorser.image}" alt="Person who endorsed" class="w-6 h-6 rounded-full border border-white">`
                        ).join('')}
                    </div>
                    <span class="text-xs text-textMedium">${skill.endorsersText}</span>
                </div>
            </div>
        `).join('');
    }
    
    // Populate additional skills
    const additionalSkillsList = document.getElementById('additionalSkillsList');
    if (additionalSkillsList) {
        additionalSkillsList.innerHTML = additionalSkills.map(skill => `
            <div class="flex items-center justify-between">
                <span class="text-sm">${skill.name}</span>
                <span class="text-xs text-textMedium">${skill.endorsements}</span>
            </div>
        `).join('');
    }
    
    // Add skill button functionality
    const addSkillBtn = document.getElementById('addSkillBtn');
    if (addSkillBtn) {
        addSkillBtn.addEventListener('click', function() {
            showNotification("Skill addition feature coming soon");
        });
    }
}

// Initialize opportunities screen functionality
function initOpportunitiesScreen() {
    // Sample opportunities data
    const opportunities = [
        {
            featured: true,
            title: 'Healthcare AI Startup',
            postedBy: 'Sarah Chen',
            role: 'Technical Co-founder',
            profileImg: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2',
            matchPercentage: 95,
            description: 'Seeking a technical co-founder with experience in AI/ML for a healthcare startup focused on personalized care plans for chronic conditions.',
            tags: ['AI/ML', 'Healthcare', 'Co-founder', 'Equity'],
            daysAgo: 2
        },
        {
            featured: false,
            title: 'E-commerce Platform Redesign',
            postedBy: 'David Wong',
            role: 'UX Project',
            profileImg: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7',
            matchPercentage: 82,
            description: 'Looking for UX designer to help with e-commerce platform redesign. 3-month contract with possibility of extension.',
            tags: ['UX Design', 'E-commerce', 'Contract'],
            daysAgo: 5
        },
        {
            featured: false,
            title: 'FinTech Joint Venture',
            postedBy: 'Michael Lin',
            role: 'Partnership',
            profileImg: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
            matchPercentage: 78,
            description: 'Established fintech company seeking partnership to expand into Asian markets. Looking for local expertise and connections.',
            tags: ['FinTech', 'Partnership', 'International'],
            daysAgo: 7
        },
        {
            featured: false,
            title: 'Director of Product Marketing',
            postedBy: 'James Wilson',
            role: 'Job Opening',
            profileImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
            matchPercentage: 75,
            description: 'Growing SaaS company seeking Director of Product Marketing to lead go-to-market strategy for new enterprise solutions.',
            tags: ['Marketing', 'SaaS', 'Full-time'],
            daysAgo: 3
        }
    ];
    
    // Populate opportunities list
    const opportunitiesList = document.getElementById('opportunitiesList');
    if (opportunitiesList) {
        opportunitiesList.innerHTML = opportunities.map(opportunity => `
            <div class="${opportunity.featured ? 
                'bg-primary/5 border border-primary/20' : 
                'bg-lightSecondary'} rounded-lg p-4 shadow-sm relative overflow-hidden">
                ${opportunity.featured ? 
                    `<div class="absolute top-0 right-0">
                        <div class="bg-primary text-white text-xs px-2 py-1 transform rotate-45 translate-x-[18px] translate-y-[-5px] w-32 text-center">
                            Top Match
                        </div>
                    </div>` : ''
                }
                <div class="flex items-start mb-2">
                    <img src="${opportunity.profileImg}" class="w-10 h-10 rounded-full mr-3" alt="Profile photo">
                    <div>
                        <h3 class="font-bold">${opportunity.title}</h3>
                        <p class="text-sm text-textMedium">Posted by ${opportunity.postedBy} • ${opportunity.role}</p>
                    </div>
                    <div class="ml-auto">
                        <span class="${opportunity.matchPercentage >= 90 ? 
                            'bg-success/10 text-success' : 
                            'bg-primary/10 text-primary'} px-2 py-0.5 rounded-full text-xs">${opportunity.matchPercentage}% Match</span>
                    </div>
                </div>
                <p class="text-sm text-textMedium mb-3">${opportunity.description}</p>
                <div class="flex flex-wrap gap-1 mb-3">
                    ${opportunity.tags.map(tag => 
                        `<span class="${opportunity.featured ? 
                            'bg-primary/10 text-primary' : 
                            'bg-lightTertiary text-textDark'} px-2 py-0.5 rounded-full text-xs">${tag}</span>`
                    ).join('')}
                </div>
                <div class="flex justify-between items-center">
                    <div class="text-xs text-textMedium">
                        <i class="far fa-clock mr-1"></i>Posted ${opportunity.daysAgo} day${opportunity.daysAgo !== 1 ? 's' : ''} ago
                    </div>
                    <button class="bg-primary text-white px-4 py-1 rounded-lg text-sm font-medium">
                        Connect
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners to connect buttons
        const connectButtons = opportunitiesList.querySelectorAll('button');
        connectButtons.forEach(button => {
            button.addEventListener('click', function() {
                showNotification("Connection request sent");
            });
        });
    }
    
    // Filter buttons functionality
    const filterButtons = document.querySelectorAll('#opportunitiesScreen .flex.space-x-2.overflow-x-auto button');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Reset all buttons
            filterButtons.forEach(btn => {
                btn.classList.remove('bg-primary', 'text-white');
                btn.classList.add('bg-lightTertiary', 'text-textDark');
            });
            
            // Highlight clicked button
            this.classList.remove('bg-lightTertiary', 'text-textDark');
            this.classList.add('bg-primary', 'text-white');
            
            // In a real app, we would filter the opportunities here
            showNotification(`Filtered by: ${this.textContent.trim()}`);
        });
    });
    
    // Create opportunity button functionality
    const createOpportunityBtn = document.getElementById('createOpportunity');
    if (createOpportunityBtn) {
        createOpportunityBtn.addEventListener('click', function() {
            showNotification("Create opportunity feature coming soon");
        });
    }
}

// Initialize analytics screen functionality
function initAnalyticsScreen() {
    // Create charts
    createNetworkGrowthChart();
    createIndustryDistributionChart();
    
    // Populate industry breakdown
    populateIndustryBreakdown();
    
    // Download report button functionality
    const downloadReportBtn = document.getElementById('downloadReportBtn');
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', function() {
            showNotification("Report download feature coming soon");
        });
    }
}

// Create Network Growth Chart
function createNetworkGrowthChart() {
    const networkGrowthCtx = document.getElementById('networkGrowthChart')?.getContext('2d');
    if (networkGrowthCtx) {
        new Chart(networkGrowthCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Connections',
                    data: [65, 78, 90, 105, 125, 142],
                    borderColor: '#0078D4',
                    backgroundColor: 'rgba(0, 120, 212, 0.1)',
                    tension: 0.3,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: false
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
}

// Create Industry Distribution Chart
function createIndustryDistributionChart() {
    const industryDistributionCtx = document.getElementById('industryDistributionChart')?.getContext('2d');
    if (industryDistributionCtx) {
        new Chart(industryDistributionCtx, {
            type: 'doughnut',
            data: {
                labels: ['Technology', 'Finance', 'Healthcare', 'Marketing', 'Other'],
                datasets: [{
                    data: [45, 22, 15, 12, 6],
                    backgroundColor: [
                        '#0078D4', // primary
                        '#2BC48A', // secondary
                        '#FFB900', // accent
                        '#9333EA', // purple
                        '#6B7280'  // gray
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
    }
}

// Populate industry breakdown section
function populateIndustryBreakdown() {
    const industryData = [
        { name: 'Technology', percentage: 45, color: '#0078D4' },
        { name: 'Finance', percentage: 22, color: '#2BC48A' },
        { name: 'Healthcare', percentage: 15, color: '#FFB900' },
        { name: 'Marketing', percentage: 12, color: '#9333EA' },
        { name: 'Other', percentage: 6, color: '#6B7280' }
    ];
    
    const industryBreakdown = document.getElementById('industryBreakdown');
    if (industryBreakdown) {
        industryBreakdown.innerHTML = industryData.map(industry => `
            <div class="mb-3">
                <div class="flex justify-between mb-1">
                    <span class="text-xs">${industry.name}</span>
                    <span class="text-xs">${industry.percentage}%</span>
                </div>
                <div class="w-full bg-lightTertiary rounded-full h-1.5">
                    <div class="h-1.5 rounded-full" style="width: ${industry.percentage}%; background-color: ${industry.color}"></div>
                </div>
            </div>
        `).join('');
    }
}

// Show notification
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'notification';
        document.body.appendChild(notification);
    }
    
    // Set message and show
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Register service worker for PWA functionality
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful');
                })
                .catch(error => {
                    console.log('ServiceWorker registration failed: ', error);
                });
        });
    }
}
