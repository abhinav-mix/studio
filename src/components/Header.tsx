"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { BarChart3, LogOut, Shield, User } from 'lucide-react';
import { useEffect, useState } from 'react';

const AUTH_KEY = 'boardprep_session';

export default function Header() {
  const router = useRouter();
  const [session, setSession] = useState<{role: string, name: string} | null>(null);

  useEffect(() => {
    try {
      const storedSession = localStorage.getItem(AUTH_KEY);
      if (storedSession) {
        setSession(JSON.parse(storedSession));
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem(AUTH_KEY);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
           {session?.name && (
             <div className="flex items-center gap-2 text-sm font-medium">
                <User className="h-4 w-4"/>
                <span>{session.name}</span>
             </div>
           )}
          <nav className="flex items-center">
            {session?.role === 'admin' && (
              <Button asChild variant="ghost">
                <Link href="/admin">
                  <Shield className="h-5 w-5" />
                  <span className="ml-2 hidden sm:inline">Admin</span>
                </Link>
              </Button>
            )}
            <Button asChild variant="ghost">
              <Link href="/progress">
                <BarChart3 className="h-5 w-5" />
                <span className="ml-2 hidden sm:inline">Progress</span>
              </Link>
            </Button>
            <Button onClick={handleLogout} variant="ghost">
              <LogOut className="h-5 w-5" />
              <span className="ml-2 hidden sm:inline">Logout</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
