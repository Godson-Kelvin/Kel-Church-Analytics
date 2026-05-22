import React from 'react';
import { StatCard } from '../components/StatCard';
import { ChartCard } from '../components/ChartCard';
import {
    Users,
    HandCoins,
    TrendingUp,
    BarChart3,
    Calendar,
    Wallet,
    Sparkles
} from 'lucide-react';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area,
    Cell,
    PieChart,
    Pie
} from 'recharts';
import { format, isToday, isThisWeek, isThisMonth, isThisYear } from 'date-fns';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const formatCedis = (amount) => {
    return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
        maximumFractionDigits: 0
    }).format(amount);
};

export const Overview = ({ attendance, finance }) => {
    // Calculate Stats
    const todayAttendance = attendance.find(r => isToday(new Date(r.date)))?.total || 0;
    const weekAttendance = attendance.filter(r => isThisWeek(new Date(r.date))).reduce((acc, curr) => acc + curr.total, 0);
    const monthAttendance = attendance.filter(r => isThisMonth(new Date(r.date))).reduce((acc, curr) => acc + curr.total, 0);
    const monthFirstTimers = attendance.filter(r => isThisMonth(new Date(r.date))).reduce((acc, curr) => acc + (curr.firstTimers || 0), 0);

    const totalIncome = finance.filter(f => f.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpenses = finance.filter(f => f.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    const netBalance = totalIncome - totalExpenses;

    // Recent Attendance Trend
    const trendData = attendance.slice(0, 10).reverse().map(r => ({
        name: format(new Date(r.date), 'MMM dd'),
        total: r.total,
        firstTimers: r.firstTimers || 0
    }));

    // Finance Distribution
    const incomeByCategory = finance
        .filter(f => f.type === 'income')
        .reduce((acc, curr) => {
            acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
            return acc;
        }, {});

    const pieData = Object.entries(incomeByCategory)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Executive Dashboard</h2>
                    <p className="text-muted-foreground">Comprehensive overview of ministry metrics in Cedis (GH₵).</p>
                </div>
                <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-xl text-sm font-medium shadow-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    {format(new Date(), 'MMMM dd, yyyy')}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Today's Attendance" value={todayAttendance} icon={Users} color="primary" trendValue={12} trend="up" />
                <StatCard title="This Month Attendance" value={monthAttendance} icon={Users} color="indigo" />
                <StatCard title="This Month 1st Timers" value={monthFirstTimers} icon={Sparkles} color="warning" />
                <StatCard title="Net Balance" value={formatCedis(netBalance)} icon={Wallet} color="success" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Income (YTD)" value={formatCedis(totalIncome)} icon={HandCoins} color="success" />
                <StatCard title="Total Expenses (YTD)" value={formatCedis(totalExpenses)} icon={TrendingUp} color="danger" />
                <StatCard title="Yearly Attendance" value={attendance.filter(r => isThisYear(new Date(r.date))).reduce((a, b) => a + b.total, 0)} icon={BarChart3} color="primary" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ChartCard title="Service Performance Trend" subtitle="Recent attendance and visitors">
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorFirst" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#818cf8" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'hsl(var(--card))',
                                        borderRadius: '12px',
                                        border: '1px solid hsl(var(--border))',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                />
                                <Area type="monotone" name="Total Attendance" dataKey="total" stroke="hsl(var(--primary))" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                                <Area type="monotone" name="First Timers" dataKey="firstTimers" stroke="#818cf8" strokeWidth={2} fillOpacity={1} fill="url(#colorFirst)" strokeDasharray="5 5" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartCard>
                </div>

                <ChartCard title="Income Distribution" subtitle="Income by category breakdown (GH₵)">
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => formatCedis(value)} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-6 space-y-3">
                        {pieData.map((item, i) => (
                            <div key={item.name} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-muted-foreground font-medium">{item.name}</span>
                                </div>
                                <span className="font-bold">{formatCedis(item.value)}</span>
                            </div>
                        ))}
                    </div>
                </ChartCard>
            </div>
        </div>
    );
};
