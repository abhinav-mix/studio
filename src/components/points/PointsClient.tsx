
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, addDoc, serverTimestamp, where } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useMemo } from 'react';
import type { PointEntry } from '@/lib/types';
import { format } from 'date-fns';
import SpinWheel from './SpinWheel';
import RealMoneySpinWheel from './RealMoneySpinWheel'; // Import the new component

function formatTimestamp(timestamp: { seconds: number; nanoseconds: number; } | Date): string {
  let date: Date;
  if (timestamp instanceof Date) {
    date = timestamp;
  } else if (timestamp && typeof timestamp.seconds === 'number') {
    date = new Date(timestamp.seconds * 1000);
  } else {
    return 'Invalid Date';
  }
  return format(date, "PPpp"); // e.g., "Aug 17, 2023, 4:30:00 PM"
}

export default function PointsClient() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const pointsHistoryQuery = useMemoFirebase(() => {
    if (!user) return null;
    const historyRef = collection(firestore, 'users', user.uid, 'pointHistory');
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    return query(historyRef, where('timestamp', '>=', twentyFourHoursAgo), orderBy('timestamp', 'desc'));
  }, [user, firestore]);

  const { data: pointsHistory, isLoading: isPointsLoading } = useCollection<PointEntry>(pointsHistoryQuery);

  const totalPoints = useMemo(() => {
    if (!pointsHistory) return 0;
    return pointsHistory.reduce((sum, entry) => sum + entry.pointsAdded, 0);
  }, [pointsHistory]);

  const handleSpinResult = async (prizePoints: number, prizeLabel: string, isItem: boolean, cost: number) => {
    if (!user) return;
    const historyRef = collection(firestore, 'users', user.uid, 'pointHistory');

    // Deduct points for spinning
    await addDoc(historyRef, {
        pointsAdded: -cost,
        reason: prizeLabel === 'Real Money' || prizeLabel === 'Next Time' ? 'Real Money Spin Cost' : 'Spin Wheel Cost',
        timestamp: serverTimestamp(),
    });

    if (isItem) {
        // Log the item win
        await addDoc(historyRef, {
            pointsAdded: 0,
            reason: `Spin Wheel Prize: Won a ${prizeLabel}!`,
            timestamp: serverTimestamp(),
        });
    } else if (prizePoints > 0) {
        // Add prize points
        await addDoc(historyRef, {
            pointsAdded: prizePoints,
            reason: `Spin Wheel Prize: ${prizePoints} points`,
            timestamp: serverTimestamp(),
        });
    }
  };


  if (isUserLoading || isPointsLoading) {
    return <div className="container py-12 text-center">Loading Points History...</div>;
  }

  if (!user) {
    return <div className="container py-12 text-center">Please log in to see your points.</div>;
  }

  return (
    <div className="container py-8 md:py-12">
       <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold font-headline">My Points</CardTitle>
          <CardDescription>You have earned a total of <span className="font-bold text-primary">{totalPoints}</span> points in the last 24 hours.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 lg:grid-cols-2">
            <SpinWheel currentPoints={totalPoints} onSpinComplete={(prize, label, isItem) => handleSpinResult(prize, label, isItem, 500)} />
            <RealMoneySpinWheel currentPoints={totalPoints} onSpinComplete={(prize, label, isItem) => handleSpinResult(prize, label, isItem, 10000)} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-xl font-bold">Points History (Last 24 Hours)</h3>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pointsHistory && pointsHistory.length > 0 ? (
                  pointsHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatTimestamp(entry.timestamp)}</TableCell>
                      <TableCell>{entry.reason}</TableCell>
                      <TableCell className={`text-right font-medium ${entry.pointsAdded > 0 ? 'text-green-500' : (entry.pointsAdded < 0 ? 'text-red-500' : 'text-muted-foreground')}`}>
                        {entry.pointsAdded > 0 ? `+${entry.pointsAdded}` : entry.pointsAdded}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      You haven't earned any points in the last 24 hours.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
