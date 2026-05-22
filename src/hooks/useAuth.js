import { useState, useEffect } from 'react';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase.js';

export const useAuth = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [adminName, setAdminName] = useState('');
    const [user, setUser] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setIsAuthenticated(true);
                setUser(user);
                setAdminName(user.displayName || user.email);
            } else {
                setIsAuthenticated(false);
                setUser(null);
                setAdminName('');
            }
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = async (email, password, name) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            setAdminName(name || userCredential.user.displayName || userCredential.user.email);
            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const createAdmin = async (email, password, name) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            // Note: In a real app, you'd update the user's display name
            // For now, we'll store the name in localStorage as a fallback
            localStorage.setItem('admin_name', name);
            return true;
        } catch (error) {
            console.error('Create admin error:', error);
            // Return the specific error message
            throw new Error(error.message || 'Failed to create admin account');
        }
    };

    return {
        isAuthenticated,
        isLoading,
        adminName,
        user,
        login,
        logout,
        createAdmin
    };
};
