/**
 * ProConnect User Search Utility (Enhanced Version)
 * This utility provides improved functions to find and search for registered users across the app
 */

// Main namespace to avoid global conflicts
const ProConnectUsers = {
    /**
     * Get all registered users from various storage locations
     * @returns {Array} Array of user objects
     */
    getAllUsers: function() {
        console.log("Searching for all users in localStorage...");
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const currentUserId = currentUser ? currentUser.id : null;
        let allUsers = [];
        
        // Debug: Log current localStorage items
        console.log("Total localStorage items:", localStorage.length);
        
        // Scan all localStorage items to find user objects with improved detection
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            // Skip obvious non-user items
            if (key === 'currentUser' || 
                key === 'loglevel:webpack-dev-server' ||
                key.startsWith('proconnect_') || 
                key.includes('Conversations') ||
                key === 'sampleUsers') {
                continue;
            }
            
            try {
                const value = JSON.parse(localStorage.getItem(key));
                
                // Skip if not an object or null
                if (!value || typeof value !== 'object') continue;
                
                // Debug the current item
                console.log("Examining localStorage item:", key, "Value type:", typeof value);
                
                // Improved user object detection with multiple patterns
                const isUserObject = 
                    // Pattern 1: Has fullName or name property
                    (value.fullName || value.name) ||
                    // Pattern 2: Has email and id properties
                    (value.email && value.id) ||
                    // Pattern 3: Has username property
                    value.username ||
                    // Pattern 4: Has specific user-related properties
                    (value.currentRole || value.company || value.skills || value.bio || value.about);
                
                if (isUserObject) {
                    console.log("Found user object:", key, value);
                    
                    // Normalize user object format
                    const user = this.normalizeUserObject(value);
                    
                    // Ensure it has an ID (create one if missing)
                    if (!user.id) {
                        console.log("User missing ID, creating one based on key:", key);
                        user.id = key;
                    }
                    
                    // Don't include current user
                    if (currentUserId && user.id === currentUserId) {
                        console.log("Skipping current user:", user.fullName || user.name);
                        continue;
                    }
                    
                    // Add to users list
                    allUsers.push(user);
                    console.log("Added user to results:", user.fullName);
                }
            } catch (e) {
                // Not a valid JSON or user object, skip
                console.log("Error processing item:", key, e);
                continue;
            }
        }
        
        // Also get users from sampleUsers if available
        try {
            const sampleUsers = JSON.parse(localStorage.getItem('sampleUsers')) || [];
            console.log("Found sample users:", sampleUsers.length);
            sampleUsers.forEach(user => {
                // Check if user already exists in allUsers
                if (!allUsers.some(u => u.id == user.id) && (user.id !== currentUserId)) {
                    allUsers.push(this.normalizeUserObject(user));
                    console.log("Added sample user:", user.fullName || user.name);
                }
            });
        } catch (e) {
            console.log("Error loading sample users:", e);
        }
        
        // Also ensure current user's connections are included
        if (currentUser && currentUser.connections) {
            console.log("Adding connections from current user:", currentUser.connections.length);
            currentUser.connections.forEach(conn => {
                if (!allUsers.some(u => u.id == conn.id)) {
                    // Create a minimal user object if not found elsewhere
                    const connUser = {
                        id: conn.id,
                        fullName: conn.name || "Unknown User",
                        profileImage: conn.profileImage || this.getDefaultProfileImage(),
                        currentRole: conn.role || "",
                        company: conn.company || "",
                        industry: "Unknown",
                        isConnection: true
                    };
                    allUsers.push(connUser);
                    console.log("Added connection:", connUser.fullName);
                }
            });
        }
        
        console.log("Total users found:", allUsers.length);
        return allUsers;
    },
    
    /**
     * Normalize user objects to have consistent properties
     * @param {Object} user - User object to normalize
     * @returns {Object} Normalized user object
     */
    normalizeUserObject: function(user) {
        // Get best name option
        const fullName = user.fullName || user.name || user.username || "Unknown User";
        
        return {
            id: user.id || ("user_" + Date.now()),
            fullName: fullName,
            profileImage: user.profileImage || user.image || user.avatar || this.getDefaultProfileImage(),
            currentRole: user.currentRole || user.title || user.role || user.jobTitle || "",
            company: user.company || user.organization || user.companyName || "",
            industry: user.industry || "",
            location: user.location || "",
            skills: user.skills || [],
            about: user.about || user.bio || user.description || "",
            lookingFor: user.lookingFor || [],
            match: user.match || Math.floor(Math.random() * 50) + 50, // Random match score between 50-99
            email: user.email || ""
        };
    },
    
    /**
     * Get default profile image if user doesn't have one
     * @returns {String} URL to default profile image
     */
    getDefaultProfileImage: function() {
        const defaultImages = [
            "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80",
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80",
            "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80",
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200&q=80"
        ];
        return defaultImages[Math.floor(Math.random() * defaultImages.length)];
    },
    
    /**
     * Search for users by various fields
     * @param {String} query - Search query
     * @param {String} filter - Filter type (all, skills, company, industry, location)
     * @returns {Array} Filtered array of users
     */
    searchUsers: function(query, filter = 'all') {
        console.log("Searching users with query:", query, "filter:", filter);
        
        // Get all users
        const allUsers = this.getAllUsers();
        
        // If query is empty, return all users
        if (!query || query.trim() === '') {
            console.log("Empty query, returning all users:", allUsers.length);
            return allUsers;
        }
        
        const searchTerm = query.toLowerCase().trim();
        
        // Filter based on the selected filter type
        const results = allUsers.filter(user => {
            if (filter === 'all') {
                return this.matchesAnyField(user, searchTerm);
            } else if (filter === 'skills') {
                return this.matchesSkills(user, searchTerm);
            } else if (filter === 'company') {
                return this.matchesCompany(user, searchTerm);
            } else if (filter === 'industry') {
                return this.matchesIndustry(user, searchTerm);
            } else if (filter === 'location') {
                return this.matchesLocation(user, searchTerm);
            }
            return false;
        });
        
        console.log("Search results:", results.length);
        return results;
    },
    
    /**
     * Check if user matches search term in any field
     * @param {Object} user - User object
     * @param {String} term - Search term
     * @returns {Boolean} True if matches
     */
    matchesAnyField: function(user, term) {
        return (user.fullName && user.fullName.toLowerCase().includes(term)) ||
               (user.email && user.email.toLowerCase().includes(term)) ||
               (user.currentRole && user.currentRole.toLowerCase().includes(term)) ||
               (user.company && user.company.toLowerCase().includes(term)) ||
               (user.industry && user.industry.toLowerCase().includes(term)) ||
               (user.location && user.location.toLowerCase().includes(term)) ||
               (user.about && user.about.toLowerCase().includes(term)) ||
               this.matchesSkills(user, term);
    },
    
    /**
     * Check if user's skills match search term
     * @param {Object} user - User object
     * @param {String} term - Search term
     * @returns {Boolean} True if matches
     */
    matchesSkills: function(user, term) {
        let skills = [];
        
        if (typeof user.skills === 'string') {
            skills = user.skills.split(',').map(s => s.trim());
        } else if (Array.isArray(user.skills)) {
            skills = user.skills;
        }
        
        return skills.some(skill => skill.toLowerCase().includes(term));
    },
    
    /**
     * Check if user's company matches search term
     * @param {Object} user - User object
     * @param {String} term - Search term
     * @returns {Boolean} True if matches
     */
    matchesCompany: function(user, term) {
        return user.company && user.company.toLowerCase().includes(term);
    },
    
    /**
     * Check if user's industry matches search term
     * @param {Object} user - User object
     * @param {String} term - Search term
     * @returns {Boolean} True if matches
     */
    matchesIndustry: function(user, term) {
        return user.industry && user.industry.toLowerCase().includes(term);
    },
    
    /**
     * Check if user's location matches search term
     * @param {Object} user - User object
     * @param {String} term - Search term
     * @returns {Boolean} True if matches
     */
    matchesLocation: function(user, term) {
        return user.location && user.location.toLowerCase().includes(term);
    },
    
    /**
     * Get user by ID
     * @param {String|Number} userId - User ID
     * @returns {Object|null} User object or null if not found
     */
    getUserById: function(userId) {
        const allUsers = this.getAllUsers();
        return allUsers.find(user => user.id == userId) || null;
    },
    
    /**
     * Calculate match percentage between two users
     * @param {Object} user1 - First user
     * @param {Object} user2 - Second user
     * @returns {Number} Match percentage (0-100)
     */
    calculateMatchPercentage: function(user1, user2) {
        // Start with a base match percentage
        let matchScore = 50;
        
        // Extract skills arrays
        let skills1 = [];
        let skills2 = [];
        
        if (typeof user1.skills === 'string') {
            skills1 = user1.skills.split(',').map(s => s.trim().toLowerCase());
        } else if (Array.isArray(user1.skills)) {
            skills1 = user1.skills.map(s => s.toLowerCase());
        }
        
        if (typeof user2.skills === 'string') {
            skills2 = user2.skills.split(',').map(s => s.trim().toLowerCase());
        } else if (Array.isArray(user2.skills)) {
            skills2 = user2.skills.map(s => s.toLowerCase());
        }
        
        // Count matching skills
        const matchingSkills = skills1.filter(skill => skills2.includes(skill)).length;
        
        // Add points for matching skills
        if (skills1.length > 0 && skills2.length > 0) {
            const skillRatio = matchingSkills / Math.max(skills1.length, skills2.length);
            matchScore += skillRatio * 25; // Up to 25 points for skills
        }
        
        // Add points for same industry
        if (user1.industry && user2.industry && user1.industry.toLowerCase() === user2.industry.toLowerCase()) {
            matchScore += 10;
        }
        
        // Add points for same location
        if (user1.location && user2.location && user1.location.toLowerCase() === user2.location.toLowerCase()) {
            matchScore += 5;
        }
        
        // Add random variability (±5%)
        matchScore += (Math.random() * 10 - 5);
        
        // Ensure score is between 0-100
        return Math.min(Math.max(Math.round(matchScore), 0), 100);
    }
};

// Debug function to show all users in console
function debugShowAllUsers() {
    const users = ProConnectUsers.getAllUsers();
    console.table(users.map(u => ({
        id: u.id,
        name: u.fullName,
        role: u.currentRole,
        company: u.company
    })));
    
    return `Found ${users.length} users`;
}

// Add a global debug function
window.debugUsers = debugShowAllUsers;
