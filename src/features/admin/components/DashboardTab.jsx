import React from 'react';
import { User } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const DashboardTab = ({ totalVisits, visitorStats }) => {
    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel text-black dark:text-white p-6 rounded-xl transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Total Visitors</h3>
                        <span className="p-2 bg-black/5 dark:bg-white/10 text-black dark:text-white rounded-lg"><User size={20} /></span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-bold text-glossy font-heading">{totalVisits.toLocaleString()}</h2>
                        <span className="text-black dark:text-white text-sm font-medium flex items-center gap-1">All Time</span>
                    </div>
                </div>

                <div className="md:col-span-2 glass-panel text-black dark:text-white p-6 rounded-xl transition-colors">
                    <h3 className="text-glossy font-heading mb-6">Visitor Trends (Last 7 Days)</h3>
                    <div className="h-[200px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={visitorStats}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="date" stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <YAxis stroke="#9CA3AF" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#111827' }}
                                    cursor={{ fill: '#f3f4f6' }}
                                />
                                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
