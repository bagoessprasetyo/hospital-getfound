// Re-export server-side auth functions
export { 
  getUser, 
  getUserProfile, 
  requireAuth, 
  requireRole, 
  requireAdmin, 
  requireDoctor, 
  requirePatient 
} from './auth/server'

// Re-export client-side auth functions
export { signOut } from './auth/client'