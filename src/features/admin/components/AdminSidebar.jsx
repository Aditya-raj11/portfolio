import React from 'react';
import { LayoutDashboard, PieChart, Briefcase, MessageCircle, User, Settings, Sun, Moon, LogOut, Star } from 'lucide-react';

const AdminSidebar = ({ activeTab, setActiveTab, messages, darkMode, setDarkMode, handleLogout }) => {
    return (
        <aside className="w-64 glass-panel border-r border-[#e5e7eb] dark:border-white/10 hidden md:flex flex-col fixed h-full z-10 transition-colors duration-300">
            <div className="p-6 border-b border-black/10 dark:border-white/10">
                <div className="flex items-center gap-2 text-glossy font-bold text-xl tracking-tight">
                    <LayoutDashboard size={24} />
                    <span className="font-heading">DevConsole</span>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                <button
                    onClick={() => setActiveTab('dashboard')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222]'}`}
                >
                    <PieChart size={18} />
                    Overview
                </button>
                <button
                    onClick={() => setActiveTab('projects')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'projects' ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222]'}`}
                >
                    <Briefcase size={18} />
                    Projects
                </button>
                <button
                    onClick={() => setActiveTab('messages')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'messages' ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222]'}`}
                >
                    <MessageCircle size={18} />
                    Messages
                    {messages.filter(m => !m.read).length > 0 && (
                        <span className="ml-auto bg-black dark:bg-white text-white dark:text-black text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {messages.filter(m => !m.read).length}
                        </span>
                    )}
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222]'}`}
                >
                    <User size={18} />
                    Profile
                </button>
                <button
                    onClick={() => setActiveTab('experiences')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'experiences' ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222]'}`}
                >
                    <Briefcase size={18} />
                    Experience
                </button>
                <button
                    onClick={() => setActiveTab('certifications')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'certifications' ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222]'}`}
                >
                    <Star size={18} />
                    Certifications
                </button>
                <button
                    onClick={() => setActiveTab('achievements')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'achievements' ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222]'}`}
                >
                    <Star size={18} />
                    Achievements
                </button>
                <button
                    onClick={() => setActiveTab('ai')}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'ai' ? 'bg-black/5 dark:bg-white/10 text-black dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222]'}`}
                >
                    <Settings size={18} />
                    AI Config
                </button>
            </nav>

            <div className="p-4 border-t border-gray-100 dark:border-[#333] space-y-2">
                <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#222] rounded-lg transition-colors"
                >
                    {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                    {darkMode ? 'Light Mode' : 'Dark Mode'}
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
                >
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
