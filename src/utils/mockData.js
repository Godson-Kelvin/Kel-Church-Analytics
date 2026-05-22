import { subDays, format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear } from 'date-fns';

export const generateMockData = () => {
    const attendance = [];
    const finance = [];

    const incomeCategories = [
        'Tithes', 'Offerings', 'Special offerings', 'Seed offerings', 'First fruits',
        'Thanksgiving', 'Donations', 'Welfare giving', 'Project fund', 'Mission support'
    ];

    const expenseCategories = [
        'Utilities', 'Welfare support', 'Maintenance', 'Events', 'Salaries',
        'Missions', 'Equipment', 'Media', 'Transport'
    ];

    // Generate last 12 months of data
    for (let i = 365; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dateStr = format(date, 'yyyy-MM-dd');

        // Attendance on Sundays and Wednesdays
        const day = date.getDay();
        if (day === 0 || day === 3) {
            attendance.push({
                id: crypto.randomUUID(),
                date: dateStr,
                type: day === 0 ? 'Sunday Service' : 'Mid-week Service',
                men: Math.floor(Math.random() * 50) + 20,
                women: Math.floor(Math.random() * 60) + 30,
                youth: Math.floor(Math.random() * 40) + 15,
                children: Math.floor(Math.random() * 30) + 10,
                total: 0, // Will be calculated in useChurchData or here
                timestamp: date.toISOString()
            });
            attendance[attendance.length - 1].total =
                attendance[attendance.length - 1].men +
                attendance[attendance.length - 1].women +
                attendance[attendance.length - 1].youth +
                attendance[attendance.length - 1].children;
        }

        // Finance - random income/expenses
        if (Math.random() > 0.7) {
            const isIncome = Math.random() > 0.3;
            const category = isIncome
                ? incomeCategories[Math.floor(Math.random() * incomeCategories.length)]
                : expenseCategories[Math.floor(Math.random() * expenseCategories.length)];

            finance.push({
                id: crypto.randomUUID(),
                date: dateStr,
                type: isIncome ? 'income' : 'expense',
                category,
                amount: isIncome ? Math.floor(Math.random() * 1000) + 200 : Math.floor(Math.random() * 500) + 50,
                description: `${category} record`,
                timestamp: date.toISOString()
            });
        }
    }

    return { attendance, finance };
};
