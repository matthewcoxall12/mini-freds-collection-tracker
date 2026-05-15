import "server-only";
import { type SupabaseClient } from '@supabase/supabase-js';
import { unauthorized, forbidden } from '@/lib/responses';

export function getAdminEmail(): string {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    throw new Error("ADMIN_EMAIL environment variable is not set");
  }
  return email;
}

export async function getCurrentUserEmail(): Promise<string | null> {
  // TODO: wire up @supabase/supabase-js server client + cookie session
  return null;
}

export async function isCurrentUserAdmin(): Promise<boolean> {
  const userEmail = await getCurrentUserEmail();
  if (!userEmail) return false;
  return userEmail.toLowerCase() === getAdminEmail().toLowerCase();
}

export async function requireAuth(client: SupabaseClient): Promise<{ userId: string } | Response> {
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user?.id) {
    return unauthorized();
  }
  return { userId: user.id };
}

export async function requireAdmin(client: SupabaseClient): Promise<{ userId: string } | Response> {
  const authResult = await requireAuth(client);
  if (authResult instanceof Response) return authResult;

  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user?.email) {
    return forbidden();
  }

  if (user.email.toLowerCase() !== getAdminEmail().toLowerCase()) {
    return forbidden();
  }

  return { userId: user.id };
}
