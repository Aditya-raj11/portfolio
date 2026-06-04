import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const MONTHS_SHORT = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * MonthYearPicker — A dropdown-style month/year selector.
 *
 * Props:
 *  - value: string (e.g. "April 2026" or "Present")
 *  - onChange: (formattedDate: string) => void
 *  - label: string — field label
 *  - required: boolean
 *  - placeholder: string
 *  - showPresent: boolean — whether to show a "Present" toggle (for ongoing durations)
 */
const MonthYearPicker = ({ value = '', onChange, label, required = false, placeholder = 'Select date', showPresent = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewYear, setViewYear] = useState(new Date().getFullYear());
    const containerRef = useRef(null);
    const panelRef = useRef(null);

    const isPresent = value?.toLowerCase() === 'present';

    // Parse current value to highlight selected month/year
    const parseValue = () => {
        if (!value || isPresent) return { month: -1, year: -1 };
        const parts = value.split(' ');
        if (parts.length === 2) {
            const monthIdx = MONTHS.findIndex(m => m.toLowerCase() === parts[0].toLowerCase());
            const year = parseInt(parts[1], 10);
            if (monthIdx !== -1 && !isNaN(year)) return { month: monthIdx, year };
        }
        return { month: -1, year: -1 };
    };

    const selected = parseValue();

    // Initialize viewYear from value
    useEffect(() => {
        const parsed = parseValue();
        if (parsed.year > 0) {
            setViewYear(parsed.year);
        }
    }, [value]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // Position the panel (ensure it doesn't overflow viewport)
    useEffect(() => {
        if (isOpen && panelRef.current && containerRef.current) {
            const containerRect = containerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - containerRect.bottom;
            if (spaceBelow < 320) {
                panelRef.current.style.bottom = '100%';
                panelRef.current.style.top = 'auto';
                panelRef.current.style.marginBottom = '4px';
            } else {
                panelRef.current.style.top = '100%';
                panelRef.current.style.bottom = 'auto';
                panelRef.current.style.marginTop = '4px';
            }
        }
    }, [isOpen]);

    const handleMonthSelect = (monthIdx) => {
        const formatted = `${MONTHS[monthIdx]} ${viewYear}`;
        onChange(formatted);
        setIsOpen(false);
    };

    const handlePresent = () => {
        onChange('Present');
        setIsOpen(false);
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
    };

    return (
        <div className="space-y-1.5">
            {label && (
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {label}
                    {required && <span className="text-red-400 ml-0.5">*</span>}
                </label>
            )}
            <div ref={containerRef} className="relative">
                {/* Trigger Button */}
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`w-full flex items-center justify-between bg-black/5 dark:bg-[#111] border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-left transition-all outline-none focus:ring-2 focus:ring-black dark:focus:ring-white ${
                        value ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                    }`}
                >
                    <span className="flex items-center gap-2 text-sm">
                        <Calendar size={15} className="text-gray-400 dark:text-gray-500 shrink-0" />
                        {value || placeholder}
                    </span>
                    <div className="flex items-center gap-1">
                        {value && (
                            <span
                                onClick={handleClear}
                                className="p-0.5 rounded hover:bg-black/10 dark:hover:bg-white/10 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer"
                            >
                                <X size={14} />
                            </span>
                        )}
                    </div>
                </button>

                {/* Dropdown Panel */}
                {isOpen && (
                    <div
                        ref={panelRef}
                        className="absolute left-0 right-0 z-50 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
                    >
                        {/* Year Navigation */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/[0.06] bg-gray-50/50 dark:bg-white/[0.02]">
                            <button
                                type="button"
                                onClick={() => setViewYear(y => y - 1)}
                                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <span className="text-sm font-bold text-gray-900 dark:text-white tracking-wide">
                                {viewYear}
                            </span>
                            <button
                                type="button"
                                onClick={() => setViewYear(y => y + 1)}
                                className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Month Grid */}
                        <div className="grid grid-cols-3 gap-1.5 p-3">
                            {MONTHS_SHORT.map((month, idx) => {
                                const isSelected = selected.month === idx && selected.year === viewYear;
                                const isFuture = viewYear > new Date().getFullYear() || 
                                    (viewYear === new Date().getFullYear() && idx > new Date().getMonth());

                                return (
                                    <button
                                        key={month}
                                        type="button"
                                        onClick={() => handleMonthSelect(idx)}
                                        className={`py-2 px-1 rounded-lg text-xs font-semibold transition-all duration-150 ${
                                            isSelected
                                                ? 'bg-black dark:bg-white text-white dark:text-black shadow-md scale-105'
                                                : isFuture
                                                    ? 'text-gray-300 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/5'
                                                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10'
                                        }`}
                                    >
                                        {month}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Present Toggle */}
                        {showPresent && (
                            <div className="px-3 pb-3">
                                <button
                                    type="button"
                                    onClick={handlePresent}
                                    className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                        isPresent
                                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                            : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10 border border-transparent'
                                    }`}
                                >
                                    ● Present (Ongoing)
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonthYearPicker;
