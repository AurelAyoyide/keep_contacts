import axios from 'axios';

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Avoid infinite loops when trying to refresh
let isRefreshing = false;
let failedQueue: any[] = [];

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

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            if (isRefreshing) {
                return new Promise(function (resolve, reject) {
                    failedQueue.push({ resolve, reject });
                }).then(token => {
                    originalRequest.headers.Authorization = 'Bearer ' + token;
                    return api(originalRequest);
                }).catch(err => {
                    return Promise.reject(err);
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            const refreshToken = localStorage.getItem('refreshToken');

            if (!refreshToken) {
                isRefreshing = false;
                localStorage.removeItem('accessToken');
                if (typeof window !== 'undefined') window.location.href = '/login';
                return Promise.reject(error);
            }

            try {
                // Refresh token call without using the intercepted api instance to avoid loops
                const { data } = await axios.post(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/auth/refresh`, {
                    refreshToken
                });

                localStorage.setItem('accessToken', data.accessToken);
                localStorage.setItem('refreshToken', data.refreshToken);

                api.defaults.headers.common.Authorization = `Bearer ${data.accessToken}`;
                originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;

                processQueue(null, data.accessToken);
                isRefreshing = false;

                return api(originalRequest);
            } catch (err) {
                processQueue(err, null);
                isRefreshing = false;

                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                if (typeof window !== 'undefined') window.location.href = '/login';

                return Promise.reject(err);
            }
        }

        return Promise.reject(error);
    }
);

export default api;
