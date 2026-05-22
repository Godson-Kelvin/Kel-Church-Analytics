import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

const cn = (...inputs) => twMerge(clsx(inputs));

export const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "primary" }) => {
    const colorMap = {
        primary: "bg-primary/10 text-primary",
        success: "bg-emerald-500/10 text-emerald-500",
        warning: "bg-amber-500/10 text-amber-500",
        danger: "bg-rose-500/10 text-rose-500",
        indigo: "bg-indigo-500/10 text-indigo-500",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
            className="p-6 rounded-2xl bg-card border border-border shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all group"
        >
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", colorMap[color] || colorMap.primary)}>
                    <Icon className="w-6 h-6" />
                </div>
                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                        trend === "up" ? "text-emerald-500 bg-emerald-500/10" : "text-rose-500 bg-rose-500/10"
                    )}>
                        {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {trendValue}%
                    </div>
                )}
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
                <h3 className="text-2xl font-bold tracking-tight">{value}</h3>
            </div>
        </motion.div>
    );
};
