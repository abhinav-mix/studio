
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { QuizAttempt } from '@/lib/types';
import { useUser } from '@/firebase';

const STORAGE_KEY_PREFIX = 'boardPrepPro_';
const MAX_ATTEMPTS = 10;

// This custom hook centralizes all localStorage logic.
// It ensures that we only interact with localStorage on the client side.
export function useQuizStorage() {
  const [isClient, setIsClient] = useState(false);
  const { user } = useUser(); // Get user from Firebase

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getUserCategoryKey = useCallback((category: string) => {
    if (!user) return null;
    // Use Firebase user's UID for a unique, stable key.
    return `${STORAGE_KEY_PREFIX}${user.uid}_${category}`;
  }, [user]);

  const getAttempts = useCallback((category: string): QuizAttempt[] => {
    if (!isClient || !user) return [];
    const key = getUserCategoryKey(category);
    if (!key) return [];
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return [];
    }
  }, [isClient, user, getUserCategoryKey]);

  const addAttempt = useCallback(
    (category: string, attempt: Omit<QuizAttempt, 'date'>) => {
      if (!isClient || !user) return;
      const key = getUserCategoryKey(category);
      if (!key) return;

      try {
        const attempts = getAttempts(category);
        const newAttempt: QuizAttempt = { ...attempt, date: Date.now() };
        const updatedAttempts = [newAttempt, ...attempts].slice(0, MAX_ATTEMPTS);
        window.localStorage.setItem(key, JSON.stringify(updatedAttempts));
        
        // Store latest attempt in a separate key for easy access on results page
        const latestAttemptKey = `${STORAGE_KEY_PREFIX}${user.uid}_${category}_latest`;
        window.localStorage.setItem(latestAttemptKey, JSON.stringify(newAttempt));

      } catch (error) {
        console.error('Error writing to localStorage', error);
      }
    },
    [isClient, user, getAttempts, getUserCategoryKey]
  );
  
  const getLatestAttempt = useCallback((category: string): QuizAttempt | null => {
     if (!isClient || !user) return null;
     const latestAttemptKey = `${STORAGE_KEY_PREFIX}${user.uid}_${category}_latest`;
     try {
       const item = window.localStorage.getItem(latestAttemptKey);
       return item ? JSON.parse(item) : null;
     } catch (error) {
       console.error('Error reading latest attempt from localStorage', error);
       // Fallback to old method if latest key fails
       const allAttempts = getAttempts(category);
       return allAttempts.length > 0 ? allAttempts[0] : null;
     }
  }, [isClient, user, getAttempts]);

  const getAllAttemptsForCurrentUser = useCallback((): { category: string, attempts: QuizAttempt[] }[] => {
    if (!isClient || !user) return [];
    const userPrefix = `${STORAGE_KEY_PREFIX}${user.uid}_`;
    
    try {
        const keys = Object.keys(window.localStorage)
                           .filter(key => key.startsWith(userPrefix) && !key.endsWith('_latest'));
                           
        return keys.map(key => {
            const category = key.replace(userPrefix, '');
            const item = window.localStorage.getItem(key);
            const attempts = item ? JSON.parse(item) : [];
            return { category, attempts };
        });
    } catch (error) {
        console.error('Error reading all attempts for user from localStorage', error);
        return [];
    }
  }, [isClient, user]);

  return { getAttempts, addAttempt, getLatestAttempt, getAllAttemptsForCurrentUser, isClient };
}
