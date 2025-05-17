// ProConnect User Search - Production Version
const ProConnectUsers = {
  getAllUsers: function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const currentUserId = currentUser ? currentUser.id : null;
    let allUsers = [];
    
    // Find all users in localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      
      // Skip these known non-user keys
      if (key === 'currentUser' || 
          key.startsWith('proconnect_') || 
          key.includes('Conversations')) {
        continue;
      }
      
      try {
        const value = JSON.parse(localStorage.getItem(key));
        
        // Check if this is a user object by looking for common properties
        if (value && typeof value === 'object' && !Array.isArray(value) &&
            (value.fullName || value.name || value.email)) {
          
          // Don't include current user
          if (value.id !== currentUserId) {
            allUsers.push(this.normalizeUserObject(value));
          }
        }
      } catch (e) {
        // Not a valid JSON or user object, skip
        continue;
      }
    }
    
    return allUsers;
  },
  
  // Rest of the methods (normalizeUserObject, searchUsers, etc.) remain the same
  // from our previous implementations
  
  normalizeUserObject: function(user) {
    return {
      id: user.id,
      fullName: user.fullName || user.name || user.username || "Unknown User",
      profileImage: user.profileImage || user.image || "",
      currentRole: user.currentRole || user.title || "",
      company: user.company || "",
      industry: user.industry || "",
      location: user.location || "",
      skills: user.skills || [],
      about: user.about || user.bio || "",
      match: this.calculateMatchScore(user)
    };
  },
  
  searchUsers: function(query, filter = 'all') {
    const allUsers = this.getAllUsers();
    
    if (!query || query.trim() === '') {
      return allUsers;
    }
    
    const searchTerm = query.toLowerCase().trim();
    
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
  
  matchesAnyField: function(user, term) {
    return (user.fullName && user.fullName.toLowerCase().includes(term)) ||
           (user.currentRole && user.currentRole.toLowerCase().includes(term)) ||
           (user.company && user.company.toLowerCase().includes(term)) ||
           (user.industry && user.industry.toLowerCase().includes(term)) ||
           (user.location && user.location.toLowerCase().includes(term)) ||
           (user.about && user.about.toLowerCase().includes(term)) ||
           this.matchesSkills(user, term);
  },
  
  matchesSkills: function(user, term) {
    let skills = [];
    
    if (typeof user.skills === 'string') {
      skills = user.skills.split(',').map(s => s.trim());
    } else if (Array.isArray(user.skills)) {
      skills = user.skills;
    }
    
    return skills.some(skill => skill.toLowerCase().includes(term));
  },
  
  matchesCompany: function(user, term) {
    return user.company && user.company.toLowerCase().includes(term);
  },
  
  matchesIndustry: function(user, term) {
    return user.industry && user.industry.toLowerCase().includes(term);
  },
  
  matchesLocation: function(user, term) {
    return user.location && user.location.toLowerCase().includes(term);
  },
  
  calculateMatchScore: function(user) {
    // Production-quality match scoring will be added below in the AI matching section
    return Math.floor(Math.random() * 30) + 70; // 70-99% for now
  }
};
// Add this to ProConnectUsers in user-search.js
ProConnectUsers.getRecommendedUsers = function() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (!currentUser) return [];
  
  // Get all available users
  let users = this.getAllUsers();
  
  // Skip users already connected with or rejected
  const swipeHistory = currentUser.swipeHistory || [];
  const swipedUserIds = swipeHistory.map(s => s.userId);
  
  users = users.filter(user => !swipedUserIds.includes(user.id));
  
  // Calculate match scores
  users.forEach(user => {
    user.matchScore = this.calculateMatchPercentage(currentUser, user);
  });
  
  // Sort by match score (highest first)
  users.sort((a, b) => b.matchScore - a.matchScore);
  
  return users;
};

