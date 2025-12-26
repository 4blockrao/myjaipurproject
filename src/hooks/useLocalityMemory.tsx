import { useState, useEffect } from 'react';

const STORAGE_KEY = 'jaipur-circle-recent-localities';
const MAX_RECENT = 4;

interface RecentLocality {
  name: string;
  slug: string;
  visitedAt: number;
}

export function useLocalityMemory() {
  const [recentLocalities, setRecentLocalities] = useState<RecentLocality[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as RecentLocality[];
        setRecentLocalities(parsed);
      }
    } catch (e) {
      console.error('Failed to load recent localities:', e);
    }
  }, []);

  // Add a locality to recent history
  const addRecentLocality = (name: string, slug: string) => {
    setRecentLocalities(prev => {
      // Remove if already exists
      const filtered = prev.filter(l => l.slug !== slug);
      
      // Add to front
      const updated = [
        { name, slug, visitedAt: Date.now() },
        ...filtered
      ].slice(0, MAX_RECENT);
      
      // Persist to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save recent localities:', e);
      }
      
      return updated;
    });
  };

  // Clear all recent localities
  const clearRecentLocalities = () => {
    setRecentLocalities([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed to clear recent localities:', e);
    }
  };

  return {
    recentLocalities,
    addRecentLocality,
    clearRecentLocalities,
  };
}
