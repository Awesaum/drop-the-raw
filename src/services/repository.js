/**
 * @fileoverview Repository utilities - URL parsing and validation
 */

/**
 * Parses GitHub repository URL or owner/repo string into clean components
 * @param {string} inputRepo - e.g. "https://github.com/Awesaum/drop-the-raw" or "Awesaum/drop-the-raw"
 * @param {string} defaultOwner - Default repository owner
 * @param {string} defaultRepo - Default repository name
 * @returns {{owner: string, repo: string, fullUrl: string}}
 */
export function parseRepoTarget(inputRepo, defaultOwner = 'Awesaum', defaultRepo = 'drop-the-raw') {
  if (!inputRepo || typeof inputRepo !== 'string') {
    return { 
      owner: defaultOwner, 
      repo: defaultRepo, 
      fullUrl: `https://github.com/${defaultOwner}/${defaultRepo}` 
    };
  }
  
  const clean = inputRepo.trim()
    .replace(/^https?:\/\/github\.com\//i, '')
    .replace(/\.git$/i, '')
    .replace(/^\/+|\/+$/g, '');
    
  const parts = clean.split('/');
  
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return { 
      owner: parts[0], 
      repo: parts[1], 
      fullUrl: `https://github.com/${parts[0]}/${parts[1]}` 
    };
  }
  
  return { 
    owner: defaultOwner, 
    repo: defaultRepo, 
    fullUrl: `https://github.com/${defaultOwner}/${defaultRepo}` 
  };
}

/**
 * Validates that a branch name is safe for raw operations
 * @param {string} branch - Branch name to validate
 * @returns {boolean}
 */
export function isSafeBranch(branch) {
  if (!branch || typeof branch !== 'string') return false;
  
  const normalizedBranch = branch.trim().toLowerCase();
  return normalizedBranch !== 'main' && 
         normalizedBranch !== 'master' && 
         !normalizedBranch.endsWith('/main');
}