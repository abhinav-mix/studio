
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useMemo, useState } from 'react';
import type { PointEntry } from '@/lib/types';
import { format } from 'date-fns';

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
    return query(historyRef, orderBy('timestamp', 'desc'));
  }, [user, firestore]);

  const { data: pointsHistory, isLoading: isPointsLoading } = useCollection<PointEntry>(pointsHistoryQuery);

  const totalPoints = useMemo(() => {
    if (!pointsHistory) return 0;
    return pointsHistory.reduce((sum, entry) => sum + entry.pointsAdded, 0);
  }, [pointsHistory]);

  if (isUserLoading || isPointsLoading) {
    return <div className="container py-12 text-center">Loading Points History...</div>;
  }

  if (!user) {
    return <div className="container py-12 text-center">Please log in to see your points.</div>;
  }

  return (
    <div className="container py-8 md:py-12">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl md:text-4xl font-bold font-headline">My Points</CardTitle>
          <CardDescription>You have earned a total of <span className="font-bold text-primary">{totalPoints}</span> points.</CardDescription>
        </CardHeader>
        <CardContent>
          <h3 className="text-xl font-bold mb-4">Points History</h3>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Points Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pointsHistory && pointsHistory.length > 0 ? (
                  pointsHistory.map((entry) => (
                    <TableRow key={entry.id}>
                      <TableCell>{formatTimestamp(entry.timestamp)}</TableCell>
                      <TableCell>{entry.reason}</TableCell>
                      <TableCell className="text-right font-medium text-green-500">+{entry.pointsAdded}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">
                      You haven't earned any points yet.
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
