"use client";

import { useState, useEffect, useCallback } from 'react';
import type { QuizAttempt, UserAnswer } from '@/lib/types';

const STORAGE_KEY_PREFIX = 'boardPrepPro_';
const MAX_ATTEMPTS = 10;

// This custom hook centralizes all localStorage logic.
// It ensures that we only interact with localStorage on the client side.
export function useQuizStorage() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const getAttempts = useCallback((category: string): QuizAttempt[] => {
    if (!isClient) return [];
    try {
      const item = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${category}`);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return [];
    }
  }, [isClient]);

  const addAttempt = useCallback(
    (category: string, attempt: Omit<QuizAttempt, 'date'>) => {
      if (!isClient) return;
      try {
        const attempts = getAttempts(category);
        const newAttempt: QuizAttempt = { ...attempt, date: Date.now() };
        const updatedAttempts = [newAttempt, ...attempts].slice(0, MAX_ATTEMPTS);
        window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${category}`, JSON.stringify(updatedAttempts));
      } catch (error) {
        console.error('Error writing to localStorage', error);
      }
    },
    [isClient, getAttempts]
  );
  
  const getLatestAttempt = useCallback((category: string): QuizAttempt | null => {
     const allAttempts = getAttempts(category);
     return allAttempts.length > 0 ? allAttempts[0] : null;
  }, [getAttempts]);

  const getAllAttempts = useCallback((): { category: string, attempts: QuizAttempt[] }[] => {
    if (!isClient) return [];
    try {
        const keys = Object.keys(window.localStorage).filter(key => key.startsWith(STORAGE_KEY_PREFIX));
        return keys.map(key => {
            const category = key.replace(STORAGE_KEY_PREFIX, '');
            return { category, attempts: getAttempts(category) };
        });
    } catch (error) {
        console.error('Error reading all attempts from localStorage', error);
        return [];
    }
  }, [isClient, getAttempts]);

  return { getAttempts, addAttempt, getLatestAttempt, getAllAttempts, isClient };
}
