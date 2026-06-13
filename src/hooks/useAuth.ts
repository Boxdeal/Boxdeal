"use client";

import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { authService } from "@/services/auth";

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
}

export function useAuth(): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data, error } = await authService.getUser();
        if (error) {
          setUser(null);
          return;
        }
        setUser(data?.user ?? null);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, []);

  return {
    user,
    loading,
    isAuthenticated: user !== null,
  };
}
