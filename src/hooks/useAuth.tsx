import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { ProfileRow } from "@/integrations/supabase/types";

type Role = "admin" | "manager" | "auditor" | "user";

export type AppUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  active: boolean;
  lastLoginAt?: number;
  needsApprovalNotification?: boolean;
};

type AuthContextValue = {
  user: AppUser | null;
  users: AppUser[];
  login: (email: string, password: string) => Promise<{ ok: boolean; code: string; message: string; user?: AppUser; backend: "supabase" | "local" }>;
  loginWithGoogle: () => Promise<{ ok: boolean; code: string; message: string; user?: AppUser }>;
  logout: () => void;
  addUser: (user: Omit<AppUser, "id">) => void;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  removeUser: (id: string) => void;
  changePassword: (id: string, oldPass: string, newPass: string) => boolean;
  reloadUsers: () => Promise<void>;
};

const USERS_KEY = "qms_users";
const SESSION_KEY = "qms_session";
const ACTIVATED_KEY = "qms_activated_emails";

const apiBase = (import.meta as unknown as { env?: Record<string, unknown> }).env?.DEV ? "http://localhost:3001" : "";
const AUTH_LOCAL_DISABLED = (((import.meta as unknown as { env?: Record<string, unknown> }).env?.VITE_AUTH_LOCAL_DISABLED) ?? "true") === "true";

async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function loadUsersLocal(): AppUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveUsersLocal(users: AppUser[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch { void 0; }
}

function loadSession(): string | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const s = JSON.parse(raw) as { userId: string };
    return s.userId || null;
  } catch {
    return null;
  }
}

function saveSession(userId: string | null) {
  if (!userId) {
    localStorage.removeItem(SESSION_KEY);
    return;
    }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId }));
}

