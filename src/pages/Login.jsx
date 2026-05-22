import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, User, LogIn, AlertCircle } from 'lucide-react';

export const Login = ({ onLogin, onCreateAdmin, showToast }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isCreatingAccount, setIsCreatingAccount] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !password || !name) {
            setError('All fields are required');
            return;
        }

        if (!email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            const success = await onLogin(email, password, name);
            if (!success) {
                setError('Login failed. Please check your credentials.');
            } else {
                showToast?.('Welcome back!', `Logged in as ${name || email}`, 'success');
            }
        } catch (error) {
            setError('Login failed. Please try again.');
            console.error('Login error:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary via-background to-indigo-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Card */}
                <div className="bg-card border border-border rounded-3xl shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-primary to-indigo-600 px-8 py-12 text-center">
                        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Kel Church Analytics</h1>
                        <p className="text-white/80 text-sm">Admin Portal</p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-center gap-3 p-4 bg-destructive/10 border border-destructive/30 rounded-xl"
                            >
                                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                                <p className="text-sm text-destructive">{error}</p>
                            </motion.div>
                        )}

                        {/* Full Name */}
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">
                                Full Name
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your full name"
                                    className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@church.com"
                                    className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-sm font-bold text-foreground mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="w-full bg-background border border-border rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="w-5 h-5" />
                                    Login to Dashboard
                                </>
                            )}
                        </button>

                        {/* Create Account Button */}
                        <button
                            type="button"
                            onClick={async () => {
                                setIsCreatingAccount(true);
                                setError('');
                                try {
                                    await onCreateAdmin(email, password, name);
                                    showToast?.('Account created!', 'You can now log in with your credentials.', 'success');
                                } catch (error) {
                                    setError(error.message || 'Failed to create account.');
                                    console.error('Create account error:', error);
                                } finally {
                                    setIsCreatingAccount(false);
                                }
                            }}
                            disabled={isCreatingAccount || isLoading}
                            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            {isCreatingAccount ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Creating Account...
                                </>
                            ) : (
                                <>
                                    <User className="w-5 h-5" />
                                    Create Account
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-xs text-muted-foreground mt-6">
                    Secure admin access. All credentials are stored locally.
                </p>
            </motion.div>
        </div>
    );
};
