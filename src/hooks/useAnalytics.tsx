import { useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Generate unique session ID
const getOrCreateSessionId = (): string => {
  const key = 'jc_session_id';
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
};

// Parse user agent for device info
const parseUserAgent = () => {
  const ua = navigator.userAgent;
  
  // Device type
  let deviceType = 'desktop';
  if (/Mobi|Android/i.test(ua)) deviceType = 'mobile';
  else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet';
  
  // Browser
  let browser = 'unknown';
  let browserVersion = '';
  if (ua.includes('Firefox')) {
    browser = 'Firefox';
    browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Chrome') && !ua.includes('Edg')) {
    browser = 'Chrome';
    browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
    browser = 'Safari';
    browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Edg')) {
    browser = 'Edge';
    browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || '';
  }
  
  // OS
  let os = 'unknown';
  let osVersion = '';
  if (ua.includes('Windows')) {
    os = 'Windows';
    osVersion = ua.match(/Windows NT ([\d.]+)/)?.[1] || '';
  } else if (ua.includes('Mac OS')) {
    os = 'macOS';
    osVersion = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '';
  } else if (ua.includes('Android')) {
    os = 'Android';
    osVersion = ua.match(/Android ([\d.]+)/)?.[1] || '';
  } else if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) {
    os = 'iOS';
    osVersion = ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '';
  } else if (ua.includes('Linux')) {
    os = 'Linux';
  }
  
  return { deviceType, browser, browserVersion, os, osVersion };
};

// Parse UTM params from URL
const parseUtmParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get('utm_source') || undefined,
    utm_medium: params.get('utm_medium') || undefined,
    utm_campaign: params.get('utm_campaign') || undefined,
    utm_term: params.get('utm_term') || undefined,
    utm_content: params.get('utm_content') || undefined,
  };
};

// Fetch geolocation from IP
const fetchGeoLocation = async (): Promise<{
  ip: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
} | null> => {
  try {
    // Using ip-api.com (free, no API key needed for basic usage)
    const response = await fetch('https://ip-api.com/json/?fields=status,message,country,regionName,city,lat,lon,query');
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status !== 'success') return null;
    return {
      ip: data.query,
      city: data.city,
      state: data.regionName,
      country: data.country,
      latitude: data.lat,
      longitude: data.lon,
    };
  } catch {
    return null;
  }
};

export const useAnalytics = () => {
  const location = useLocation();
  const { user } = useAuth();
  const sessionId = useRef(getOrCreateSessionId());
  const isInitialized = useRef(false);
  const pageStartTime = useRef(Date.now());

  // Initialize session on first load
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    const initSession = async () => {
      const { deviceType, browser, browserVersion, os, osVersion } = parseUserAgent();
      const utmParams = parseUtmParams();
      const geo = await fetchGeoLocation();

      try {
        await supabase.from('visitor_sessions').upsert({
          session_id: sessionId.current,
          ip_address: geo?.ip,
          city: geo?.city,
          state: geo?.state,
          country: geo?.country,
          latitude: geo?.latitude,
          longitude: geo?.longitude,
          device_type: deviceType,
          browser,
          browser_version: browserVersion,
          os,
          os_version: osVersion,
          screen_width: window.screen.width,
          screen_height: window.screen.height,
          user_agent: navigator.userAgent,
          referrer: document.referrer || undefined,
          landing_page: window.location.pathname,
          user_id: user?.id,
          ...utmParams,
        }, { onConflict: 'session_id' });
      } catch (error) {
        console.error('Failed to initialize session:', error);
      }
    };

    initSession();
  }, [user?.id]);

  // Track page views
  useEffect(() => {
    const trackPageView = async () => {
      const timeOnPreviousPage = Math.floor((Date.now() - pageStartTime.current) / 1000);
      pageStartTime.current = Date.now();

      try {
        // Insert page view
        await supabase.from('page_views').insert({
          session_id: sessionId.current,
          page_url: location.pathname + location.search,
          page_title: document.title,
          referrer_url: document.referrer || undefined,
          user_id: user?.id,
        });

        // Update session stats
        await supabase.from('visitor_sessions')
          .update({
            total_page_views: supabase.rpc ? undefined : undefined, // Will use increment
            last_activity_at: new Date().toISOString(),
            user_id: user?.id,
          })
          .eq('session_id', sessionId.current);
      } catch (error) {
        console.error('Failed to track page view:', error);
      }
    };

    trackPageView();
  }, [location.pathname, user?.id]);

  // Track clicks
  const trackClick = useCallback(async (
    elementType: string,
    elementText?: string,
    elementId?: string,
    targetUrl?: string
  ) => {
    try {
      await supabase.from('click_events').insert({
        session_id: sessionId.current,
        page_url: window.location.pathname,
        element_type: elementType,
        element_text: elementText?.substring(0, 200),
        element_id: elementId,
        target_url: targetUrl,
        user_id: user?.id,
      });
    } catch (error) {
      console.error('Failed to track click:', error);
    }
  }, [user?.id]);

  // Track search
  const trackSearch = useCallback(async (
    query: string,
    searchType: string,
    resultsCount?: number
  ) => {
    try {
      await supabase.from('search_queries').insert({
        session_id: sessionId.current,
        search_query: query,
        search_type: searchType,
        results_count: resultsCount,
        user_id: user?.id,
      });
    } catch (error) {
      console.error('Failed to track search:', error);
    }
  }, [user?.id]);

  // Mark session as converted (user signed up)
  const markConverted = useCallback(async () => {
    try {
      await supabase.from('visitor_sessions')
        .update({ is_converted: true, user_id: user?.id })
        .eq('session_id', sessionId.current);
    } catch (error) {
      console.error('Failed to mark conversion:', error);
    }
  }, [user?.id]);

  return {
    sessionId: sessionId.current,
    trackClick,
    trackSearch,
    markConverted,
  };
};

export default useAnalytics;
