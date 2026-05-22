import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Toast } from './components/Toast';
import { Overview } from './pages/Overview';
import { Attendance } from './pages/Attendance';
import { Finance } from './pages/Finance';
import { Reports } from './pages/Reports';
import { Login } from './pages/Login';
import { useChurchData } from './hooks/useChurchData';
import { useAuth } from './hooks/useAuth';
import { generateMockData } from './utils/mockData';
import { Sun, Moon, Bell, Search, User, Menu, Settings, LogOut, CheckCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
    const { isAuthenticated, isLoading: authLoading, adminName, login, logout: authLogout, createAdmin } = useAuth();
    const [toasts, setToasts] = useState([]);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    const {
        attendance, finance, notifications,
        addAttendance, addFinance, updateAttendance, updateFinance, deleteAttendance, deleteFinance, clearAttendance,
        markAllRead, setData
    } = useChurchData();

    const showToast = (title, message = '', type = 'success') => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, title, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, 4000);
    };

    const removeToast = (id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const handleLogout = () => {
        authLogout();
    };

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDarkMode]);

    useEffect(() => {
        const isFirstRun = !localStorage.getItem('church_analytics_data_v2_initialized');
        if (isFirstRun && attendance.length === 0 && finance.length === 0) {
            const mock = generateMockData();
            const updatedMockAttendance = mock.attendance.map(a => ({
                ...a,
                serviceName: a.type === 'Sunday Service' ? 'Main Sunday Service' : 'Power Encounter',
                firstTimers: Math.floor(Math.random() * 10)
            }));
            setData({ ...mock, attendance: updatedMockAttendance });
            localStorage.setItem('church_analytics_data_v2_initialized', 'true');
        }
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Overview attendance={attendance} finance={finance} />;
            case 'attendance':
                return (
                    <Attendance
                        attendance={attendance.filter(r =>
                            (r.serviceName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (r.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            r.date.includes(searchQuery)
                        )}
                        addAttendance={addAttendance}
                        updateAttendance={updateAttendance}
                        deleteAttendance={deleteAttendance}
                        clearAttendance={clearAttendance}
                    />
                );
            case 'finance':
                return (
                    <Finance
                        finance={finance.filter(f =>
                            f.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            f.description.toLowerCase().includes(searchQuery.toLowerCase())
                        )}
                        addFinance={addFinance}
                        updateFinance={updateFinance}
                        deleteFinance={deleteFinance}
                    />
                );
            case 'reports':
                return <Reports attendance={attendance} finance={finance} />;
            default:
                return <Overview attendance={attendance} finance={finance} />;
        }
    };

    // Show loading state while checking authentication
    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary via-background to-indigo-950 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin" />
                    <p className="text-white/60 text-sm font-medium">Loading...</p>
                </div>
            </div>
        );
    }

    // Show login page if not authenticated
    if (!isAuthenticated) {
        return (
            <>
                <Toast toasts={toasts} removeToast={removeToast} />
                <Login onLogin={login} onCreateAdmin={createAdmin} showToast={showToast} />
            </>
        );
    }

    return (
        <div className="min-h-screen bg-background transition-colors duration-300">
            <Toast toasts={toasts} removeToast={removeToast} />
            <Sidebar
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isOpen={sidebarOpen}
                setIsOpen={setSidebarOpen}
                onLogout={handleLogout}
            />

            <main
                className="lg:pl-64 min-h-screen transition-all duration-300"
                onClick={() => {
                    if (showNotifications) setShowNotifications(false);
                    if (showProfile) setShowProfile(false);
                }}
            >
                {/* Top Navbar */}
                <header className="h-20 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); setSidebarOpen(true); }}
                            className="lg:hidden p-2 hover:bg-muted rounded-lg border border-border"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="relative hidden md:block w-64 lg:w-96">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                placeholder="Search analytics, records..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-background/50 border border-border rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 lg:gap-4">
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsDarkMode(!isDarkMode); }}
                            className="p-2 lg:p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground border border-border"
                        >
                            {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-500" />}
                        </button>

                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); setShowProfile(false); }}
                                className="p-2 lg:p-2.5 rounded-xl hover:bg-muted transition-colors text-muted-foreground border border-border relative"
                            >
                                <Bell className="w-5 h-5" />
                                {unreadCount > 0 && (
                                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-card" />
                                )}
                            </button>

                            <AnimatePresence>
                                {showNotifications && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30">
                                            <h4 className="font-bold">Notifications</h4>
                                            <button onClick={markAllRead} className="text-[10px] uppercase font-bold text-primary hover:underline">Mark all read</button>
                                        </div>
                                        <div className="max-h-96 overflow-y-auto">
                                            {notifications.map(n => (
                                                <div key={n.id} className={`p-4 border-b border-border hover:bg-muted/30 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}>
                                                    <div className="flex justify-between mb-1">
                                                        <span className="text-sm font-bold">{n.title}</span>
                                                        <span className="text-[10px] text-muted-foreground">{n.time}</span>
                                                    </div>
                                                    <p className="text-xs text-muted-foreground leading-relaxed">{n.message}</p>
                                                </div>
                                            ))}
                                            {notifications.length === 0 && (
                                                <div className="p-10 text-center text-muted-foreground flex flex-col items-center gap-2">
                                                    <CheckCheck className="w-8 h-8 opacity-20" />
                                                    <p className="text-xs">No notifications yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="h-8 w-px bg-border mx-1 lg:mx-2" />

                        <div className="relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowProfile(!showProfile); setShowNotifications(false); }}
                                className="flex items-center gap-3 pl-1 lg:pl-2 group"
                            >
                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">{adminName}</p>
                                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Administrator</p>
                                </div>
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">
                                    <User className="w-5 h-5" />
                                </div>
                            </button>

                            <AnimatePresence>
                                {showProfile && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute right-0 mt-3 w-48 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="p-4 border-b border-border bg-muted/30">
                                            <p className="text-xs font-bold text-muted-foreground uppercase">Pastoral Account</p>
                                        </div>
                                        <div className="p-2">
                                            <button
                                                onClick={handleLogout}
                                                className="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors text-sm font-medium"
                                            >
                                                <LogOut className="w-4 h-4" /> Logout
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </header>

                {/* Mobile Search - Visible only on mobile */}
                <div className="md:hidden px-4 pt-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            placeholder="Search records..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2 text-sm outline-none"
                        />
                    </div>
                </div>

                {/* Page Content */}
                <div className="p-4 lg:p-10 max-w-[1600px] mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.3 }}
                        >
                            {renderContent()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

export default App;
