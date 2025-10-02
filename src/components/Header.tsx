
"use client";

import { useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { BarChart3, LogOut, Shield, User, Star, ClipboardCheck, MoreVertical } from 'lucide-react';
import { useAuth, useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Header() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { user } = useUser();
  const isAdmin = user && user.email === 'bhainew124@gmail.com';

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              {(user?.displayName || user?.email) && (
                <>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none flex items-center gap-2"><User className="h-4 w-4 text-muted-foreground"/>{user.displayName || user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                </>
              )}
               {!isAdmin && pointHistoryData !== null && (
                 <DropdownMenuItem asChild>
                    <Link href="/points" className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                           <Star className="h-4 w-4 text-yellow-500"/>
                           <span>Points</span>
                        </div>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full text-xs font-bold">{totalPoints}</span>
                    </Link>
                 </DropdownMenuItem>
               )}
              {isAdmin && (
                <DropdownMenuItem asChild>
                  <Link href="/admin"><Shield className="mr-2 h-4 w-4"/>Admin Panel</Link>
                </DropdownMenuItem>
              )}
               {!isAdmin && (
                 <DropdownMenuItem asChild>
                  <Link href="/review"><ClipboardCheck className="mr-2 h-4 w-4"/>Review</Link>
                </DropdownMenuItem>
               )}
              <DropdownMenuItem asChild>
                <Link href="/progress"><BarChart3 className="mr-2 h-4 w-4"/>Progress</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-500 focus:text-red-500">
                <LogOut className="mr-2 h-4 w-4"/>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
