"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";

const ADMIN_STORAGE_KEY = "opportunityx_admin_session_token";
export const DEMO_ADMIN_PASSKEY = "DEMO-ADMIN-2026";
export const DEMO_ADMIN_EMAIL = "admin@opportunityx.demo";

export interface AdminAuthState {
  isAdmin: boolean;
  isLoading: boolean;
  adminUser: { email: string; role: string; signedInAt: string } | null;
  error: string | null;
  loginAsAdmin: (passkey: string) => boolean;
  loginWithAdminAccount: (email: string, pass: string) => Promise<boolean>;
  logoutAdmin: () => void;
}

export function useAdminAuth(): AdminAuthState {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminUser, setAdminUser] = useState<{ email: string; role: string; signedInAt: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Check stored admin session on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(ADMIN_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.token && parsed?.role === "demo_administrator") {
          setIsAdmin(true);
          setAdminUser(parsed);
        }
      } else if (user?.email && user.email.toLowerCase().includes("admin")) {
        // Logged in with an admin email in main auth
        const autoAdmin = {
          email: user.email,
          role: "demo_administrator",
          signedInAt: new Date().toISOString(),
          token: "auth_email_admin",
        };
        setIsAdmin(true);
        setAdminUser(autoAdmin);
        localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(autoAdmin));
      }
    } catch {
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Login via Hackathon Demo Admin Passkey
  const loginAsAdmin = useCallback((passkey: string): boolean => {
    setError(null);
    if (!passkey || passkey.trim() !== DEMO_ADMIN_PASSKEY) {
      setError("Invalid Admin Passkey. Normal public users cannot access this demo administrative interface.");
      return false;
    }

    const sessionData = {
      email: DEMO_ADMIN_EMAIL,
      role: "demo_administrator",
      signedInAt: new Date().toISOString(),
      token: `admin_token_${Date.now()}`,
    };

    try {
      localStorage.setItem(ADMIN_STORAGE_KEY, JSON.stringify(sessionData));
      setIsAdmin(true);
      setAdminUser(sessionData);
      return true;
    } catch (err: any) {
      setError("Failed to initialize admin session in browser storage: " + err.message);
      return false;
    }
  }, []);

  // Login via email/password check
  const loginWithAdminAccount = useCallback(async (email: string, pass: string): Promise<boolean> => {
    setError(null);
    const normalized = email.toLowerCase().trim();
    if (normalized === DEMO_ADMIN_EMAIL && (pass === "AdminDemo@2026" || pass === "admin123")) {
      return loginAsAdmin(DEMO_ADMIN_PASSKEY);
    }

    setError("Access denied: Invalid administrator credentials. Only authorized demo administrators may enter.");
    return false;
  }, [loginAsAdmin]);

  // Logout admin
  const logoutAdmin = useCallback(() => {
    try {
      localStorage.removeItem(ADMIN_STORAGE_KEY);
    } catch {
      // ignore
    }
    setIsAdmin(false);
    setAdminUser(null);
    setError(null);
  }, []);

  return {
    isAdmin,
    isLoading,
    adminUser,
    error,
    loginAsAdmin,
    loginWithAdminAccount,
    logoutAdmin,
  };
}
