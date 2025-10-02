
"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { BarChart3, LogOut, Shield, User, Star } from 'lucide-react';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

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

  const { data: userData } = useDoc<{ points: number }>(userDocRef);
  const [localPoints, setLocalPoints] = useState<number>(0);

  useEffect(() => {
    if (userData && typeof userData.points === 'number') {
      setLocalPoints(userData.points);
    }
  }, [userData]);

  useEffect(() => {
    if (!user || isAdmin) return;

    // Increment points locally every 10 seconds
    const pointInterval = setInterval(() => {
      setLocalPoints(prevPoints => (prevPoints || 0) + 1);
    }, 10000); // 10 seconds

    // Save points to Firestore every 60 seconds
    const saveInterval = setInterval(() => {
      if (userDocRef) {
        updateDoc(userDocRef, {
          points: increment(6) // 6 points per minute (1 point every 10s)
        }).catch(err => console.error("Failed to save points: ", err));
      }
    }, 60000); // 60 seconds

    return () => {
      clearInterval(pointInterval);
      clearInterval(saveInterval);
    };
  }, [user, isAdmin, userDocRef]);


  const handleLogout = async () => {
    if (auth) {
      // Before logging out, ensure the latest points are saved
      if (userDocRef && localPoints > (userData?.points || 0)) {
        const pointsToAdd = localPoints - (userData?.points || 0);
         await updateDoc(userDocRef, {
          points: increment(pointsToAdd)
        }).catch(err => console.error("Failed to save final points on logout: ", err));
      }
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
                {!isAdmin && userData && (
                  <div className="flex items-center gap-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                    <Star className="h-4 w-4 text-yellow-500"/>
                    <span>{localPoints}</span>
                  </div>
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
