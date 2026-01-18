import { useState, useCallback, useEffect } from "react";

interface UseAuthRedirectReturn {
  redirectPath: string | null;
  setRedirectPath: (path: string | null) => void;
  clearRedirectPath: () => void;
  handleAuthRedirect: (currentPath?: string) => void;
}

export const useAuthRedirect = (): UseAuthRedirectReturn => {
  const [redirectPath, setRedirectPathState] = useState<string | null>(null);

  const setRedirectPath = useCallback((path: string | null) => {
    setRedirectPathState(path);

    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return;

    if (path) {
      sessionStorage.setItem('auth_redirect_path', path);
    } else {
      sessionStorage.removeItem('auth_redirect_path');
    }
  }, []);

  const clearRedirectPath = useCallback(() => {
    setRedirectPathState(null);
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return;
    sessionStorage.removeItem('auth_redirect_path');
  }, []);

  const handleAuthRedirect = useCallback(
    (currentPath?: string) => {
      if (typeof window === 'undefined') return;

      // Check if user is in a checkout flow or specific flow that needs preservation
      const checkoutPaths = ['/checkout', '/deal/', '/order', '/payment'];
      const path = currentPath || window.location.pathname;

      const isCheckoutFlow = checkoutPaths.some((checkoutPath) => path.includes(checkoutPath));

      if (isCheckoutFlow) {
        setRedirectPath(path + window.location.search);
      } else {
        // For normal auth flows, clear any existing redirect
        clearRedirectPath();
      }
    },
    [setRedirectPath, clearRedirectPath]
  );

  // Initialize from sessionStorage on first client load
  useEffect(() => {
    if (typeof window === 'undefined' || typeof sessionStorage === 'undefined') return;
    const savedPath = sessionStorage.getItem('auth_redirect_path');
    if (savedPath) setRedirectPathState(savedPath);
  }, []);

  return {
    redirectPath,
    setRedirectPath,
    clearRedirectPath,
    handleAuthRedirect,
  };
};

