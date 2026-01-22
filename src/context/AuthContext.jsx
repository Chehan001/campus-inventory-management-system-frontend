import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkUser = async () => {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            
            if (storedToken && storedUser) {
                try {
                    const parsedUser = JSON.parse(storedUser);
                    setUser(parsedUser);
                    setToken(storedToken);
                    
                    // Set axios default header --> for all future requests
                    axios.defaults.headers.common['x-auth-token'] = storedToken;
                    
                    console.log(' User restored from localStorage:', parsedUser.username);
                } catch (error) {
                    console.error(' Error parsing stored user:', error);
                    // Clear --> invalid data
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        checkUser();
    }, []);

    const login = async (username, password) => {
        try {
            console.log(' Attempting login for:', username);
            
            const res = await axios.post('/api/auth/login', { username, password });
            
            const { token: authToken, user: userData } = res.data;
            
            // Store --> localStorage
            localStorage.setItem('token', authToken);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Set in state
            setToken(authToken);
            setUser(userData);
            
            // Set axios -->  default header --> for all future requests
            axios.defaults.headers.common['x-auth-token'] = authToken;
            
            console.log(' Login successful:', userData.username, 'Role:', userData.role);
            
            return { success: true };
        } catch (err) {
            console.error(' Login error:', err.response?.data || err.message);
            
            // Return error message --> 
            return { 
                success: false, 
                error: err.response?.data?.msg || 'Login failed. Please try again.' 
            };
        }
    };

    const logout = () => {
        console.log(' Logging out user:', user?.username);
        
        // Clear localStorage
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        
        // Clear axios default header
        delete axios.defaults.headers.common['x-auth-token'];
        setToken(null);
        setUser(null);
        
        console.log(' Logout complete');
    };

    // check -->  user is authenticated
    const isAuthenticated = () => {
        return !!token && !!user;
    };

    //  check -->  user has specific role
    const hasRole = (role) => {
        return user?.role === role;
    };

    //check --> user is super admin
    const isSuperAdmin = () => {
        return user?.role === 'super_admin';
    };

    // check -->  user is faculty admin
    const isFacultyAdmin = () => {
        return user?.role === 'faculty_admin';
    };

    const value = {
        user,
        token,
        loading,
        login,
        logout,
        isAuthenticated,
        hasRole,
        isSuperAdmin,
        isFacultyAdmin,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};