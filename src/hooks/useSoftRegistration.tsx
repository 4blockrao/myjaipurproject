import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SoftRegistrationData {
  email?: string;
  fullName?: string;
  phone?: string;
  locality?: string;
}

// Get session ID from analytics
const getSessionId = (): string => {
  const key = 'jc_session_id';
  let sessionId = sessionStorage.getItem(key);
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    sessionStorage.setItem(key, sessionId);
  }
  return sessionId;
};

// Get device info
const getDeviceInfo = () => {
  const ua = navigator.userAgent;
  let deviceType = 'desktop';
  if (/Mobi|Android/i.test(ua)) deviceType = 'mobile';
  else if (/Tablet|iPad/i.test(ua)) deviceType = 'tablet';
  
  let browser = 'unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Edg')) browser = 'Edge';
  
  return { deviceType, browser };
};

// Fetch IP and location
const fetchLocation = async () => {
  try {
    const response = await fetch('https://ip-api.com/json/?fields=status,city,regionName,query');
    if (!response.ok) return null;
    const data = await response.json();
    if (data.status !== 'success') return null;
    return { ip: data.query, city: data.city, state: data.regionName };
  } catch {
    return null;
  }
};

export const useSoftRegistration = () => {
  const sessionId = useRef(getSessionId());
  const softRegId = useRef<string | null>(null);
  const dataRef = useRef<SoftRegistrationData>({});
  const fieldsFilledRef = useRef<Set<string>>(new Set());
  const isSaving = useRef(false);

  // Save soft registration data
  const saveData = useCallback(async (data: SoftRegistrationData, fieldName: string) => {
    // Don't save if already saving or no meaningful data
    if (isSaving.current) return;
    
    // Update local refs
    dataRef.current = { ...dataRef.current, ...data };
    if (data[fieldName as keyof SoftRegistrationData]) {
      fieldsFilledRef.current.add(fieldName);
    }
    
    // Only save if we have at least one field
    if (fieldsFilledRef.current.size === 0) return;
    
    isSaving.current = true;
    
    try {
      const { deviceType, browser } = getDeviceInfo();
      
      // Build payload without waiting for location (non-blocking)
      const payload = {
        session_id: sessionId.current,
        email: dataRef.current.email || null,
        full_name: dataRef.current.fullName || null,
        phone: dataRef.current.phone || null,
        locality: dataRef.current.locality || null,
        device_type: deviceType,
        browser,
        fields_filled: Array.from(fieldsFilledRef.current),
        last_interaction_at: new Date().toISOString(),
      };

      if (softRegId.current) {
        // Update existing record
        const { error } = await supabase
          .from('soft_registrations')
          .update(payload)
          .eq('id', softRegId.current);
        
        if (error) {
          console.error('Failed to update soft registration:', error);
        }
      } else {
        // Insert new record
        const { data: inserted, error } = await supabase
          .from('soft_registrations')
          .insert(payload)
          .select('id')
          .single();
        
        if (error) {
          console.error('Failed to insert soft registration:', error);
        } else if (inserted) {
          softRegId.current = inserted.id;
          console.log('Soft registration created:', inserted.id);
          
          // Now fetch location and update (non-blocking)
          fetchLocation().then(async (location) => {
            if (location && softRegId.current) {
              await supabase
                .from('soft_registrations')
                .update({
                  ip_address: location.ip,
                  city: location.city,
                  state: location.state,
                })
                .eq('id', softRegId.current);
            }
          });
        }
      }
    } catch (error) {
      console.error('Failed to save soft registration:', error);
    } finally {
      isSaving.current = false;
    }
  }, []);

  // Handle field blur (user leaves a field)
  const onFieldBlur = useCallback((fieldName: string, value: string) => {
    if (!value?.trim()) return;
    
    const data: SoftRegistrationData = {};
    
    switch (fieldName) {
      case 'email':
        data.email = value.trim();
        break;
      case 'fullName':
        data.fullName = value.trim();
        break;
      case 'phone':
        data.phone = value.trim();
        break;
      case 'locality':
        data.locality = value.trim();
        break;
    }
    
    saveData(data, fieldName);
  }, [saveData]);

  // Mark registration as completed (don't need soft reg anymore)
  const markCompleted = useCallback(async (userId: string) => {
    if (!softRegId.current) return;
    
    try {
      await supabase
        .from('soft_registrations')
        .update({ 
          is_completed: true, 
          completed_user_id: userId 
        })
        .eq('id', softRegId.current);
    } catch (error) {
      console.error('Failed to mark soft registration as completed:', error);
    }
  }, []);

  // Save on page unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (fieldsFilledRef.current.size > 0 && !isSaving.current) {
        // Use sendBeacon for reliable delivery on page close
        const payload = {
          session_id: sessionId.current,
          ...dataRef.current,
          fields_filled: Array.from(fieldsFilledRef.current),
          last_interaction_at: new Date().toISOString(),
        };
        
        // We can't use supabase here, so we'll rely on the blur handlers
        // The data should already be saved from blur events
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return {
    onFieldBlur,
    markCompleted,
    sessionId: sessionId.current,
  };
};

export default useSoftRegistration;