// Improved match algorithm
ProConnectUsers.calculateMatchPercentage = function(user1, user2) {
  let matchScore = 50; // Base score
  
  // SKILL MATCHING (30 points)
  let skills1 = this.extractSkills(user1);
  let skills2 = this.extractSkills(user2);
  
  if (skills1.length > 0 && skills2.length > 0) {
    // Find common skills
    const commonSkills = skills1.filter(s => skills2.includes(s));
    const skillRatio = commonSkills.length / Math.max(skills1.length, skills2.length);
    
    // Award up to 30 points for skill overlap
    matchScore += Math.round(skillRatio * 30);
  }
  
  // INDUSTRY MATCHING (15 points)
  if (user1.industry && user2.industry) {
    const industry1 = user1.industry.toLowerCase();
    const industry2 = user2.industry.toLowerCase();
    
    if (industry1 === industry2) {
      matchScore += 15; // Exact match
    } else if (this.areRelatedIndustries(industry1, industry2)) {
      matchScore += 8; // Related industries
    }
  }
  
  // LOCATION MATCHING (10 points)
  if (user1.location && user2.location) {
    const location1 = user1.location.toLowerCase();
    const location2 = user2.location.toLowerCase();
    
    if (location1 === location2) {
      matchScore += 10; // Same location
    } else if (this.areSameRegion(location1, location2)) {
      matchScore += 5; // Same region
    }
  }
  
  // EXPERIENCE LEVEL MATCHING (5 points)
  const exp1 = user1.experience || [];
  const exp2 = user2.experience || [];
  const expYears1 = this.estimateExperienceYears(exp1);
  const expYears2 = this.estimateExperienceYears(exp2);
  
  // Similar experience level (±3 years)
  if (Math.abs(expYears1 - expYears2) <= 3) {
    matchScore += 5;
  }
  
  // COMPANY SIZE/TYPE MATCHING (5 points)
  if (user1.company && user2.company) {
    // In a real app, you'd have company size/type data
    // For now, just check if both have company info
    matchScore += 5;
  }
  
  // Ensure score is between 0-100
  return Math.min(Math.max(Math.round(matchScore), 0), 100);
};

// Helper methods for match algorithm
ProConnectUsers.extractSkills = function(user) {
  if (typeof user.skills === 'string') {
    return user.skills.split(',').map(s => s.trim().toLowerCase());
  } else if (Array.isArray(user.skills)) {
    return user.skills.map(s => s.toLowerCase());
  }
  return [];
};

ProConnectUsers.areRelatedIndustries = function(industry1, industry2) {
  const relatedIndustries = {
    'technology': ['software', 'it', 'tech', 'computer', 'digital', 'web'],
    'finance': ['banking', 'accounting', 'financial', 'investment'],
    'healthcare': ['medical', 'health', 'hospital', 'pharma', 'biotech'],
    'education': ['teaching', 'academic', 'school', 'university', 'learning'],
    'marketing': ['advertising', 'media', 'communications', 'pr']
  };
  
  // Check if industries are related
  for (const [key, related] of Object.entries(relatedIndustries)) {
    if ((industry1.includes(key) || related.some(r => industry1.includes(r))) &&
        (industry2.includes(key) || related.some(r => industry2.includes(r)))) {
      return true;
    }
  }
  
  return false;
};

ProConnectUsers.areSameRegion = function(location1, location2) {
  // Simple check - locations contain same region/state/country
  const location1Parts = location1.split(/[\s,]+/);
  const location2Parts = location2.split(/[\s,]+/);
  
  return location1Parts.some(part => 
    location2Parts.includes(part) && part.length > 2
  );
};

ProConnectUsers.estimateExperienceYears = function(experience) {
  if (!Array.isArray(experience) || experience.length === 0) {
    return 0;
  }
  
  // Calculate total years from experience
  let totalYears = 0;
  
  experience.forEach(job => {
    if (job.period) {
      const periodText = job.period.toLowerCase();
      
      // Try to extract years
      const yearPattern = /(\d{4})\s*-\s*(\d{4}|present)/i;
      const match = periodText.match(yearPattern);
      
      if (match) {
        const startYear = parseInt(match[1]);
        const endYear = match[2].toLowerCase() === 'present' 
          ? new Date().getFullYear() 
          : parseInt(match[2]);
        
        if (!isNaN(startYear) && !isNaN(endYear)) {
          totalYears += endYear - startYear;
        }
      } else {
        // Add default 2 years if we can't parse
        totalYears += 2;
      }
    } else {
      // Add default 2 years
      totalYears += 2;
    }
  });
  
  return totalYears;
};
