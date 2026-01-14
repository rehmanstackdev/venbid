import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://venbid-backend.vercel.app';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

let isRefreshing = false;
let failedQueue: any[] = [];
let refreshTimer: NodeJS.Timeout | null = null;

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  
  if (!refreshToken) {
    clearRefreshTimer();
    return null;
  }

  try {
    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
      refreshToken
    });
    
    const { accessToken } = response.data.data || response.data;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('token_timestamp', Date.now().toString());
    
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    
    // Schedule next refresh (13 minutes - 2 minutes before expiry)
    scheduleTokenRefresh();
    
    return accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    
    // Clear all auth data
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('user_roles');
    localStorage.removeItem('token_timestamp');
    clearRefreshTimer();
    

    if (typeof window !== 'undefined') {

      import('sonner').then(({ toast }) => {
        toast.error('Session expired', {
          description: 'Please sign in again to continue'
        });
      });
      

      window.location.href = '/';
    }
    
    return null;
  }
};

const scheduleTokenRefresh = () => {
  clearRefreshTimer();
 
  refreshTimer = setTimeout(() => {
    refreshAccessToken();
  }, 13 * 60 * 1000);
};

const clearRefreshTimer = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
};


const initTokenRefresh = () => {
  const token = localStorage.getItem('access_token');
  const timestamp = localStorage.getItem('token_timestamp');
  
  if (token && timestamp) {
    const elapsed = Date.now() - parseInt(timestamp);
    const remaining = (15 * 60 * 1000) - elapsed;
    
    if (remaining > 2 * 60 * 1000) {
   
      refreshTimer = setTimeout(() => {
        refreshAccessToken();
      }, remaining - (2 * 60 * 1000));
    } else {
     
      refreshAccessToken();
    }
  }
};


initTokenRefresh();


apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    
    if (error.response?.status === 403 && 
        error.response?.data?.message?.toLowerCase().includes('email not verified')) {
      if (typeof window !== 'undefined') {
        import('sonner').then(({ toast }) => {
          toast.error('Email not verified', {
            description: 'Please verify your email to continue'
          });
        });
        window.location.href = '/auth/request-verification';
      }
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const accessToken = await refreshAccessToken();
        
        if (!accessToken) {
          processQueue(error, null);
          isRefreshing = false;
          return Promise.reject(error);
        }
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        isRefreshing = false;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export { scheduleTokenRefresh, clearRefreshTimer };
