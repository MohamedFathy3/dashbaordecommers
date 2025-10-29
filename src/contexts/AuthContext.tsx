'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { AuthUser } from '@/types/auth';
interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (credentials: { email: string; password: string; remember?: boolean }) => Promise<boolean>;
  logout: () => void;
  updateUser: (user: AuthUser) => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
  updateUser: () => {},
  token: null,
});

// دالة مساعدة للتعامل مع التوكن في localStorage
const getStoredToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

const setStoredToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
};

const removeStoredToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
};

async function fetchUser(): Promise<AuthUser | null> {
  try {
    const token = getStoredToken();
    if (!token) {
      console.log('❌ No token found in localStorage');
      return null; // تأكد من إرجاع null وليس undefined
    }

    console.log('🔐 Using token from localStorage:', token.substring(0, 10) + '...');
    
    const res = await apiFetch('/back/check-auth/admin', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    // تأكد من إرجاع البيانات بشكل صحيح
    if (res && (res.data || res.admin || res.id)) {
      return res.data || res.admin || res;
    }
    
    return null; // دائماً أرجع null بدلاً من undefined
  } catch (error) {
    console.log('❌ fetchUser error:', error);
    return null; // دائماً أرجع null
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  const [token, setToken] = useState<string | null>(null);

  // تهيئة التوكن عند التحميل
  useEffect(() => {
    const storedToken = getStoredToken();
    if (storedToken) {
      setToken(storedToken);
    }
  }, []);

  const { data: user, isLoading } = useQuery<AuthUser | null, Error>({
    queryKey: ['user', token],
    queryFn: fetchUser,
    enabled: !!token, // يشغل الاستعلام فقط إذا كان التوكن موجوداً
    staleTime: 5 * 60 * 1000, // 5 دقائق
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string; remember?: boolean }) => {
      const res = await apiFetch('login/admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      return res;
    },
    onSuccess: (data) => {
      if (data.token) {
        // حفظ التوكن في localStorage
        setStoredToken(data.token);
        setToken(data.token);
        console.log('✅ Token saved to localStorage');
        
        // تحديث بيانات المستخدم
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    },
  });

  const login = async (credentials: { email: string; password: string; remember?: boolean }) => {
    try {
      await loginMutation.mutateAsync(credentials);
      return true;
    } catch (error) {
      console.log('❌ Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      const token = getStoredToken();
      if (token) {
        await apiFetch('admin/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.log('Logout API call failed, but proceeding anyway');
    }

    // تنظيف التخزين
    removeStoredToken();
    setToken(null);
    queryClient.removeQueries({ queryKey: ['user'] });
    queryClient.clear();
    
    // التوجيه لصفحة Login
    window.location.href = '/auth';
  };

  const updateUser = (newUser: AuthUser) => {
    queryClient.setQueryData(['user'], newUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        loading: isLoading,
        login,
        logout,
        updateUser,
        token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}