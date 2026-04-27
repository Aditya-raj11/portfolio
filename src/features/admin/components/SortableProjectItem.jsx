import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Image as ImageIcon, Star, Trash2 } from 'lucide-react';

const SortableProjectItem = ({ project, onToggleFeatured, onDelete, onImageClick }) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: project.id });

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
                className="h-16 w-16 bg-gray-100 dark:bg-[#333] rounded-lg overflow-hidden flex-shrink-0 border border-gray-100 dark:border-[#444] cursor-zoom-in"
                onClick={() => onImageClick(project)}
            >
                {project.imageUrl ? (
                    <img src={project.imageUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ImageIcon size={20} />
                    </div>
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-black dark:text-white truncate">{project.title}</h3>
                <p className="text-sm text-black/80 dark:text-gray-300 line-clamp-1 mb-2">{project.description}</p>
                <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-[#333] text-gray-600 dark:text-gray-300 text-[10px] font-medium uppercase tracking-wider rounded border border-gray-200 dark:border-[#444]">
                        {project.category}
                    </span>
                    {project.featured && (
                        <span className="px-2 py-0.5 bg-black/5 dark:bg-white/10 text-black dark:text-white text-[10px] font-medium uppercase tracking-wider rounded border border-black/20 dark:border-white/20 flex items-center gap-1">
                            <Star size={8} fill="currentColor" /> Featured
                        </span>
                    )}
                </div>
            </div>
            <div className="flex flex-col gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={() => onToggleFeatured(project)}
                    className={`p-2 rounded-lg transition-colors ${project.featured ? 'bg-black/10 text-black dark:bg-white/10 dark:text-white' : 'text-gray-400 hover:bg-black/5 hover:text-black dark:hover:bg-white/5 dark:hover:text-white'}`}
                    title={project.featured ? "Unfeature" : "Spotlight this project"}
                >
                    <Star size={18} fill={project.featured ? "currentColor" : "none"} />
                </button>
                <button
                    onClick={() => onDelete(project)}
                    className="p-2 text-gray-400 hover:text-black dark:hover:text-white hover:bg-black/10 dark:hover:bg-white/10 rounded-lg transition-colors"
                    title="Delete Project"
                >
                    <Trash2 size={18} />
                </button>
            </div>
        </div>
    );
};

export default SortableProjectItem;
