// This file might become obsolete or significantly reduced if all auth logic moves to AuthContext with Supabase.
// For now, keeping generateNumericId if it's used elsewhere, but Supabase handles user creation.
import { v4 as uuidv4 } from 'uuid';

// This function might still be useful if Supabase user metadata doesn't auto-generate it
// or if we need it before the user is fully committed to Supabase auth.users table.
// However, the trigger function handle_new_user now calls a SQL function for this.
export const generateNumericId = () => {
  return Math.floor(1000000 + Math.random() * 9000000).toString();
};

// loginUser and registerNewUser are now handled directly within AuthContext using Supabase client.
// This file can be removed or repurposed if no longer holding primary auth logic.