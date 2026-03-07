// Auth service — currently uses localStorage mock.
// All functions are shaped to match what Supabase auth calls will look like,
// so swapping in real Supabase calls requires minimal frontend changes.
//
// TODO: When wiring Supabase:
//   1. Import createClient from "@/lib/supabase"
//   2. Replace signIn → supabase.auth.signInWithPassword()
//   3. Replace signUp → supabase.auth.signUp() + insert into "profiles" table
//   4. Replace signOut → supabase.auth.signOut()
//   5. Replace getStoredUser → supabase.auth.getUser() + fetch profile row

import type { User, UserType } from "@/types";

const STORAGE_KEY = "farmesh_session";

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function persistUser(user: User): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// TODO: Replace with supabase.auth.signInWithPassword({ email, password })
//       then fetch profile row to get role + businessName
export async function signIn(
  email: string,
  _password: string,
  role: UserType
): Promise<User> {
  const user: User = {
    id: "mock-user-signin",
    name: email.split("@")[0],
    email,
    type: role,
    businessName: "",
  };
  persistUser(user);
  return user;
}

// TODO: Replace with:
//   const { data } = await supabase.auth.signUp({ email, password })
//   then: supabase.from("profiles").insert({ id: data.user.id, role, business_name: businessName })
export async function signUp(
  email: string,
  _password: string,
  role: UserType,
  businessName: string
): Promise<User> {
  const user: User = {
    id: `mock-user-${Date.now()}`,
    name: email.split("@")[0],
    email,
    type: role,
    businessName,
  };
  persistUser(user);
  return user;
}

// TODO: Replace with supabase.auth.signOut()
export async function signOut(): Promise<void> {
  clearUser();
}
