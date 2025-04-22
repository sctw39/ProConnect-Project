/**
 * ProConnect User Search Utility
 * This utility provides functions to find and search for registered users across the app
 */

// Main namespace to avoid global conflicts
const ProConnectUsers = {
    /**
     * Get all registered users from various storage locations
     * @returns {Array} Array of user objects
     */
    getAllUsers: function() {
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const currentUserId = currentUser ? currentUser.id : null;
        let allUsers = [];
        
        // Scan all localStorage items to find user objects
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            
            // Skip non-user items
            if (key === 'currentUser' || 
                key.startsWith('proconnect_') || 
                key.startsWith('swipe_') || 
                key.includes('Conversations')) {
                continue;
            }
            
            try {
                const value = JSON.parse(localStorage.getItem(key));
                
                // Check if this is a user object by looking for common properties
                if (value && (value.fullName || value.name) && value.id) {
                    // Normalize user object format
                    const user = this.normalizeUserObject(value);
                    
                    // Don't include current user
                    if (user.id !== currentUserId) {
                        allUsers.push(user);
                    }
                }
            } catch (e) {
                // Not a valid JSON or user object, skip
                continue;
            }
        }
        
        // Also get users from sampleUsers if available
        try {
            const sampleUsers = JSON.parse(localStorage.getItem('sampleUsers')) || [];
            sampleUsers.forEach(user => {
                // Check if user already exists in allUsers
                if (!allUsers.some(u => u.id == user.id) && user.id !== currentUserId) {
                    allUsers.push(this.normalizeUserObject(user));
                }
            });
        } catch (e) {
            console.log("Error loading sample users:", e);
        }
        
        // Also ensure current user's connections are included
        if (currentUser && currentUser.connections) {
            currentUser.connections.forEach(conn => {
                if (!allUsers.some(u => u.id == conn.id)) {
                    // Create a minimal user object if not found elsewhere
                    allUsers.push({
                        id: conn.id,
                        fullName: conn.name || "Unknown User",
                        profileImage: conn.profileImage || this.getDefaultProfileImage(),
                        currentRole: conn.role || "",
                        company: conn.company || "",
                        industry: "Unknown",
                        isConnection: true
                    });
                }
            });
        }
        
        return allUsers;
    },
    
    /**
     * Normalize user objects to have consistent properties
     * @param {Object} user - User object to normalize
     * @returns {Object} Normalized user object
     */
    normalizeUserObject: function(user) {
        return {
            id: user.id,
            fullName: user.fullName || user.name || "Unknown User",
            profileImage: user.profileImage || user.image || this.getDefaultProfileImage(),
            currentRole: user.currentRole || user.title || "",
            company: user.company || "",
            industry: user.industry || "Unknown",
            location: user.location || "",
            skills: user.skills || [],
            about: user.about || user.bio || "",
            lookingFor: user.lookingFor || [],
            match: user.match || Math.floor(Math.random() * 50) + 50 // Random match score between 50-99
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
        if (!query) return this.getAllUsers();
        
        const searchTerm = query.toLowerCase();
        const allUsers = this.getAllUsers();
        
        return allUsers.filter(user => {
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
    },
    
    /**
     * Check if user matches search term in any field
     * @param {Object} user - User object
     * @param {String} term - Search term
     * @returns {Boolean} True if matches
     */
    matchesAnyField: function(user, term) {
        return user.fullName.toLowerCase().includes(term) ||
               user.currentRole.toLowerCase().includes(term) ||
               user.company.toLowerCase().includes(term) ||
               user.industry.toLowerCase().includes(term) ||
               user.location.toLowerCase().includes(term) ||
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
        return user.company.toLowerCase().includes(term);
    },
    
    /**
     * Check if user's industry matches search term
     * @param {Object} user - User object
     * @param {String} term - Search term
     * @returns {Boolean} True if matches
     */
    matchesIndustry: function(user, term) {
        return user.industry.toLowerCase().includes(term);
    },
    
    /**
     * Check if user's location matches search term
     * @param {Object} user - User object
     * @param {String} term - Search term
     * @returns {Boolean} True if matches
     */
    matchesLocation: function(user, term) {
        return user.location.toLowerCase().includes(term);
    },
    
    /**
     * Register a new user
     * @param {Object} user - User object
     * @returns {Boolean} Success status
     */
    registerUser: function(user) {
        if (!user.id) {
            user.id = 'user_' + Date.now();
        }
        
        try {
            localStorage.setItem('user_' + user.id, JSON.stringify(user));
            return true;
        } catch (e) {
            console.error("Error registering user:", e);
            return false;
        }
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
