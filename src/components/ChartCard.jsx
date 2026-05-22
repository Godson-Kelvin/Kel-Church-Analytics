import React from 'react';
import { motion } from 'framer-motion';

export const ChartCard = ({ title, children, subtitle, actions }) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col h-full"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-bold tracking-tight text-foreground">{title}</h3>
                    {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                </div>
                {actions && <div className="flex gap-2">{actions}</div>}
            </div>
            <div className="flex-1 min-h-[300px] w-full">
                {children}
            </div>
        </motion.div>
    );
};
