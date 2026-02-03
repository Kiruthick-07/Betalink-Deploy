import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests if it exists
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('betalink_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Authentication API
export const authAPI = {
    // Signup
    signup: async (userData) => {
        try {
            const response = await api.post('/auth/signup', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Signup failed' };
        }
    },

    // Login
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Login failed' };
        }
    },

    // Verify token
    verifyToken: async () => {
        try {
            const response = await api.get('/auth/verify');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Token verification failed' };
        }
    },

    // Update profile
    updateProfile: async (formData) => {
        try {
            const response = await api.put('/auth/profile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Profile update failed' };
        }
    },
};

// App API
export const appAPI = {
    uploadApp: async (formData) => {
        try {
            const response = await api.post('/apps', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Upload failed' };
        }
    },
    getApps: async (mode = '') => {
        try {
            const response = await api.get(`/apps${mode ? `?mode=${mode}` : ''}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch apps' };
        }
    },
    deleteApp: async (appId) => {
        try {
            console.log('API: Deleting app with ID:', appId);
            const response = await api.delete(`/apps/${appId}`);
            console.log('API: Delete response:', response.data);
            return response.data;
        } catch (error) {
            console.error('API: Delete failed:', error);
            console.error('API: Error response:', error.response);
            throw error.response?.data || { message: error.message || 'Failed to delete app' };
        }
    }
};

// Review API
export const reviewAPI = {
    getReviews: async (appId) => {
        try {
            const response = await api.get(`/reviews/${appId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch reviews' };
        }
    },
    addReview: async (reviewData) => {
        try {
            // If reviewData has an image, send as FormData
            let data = reviewData;
            let headers = {};
            
            if (reviewData instanceof FormData) {
                data = reviewData;
                headers = { 'Content-Type': 'multipart/form-data' };
            }
            
            const response = await api.post('/reviews', data, { headers });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to add review' };
        }
    }
};

// Chat API
export const chatAPI = {
    getConversations: async () => {
        try {
            const response = await api.get('/chat/conversations/list');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch conversations' };
        }
    },
    getMessages: async (userId) => {
        try {
            const response = await api.get(`/chat/${userId}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to fetch messages' };
        }
    },
    sendMessage: async (messageData) => {
        try {
            const response = await api.post('/chat', messageData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Failed to send message' };
        }
    }
};

export default api;
