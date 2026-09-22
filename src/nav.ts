export interface NavItem { path: string; label: string; icon: string; roles: string[] }
const M = ['admin', 'buHead', 'ta']
const C = ['cto']
export const NAV: NavItem[] = [
  { path: '/dashboard', label: 'Dashboard', icon: '▦', roles: M },
  { path: '/employees', label: 'Bench Employees', icon: '👥', roles: M },
  // { path: '/materials', label: 'Materials', icon: '📚', roles: M },
  // { path: '/plans', label: 'Training Plans', icon: '🗂️', roles: M },
    { path: '/training', label: 'Training', icon: '📚', roles: M },
  // { path: '/assessments', label: 'Assessments', icon: '📝', roles: M },
  // { path: '/progress', label: 'Training Progress', icon: '📈', roles: M },
  // { path: '/prep', label: 'Interview Prep', icon: '🧠', roles: M },
  { path: '/interviews', label: 'Interviews', icon: '🗓️', roles: M },
  { path: '/readiness', label: 'Readiness', icon: '✅', roles: M },
  // { path: '/people', label: 'People & Capacity', icon: '🎓', roles: M },
  { path: '/reports', label: 'Reports', icon: '📊', roles: M },
  // { path: '/library', label: 'Knowledge Library', icon: '📖', roles: [...M, 'benchEngineer'] },
  { path: '/admin', label: 'Administration', icon: '⚙️', roles: ['admin'] },
  { path: '/admin', label: 'BU Administration', icon: '⚙️', roles: ['buHead'] },
  // employee
  { path: '/me', label: 'My Dashboard', icon: '▦', roles: ['benchEngineer'] },
  { path: '/my-training', label: 'My Training', icon: '📈', roles: ['benchEngineer'] },
  // { path: '/my-assessments', label: 'My Assessments', icon: '📝', roles: ['benchEngineer'] },
  // { path: '/my-prep', label: 'My Interview Prep', icon: '🧠', roles: ['benchEngineer'] },
  { path: '/my-interviews', label: 'My Interviews', icon: '🗓️', roles: ['benchEngineer'] },
  { path: '/my-availability', label: 'My Availability', icon: '📅', roles: ['benchEngineer'] },
  { path: '/my-profile', label: 'My Profile', icon: '👤', roles: ['benchEngineer'] },
  // { path: '/notifications', label: 'Notifications', icon: '🔔', roles: [...M, 'benchEngineer'] },
  { path: '/profile', label: 'Profile & Settings', icon: '👤', roles: M },


  //cto
  { path: '/dashboard', label: 'Dashboard', icon: '▦', roles: C },
  { path: '/employees', label: 'Employees / Bench', icon: '👥', roles: C },
  { path: '/training', label: 'Training', icon: '📚', roles: C },
  // { path: '/requirements', label: 'Requirements', icon: '📋', roles: C },
  // { path: '/people', label: 'Allocation', icon: '🎓', roles: C },
  { path: '/reports', label: 'Reports / Analytics', icon: '📊', roles: C },
  // { path: '/library', label: 'Knowledge Library', icon: '📖', roles: C },
  // { path: '/notifications', label: 'Notifications', icon: '🔔', roles: C },
  { path: '/profile', label: 'Profile & Settings', icon: '👤', roles: C },
]
export const roleLabel = (r: string) => (({ admin: 'Administrator', buHead: 'BU Head', ta: 'Talent Acquisition', benchEngineer: 'Bench Employee' } as any)[r] || r)
