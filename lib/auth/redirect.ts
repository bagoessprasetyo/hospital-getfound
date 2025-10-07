/**
 * Utility functions for role-based redirects
 */

export type UserRole = 'admin' | 'doctor' | 'patient' | null

/**
 * Get the appropriate redirect URL based on user role
 */
export function getRedirectUrlByRole(role: UserRole): string {
  switch (role) {
    case 'admin':
      return '/admin/dashboard'
    case 'doctor':
      return '/doctor/dashboard'
    case 'patient':
      return '/my-profile'
    default:
      // Fallback for users without roles or unknown roles
      return '/my-profile'
  }
}

/**
 * Check if a user should have access to a specific route based on their role
 */
export function canAccessRoute(userRole: UserRole, requiredRole: UserRole): boolean {
  if (!userRole) return false
  
  // Admin can access everything
  if (userRole === 'admin') return true
  
  // Users can only access their own role's routes or public routes
  return userRole === requiredRole
}

/**
 * Get dashboard URL for a specific role
 */
export function getDashboardUrl(role: UserRole): string {
  return getRedirectUrlByRole(role)
}

/**
 * Check if current route matches user's expected dashboard
 */
export function isUserOnCorrectDashboard(currentPath: string, userRole: UserRole): boolean {
  const expectedPath = getRedirectUrlByRole(userRole)
  return currentPath.startsWith(expectedPath)
}