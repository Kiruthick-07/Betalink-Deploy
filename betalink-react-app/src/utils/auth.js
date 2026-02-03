// Token management
export const setToken = (token) => {
    localStorage.setItem('betalink_token', token);
};

export const getToken = () => {
    return localStorage.getItem('betalink_token');
};

export const removeToken = () => {
    localStorage.removeItem('betalink_token');
};

// User data management
export const setUser = (user) => {
    localStorage.setItem('betalink_user', JSON.stringify(user));
};

export const getUser = () => {
    const user = localStorage.getItem('betalink_user');
    return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
    localStorage.removeItem('betalink_user');
};

// Check if user is authenticated
export const isAuthenticated = () => {
    const token = getToken();
    return !!token;
};

// Logout
export const logout = () => {
    removeToken();
    removeUser();
};
