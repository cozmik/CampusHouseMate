import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { fetchProfileById, supabase } from "@housemates/shared-supabase";
import type { Profile } from "@housemates/shared-types";

interface AuthContextValue {
  sessionReady: boolean;
  user: Profile | null;
  isAdmin: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessionReady, setSessionReady] = useState(false);
  const [user, setUser] = useState<Profile | null>(null);

  const refreshProfile = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      setUser(null);
      return;
    }
    const profile = await fetchProfileById(session.user.id);
    setUser(profile);
  }, []);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      await refreshProfile();
      if (mounted) setSessionReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await refreshProfile();
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [refreshProfile]);

  const signIn = useCallback(async (email: string, password: string): Promise<string | null> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return error.message;
    await refreshProfile();
    return null;
  }, [refreshProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ sessionReady, user, isAdmin: Boolean(user?.isAdmin), refreshProfile, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
