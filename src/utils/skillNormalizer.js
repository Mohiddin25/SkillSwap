/**
 * Intelligent Skill Normalizer
 */

const ALIAS_MAP = {
  // Programming & Dev
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'java script': 'JavaScript',
  'react': 'React',
  'reactjs': 'React',
  'react.js': 'React',
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'vue': 'Vue.js',
  'vuejs': 'Vue.js',
  'vue.js': 'Vue.js',
  'py': 'Python',
  'python': 'Python',
  'cpp': 'C++',
  'c++': 'C++',
  'java': 'Java',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',
  'html': 'HTML/CSS',
  'css': 'HTML/CSS',
  'html/css': 'HTML/CSS',

  // Design
  'ui': 'UI/UX',
  'ux': 'UI/UX',
  'ui/ux': 'UI/UX',
  'ui ux': 'UI/UX',
  'uiux': 'UI/UX',
  'user interface': 'UI/UX',
  'figma': 'Figma',
  'graphic design': 'Graphic Design',
  'video editing': 'Video Editing',

  // Data
  'data analysis': 'Data Analysis',
  'excel': 'Excel',
  'ms excel': 'Excel',
  'powerbi': 'Power BI',
  'power bi': 'Power BI',
  'tableau': 'Tableau',

  // Communication
  'public speaking': 'Public Speaking',
  'english communication': 'English Communication',
  'english': 'English Communication',
  'presentation skills': 'Presentation Skills',
  'presentation': 'Presentation Skills'
};

const normalizeSkillName = (rawName) => {
  if (!rawName || typeof rawName !== 'string') return '';
  const trimmed = rawName.trim();
  const lower = trimmed.toLowerCase();

  if (ALIAS_MAP[lower]) {
    return ALIAS_MAP[lower];
  }

  // Capitalize words nicely if not matched in dictionary
  return trimmed
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

module.exports = {
  normalizeSkillName,
  ALIAS_MAP
};
