import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.js';

const STORAGE_KEY = 'church_analytics_data_v2';

const DEFAULT_DATA = {
    attendance: [],
    finance: []
};

export const useChurchData = () => {
    const [data, setData] = useState(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_DATA;
    });

    const [notifications, setNotifications] = useState([
        { id: 1, title: 'Welcome', message: 'Church Analytics Dashboard is ready.', time: 'Just now', read: false },
        { id: 2, title: 'Backup', message: 'Local data backup completed.', time: '2 mins ago', read: true },
    ]);

    useEffect(() => {
        const loadData = async () => {
            try {
                // Load attendance data from Firestore
                const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
                const attendanceData = attendanceSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Load finance data from Firestore
                const financeSnapshot = await getDocs(collection(db, 'finance'));
                const financeData = financeSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                setData({
                    attendance: attendanceData,
                    finance: financeData
                });
            } catch (error) {
                console.error('Error loading data from Firestore:', error);
                // Fallback to localStorage if Firestore fails
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    setData(JSON.parse(saved));
                }
            }
        };

        loadData();
    }, []);

    const addAttendance = async (record) => {
        try {
            const newRecord = {
                ...record,
                total: (record.men || 0) + (record.women || 0) + (record.youth || 0) + (record.children || 0),
                timestamp: new Date().toISOString()
            };

            await addDoc(collection(db, 'attendance'), newRecord);

            // Reload data from Firestore to ensure consistency
            const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
            const attendanceData = attendanceSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setData(prev => ({
                ...prev,
                attendance: attendanceData
            }));

            addNotification('Attendance Recorded', `${record.serviceName} attendance has been saved.`, 'Just now');
        } catch (error) {
            console.error('Error adding attendance:', error);
            // Fallback to local state if Firestore fails
            const newRecord = {
                ...record,
                id: crypto.randomUUID(),
                total: (record.men || 0) + (record.women || 0) + (record.youth || 0) + (record.children || 0),
                timestamp: new Date().toISOString()
            };
            setData(prev => ({
                ...prev,
                attendance: [newRecord, ...prev.attendance]
            }));
            addNotification('Attendance Recorded (Offline)', `${record.serviceName} attendance saved locally.`, 'Just now');
        }
    };

    const addFinance = async (record) => {
        try {
            const newRecord = {
                ...record,
                timestamp: new Date().toISOString()
            };

            await addDoc(collection(db, 'finance'), newRecord);

            // Reload data from Firestore to ensure consistency
            const financeSnapshot = await getDocs(collection(db, 'finance'));
            const financeData = financeSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setData(prev => ({
                ...prev,
                finance: financeData
            }));

            addNotification('Transaction Saved', `${record.type === 'income' ? 'Income' : 'Expense'} of ${record.amount} recorded.`, 'Just now');
        } catch (error) {
            console.error('Error adding finance:', error);
            // Fallback to local state if Firestore fails
            const newRecord = {
                ...record,
                id: crypto.randomUUID(),
                timestamp: new Date().toISOString()
            };
            setData(prev => ({
                ...prev,
                finance: [newRecord, ...prev.finance]
            }));
            addNotification('Transaction Saved (Offline)', `${record.type === 'income' ? 'Income' : 'Expense'} of ${record.amount} recorded locally.`, 'Just now');
        }
    };

    const updateAttendance = async (id, updatedRecord) => {
        try {
            const updatedRecordWithTotal = {
                ...updatedRecord,
                total: (updatedRecord.men || 0) + (updatedRecord.women || 0) + (updatedRecord.youth || 0) + (updatedRecord.children || 0),
                timestamp: updatedRecord.timestamp || new Date().toISOString()
            };

            await updateDoc(doc(db, 'attendance', id), updatedRecordWithTotal);

            // Reload data from Firestore to ensure consistency
            const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
            const attendanceData = attendanceSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setData(prev => ({
                ...prev,
                attendance: attendanceData
            }));

            addNotification('Attendance Updated', `${updatedRecord.serviceName} has been updated.`, 'Just now');
        } catch (error) {
            console.error('Error updating attendance:', error);
            // Fallback to local state if Firestore fails
            setData(prev => ({
                ...prev,
                attendance: prev.attendance.map(r =>
                    r.id === id
                        ? {
                            ...updatedRecord,
                            id: r.id,
                            total: (updatedRecord.men || 0) + (updatedRecord.women || 0) + (updatedRecord.youth || 0) + (updatedRecord.children || 0),
                            timestamp: r.timestamp
                        }
                        : r
                )
            }));
            addNotification('Attendance Updated (Offline)', `${updatedRecord.serviceName} updated locally.`, 'Just now');
        }
    };

    const updateFinance = async (id, updatedRecord) => {
        try {
            const updatedRecordWithTimestamp = {
                ...updatedRecord,
                timestamp: updatedRecord.timestamp || new Date().toISOString()
            };

            await updateDoc(doc(db, 'finance', id), updatedRecordWithTimestamp);

            // Reload data from Firestore to ensure consistency
            const financeSnapshot = await getDocs(collection(db, 'finance'));
            const financeData = financeSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setData(prev => ({
                ...prev,
                finance: financeData
            }));

            addNotification('Transaction Updated', 'Financial record has been updated.', 'Just now');
        } catch (error) {
            console.error('Error updating finance:', error);
            // Fallback to local state if Firestore fails
            setData(prev => ({
                ...prev,
                finance: prev.finance.map(f =>
                    f.id === id ? { ...updatedRecord, id: f.id, timestamp: f.timestamp } : f
                )
            }));
            addNotification('Transaction Updated (Offline)', 'Financial record updated locally.', 'Just now');
        }
    };

    const deleteAttendance = async (id) => {
        try {
            await deleteDoc(doc(db, 'attendance', id));

            // Reload data from Firestore to ensure consistency
            const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
            const attendanceData = attendanceSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setData(prev => ({
                ...prev,
                attendance: attendanceData
            }));

            addNotification('Record Deleted', 'Attendance record has been removed.', 'Just now');
        } catch (error) {
            console.error('Error deleting attendance:', error);
            // Fallback to local state if Firestore fails
            setData(prev => ({
                ...prev,
                attendance: prev.attendance.filter(r => r.id !== id)
            }));
            addNotification('Record Deleted (Offline)', 'Attendance record removed locally.', 'Just now');
        }
    };

    const deleteFinance = async (id) => {
        try {
            await deleteDoc(doc(db, 'finance', id));

            // Reload data from Firestore to ensure consistency
            const financeSnapshot = await getDocs(collection(db, 'finance'));
            const financeData = financeSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setData(prev => ({
                ...prev,
                finance: financeData
            }));

            addNotification('Transaction Deleted', 'Financial record has been removed.', 'Just now');
        } catch (error) {
            console.error('Error deleting finance:', error);
            // Fallback to local state if Firestore fails
            setData(prev => ({
                ...prev,
                finance: prev.finance.filter(r => r.id !== id)
            }));
            addNotification('Transaction Deleted (Offline)', 'Financial record removed locally.', 'Just now');
        }
    };

    const clearAttendance = async () => {
        try {
            // Get all attendance documents and delete them
            const attendanceSnapshot = await getDocs(collection(db, 'attendance'));
            const deletePromises = attendanceSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            setData(prev => ({ ...prev, attendance: [] }));
            addNotification('Data Cleared', 'All attendance records have been removed.', 'Just now');
        } catch (error) {
            console.error('Error clearing attendance:', error);
            // Fallback to local state if Firestore fails
            setData(prev => ({ ...prev, attendance: [] }));
            addNotification('Data Cleared (Offline)', 'All attendance records removed locally.', 'Just now');
        }
    };

    const clearFinance = async () => {
        try {
            // Get all finance documents and delete them
            const financeSnapshot = await getDocs(collection(db, 'finance'));
            const deletePromises = financeSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            setData(prev => ({ ...prev, finance: [] }));
            addNotification('Data Cleared', 'All financial records have been removed.', 'Just now');
        } catch (error) {
            console.error('Error clearing finance:', error);
            // Fallback to local state if Firestore fails
            setData(prev => ({ ...prev, finance: [] }));
            addNotification('Data Cleared (Offline)', 'All financial records removed locally.', 'Just now');
        }
    };

    const addNotification = (title, message, time) => {
        setNotifications(prev => [{ id: Date.now(), title, message, time, read: false }, ...prev]);
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const logout = () => {
        if (confirm('Are you sure you want to logout?')) {
            window.location.reload(); // Simple simulation
        }
    };

    return {
        attendance: data.attendance,
        finance: data.finance,
        notifications,
        addAttendance,
        addFinance,
        updateAttendance,
        updateFinance,
        deleteAttendance,
        deleteFinance,
        clearAttendance,
        markAllRead,
        setData,
        logout
    };
};
