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
