import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'jaipur-circle-user-locality';

export interface UserLocality {
  name: string;
  slug: string;
  setAt: number;
}

export function useUserLocality() {
  const [userLocality, setUserLocalityState] = useState<UserLocality | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as UserLocality;
        setUserLocalityState(parsed);
      }
    } catch (e) {
      console.error('Failed to load user locality:', e);
    }
    setIsLoaded(true);
  }, []);

  // Set user locality and persist
  const setUserLocality = useCallback((name: string, slug: string) => {
    const locality: UserLocality = { name, slug, setAt: Date.now() };
    setUserLocalityState(locality);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(locality));
    } catch (e) {
      console.error('Failed to save user locality:', e);
    }
  }, []);

  // Clear user locality
  const clearUserLocality = useCallback(() => {
    setUserLocalityState(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear user locality:', e);
    }
  }, []);

  // Check if locality prompt should be shown
  const shouldPromptLocality = isLoaded && !userLocality;

  return {
    userLocality,
    setUserLocality,
    clearUserLocality,
    shouldPromptLocality,
    isLoaded,
  };
}
