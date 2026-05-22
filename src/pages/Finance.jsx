import React, { useState } from 'react';
import { ChartCard } from '../components/ChartCard';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet,
    Plus,
    Search,
    ArrowUpCircle,
    ArrowDownCircle,
    TrendingUp,
    Receipt,
    Filter,
    Download,
    Trash2,
    Edit2,
    X
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    BarChart,
    Bar
} from 'recharts';
import { format } from 'date-fns';

const INCOME_CATEGORIES = [
    'Tithes', 'Offerings', 'Special offerings', 'Seed offerings', 'First fruits',
    'Thanksgiving', 'Donations', 'Welfare giving', 'Project/Building fund',
    'Mission support', 'Love gifts', 'Fundraising', 'Event contributions',
    'Partnership giving', 'Other givings'
];

const EXPENSE_CATEGORIES = [
    'Utilities', 'Welfare support', 'Maintenance', 'Events', 'Salaries',
    'Missions', 'Equipment', 'Media', 'Transport', 'Other expenses'
];

const formatCedis = (amount) => {
    return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
        minimumFractionDigits: 2
    }).format(amount);
};

export const Finance = ({ finance, addFinance, updateFinance, deleteFinance }) => {
    const [showForm, setShowForm] = useState(false);
    const [filterType, setFilterType] = useState('all'); // all, income, expense
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        type: 'income',
        category: 'Tithes',
        amount: '',
        description: ''
    });

    const handleEdit = (item) => {
        setEditingId(item.id);
        setFormData({
            date: item.date,
            type: item.type,
            category: item.category,
            amount: item.amount,
            description: item.description
        });
        setShowForm(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            ...formData,
            amount: parseFloat(formData.amount)
        };

        if (editingId) {
            updateFinance(editingId, data);
            setEditingId(null);
        } else {
            addFinance(data);
        }

        setShowForm(false);
        setFormData({
            date: new Date().toISOString().split('T')[0],
            type: 'income',
            category: 'Tithes',
            amount: '',
            description: ''
        });
    };

    const exportCSV = () => {
        if (finance.length === 0) return;
        const headers = ['Date', 'Type', 'Category', 'Description', 'Amount'];
        const rows = finance.map(f => [
            f.date,
            f.type,
            f.category,
            `"${f.description || ''}"`,
            f.amount
        ]);
        const csvContent = "data:text/csv;charset=utf-8," + headers.join(',') + "\n" + rows.map(r => r.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `finance_export_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const filteredData = finance.filter(f => {
        if (filterType === 'all') return true;
        return f.type === filterType;
    });

    const monthlyTimeline = filteredData.reduce((acc, curr) => {
        const month = format(new Date(curr.date), 'MMM yy');
        if (!acc[month]) acc[month] = { month, income: 0, expense: 0 };
        acc[month][curr.type] += curr.amount;
        return acc;
    }, {});

    const timelineData = Object.values(monthlyTimeline).slice(-6);

    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Financial Management</h2>
                    <p className="text-muted-foreground">Track giving growth and operational expenses in Cedis (GH₵).</p>
                </div>
                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({
                            date: new Date().toISOString().split('T')[0],
                            type: 'income',
                            category: 'Tithes',
                            amount: '',
                            description: ''
                        });
                        setShowForm(!showForm);
                    }}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:scale-105 transition-all"
                >
                    {showForm ? 'Cancel' : <><Plus className="w-5 h-5" /> Add Transaction</>}
                </button>
            </div>

            <AnimatePresence>
                {showForm && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-card border border-border p-8 rounded-2xl shadow-xl">
                            <h3 className="text-xl font-bold mb-6">{editingId ? 'Edit Transaction' : 'Record Transaction'}</h3>
                            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium mb-2">Type</label>
                                    <div className="flex bg-muted p-1 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'income', category: INCOME_CATEGORIES[0] })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'income' ? 'bg-card shadow-sm text-emerald-500' : 'text-muted-foreground'}`}
                                        >
                                            <ArrowUpCircle className="w-4 h-4" /> Income
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFormData({ ...formData, type: 'expense', category: EXPENSE_CATEGORIES[0] })}
                                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${formData.type === 'expense' ? 'bg-card shadow-sm text-rose-500' : 'text-muted-foreground'}`}
                                        >
                                            <ArrowDownCircle className="w-4 h-4" /> Expense
                                        </button>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Category</label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                    >
                                        {(formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map(cat => (
                                            <option key={cat}>{cat}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Amount (GH₵)</label>
                                    <div className="relative">
                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-muted-foreground">GH₵</span>
                                        <input
                                            type="number"
                                            required
                                            step="0.01"
                                            value={formData.amount}
                                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                            placeholder="0.00"
                                            className="w-full bg-background border border-border rounded-xl pl-14 pr-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-2">Description / Note</label>
                                    <input
                                        type="text"
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="e.g. Monthly electricity bill"
                                        className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                                    />
                                </div>
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
                                    <button type="submit" className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20">
                                        {editingId ? 'Update Transaction' : 'Save Transaction'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ChartCard
                        title="Cash Flow Trend"
                        subtitle={`Showing ${filterType} monthly trend (GH₵)`}
                        actions={
                            <div className="flex bg-muted p-1 rounded-lg text-xs">
                                {['all', 'income', 'expense'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setFilterType(t)}
                                        className={`px-3 py-1 rounded-md capitalize transition-all ${filterType === t ? 'bg-card shadow-sm font-bold text-primary' : 'text-muted-foreground'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        }
                    >
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={timelineData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(val) => `₵${val}`} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                    formatter={(value) => formatCedis(value)}
                                />
                                <Legend iconType="circle" />
                                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <div className="bg-card border border-border p-6 rounded-2xl shadow-sm flex flex-col">
                    <h3 className="font-bold mb-6 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-primary" /> Financial Health
                    </h3>
                    <div className="space-y-6 flex-1">
                        <div>
                            <div className="flex justify-between text-sm mb-2">
                                <span className="text-muted-foreground">Income Growth</span>
                                <span className="text-emerald-500 font-bold">+12.5%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 w-[65%]" />
                            </div>
                        </div>
                        <div className="mt-8 p-4 rounded-xl bg-primary/5 border border-primary/10">
                            <p className="text-xs text-muted-foreground mb-1">Projected Savings</p>
                            <h4 className="text-xl font-bold text-primary">{formatCedis(12450.00)}</h4>
                            <p className="text-[10px] text-muted-foreground mt-2">Based on current giving trends this month.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-border flex justify-between items-center">
                    <h3 className="text-xl font-bold">Recent Transactions</h3>
                    <div className="flex gap-2">
                        <div className="relative group">
                            <button className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors">
                                <Filter className="w-4 h-4" /> Type: {filterType}
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-40 bg-card border border-border rounded-xl shadow-xl z-50 py-1 opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100 group-hover:pointer-events-auto transition-all">
                                {['all', 'income', 'expense'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setFilterType(t)}
                                        className="w-full text-left px-4 py-2 text-sm hover:bg-muted capitalize"
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted transition-colors"
                        >
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-muted/50 text-muted-foreground font-medium text-sm">
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Transaction Details</th>
                                <th className="px-6 py-4">Category</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filteredData.slice(0, 20).map((item) => (
                                <tr key={item.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-6 py-4">
                                        {item.type === 'income' ? (
                                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                                <ArrowUpCircle className="w-4 h-4 text-emerald-500" />
                                            </div>
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-rose-500/10 flex items-center justify-center">
                                                <ArrowDownCircle className="w-4 h-4 text-rose-500" />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-bold text-sm">{item.description}</p>
                                            <p className="text-xs text-muted-foreground">ID: {item.id.split('-')[0]}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${item.type === 'income' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-rose-500/10 text-rose-600'}`}>
                                            {item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-muted-foreground">{format(new Date(item.date), 'MMM dd, yyyy')}</td>
                                    <td className={`px-6 py-4 text-right font-bold ${item.type === 'income' ? 'text-emerald-500' : 'text-rose-500'}`}>
                                        {item.type === 'income' ? '+' : '-'}{formatCedis(item.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Delete this transaction?')) {
                                                        deleteFinance(item.id);
                                                    }
                                                }}
                                                className="p-2 hover:bg-destructive/10 rounded-lg text-destructive transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredData.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="px-6 py-10 text-center text-muted-foreground">No transactions found matching the filter.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
