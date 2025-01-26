'use client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

export default function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN') router.push('/assessment');
        if (event === 'SIGNED_OUT') router.push('/login');
      }
    );
    return () => subscription.unsubscribe();
  }, [router, supabase]);

  return children;
}