export function can(user: any, perm: string): boolean {
  const r = user?.role
  if (r === 'admin') return true
  if (r === 'cto') return perm === 'view' || perm === 'export'
  if (r === 'buHead') return ['view','add','edit','deactivate','assign','approve','export','manageTa','schedule'].includes(perm)
  if (r === 'ta') return ['view','add','edit','assign','export','schedule'].includes(perm)
  if (r === 'benchEngineer') return perm === 'view'
  return false
}