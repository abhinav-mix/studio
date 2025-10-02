
"use client";

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { BarChart3, LogOut, Shield, User, Star, ClipboardCheck } from 'lucide-react';
import { useAuth, useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, query, orderBy, getDocs } from 'firebase/firestore';

export default function Header() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useUser();
  const isAdmin = user && user.email === 'bhainew124@gmail.com';

  const userDocRef = useMemoFirebase(() => {
    if (!user || isAdmin) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, isAdmin, firestore]);
  
  const pointHistoryRef = useMemoFirebase(() => {
      if (!user || isAdmin) return null;
      return collection(firestore, 'users', user.uid, 'pointHistory');
  }, [user, isAdmin, firestore]);

  const { data: pointHistoryData } = useCollection<{ pointsAdded: number }>(pointHistoryRef);

  const totalPoints = useMemo(() => {
    if (!pointHistoryData) return 0;
    return pointHistoryData.reduce((sum, entry) => sum + entry.pointsAdded, 0);
  }, [pointHistoryData]);


  useEffect(() => {
    if (!user || isAdmin) return;

    // Award points for being active every 60 seconds
    const interval = setInterval(() => {
      if (pointHistoryRef) {
        addDoc(pointHistoryRef, {
          pointsAdded: 1, // Award 1 point per minute
          reason: 'Active Time',
          timestamp: serverTimestamp(),
        }).catch(err => console.error("Failed to save points: ", err));
      }
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [user, isAdmin, pointHistoryRef]);


  const handleLogout = async () => {
    if (auth) {
      await auth.signOut();
    }
    router.push('/');
  };


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Logo />
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
           {(user?.displayName || user?.email) && (
             <div className="flex items-center gap-4 text-sm font-medium">
                {!isAdmin && pointHistoryData !== null && (
                  <Button asChild variant="ghost" className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full hover:bg-yellow-200">
                    <Link href="/points">
                      <Star className="h-4 w-4 text-yellow-500"/>
                      <span>{totalPoints}</span>
                    </Link>
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4"/>
                  <span>{user.displayName || user.email}</span>
                </div>
             </div>
           )}
          <nav className="flex items-center">
            {isAdmin && (
              <Button asChild variant="ghost">
                <Link href="/admin">
                  <Shield className="h-5 w-5" />
                  <span className="ml-2 hidden sm:inline">Admin</span>
                </Link>
              </Button>
            )}
            {!isAdmin && (
               <Button asChild variant="ghost">
                <Link href="/review">
                  <ClipboardCheck className="h-5 w-5" />
                  <span className="ml-2 hidden sm:inline">Review</span>
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
