
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, XCircle, Clock } from 'lucide-react';

interface HealthStatus {
  database: 'healthy' | 'error' | 'checking';
  auth: 'healthy' | 'error' | 'checking';
  roles: 'healthy' | 'error' | 'checking';
}

export const HealthCheck = () => {
  const [status, setStatus] = useState<HealthStatus>({
    database: 'checking',
    auth: 'checking',
    roles: 'checking'
  });

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    // Check database
    try {
      const { error } = await supabase.from('test').select('id').limit(1);
      setStatus(prev => ({ 
        ...prev, 
        database: error ? 'error' : 'healthy' 
      }));
    } catch {
      setStatus(prev => ({ ...prev, database: 'error' }));
    }

    // Check auth
    try {
      const { data, error } = await supabase.auth.getSession();
      setStatus(prev => ({ 
        ...prev, 
        auth: error ? 'error' : 'healthy' 
      }));
    } catch {
      setStatus(prev => ({ ...prev, auth: 'error' }));
    }

    // Check roles function
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { error } = await supabase.rpc('get_user_roles', { _user_id: user.id });
        setStatus(prev => ({ 
          ...prev, 
          roles: error ? 'error' : 'healthy' 
        }));
      } else {
        setStatus(prev => ({ ...prev, roles: 'healthy' }));
      }
    } catch {
      setStatus(prev => ({ ...prev, roles: 'error' }));
    }
  };

  const getIcon = (state: string) => {
    switch (state) {
      case 'healthy':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500 animate-spin" />;
    }
  };

  // Only show in development
  if (!import.meta.env.DEV) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border rounded-lg shadow-lg p-3 text-xs z-50">
      <div className="font-bold mb-2">System Health</div>
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          {getIcon(status.database)}
          <span>Database</span>
        </div>
        <div className="flex items-center space-x-2">
          {getIcon(status.auth)}
          <span>Authentication</span>
        </div>
        <div className="flex items-center space-x-2">
          {getIcon(status.roles)}
          <span>User Roles</span>
        </div>
      </div>
    </div>
  );
};
