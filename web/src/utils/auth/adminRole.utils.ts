/** Login JWT stores roles as comma-separated names, e.g. "admin" or "student,admin". */
export function hasAdminRole(role?: string | null): boolean {
  if (!role) return false
  return role.split(',').some((r) => r.trim().toLowerCase() === 'admin')
}
