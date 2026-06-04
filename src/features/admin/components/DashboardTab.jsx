import React from 'react';
import { User, Eye, BarChart2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const DashboardTab = ({ totalVisits, visitorStats, projects = [] }) => {
    // Calculations
    const totalProjectViews = projects.reduce((sum, p) => sum + (p.views || 0), 0);
    
    const sortedProjects = [...projects].sort((a, b) => (b.views || 0) - (a.views || 0));
    const topProject = sortedProjects[0];
    const topProjectName = topProject ? topProject.title : 'None';
    const topProjectViews = topProject ? (topProject.views || 0) : 0;

    // Category breakdown
    const categoryViews = { app: 0, website: 0, github: 0 };
    projects.forEach(p => {
        if (categoryViews[p.category] !== undefined) {
            categoryViews[p.category] += (p.views || 0);
        }
    });
    const totalCatViews = Object.values(categoryViews).reduce((a, b) => a + b, 0) || 1;
    const catPercentages = {
        app: Math.round((categoryViews.app / totalCatViews) * 100),
        website: Math.round((categoryViews.website / totalCatViews) * 100),
        github: Math.round((categoryViews.github / totalCatViews) * 100),
    };

    // Chart data for Popular Projects
    const chartData = sortedProjects.slice(0, 5).map(project => ({
        name: project.title.length > 15 ? project.title.slice(0, 15) + '...' : project.title,
        views: project.views || 0
    })).reverse(); // Reverse for clean bottom-to-top rendering in vertical bar chart

    return (
        <div className="space-y-6">
            {/* Stats Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Visitors Card */}
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

                {/* Total Project Views Card */}
                <div className="glass-panel text-black dark:text-white p-6 rounded-xl transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Project Interactions</h3>
                        <span className="p-2 bg-black/5 dark:bg-white/10 text-black dark:text-white rounded-lg"><Eye size={20} /></span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-4xl font-bold text-glossy font-heading">{totalProjectViews.toLocaleString()}</h2>
                        <span className="text-black dark:text-white text-sm font-medium flex items-center gap-1">Total Views</span>
                    </div>
                </div>

                {/* Top Project Card */}
                <div className="glass-panel text-black dark:text-white p-6 rounded-xl transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium uppercase tracking-wider">Top Project</h3>
                        <span className="p-2 bg-black/5 dark:bg-white/10 text-black dark:text-white rounded-lg"><BarChart2 size={20} /></span>
                    </div>
                    <div className="flex flex-col">
                        <h2 className="text-xl font-bold text-glossy font-heading truncate mb-1" title={topProjectName}>
                            {topProjectName}
                        </h2>
                        <span className="text-xs text-black/60 dark:text-gray-400 font-medium">
                            {topProjectViews.toLocaleString()} Views
                        </span>
                    </div>
                </div>
            </div>

            {/* Row 2: Visitor Trends & Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Visitor Trends Chart */}
                <div className="lg:col-span-2 glass-panel text-black dark:text-white p-6 rounded-xl transition-colors">
                    <h3 className="text-glossy font-heading text-lg font-bold mb-6">Visitor Trends (Last 7 Days)</h3>
                    <div className="h-[250px] w-full">
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

                {/* Project Leaderboard List */}
                <div className="lg:col-span-1 glass-panel text-black dark:text-white p-6 rounded-xl transition-colors flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-glossy font-heading text-lg font-bold">Project Leaderboard</h3>
                        <span className="text-xs bg-black/5 dark:bg-white/10 px-2.5 py-1 rounded-full text-gray-500 dark:text-gray-400 font-medium">Views</span>
                    </div>
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[250px] pr-1">
                        {sortedProjects.map((project, idx) => {
                            const maxViews = Math.max(...projects.map(p => p.views || 0), 1);
                            const percentage = Math.round(((project.views || 0) / maxViews) * 100);
                            return (
                                <div key={project.id} className="flex flex-col gap-1.5">
                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 truncate">
                                            <span className="text-xs font-mono font-bold text-gray-400 dark:text-gray-500">#{idx + 1}</span>
                                            <span className="font-semibold truncate">{project.title}</span>
                                            <span className="text-[9px] px-1.5 py-0.5 bg-black/5 dark:bg-white/5 text-gray-500 dark:text-gray-400 rounded uppercase tracking-wider">{project.category}</span>
                                        </div>
                                        <span className="font-mono font-bold">{project.views || 0}</span>
                                    </div>
                                    <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <div 
                                            className="bg-blue-500 dark:bg-blue-400 h-full rounded-full transition-all duration-500" 
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {projects.length === 0 && (
                            <div className="text-center py-12 text-sm text-gray-400">No project views data available</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Row 3: Popular Projects Chart & Category Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Popular Projects Chart */}
                <div className="lg:col-span-2 glass-panel text-black dark:text-white p-6 rounded-xl transition-colors flex flex-col">
                    <h3 className="text-glossy font-heading text-lg font-bold mb-6">Popular Projects</h3>
                    <div className="h-[250px] w-full flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 20 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                                <XAxis type="number" stroke="#9CA3AF" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                                <YAxis dataKey="name" type="category" stroke="#9CA3AF" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={100} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                    itemStyle={{ color: '#111827' }}
                                    cursor={{ fill: '#f3f4f6' }}
                                />
                                <Bar dataKey="views" fill="#8B5CF6" radius={[0, 4, 4, 0]} barSize={16} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Views by Category Breakdown */}
                <div className="lg:col-span-1 glass-panel text-black dark:text-white p-6 rounded-xl transition-colors flex flex-col justify-between">
                    <div>
                        <h3 className="text-glossy font-heading text-lg font-bold mb-6">Views by Category</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between text-sm mb-1.5 font-medium">
                                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />Mobile Apps</span>
                                    <span>{categoryViews.app} ({catPercentages.app}%)</span>
                                </div>
                                <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${catPercentages.app}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1.5 font-medium">
                                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block" />Websites</span>
                                    <span>{categoryViews.website} ({catPercentages.website}%)</span>
                                </div>
                                <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${catPercentages.website}%` }} />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between text-sm mb-1.5 font-medium">
                                    <span className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />GitHub Repos</span>
                                    <span>{categoryViews.github} ({catPercentages.github}%)</span>
                                </div>
                                <div className="w-full bg-black/5 dark:bg-white/5 h-2 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${catPercentages.github}%` }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardTab;
