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
  login: (
    email: string,
    password: string
  ) => {
    ok: boolean;
    code: string;
    message: string;
    user?: AppUser;
    backend: "supabase" | "local";
  };
  logout: () => void;
  addUser: (user: Omit<AppUser, "id">) => Promise<{ ok: boolean; message?: string }>;
  updateUser: (id: string, updates: Partial<AppUser>) => void;
  removeUser: (id: string) => void;
  changePassword: (id: string, oldPass: string, newPass: string) => boolean;
  reloadUsers: () => Promise<void>;
};

const USERS_KEY = "qms_users";
const SESSION_KEY = "qms_session";

const apiBase =
  (import.meta as unknown as { env?: Record<string, unknown> }).env?.DEV
    ? "http://localhost:3001"
    : "";

async function apiFetch<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
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
  } catch {
    void 0;
  }
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

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialLocal = (() => {
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
      saveUsersLocal([seeded]);
      return [seeded];
    }
    return existing;
  })();

  const [users, setUsers] = React.useState<AppUser[]>(initialLocal);
  const [user, setUser] = React.useState<AppUser | null>(null);
  const [supabaseDisabled, setSupabaseDisabled] = React.useState(false);

  // 1) Bootstrap users (Supabase -> /api/users -> localStorage)
  React.useEffect(() => {
    const bootstrap = async () => {
      // Prefer Supabase unless disabled
      if (supabase && !supabaseDisabled) {
        const selectOnce = async () => {
          const { data, error } = await supabase.from("profiles").select("*");
          return { rows: Array.isArray(data) ? data : [], error };
        };

        let { rows, error } = await selectOnce();

        // If select fails, disable supabase and fall back
        if (error) {
          console.error("Supabase select failed:", error.message);
          setSupabaseDisabled(true);
        } else {
          // ensure admin exists
          const hasAdmin = rows.some((r) => String(r.email).toLowerCase() === "admin@local");
          if (!hasAdmin) {
            const adminId = crypto.randomUUID();
            const { error: insertErr } = await supabase.from("profiles").insert({
              id: adminId,
              name: "admin",
              email: "admin@local",
              password: "admin",
              role: "admin",
              active: true,
              last_login_at: 0,
            });

            if (!insertErr) {
              const res2 = await selectOnce();
              rows = res2.rows;
            }
          }

          const mapped = rows.map((r: ProfileRow) => ({
            id: r.id,
            name: r.name,
            email: r.email,
            password: r.password || "",
            role: (r.role || "user") as Role,
            active: !!r.active,
            lastLoginAt: r.last_login_at || 0,
            needsApprovalNotification: false,
          })) as AppUser[];

          // Safety: if mapped doesn't contain admin, add it locally (won't break UI)
          if (!mapped.some((u) => u.email.toLowerCase() === "admin@local")) {
            mapped.push({
              id: crypto.randomUUID(),
              name: "admin",
              email: "admin@local",
              password: "admin",
              role: "admin",
              active: true,
              lastLoginAt: 0,
            });
          }

          setUsers(mapped);
          return;
        }
      }

      // Fallback: /api/users then localStorage
      try {
        const existing = await apiFetch<AppUser[]>("/api/users");
        const hasAdmin = existing.some((u) => u.email.toLowerCase() === "admin@local");

        if (!hasAdmin) {
          const admin: Omit<AppUser, "id"> = {
            name: "admin",
            email: "admin@local",
            password: "admin",
            role: "admin",
            active: true,
            lastLoginAt: 0,
            needsApprovalNotification: false,
          };

          try {
            const created = await apiFetch<AppUser>("/api/users", {
              method: "POST",
              body: JSON.stringify(admin),
            });
            setUsers([...existing, created]);
            return;
          } catch {
            const seeded: AppUser = { ...admin, id: crypto.randomUUID() };
            const merged = [...existing, seeded];
            saveUsersLocal(merged);
            setUsers(merged);
            return;
          }
        }

        setUsers(existing);
        return;
      } catch {
        const existing = loadUsersLocal();
        let list = existing;

        const hasAdmin = existing.some((u) => u.email.toLowerCase() === "admin@local");
        if (!hasAdmin) {
          list = [
            ...existing,
            {
              id: crypto.randomUUID(),
              name: "admin",
              email: "admin@local",
              password: "admin",
              role: "admin",
              active: true,
              lastLoginAt: 0,
            },
          ];
          saveUsersLocal(list);
        }

        setUsers(list);
      }
    };

    bootstrap();
  }, [supabaseDisabled]);

  // 2) Keep `user` synced with session whenever `users` changes
  React.useEffect(() => {
    const userId = loadSession();
    if (!userId) {
      setUser(null);
      return;
    }
    setUser(users.find((x) => x.id === userId) || null);
  }, [users]);

  // 3) Sync session across tabs
  React.useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === SESSION_KEY) {
        const currentId = loadSession();
        setUser(currentId ? users.find((x) => x.id === currentId) || null : null);
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [users]);

  const login = React.useCallback(
    (email: string, password: string) => {
      const backend: "supabase" | "local" =
        supabase && !supabaseDisabled ? "supabase" : "local";

      if (!email.trim())
        return { ok: false, code: "email_empty", message: "البريد الإلكتروني فارغ", backend };

      if (!password.trim())
        return { ok: false, code: "password_empty", message: "كلمة المرور فارغة", backend };

      const found = users.find((x) => x.email.toLowerCase() === email.toLowerCase());
      if (!found) return { ok: false, code: "not_found", message: "الحساب غير موجود", backend };

      if (found.password !== password)
        return { ok: false, code: "wrong_password", message: "كلمة المرور غير صحيحة", backend };

      const updated = users.map((x) => {
        if (x.id !== found.id) return x;

        const approvalJustGranted = !!x.needsApprovalNotification;
        if (approvalJustGranted) {
          try {
            localStorage.setItem(`approval_just_granted:${x.email}`, "true");
          } catch {
            void 0;
          }
        }

        return { ...x, lastLoginAt: Date.now(), needsApprovalNotification: false };
      });

      setUsers(updated);

      if (!supabase || supabaseDisabled) {
        saveUsersLocal(updated);
      } else {
        supabase
          .from("profiles")
          .update({ last_login_at: Date.now() })
          .eq("id", found.id)
          .then(() => void 0)
          .catch(() => void 0);
      }

      setUser(found);
      saveSession(found.id);

      return { ok: true, code: "ok", message: "تم تسجيل الدخول", user: found, backend };
    },
    [users, supabaseDisabled]
  );

  const logout = React.useCallback(() => {
    setUser(null);
    saveSession(null);
  }, []);

  const addUser = React.useCallback(
    async (userInput: Omit<AppUser, "id">) => {
      const newUser: AppUser = { ...userInput, id: crypto.randomUUID() };

      // 1) Try Supabase
      if (supabase && !supabaseDisabled) {
        const { error } = await supabase.from("profiles").insert({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          password: newUser.password,
          role: newUser.role,
          active: newUser.active,
          last_login_at: newUser.lastLoginAt || 0,
        });

        if (!error) {
          setUsers((prev) => [...prev, newUser]);
          return { ok: true };
        }

        console.error("Failed to create user in Supabase:", error.message);
        setSupabaseDisabled(true);

        // 2) Fallback to local server API
        try {
          const created = await apiFetch<AppUser>("/api/users", {
            method: "POST",
            body: JSON.stringify(newUser),
          });
          setUsers((prev) => [...prev, created]);
          return { ok: true, message: "تم إنشاء الحساب عبر الخادم المحلي لأن Supabase رفض العملية." };
        } catch (apiError) {
          console.error("Fallback /api/users create failed:", apiError);
          // 3) Final fallback: localStorage
          const updatedLocal = [...users, newUser];
          setUsers(updatedLocal);
          saveUsersLocal(updatedLocal);
          return { ok: true, message: "تم إنشاء الحساب محلياً على هذا المتصفح." };
        }
      }

      // No Supabase (or disabled) -> localStorage
      const updated = [...users, newUser];
      setUsers(updated);
      saveUsersLocal(updated);
      return { ok: true, message: "تم إنشاء الحساب محلياً على هذا المتصفح." };
    },
    [users, supabaseDisabled]
  );

  const updateUser = React.useCallback(
    (id: string, updates: Partial<AppUser>) => {
      const updated = users.map((u) => (u.id === id ? { ...u, ...updates } : u));
      setUsers(updated);

      if (!supabase || supabaseDisabled) {
        saveUsersLocal(updated);
      } else {
        supabase
          .from("profiles")
          .update({
            name: updates.name,
            email: updates.email,
            password: updates.password,
            role: updates.role,
            active: updates.active,
            last_login_at: updates.lastLoginAt,
          })
          .eq("id", id)
          .then(() => void 0)
          .catch(() => void 0);
      }

      if (user && user.id === id) {
        setUser({ ...user, ...updates });
      }
    },
    [users, user, supabaseDisabled]
  );

  const removeUser = React.useCallback(
    (id: string) => {
      const updated = users.filter((u) => u.id !== id);
      setUsers(updated);

      if (!supabase || supabaseDisabled) {
        saveUsersLocal(updated);
      } else {
        supabase
          .from("profiles")
          .delete()
          .eq("id", id)
          .then(() => void 0)
          .catch(() => void 0);
      }

      if (user && user.id === id) {
        setUser(null);
        saveSession(null);
      }
    },
    [users, user, supabaseDisabled]
  );

  const reloadUsers = React.useCallback(async () => {
    if (supabase && !supabaseDisabled) {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error) {
        console.error("reloadUsers supabase error:", error.message);
        setSupabaseDisabled(true);
        setUsers(loadUsersLocal());
        return;
      }
      const rows = Array.isArray(data) ? data : [];
      const mapped = rows.map((r: ProfileRow) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        password: r.password || "",
        role: (r.role || "user") as Role,
        active: !!r.active,
        lastLoginAt: r.last_login_at || 0,
        needsApprovalNotification: false,
      })) as AppUser[];
      setUsers(mapped);
      return;
    }

    // local server -> localStorage fallback
    try {
      const existing = await apiFetch<AppUser[]>("/api/users");
      setUsers(existing);
    } catch {
      setUsers(loadUsersLocal());
    }
  }, [supabaseDisabled]);

  const value: AuthContextValue = {
    user,
    users,
    login,
    logout,
    addUser,
    updateUser,
    removeUser,
    changePassword: (id, oldPass, newPass) => {
      const u = users.find((x) => x.id === id);
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
