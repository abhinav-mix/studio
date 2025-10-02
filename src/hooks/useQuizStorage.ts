
"use client";

import { useState, useEffect, useCallback } from 'react';
import type { QuizAttempt } from '@/lib/types';

const STORAGE_KEY_PREFIX = 'boardPrepPro_';
const AUTH_KEY = 'boardprep_session';
const MAX_ATTEMPTS = 10;

// This custom hook centralizes all localStorage logic.
// It ensures that we only interact with localStorage on the client side.
export function useQuizStorage() {
  const [isClient, setIsClient] = useState(false);
  const [currentUserName, setCurrentUserName] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    try {
      const session = window.localStorage.getItem(AUTH_KEY);
      if (session) {
        const { name, role } = JSON.parse(session);
        // Only store progress for members, not admin
        if (role === 'member') {
          setCurrentUserName(name);
        }
      }
    } catch (error) {
      console.error('Error reading session from localStorage', error);
    }
  }, []);

  const getUserCategoryKey = useCallback((category: string) => {
    if (!currentUserName) return null;
    // Sanitize user name for key: replace spaces and make lowercase
    const sanitizedName = currentUserName.trim().toLowerCase().replace(/\s+/g, '_');
    return `${STORAGE_KEY_PREFIX}${sanitizedName}_${category}`;
  }, [currentUserName]);

  const getAttempts = useCallback((category: string): QuizAttempt[] => {
    if (!isClient || !currentUserName) return [];
    const key = getUserCategoryKey(category);
    if (!key) return [];
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : [];
    } catch (error) {
      console.error('Error reading from localStorage', error);
      return [];
    }
  }, [isClient, currentUserName, getUserCategoryKey]);

  const addAttempt = useCallback(
    (category: string, attempt: Omit<QuizAttempt, 'date'>) => {
      if (!isClient || !currentUserName) return;
      const key = getUserCategoryKey(category);
      if (!key) return;

      try {
        const attempts = getAttempts(category);
        const newAttempt: QuizAttempt = { ...attempt, date: Date.now() };
        const updatedAttempts = [newAttempt, ...attempts].slice(0, MAX_ATTEMPTS);
        window.localStorage.setItem(key, JSON.stringify(updatedAttempts));
      } catch (error) {
        console.error('Error writing to localStorage', error);
      }
    },
    [isClient, currentUserName, getAttempts, getUserCategoryKey]
  );
  
  const getLatestAttempt = useCallback((category: string): QuizAttempt | null => {
     const allAttempts = getAttempts(category);
     return allAttempts.length > 0 ? allAttempts[0] : null;
  }, [getAttempts]);

  const getAllAttemptsForCurrentUser = useCallback((): { category: string, attempts: QuizAttempt[] }[] => {
    if (!isClient || !currentUserName) return [];
    const sanitizedName = currentUserName.trim().toLowerCase().replace(/\s+/g, '_');
    const userPrefix = `${STORAGE_KEY_PREFIX}${sanitizedName}_`;
    
    try {
        const keys = Object.keys(window.localStorage).filter(key => key.startsWith(userPrefix));
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
  }, [isClient, currentUserName]);

  return { getAttempts, addAttempt, getLatestAttempt, getAllAttemptsForCurrentUser, isClient };
}
