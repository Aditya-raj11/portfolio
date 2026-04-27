import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Image as ImageIcon, Trash2, ExternalLink, FileText } from 'lucide-react';

const SortableGenericItem = ({ item, onDelete, onImageClick, type }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="glass-panel text-black dark:text-gray-300 p-4 rounded-xl transition-all group flex gap-4 items-center"
        >
            {/* Drag Handle */}
            <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <GripVertical size={20} />
            </div>

            <div
                className={`h-16 w-16 bg-gray-100 dark:bg-[#333] rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-[#444] ${item.fileType !== 'pdf' ? 'cursor-zoom-in' : 'cursor-pointer'}`}
                onClick={() => {
                    if (item.fileType === 'pdf') {
                        window.open(item.imageUrl, '_blank');
                    } else if (onImageClick) {
                        onImageClick(item);
                    }
                }}
            >
                {item.imageUrl ? (
                    item.fileType === 'pdf' ? (
                        <div className="w-full h-full flex items-center justify-center text-red-500 bg-red-50 dark:bg-red-900/20">
                            <FileText size={24} />
                        </div>
                    ) : (
                        <img src={item.imageUrl} alt="" className="w-full h-full object-cover" />
                    )
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon size={20} />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-black dark:text-white truncate flex items-center gap-2">
                    {item.title}
                    {item.linkUrl && (
                        <a href={item.linkUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-black dark:hover:text-white transition-colors" title="View Link">
                            <ExternalLink size={14} />
                        </a>
                    )}
                </h3>
                <p className="text-sm font-medium text-black/60 dark:text-gray-400 mb-1">{item.organization} • {item.duration}</p>
                <p className="text-sm text-black/80 dark:text-gray-300 line-clamp-1">{item.description}</p>
            </div>
            <div className="flex flex-col gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onDelete(item)}
                    className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title={`Delete ${type}`}
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default SortableGenericItem;
