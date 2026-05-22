import React, { useState } from 'react';
import { ChartCard } from '../components/ChartCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users,
    Plus,
    Search,
    Filter,
    ChevronRight,
    UserPlus,
    Baby,
    UserCheck,
    Trash2,
    Calendar,
    Sparkles,
    Edit2,
    X
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { format } from 'date-fns';

export const Attendance = ({ attendance, addAttendance, clearAttendance, deleteAttendance, updateAttendance }) => {
    const [showForm, setShowForm] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingId, setEditingId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        serviceName: '',
        type: 'Sunday Service',
        men: 0,
        women: 0,
        youth: 0,
        children: 0,
        firstTimers: 0
    });

    const handleEdit = (record) => {
        setEditingId(record.id);
        setFormData({
            date: record.date,
            serviceName: record.serviceName,
            type: record.type,
            men: record.men,
            women: record.women,
            youth: record.youth,
            children: record.children,
            firstTimers: record.firstTimers
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage('');

        try {
            const data = {
                ...formData,
                men: parseInt(formData.men || 0),
                women: parseInt(formData.women || 0),
                youth: parseInt(formData.youth || 0),
                children: parseInt(formData.children || 0),
                firstTimers: parseInt(formData.firstTimers || 0),
            };

            if (editingId) {
                updateAttendance(editingId, data);
                setSubmitMessage('Record updated successfully!');
                setEditingId(null);
            } else {
                await addAttendance(data);
                setSubmitMessage('Record saved successfully!');
            }

            // Close form after successful submission
            setTimeout(() => {
                setShowForm(false);
                setSubmitMessage('');
                setFormData({
                    date: new Date().toISOString().split('T')[0],
                    serviceName: '',
                    type: 'Sunday Service',
                    men: 0,
                    women: 0,
                    youth: 0,
                    children: 0,
                    firstTimers: 0
                });
            }, 1500);

        } catch (error) {
            console.error('Error saving record:', error);
            setSubmitMessage('Failed to save record. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredAttendance = attendance.filter(r =>
        (r.serviceName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (r.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.date.includes(searchQuery)
    );

    const chartData = filteredAttendance.slice(0, 7).reverse().map(r => ({
        name: format(new Date(r.date), 'MMM dd'),
        Men: r.men,
        Women: r.women,
        Youth: r.youth,
        Children: r.children,
        'First Timers': r.firstTimers,
        Total: r.total
    }));

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Attendance Records</h2>
                    <p className="text-muted-foreground">Track and manage service attendance growth.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setEditingId(null);
                            setFormData({
                                date: new Date().toISOString().split('T')[0],
                                serviceName: '',
                                type: 'Sunday Service',
                                men: 0,
                                women: 0,
                                youth: 0,
                                children: 0,
                                firstTimers: 0
                            });
                            setShowForm(!showForm);
                        }}
                        className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                    >
                        {showForm ? 'Cancel' : <><Plus className="w-5 h-5" /> Record Attendance</>}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-card border border-border p-8 rounded-2xl shadow-xl">
                            <h3 className="text-xl font-bold mb-6">{editingId ? 'Edit Service Attendance' : 'Enter Service Attendance'}</h3>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Service Name</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Morning Glory"
                                        value={formData.serviceName}
                                        onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Service Type</label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        <option>Sunday Service</option>
                                        <option>Mid-week Service</option>
                                        <option>Youth Service</option>
                                        <option>Special Event</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Service Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Men</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.men}
                                        onChange={(e) => setFormData({ ...formData, men: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Women</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.women}
                                        onChange={(e) => setFormData({ ...formData, women: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Youth</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.youth}
                                        onChange={(e) => setFormData({ ...formData, youth: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Children</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.children}
                                        onChange={(e) => setFormData({ ...formData, children: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                        disabled={isSubmitting}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 text-primary font-bold">First Timers</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.firstTimers}
                                        onChange={(e) => setFormData({ ...formData, firstTimers: e.target.value })}
                                        className="w-full bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                        disabled={isSubmitting}
                                    />
                                </div>

                                {/* Submit Message */}
                                {submitMessage && (
                                    <div className="md:col-span-3 p-4 rounded-xl text-center font-medium">
                                        {submitMessage.includes('successfully') ? (
                                            <span className="text-green-600">{submitMessage}</span>
                                        ) : (
                                            <span className="text-red-600">{submitMessage}</span>
                                        )}
                                    </div>
                                )}

                                <div className="md:col-span-3 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowForm(false);
                                            setEditingId(null);
                                        }}
                                        className="px-6 py-3 border border-border rounded-xl font-bold hover:bg-muted transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Saving...' : (editingId ? 'Update Record' : 'Save Record')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ChartCard title="Attendance Breakdown" subtitle="Comparison including demographics and first timers">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Legend iconType="circle" />
                                <Bar dataKey="Men" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Women" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Youth" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Children" fill="#ef4444" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="First Timers" fill="#818cf8" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <div className="space-y-6">
                    <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
                        <h3 className="font-bold mb-4 flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-primary" /> Key Metrics
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Avg. Men', val: Math.round(filteredAttendance.reduce((a, b) => a + (b.men || 0), 0) / (filteredAttendance.length || 1)), icon: Users, color: 'text-blue-500' },
                                { label: 'Avg. Women', val: Math.round(filteredAttendance.reduce((a, b) => a + (b.women || 0), 0) / (filteredAttendance.length || 1)), icon: Users, color: 'text-emerald-500' },
                                { label: 'Avg. First Timers', val: Math.round(filteredAttendance.reduce((a, b) => a + (b.firstTimers || 0), 0) / (filteredAttendance.length || 1)), icon: Sparkles, color: 'text-indigo-400' },
                                { label: 'Avg. Children', val: Math.round(filteredAttendance.reduce((a, b) => a + (b.children || 0), 0) / (filteredAttendance.length || 1)), icon: Baby, color: 'text-rose-500' },
                            ].map((item) => (
                                <div key={item.label} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                        <item.icon className={`w-4 h-4 ${item.color}`} />
                                        {item.label}
                                    </div>
                                    <span className="font-bold">{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-bold">History</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            placeholder="Search services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-background border border-border rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 text-muted-foreground font-medium text-sm">
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4">Service Name</th>
                                <th className="px-6 py-4">M</th>
                                <th className="px-6 py-4">W</th>
                                <th className="px-6 py-4">Y</th>
                                <th className="px-6 py-4">C</th>
                                <th className="px-6 py-4">1st</th>
                                <th className="px-6 py-4 text-right">Total</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredAttendance.map((record) => (
                                <tr key={record.id} className="hover:bg-muted/30 transition-colors group text-sm">
                                    <td className="px-6 py-4 font-medium">{format(new Date(record.date), 'MMM dd, yyyy')}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold">{record.serviceName || 'Untitled Service'}</span>
                                            <span className="text-[10px] text-muted-foreground uppercase">{record.type}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{record.men}</td>
                                    <td className="px-6 py-4">{record.women}</td>
                                    <td className="px-6 py-4">{record.youth}</td>
                                    <td className="px-6 py-4">{record.children}</td>
                                    <td className="px-6 py-4 font-bold text-primary">{record.firstTimers || 0}</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-foreground">{record.total}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => handleEdit(record)}
                                                className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredAttendance.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="px-6 py-10 text-center text-muted-foreground">
                                        No attendance records found. Click "Record Attendance" to add one.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

