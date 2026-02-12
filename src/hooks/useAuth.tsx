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
      if (window.__AUTH_BOOTSTRAPPED__) return;
      window.__AUTH_BOOTSTRAPPED__ = true;
      
      console.log("[AUTH-BOOTSTRAP] Starting bootstrap...", { hasSupabase: !!supabase, supabaseDisabled });
      if (supabase && !supabaseDisabled) {
        const selectOnce = async () => {
          try {
            const { data, error, status } = await supabase.from("profiles").select("*");
            if (error) {
              if (status === 403 || status === 401) {
                console.warn(`Supabase ${status} error on profiles. Falling back to local auth.`);
              }
              setSupabaseDisabled(true);
            }
            return { rows: Array.isArray(data) ? (data as any[]) : [], error };
          } catch (e) {
            console.error("Supabase connection failed:", e);
            setSupabaseDisabled(true);
            return { rows: [], error: e as any };
          }
        };
        let { rows, error } = await selectOnce();
        if (error) {
          console.error("[AUTH-BOOTSTRAP] Profiles fetch failed:", error);
          setSupabaseDisabled(true);
          return;
        }
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
            active: true,
            last_login_at: 0,
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
          }
        }
        const mapped = rows.map((r: any) => {
          const lastLoginAt = r.last_login_at || 0;
          const role = roleByUserId.get(r.user_id || r.id) || "user";
          return {
            id: r.user_id || r.id,
            name: r.name || (typeof r.email === "string" ? String(r.email).split("@")[0] : "user"),
            email: r.email || "",
            password: "",
            role: role as Role,
            active: !!(r.active ?? false),
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

        // Check if there's an existing Supabase session (e.g. after page refresh)
        const { data: { session } } = await supabase.auth.getSession();
        console.log("[AUTH-BOOTSTRAP] getSession result:", { hasSession: !!session, userId: session?.user?.id, email: session?.user?.email });
        if (session?.user) {
          const authUserId = session.user.id;
          const found = mergedArr.find(x => x.id === authUserId);
          console.log("[AUTH-BOOTSTRAP] Found user in merged array:", { found: !!found, active: found?.active });
          if (found && found.active) {
            setUser(found);
            saveSession(found.id);
            return;
          }
        }
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

      // Local session check if not logged in via Supabase above
      const sid = loadSession();
      if (sid) {
        const found = users.find(x => x.id === sid);
        if (found) {
          setUser(found);
        }
      }
    };
    bootstrap();
  }, []);

  const reloadUsers = React.useCallback(async () => {
    const run = async () => {
      if (supabase && !supabaseDisabled) {
        try {
          const { data, error, status } = await supabase.from("profiles").select("*");
          if (error) {
            if (status === 403 || status === 401) {
              console.warn(`Supabase ${status} error on reload. Falling back.`);
            }
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
            const lastLoginAt = r.last_login_at || 0;
            const role = roleByUserId.get(r.user_id || r.id) || "user";
            return {
              id: r.user_id || r.id,
              name: r.name || (typeof r.email === "string" ? String(r.email).split("@")[0] : "user"),
              email: r.email || "",
              password: "",
              role: role as Role,
              active: !!(r.active ?? false),
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
        } catch (e) {
          console.error("Supabase reload failed:", e);
          setSupabaseDisabled(true);
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

  // Handle Supabase auth state changes (Google OAuth redirect)
  React.useEffect(() => {
    if (!supabase) {
      console.warn("[AUTH] Supabase client is NULL - auth state changes will NOT be tracked");
      return;
    }
    console.log("[AUTH] Setting up onAuthStateChange listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("[AUTH] onAuthStateChange fired:", { event, hasSession: !!session, userId: session?.user?.id, email: session?.user?.email });
      if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
        const authUserId = session.user.id;
        const email = session.user.email || "";
        
        // Fetch or create profile for the session user
        let profile: ProfileRow | null = null;
        let roleData: { role: string } | null = null;

        try {
          const { data: prof } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", authUserId)
            .maybeSingle();
          profile = prof as ProfileRow;

          if (!profile) {
            console.log("[AUTH] No profile found for Google user, creating one...");
            const { data: newProf } = await supabase.from("profiles").insert({
              id: crypto.randomUUID(),
              user_id: authUserId,
              email: email,
              name: session.user.user_metadata?.full_name || email.split("@")[0] || "Google User",
              active: true,
              last_login_at: Date.now(),
            }).select().maybeSingle();
            profile = newProf as ProfileRow;

            // Default role
            await supabase.from("user_roles").insert({
              id: crypto.randomUUID(),
              user_id: authUserId,
              role: "user",
            });
          }

          const { data: rData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", authUserId)
            .maybeSingle();
          roleData = rData as { role: string };
        } catch (err) {
          console.error("[AUTH] Error during onAuthStateChange profile fetch:", err);
        }

        if (profile) {
          const isActive = !!(profile.active ?? false);
          if (!isActive) {
            console.warn("[AUTH] Account not active, signing out");
            await supabase.auth.signOut();
            return;
          }

          const user: AppUser = {
            id: authUserId,
            name: profile.name || email.split("@")[0] || "Google User",
            email: email,
            password: "",
            role: (roleData?.role as Role) || "user",
            active: isActive,
            lastLoginAt: profile.last_login_at || Date.now(),
          };
          
          setUsers(prev => {
            const idx = prev.findIndex(x => x.id === user.id || x.email.toLowerCase() === user.email.toLowerCase());
            if (idx >= 0) {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], ...user };
              return copy;
            }
            return [...prev, user];
          });
          setUser(user);
          saveSession(user.id);
          console.log("[AUTH] User logged in via onAuthStateChange:", user.email);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        saveSession(null);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  const login = React.useCallback(async (email: string, password: string): Promise<{ ok: boolean; code: string; message: string; user?: AppUser; backend: "supabase" | "local" }> => {
    const backend: "supabase" | "local" = supabase ? "supabase" : "local";
    if (!email.trim()) {
      return { ok: false, code: "email_empty", message: "البريد الإلكتروني فارغ", backend };
    }
    if (!password.trim()) {
      return { ok: false, code: "password_empty", message: "كلمة المرور فارغة", backend };
    }
    if (backend === "supabase") {
      try {
        const { data: authRes, error: authErr } = await supabase!.auth.signInWithPassword({ email, password });
        if (authErr || !authRes?.user?.id) {
          console.error("[AUTH] Login error:", authErr);
          return { ok: false, code: "wrong_password", message: "بيانات الاعتماد غير صحيحة أو الحساب غير موجود", backend };
        }
        const authUserId = authRes.user.id;
        let profileRow: ProfileRow | null = null;
        try {
          const { data: profRows } = await supabase!
            .from("profiles")
            .select("*")
            .eq("user_id", authUserId)
            .maybeSingle();
          profileRow = profRows as ProfileRow;
        } catch { void 0; }
        
        if (!profileRow) {
          console.log("[AUTH] No profile found, creating default for", email);
          const { error: upErr } = await supabase!.from("profiles").insert({
            id: crypto.randomUUID(),
            user_id: authUserId,
            email,
            active: true,
            last_login_at: Date.now(),
          }).select().maybeSingle();
          
          if (!upErr) {
            try {
              const { data: profRows2 } = await supabase!
                .from("profiles")
                .select("*")
                .eq("user_id", authUserId)
                .maybeSingle();
              profileRow = profRows2 as ProfileRow;
              
              await supabase.from("user_roles").insert({
                id: crypto.randomUUID(),
                user_id: authUserId,
                role: "user",
              });
            } catch { void 0; }
          }
        }
        
        let role = "user";
        try {
          const { data: rolesRows } = await supabase!
            .from("user_roles")
            .select("role")
            .eq("user_id", authUserId)
            .maybeSingle();
          if (rolesRows?.role) {
            role = String(rolesRows.role).toLowerCase();
          }
        } catch { void 0; }
        
        const lastLoginAt = profileRow?.last_login_at || Date.now();
        const isActive = !!(profileRow?.active ?? true);
        
        if (!isActive) {
          console.warn("[AUTH] Account inactive:", email);
          await supabase!.auth.signOut();
          return { ok: false, code: "inactive", message: "الحساب غير مفعل", backend };
        }
        
        const u: AppUser = {
          id: authUserId,
          name: profileRow?.name || email.split("@")[0],
          email,
          password: "",
          role: role as Role,
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
        console.log("[AUTH] Login successful for:", email);
        return { ok: true, code: "ok", message: "تم تسجيل الدخول", user: u, backend };
      } catch (err) {
        console.error("[AUTH] Login exception:", err);
        return { ok: false, code: "exception", message: "حدث خطأ غير متوقع أثناء تسجيل الدخول", backend };
      }
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

  const loginWithGoogle = React.useCallback(async (): Promise<{ ok: boolean; code: string; message: string; user?: AppUser }> => {
    if (!supabase) {
      return { ok: false, code: "no_supabase", message: "خدمة المصادقة غير متوفرة حالياً" };
    }
    
    try {
      console.log("[AUTH] Starting Google OAuth flow...");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        }
      });

      if (error) {
        console.error("[AUTH] Google OAuth error:", error);
        return { ok: false, code: "oauth_error", message: error.message };
      }

      return { ok: true, code: "redirecting", message: "جاري التوجه إلى جوجل..." };
    } catch (err) {
      console.error("[AUTH] Google OAuth exception:", err);
      return { ok: false, code: "exception", message: "حدث خطأ غير متوقع أثناء الاتصال بجوجل" };
    }
  }, []);

  const logout = React.useCallback(async () => {
    console.log("[AUTH] Logging out user...");
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn("[AUTH] Supabase signOut error:", err);
      }
    }
    setUser(null);
    saveSession(null);
    // Clear all potential auth data from localStorage
    localStorage.removeItem(SESSION_KEY);
    // Force a full reload to clear any remaining in-memory state/listeners
    window.location.href = "/login";
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
        active: !!newUser.active,
        last_login_at: 0,
      }).then(async () => {
        try {
          await supabase.from("user_roles").insert({
            id: crypto.randomUUID(),
            user_id: newUser.id,
            role: newUser.role,
          });
        } catch { void 0; }
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
      if (typeof updates.active === "boolean") payload.active = updates.active;
      if (typeof updates.lastLoginAt === "number") payload.last_login_at = updates.lastLoginAt;
      supabase.from("profiles").update(payload).eq("user_id", id).then(async () => {
        if (typeof updates.role === "string") {
          try {
            await supabase.from("user_roles").upsert(
              { id: crypto.randomUUID(), user_id: id, role: updates.role },
              { onConflict: "user_id" }
            );
          } catch { void 0; }
        }
      });
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
      supabase.from("user_roles").delete().eq("user_id", id);
      supabase.from("profiles").delete().eq("user_id", id);
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
