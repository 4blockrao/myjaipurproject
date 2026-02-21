import { createContext, useContext, useEffect, useCallback, useRef, ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface AnalyticsContextType {
  sessionId: string;
  trackClick: (elementType: string, elementText?: string, elementId?: string, targetUrl?: string) => void;
  trackSearch: (query: string, searchType: string, resultsCount?: number) => void;
  markConverted: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | null>(null);

// Generate unique session ID (per-tab via sessionStorage)
const getOrCreateSessionId = (): string => {
  const key = "jc_session_id";
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

  let deviceType = "desktop";
  if (/Mobi|Android/i.test(ua)) deviceType = "mobile";
  else if (/Tablet|iPad/i.test(ua)) deviceType = "tablet";

  let browser = "unknown";
  let browserVersion = "";
  if (ua.includes("Firefox")) {
    browser = "Firefox";
    browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || "";
  } else if (ua.includes("Chrome") && !ua.includes("Edg")) {
    browser = "Chrome";
    browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || "";
  } else if (ua.includes("Safari") && !ua.includes("Chrome")) {
    browser = "Safari";
    browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || "";
  } else if (ua.includes("Edg")) {
    browser = "Edge";
    browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || "";
  }

  let os = "unknown";
  let osVersion = "";
  if (ua.includes("Windows")) {
    os = "Windows";
    osVersion = ua.match(/Windows NT ([\d.]+)/)?.[1] || "";
  } else if (ua.includes("Mac OS")) {
    os = "macOS";
    osVersion = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, ".") || "";
  } else if (ua.includes("Android")) {
    os = "Android";
    osVersion = ua.match(/Android ([\d.]+)/)?.[1] || "";
  } else if (ua.includes("iOS") || ua.includes("iPhone") || ua.includes("iPad")) {
    os = "iOS";
    osVersion = ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, ".") || "";
  } else if (ua.includes("Linux")) {
    os = "Linux";
  }

  return { deviceType, browser, browserVersion, os, osVersion };
};

// Parse UTM params from URL
const parseUtmParams = () => {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source") || undefined,
    utm_medium: params.get("utm_medium") || undefined,
    utm_campaign: params.get("utm_campaign") || undefined,
    utm_term: params.get("utm_term") || undefined,
    utm_content: params.get("utm_content") || undefined,
  };
};

// Fetch geolocation from IP (best-effort)
const fetchGeoLocation = async () => {
  try {
    const response = await fetch(
      "https://ip-api.com/json/?fields=status,message,country,regionName,city,lat,lon,query"
    );
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status !== "success") return null;
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

export const AnalyticsProvider = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const { user } = useAuth();

  const sessionId = useRef(getOrCreateSessionId());

  // Prevent duplicate init in strict-mode / re-renders
  const initOnceRef = useRef(false);
  const initInFlightRef = useRef<Promise<void> | null>(null);

  const pageStartTime = useRef(Date.now());

  // Initialize visitor session (upsert-safe)
  useEffect(() => {
    if (initOnceRef.current) return;

    // If init is already running, don't start a second one
    if (initInFlightRef.current) return;

    initInFlightRef.current = (async () => {
      try {
        const { deviceType, browser, browserVersion, os, osVersion } = parseUserAgent();
        const utmParams = parseUtmParams();

        // UPSERT prevents duplicate-key crashes
        const { error } = await supabase
          .from("visitor_sessions")
          .upsert(
            {
              session_id: sessionId.current,
              device_type: deviceType,
              browser,
              browser_version: browserVersion,
              os,
              os_version: osVersion,
              screen_width: window.screen.width,
              screen_height: window.screen.height,
              user_agent: navigator.userAgent,
              referrer: document.referrer || null,
              landing_page: window.location.pathname,
              user_id: user?.id || null,
              utm_source: utmParams.utm_source || null,
              utm_medium: utmParams.utm_medium || null,
              utm_campaign: utmParams.utm_campaign || null,
              utm_term: utmParams.utm_term || null,
              utm_content: utmParams.utm_content || null,
              last_activity_at: new Date().toISOString(),
            },
            { onConflict: "session_id" }
          );

        if (error) {
          console.error("Failed to initialize analytics session:", error);
        } else {
          // Geo update is best-effort + non-blocking
          fetchGeoLocation().then(async (geo) => {
            if (!geo) return;
            const { error: geoErr } = await supabase
              .from("visitor_sessions")
              .update({
                ip_address: geo.ip,
                city: geo.city,
                state: geo.state,
                country: geo.country,
                latitude: geo.latitude,
                longitude: geo.longitude,
              })
              .eq("session_id", sessionId.current);

            if (geoErr) console.warn("Failed to update geo info:", geoErr);
          });
        }
      } catch (e) {
        console.error("Failed to initialize session:", e);
      } finally {
        initOnceRef.current = true;
        initInFlightRef.current = null;
      }
    })();
  }, [user?.id]);

  // Track page views on route change
  useEffect(() => {
    const trackPageView = async () => {
      pageStartTime.current = Date.now();

      try {
        const { error } = await supabase.from("page_views").insert({
          session_id: sessionId.current,
          page_url: location.pathname + location.search,
          page_title: document.title,
          referrer_url: document.referrer || undefined,
          user_id: user?.id,
        });

        if (error) console.error("Failed to track page view:", error);

        // Update last activity (best effort)
        const { error: sessErr } = await supabase
          .from("visitor_sessions")
          .update({
            last_activity_at: new Date().toISOString(),
            user_id: user?.id || null,
          })
          .eq("session_id", sessionId.current);

        if (sessErr) console.warn("Failed to update session last_activity:", sessErr);
      } catch (e) {
        console.error("Failed to track page view:", e);
      }
    };

    trackPageView();
  }, [location.pathname, location.search, user?.id]);

  // Track clicks
  const trackClick = useCallback(
    (elementType: string, elementText?: string, elementId?: string, targetUrl?: string) => {
      supabase
        .from("click_events")
        .insert({
          session_id: sessionId.current,
          page_url: window.location.pathname,
          element_type: elementType,
          element_text: elementText?.substring(0, 200),
          element_id: elementId,
          target_url: targetUrl,
          user_id: user?.id,
        })
        .then(({ error }) => {
          if (error) console.error("Failed to track click:", error);
        });
    },
    [user?.id]
  );

  // Track search
  const trackSearch = useCallback(
    (query: string, searchType: string, resultsCount?: number) => {
      supabase
        .from("search_queries")
        .insert({
          session_id: sessionId.current,
          search_query: query,
          search_type: searchType,
          results_count: resultsCount,
          user_id: user?.id,
        })
        .then(({ error }) => {
          if (error) console.error("Failed to track search:", error);
        });
    },
    [user?.id]
  );

  // Mark session as converted
  const markConverted = useCallback(() => {
    supabase
      .from("visitor_sessions")
      .update({ is_converted: true, user_id: user?.id || null })
      .eq("session_id", sessionId.current)
      .then(({ error }) => {
        if (error) console.error("Failed to mark conversion:", error);
      });
  }, [user?.id]);

  return (
    <AnalyticsContext.Provider
      value={{
        sessionId: sessionId.current,
        trackClick,
        trackSearch,
        markConverted,
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    return {
      sessionId: "",
      trackClick: () => {},
      trackSearch: () => {},
      markConverted: () => {},
    };
  }
  return context;
};

export default AnalyticsProvider;