function loadActivatedEmails(): string[] {
  try {
    const raw = localStorage.getItem(ACTIVATED_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr.map((e: string) => String(e).toLowerCase()) : [];
  } catch {
    return [];
  }
}

function saveActivatedEmails(emails: string[]) {
  try {
    const norm = emails.map(e => e.toLowerCase());
    localStorage.setItem(ACTIVATED_KEY, JSON.stringify(norm));
  } catch { void 0; }
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialLocal = (() => {
    if (AUTH_LOCAL_DISABLED) return [];
    const existing = loadUsersLocal();
    if (existing.length === 0) {
      const seeded: AppUser = {
        id: crypto.randomUUID(),
        name: "admin",
        email: "admin@local",
        password: "admin",
        role: "admin",
        active: true,
        lastLoginAt: 0,
      };
      const merged = [seeded];
      saveUsersLocal(merged);
      return merged;
    }
    return existing;
  })();
  const [users, setUsers] = React.useState<AppUser[]>(initialLocal);
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [supabaseDisabled, setSupabaseDisabled] = React.useState(false);

  React.useEffect(() => {
    const bootstrap = async () => {
      if (supabase && !supabaseDisabled) {
        const selectOnce = async () => {
          const { data, error } = await supabase.from("profiles").select("*");
          if (error) {
            setSupabaseDisabled(true);
          }
          return { rows: Array.isArray(data) ? data : [], error };
        };
        let { rows, error } = await selectOnce();
        if (error) { void 0; }
        let rolesRows: any[] = [];
        try {
          const { data: rolesData } = await supabase.from("user_roles").select("*");
          rolesRows = Array.isArray(rolesData) ? rolesData : [];
        } catch { void 0; }
        const roleByUserId = new Map<string, string>();
        rolesRows.forEach((r: any) => {
          if (r && typeof r.user_id === "string" && typeof r.role === "string") {
            roleByUserId.set(r.user_id, r.role.toLowerCase());
          }
        });
        let hasAdmin = rows.some(r => String(r.email).toLowerCase() === "admin@local");
        if (!hasAdmin) {
          const adminId = crypto.randomUUID();
          const { error: insertErr } = await supabase.from("profiles").insert({
            id: adminId,
            user_id: adminId,
            email: "admin@local",
            is_active: true,
            last_login: new Date(0).toISOString(),
          });
          if (!insertErr) {
            try {
              await supabase.from("user_roles").insert({
                id: crypto.randomUUID(),
                user_id: adminId,
                role: "admin",
              });
            } catch { void 0; }
            const res = await selectOnce();
            rows = res.rows;
            error = res.error;
            hasAdmin = rows.some(r => String(r.email).toLowerCase() === "admin@local");
          } else {
            void 0;
          }
        }
        const mapped = rows.map((r: any) => {
          const lastLoginRaw = (r.last_login as string) || "";
          const lastLoginAt = lastLoginRaw ? Date.parse(lastLoginRaw) || 0 : 0;
          const role = roleByUserId.get(r.user_id || r.id) || "user";
          return {
            id: r.user_id || r.id,
            name: r.name || (typeof r.email === "string" ? String(r.email).split("@")[0] : "user"),
            email: r.email || "",
            password: "",
            role,
            active: !!(r.is_active ?? false),
            lastLoginAt,
            needsApprovalNotification: false,
          } as AppUser;
        });
        let mergedArr = mapped;
        const hasAdminInMerged = mergedArr.some(u => u.email.toLowerCase() === "admin@local");
        if (!hasAdminInMerged) {
          const seeded: AppUser = {
            id: crypto.randomUUID(),
            name: "admin",
            email: "admin@local",
            password: "",
            role: "admin",
            active: true,
            lastLoginAt: 0,
          };
          mergedArr = [...mergedArr, seeded];
        }
        setUsers(mergedArr);
        setSupabaseDisabled(false);
      } else {
        if (AUTH_LOCAL_DISABLED) {
          setUsers([]);
        } else {
          try {
            const existing = await apiFetch<AppUser[]>("/api/users");
            const hasAdmin = existing.some(u => u.email.toLowerCase() === "admin@local");
            if (!hasAdmin) {
              const admin: Omit<AppUser, "id"> = {
                name: "admin",
                email: "admin@local",
                password: "admin",
                role: "admin",
                active: true,
                lastLoginAt: 0,
              };
              try {
                const created = await apiFetch<AppUser>("/api/users", {
                  method: "POST",
                  body: JSON.stringify(admin),
                });
                setUsers([...existing, created]);
              } catch {
                const seeded: AppUser = { ...admin, id: crypto.randomUUID() };
                const merged = [...existing, seeded];
                saveUsersLocal(merged);
                setUsers(merged);
              }
            } else {
              setUsers(existing);
            }
          } catch {
            const existing = loadUsersLocal();
            let list = existing;
            const hasAdmin = existing.some(u => u.email.toLowerCase() === "admin@local");
            if (!hasAdmin) {
              const seeded: AppUser = {
                id: crypto.randomUUID(),
                name: "admin",
                email: "admin@local",
                password: "admin",
                role: "admin",
                active: true,
                lastLoginAt: 0,
              };
              list = [...existing, seeded];
              saveUsersLocal(list);
            }
            setUsers(list);
          }
        }
      }
    };
    bootstrap();
    const userId = loadSession();
    if (userId) {
      if (supabase) {
        const u = users.find(x => x.id === userId) || null;
        setUser(u);
      } else {
        // prefer Supabase; if it fails, keep current session state
        const u = users.find(x => x.id === userId) || null;
        setUser(u);
      }
    }
  }, []);

  const reloadUsers = React.useCallback(async () => {
    const run = async () => {
      if (supabase && !supabaseDisabled) {
        const { data, error } = await supabase.from("profiles").select("*");
        if (error) {
          setSupabaseDisabled(true);
          if (!AUTH_LOCAL_DISABLED) {
            const local = loadUsersLocal();
            setUsers(local);
            const currentId = loadSession();
            if (currentId) {
              const u = local.find(x => x.id === currentId) || null;
              setUser(u);
            }
          } else {
            setUsers([]);
          }
          return;
        }
        const rows = Array.isArray(data) ? data : [];
        let rolesRows: any[] = [];
        try {
          const { data: rolesData } = await supabase.from("user_roles").select("*");
          rolesRows = Array.isArray(rolesData) ? rolesData : [];
        } catch { void 0; }
        const roleByUserId = new Map<string, string>();
        rolesRows.forEach((r: any) => {
          if (r && typeof r.user_id === "string" && typeof r.role === "string") {
            roleByUserId.set(r.user_id, r.role.toLowerCase());
          }
        });
        const mapped = rows.map((r: any) => {
          const lastLoginRaw = (r.last_login as string) || "";
          const lastLoginAt = lastLoginRaw ? Date.parse(lastLoginRaw) || 0 : 0;
          const role = roleByUserId.get(r.user_id || r.id) || "user";
          return {
            id: r.user_id || r.id,
            name: r.name || (typeof r.email === "string" ? String(r.email).split("@")[0] : "user"),
            email: r.email || "",
            password: "",
            role,
            active: !!(r.is_active ?? false),
            lastLoginAt,
            needsApprovalNotification: false,
          } as AppUser;
        });
        setUsers(mapped);
        setSupabaseDisabled(false);
        const currentId = loadSession();
        if (currentId) {
          const u = mapped.find(x => x.id === currentId) || null;
          setUser(u);
        }
      } else {
        if (!AUTH_LOCAL_DISABLED) {
          const local = loadUsersLocal();
          setUsers(local);
          const currentId = loadSession();
          if (currentId) {
            const u = local.find(x => x.id === currentId) || null;
            setUser(u);
          }
        } else {
          setUsers([]);
        }
      }
    };
    await run();
  }, [supabaseDisabled]);

  React.useEffect(() => {
    // Listen for auth state changes (OAuth callbacks)
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // User signed in via OAuth
          const authUser = session.user;
          
          // Check if user profile exists
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", authUser.id)
            .single();

          if (!profileData) {
            // Create new profile for Google user
            await supabase.from("profiles").insert({
              id: crypto.randomUUID(),
              user_id: authUser.id,
              email: authUser.email,
              name: authUser.user_metadata?.full_name || authUser.email?.split("@")[0] || "Google User",
              is_active: true,
              last_login: new Date().toISOString(),
            });

            // Create default role for new user
            await supabase.from("user_roles").insert({
              id: crypto.randomUUID(),
              user_id: authUser.id,
              role: "user",
            });
          }

          // Reload users to update local state
          await reloadUsers();
          
          // Set current user
          const { data: { user: currentUser } } = await supabase.auth.getUser();
          if (currentUser) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("user_id", currentUser.id)
              .single();
            
            const { data: roleData } = await supabase
              .from("user_roles")
              .select("role")
              .eq("user_id", currentUser.id)
              .single();

            if (profile) {
              const user: AppUser = {
                id: currentUser.id,
                name: profile.name || currentUser.email?.split("@")[0] || "Google User",
                email: currentUser.email || "",
                password: "",
                role: (roleData?.role as Role) || "user",
                active: profile.is_active ?? true,
                lastLoginAt: profile.last_login ? Date.parse(profile.last_login) : Date.now(),
              };
              setUser(user);
              saveSession(user.id);
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          saveSession(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [reloadUsers]);

  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) {
        const currentId = loadSession();
        if (!currentId) {
          setUser(null);
        } else {
        const u = users.find(x => x.id === currentId) || null;
        setUser(u);
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = React.useCallback(async (email: string, password: string) => {
    const backend: "supabase" | "local" = supabase ? "supabase" : "local";
    if (!email.trim()) {
      return { ok: false, code: "email_empty", message: "البريد الإلكتروني فارغ", backend };
    }
    if (!password.trim()) {
      return { ok: false, code: "password_empty", message: "كلمة المرور فارغة", backend };
    }
    if (backend === "supabase") {
      const { data: authRes, error: authErr } = await supabase!.auth.signInWithPassword({ email, password });
      if (authErr || !authRes?.user?.id) {
        return { ok: false, code: "wrong_password", message: "بيانات الاعتماد غير صحيحة أو الحساب غير موجود", backend };
      }
      const authUserId = authRes.user.id;
      let profileRow: ProfileRow | null = null;
      try {
        const { data: profRows } = await supabase!
          .from("profiles")
          .select("*")
          .eq("user_id", authUserId)
          .limit(1);
        const list = Array.isArray(profRows) ? (profRows as ProfileRow[]) : [];
        if (list.length > 0) {
          profileRow = list[0] || null;
        }
      } catch { void 0; }
      if (!profileRow) {
        const { error: upErr } = await supabase!.from("profiles").upsert(
          {
            id: crypto.randomUUID(),
            user_id: authUserId,
            email,
            is_active: false,
            last_login: new Date(0).toISOString(),
          },
          { onConflict: "user_id" }
        );
        if (!upErr) {
          try {
            const { data: profRows2 } = await supabase!
              .from("profiles")
              .select("*")
              .eq("user_id", authUserId)
              .limit(1);
            const list2 = Array.isArray(profRows2) ? (profRows2 as ProfileRow[]) : [];
            if (list2.length > 0) {
              profileRow = list2[0] || null;
            }
          } catch { void 0; }
        }
      }
      let role = "user";
      try {
        type UserRoleRow = { id?: string; user_id?: string; role?: string };
        const { data: rolesRows } = await supabase!
          .from("user_roles")
          .select("*")
          .eq("user_id", authUserId)
          .limit(1);
        const rlist = Array.isArray(rolesRows) ? (rolesRows as UserRoleRow[]) : [];
        if (rlist.length > 0 && rlist[0]?.role) {
          role = String(rlist[0].role).toLowerCase();
        }
      } catch { void 0; }
      const lastLoginRaw = (profileRow?.last_login as string) || "";
      const lastLoginAt = lastLoginRaw ? Date.parse(lastLoginRaw) || 0 : 0;
      const isActive = !!(profileRow?.is_active ?? false);
      if (!isActive) {
        return { ok: false, code: "inactive", message: "الحساب غير مفعل", backend };
      }
      supabase!.from("profiles").update({ last_login: new Date().toISOString() }).eq("user_id", authUserId)
        .then(() => void 0)
        .catch(() => void 0);
      const u: AppUser = {
        id: authUserId,
        name: profileRow?.name || email.split("@")[0],
        email,
        password: "",
        role,
        active: isActive,
        lastLoginAt,
        needsApprovalNotification: false,
      };
      setUsers(prev => {
        const idx = prev.findIndex(x => x.id === u.id || x.email.toLowerCase() === u.email.toLowerCase());
        if (idx >= 0) {
          const copy = [...prev];
          copy[idx] = { ...copy[idx], ...u };
          return copy;
        }
        return [...prev, u];
      });
      setUser(u);
      saveSession(u.id);
      setSupabaseDisabled(false);
      return { ok: true, code: "ok", message: "تم تسجيل الدخول", user: u, backend };
    }
    if (AUTH_LOCAL_DISABLED) {
      return { ok: false, code: "supabase_only", message: "التسجيل وتسجيل الدخول متوقفان محليًا. Supabase مطلوب", backend: "local" };
    }
    const found = users.find(x => x.email.toLowerCase() === email.toLowerCase());
    if (!found) {
      return { ok: false, code: "not_found", message: "الحساب غير موجود", backend };
    }
    if (found.password !== password) {
      return { ok: false, code: "wrong_password", message: "كلمة المرور غير صحيحة", backend };
    }
    const u = { ...found, lastLoginAt: Date.now(), needsApprovalNotification: false };
    setUsers(users.map(x => (x.id === u.id ? u : x)));
    setUser(u);
    saveSession(u.id);
    return { ok: true, code: "ok", message: "تم تسجيل الدخول", user: u, backend };
  }, [users, supabaseDisabled]);

  const loginWithGoogle = React.useCallback(async () => {
    if (!supabase) {
      return { ok: false, code: "supabase_not_available", message: "Google authentication is not available" };
    }

    try {
      // Start Google OAuth flow
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        return { ok: false, code: "oauth_error", message: error.message };
      }

      // The OAuth flow will redirect the user to Google
      // After successful authentication, the user will be redirected back
      return { ok: true, code: "redirecting", message: "Redirecting to Google..." };
    } catch (error) {
      return { ok: false, code: "oauth_error", message: "Failed to start Google authentication" };
    }
  }, []);

  const logout = React.useCallback(() => {
    setUser(null);
    saveSession(null);
  }, []);

  const addUser = React.useCallback((userInput: Omit<AppUser, "id">) => {
    const newUser: AppUser = { ...userInput, id: crypto.randomUUID() };
    const updated = [...users, newUser];
    if (!AUTH_LOCAL_DISABLED) {
      setUsers(updated);
      saveUsersLocal(updated);
    }
    if (supabase) {
      supabase.from("profiles").insert({
        id: newUser.id,
        user_id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        is_active: !!newUser.active,
        last_login: new Date(0).toISOString(),
      }).then(async () => {
        try {
          await supabase.from("user_roles").insert({
            id: crypto.randomUUID(),
            user_id: newUser.id,
            role: newUser.role,
          });
        } catch { void 0; }
      }).catch(() => {
        setSupabaseDisabled(true);
      });
    }
  }, [users]);

  const updateUser = React.useCallback((id: string, updates: Partial<AppUser>) => {
    const updated = users.map(u => (u.id === id ? { ...u, ...updates } : u));
    if (!AUTH_LOCAL_DISABLED) {
      setUsers(updated);
      saveUsersLocal(updated);
    }
    if (supabase) {
      const payload: Record<string, unknown> = {};
      if (typeof updates.name === "string") payload.name = updates.name;
      if (typeof updates.email === "string") payload.email = updates.email;
      if (typeof updates.active === "boolean") payload.is_active = updates.active;
      if (typeof updates.lastLoginAt === "number") payload.last_login = new Date(updates.lastLoginAt).toISOString();
      supabase.from("profiles").update(payload).eq("user_id", id).then(async () => {
        if (typeof updates.role === "string") {
          try {
            await supabase.from("user_roles").upsert(
              { id: crypto.randomUUID(), user_id: id, role: updates.role },
              { onConflict: "user_id" }
            );
          } catch { void 0; }
        }
      }).catch(() => void 0);
    }
    if (user && user.id === id) {
      setUser({ ...user, ...updates });
    }
  }, [users, user]);

  const removeUser = React.useCallback((id: string) => {
    const updated = users.filter(u => u.id !== id);
    if (!AUTH_LOCAL_DISABLED) {
      setUsers(updated);
      saveUsersLocal(updated);
    }
    if (supabase) {
      supabase.from("user_roles").delete().eq("user_id", id).then(() => void 0).catch(() => void 0);
      supabase.from("profiles").delete().eq("user_id", id).then(() => void 0).catch(() => void 0);
    }
    if (user && user.id === id) {
      setUser(null);
      saveSession(null);
    }
  }, [users, user]);
  
  const value: AuthContextValue = {
    user,
    users,
    login,
    loginWithGoogle,
    logout,
    addUser,
    updateUser,
    removeUser,
    changePassword: (id, oldPass, newPass) => {
      const u = users.find(x => x.id === id);
      if (!u || u.password !== oldPass) return false;
      updateUser(id, { password: newPass });
      return true;
    },
    reloadUsers,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
