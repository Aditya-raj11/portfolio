import React from 'react';
import { MessageCircle, Trash2 } from 'lucide-react';

const MessagesTab = ({ messages, deleteMessage, markMessageRead }) => {
    return (
        <div className="glass-panel text-black dark:text-white rounded-xl overflow-hidden transition-colors">
            <div className="p-6 border-b border-black/10 dark:border-white/10">
                <h2 className="text-lg font-semibold font-heading text-glossy">Inbox</h2>
            </div>
            <div className="divide-y divide-black/10 dark:divide-white/10">
                {messages.length > 0 ? messages.map(msg => (
                    <div key={msg.id} className={`p-6 transition-colors ${msg.read ? 'bg-transparent' : 'bg-black/5 dark:bg-white/10'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className={`font-medium ${msg.read ? 'text-black dark:text-white' : 'text-black dark:text-white'} flex items-center gap-2`}>
                                    {msg.name}
                                    {!msg.read && <span className="w-2 h-2 rounded-full bg-black dark:bg-white"></span>}
                                </h3>
                                <a href={`mailto:${msg.email}`} className="text-sm text-black/80 dark:text-gray-300 hover:text-black dark:hover:text-white">{msg.email}</a>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {new Date(msg.createdAt).toLocaleDateString()}
                                </span>
                                <button
                                    onClick={() => deleteMessage(msg.id)}
                                    className="text-gray-400 hover:text-black dark:hover:text-white"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <p className="text-black/80 dark:text-gray-300 text-sm mt-3 whitespace-pre-wrap">{msg.message}</p>
                        {!msg.read && (
                            <button
                                onClick={() => markMessageRead(msg.id)}
                                className="text-xs text-black dark:text-white mt-4 font-medium hover:underline"
                            >
                                Mark as Read
                            </button>
                        )}
                    </div>
                )) : (
                    <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                        <MessageCircle size={32} className="mx-auto mb-3 opacity-50" />
                        <p>No messages yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MessagesTab;
