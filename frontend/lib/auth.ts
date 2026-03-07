// Auth service — wired to Supabase via server actions + browser client.
//
// Server actions handle signIn, signUp, signOut (they run on the server
// and use redirect() internally).
//
// getUser() uses the browser Supabase client to fetch the current session
// and profile from public.users — used by client components like AppNav.

import { createClient } from "@/lib/supabase/client";
import type { User } from "@/types";

/**
 * Fetch the currently authenticated user and their profile from public.users.
 * Returns null if not authenticated.
 */
export async function getUser(): Promise<User | null> {
  const supabase = createClient();

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, name, email, type, business_name, phone")
    .eq("id", authUser.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    name: profile.name ?? "",
    email: profile.email ?? authUser.email ?? "",
    type: profile.type ?? "buyer",
    businessName: profile.business_name ?? "",
    phone: profile.phone ?? "",
  };
}
