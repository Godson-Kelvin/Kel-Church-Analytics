import React, { useState } from 'react';
import { ChartCard } from '../components/ChartCard';
import {
    FileSearch,
    Download,
    Printer,
    Calendar,
    FileSpreadsheet,
    FileText,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const formatCedis = (amount) => {
    return new Intl.NumberFormat('en-GH', {
        style: 'currency',
        currency: 'GHS',
        minimumFractionDigits: 2
    }).format(amount);
};

export const Reports = ({ attendance, finance }) => {
    const [dateRange, setDateRange] = useState({
        start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
        end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
    });
    const [isGenerating, setIsGenerating] = useState(false);
    const [lastGenerated, setLastGenerated] = useState(null);

    const filteredAttendance = attendance.filter(r =>
        isWithinInterval(new Date(r.date), {
            start: new Date(dateRange.start),
            end: new Date(dateRange.end)
        })
    );

    const filteredFinance = finance.filter(f =>
        isWithinInterval(new Date(f.date), {
            start: new Date(dateRange.start),
            end: new Date(dateRange.end)
        })
    );

    const handleGenerate = () => {
        setIsGenerating(true);
        // Simulate complex report generation
        setTimeout(() => {
            setIsGenerating(false);
            setLastGenerated(new Date());
        }, 1200);
    };

    const exportCSV = (data, filename) => {
        if (data.length === 0) return;
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(fieldName => {
                let value = row[fieldName] ?? '';
                let cell = String(value).replace(/"/g, '""');
                if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
                    cell = `"${cell}"`;
                }
                return cell;
            }).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", `${filename}_${format(new Date(), 'yyyyMMdd')}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="space-y-8 animate-in zoom-in-95 duration-500 print:p-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-foreground">Analytics Reports</h2>
                    <p className="text-muted-foreground">Generate and export detailed ministry performance data in Cedis (GH₵).</p>
                </div>
            </div>

            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm print:hidden">
                <div className="flex flex-col md:flex-row items-end gap-6">
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> Start Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.start}
                            onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <div className="flex-1 space-y-2">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Calendar className="w-4 h-4" /> End Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.end}
                            onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary outline-none"
                        />
                    </div>
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all disabled:opacity-70 disabled:hover:scale-100"
                    >
                        {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileSearch className="w-5 h-5" />}
                        {isGenerating ? 'Processing...' : 'Generate Preview'}
                    </button>
                </div>
                {lastGenerated && (
                    <div className="mt-4 flex items-center gap-2 text-xs text-emerald-500 font-medium animate-in fade-in slide-in-from-bottom-2">
                        <CheckCircle2 className="w-3 h-3" /> Report generated for the selected range.
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 print:hidden">
                <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <FileSpreadsheet className="w-6 h-6 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Attendance Summary</h3>
                    <p className="text-muted-foreground text-sm mb-6">Detailed breakdown including demographics and first timers for the selected period.</p>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => exportCSV(filteredAttendance, 'attendance_report')}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-bold hover:bg-muted transition-colors"
                        >
                            <Download className="w-4 h-4" /> CSV
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-bold hover:bg-muted transition-colors"
                        >
                            <Printer className="w-4 h-4" /> Print PDF
                        </button>
                    </div>
                </div>

                <div className="bg-card border border-border p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all group">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                        <FileText className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Financial Statement</h3>
                    <p className="text-muted-foreground text-sm mb-6">Complete record of income and expenses in Cedis (GH₵).</p>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => exportCSV(filteredFinance, 'finance_report')}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-bold hover:bg-muted transition-colors"
                        >
                            <Download className="w-4 h-4" /> CSV
                        </button>
                        <button
                            onClick={() => window.print()}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-border rounded-xl text-sm font-bold hover:bg-muted transition-colors"
                        >
                            <Printer className="w-4 h-4" /> Print PDF
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-8 print:border-none print:shadow-none relative overflow-hidden">
                {isGenerating && (
                    <div className="absolute inset-0 bg-card/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-4 animate-in fade-in">
                        <Loader2 className="w-10 h-10 text-primary animate-spin" />
                        <p className="font-bold text-primary">Generating Report...</p>
                    </div>
                )}

                <h3 className="text-xl font-bold mb-6 text-center">Ministry Report: {format(new Date(dateRange.start), 'MMM dd')} - {format(new Date(dateRange.end), 'MMM dd, yyyy')}</h3>
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-8">
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Attendance</p>
                        <p className="text-2xl font-bold">{filteredAttendance.reduce((a, b) => a + b.total, 0)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">First Timers</p>
                        <p className="text-2xl font-bold text-primary">{filteredAttendance.reduce((a, b) => a + (b.firstTimers || 0), 0)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Avg/Service</p>
                        <p className="text-2xl font-bold">{Math.round(filteredAttendance.reduce((a, b) => a + b.total, 0) / (filteredAttendance.length || 1))}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Income</p>
                        <p className="text-2xl font-bold text-emerald-500">{formatCedis(filteredFinance.filter(f => f.type === 'income').reduce((a, b) => a + b.amount, 0))}</p>
                    </div>
                    <div>
                        <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                        <p className="text-2xl font-bold text-rose-500">{formatCedis(filteredFinance.filter(f => f.type === 'expense').reduce((a, b) => a + b.amount, 0))}</p>
                    </div>
                </div>

                <div className="hidden print:block mt-10 text-center border-t pt-6">
                    <p className="text-xs text-muted-foreground">Kel Church Analytics | Automated Ministry Report</p>
                    <p className="text-[10px] text-muted-foreground mt-1">Report Generated: {format(new Date(), 'PPP p')}</p>
                </div>
            </div>
        </div>
    );
};
