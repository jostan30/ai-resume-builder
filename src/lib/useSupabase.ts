"use client"; // Required for Next.js App Router

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supaBaseClient";
import { User, Session } from "@supabase/supabase-js";

export const useSupabase = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Error fetching user:", error.message);
      } else {
        setUser(data?.user ?? null);
      }

      setIsLoading(false);
    };

    fetchUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session: Session | null) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return { supabase, user, isLoading };
};
