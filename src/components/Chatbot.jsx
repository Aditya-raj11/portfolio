import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { MessageSquare, Send, X, Sparkles, User, Loader2, RefreshCw } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../lib/firebase';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const Chatbot = forwardRef((props, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', text: "Hi! I'm Aditya's AI Assistant. Ask me anything about his projects, skills, or experience!" }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [projectContext, setProjectContext] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useImperativeHandle(ref, () => ({
        openWithPrompt: (promptText) => {
            setIsOpen(true);
            setMessages(prev => [...prev, { role: 'user', text: promptText }]);
            // We need to trigger handleSend logic, but handleSend uses current state which might be stale in this closure if not careful.
            // Better approach: Set input and auto-send, or just call the API directly here.
            // Let's reuse handleSend but we need to pass the text directly.
            handleSend(promptText);
        }
    }));

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]); // Scroll on open too

    // Fetch projects to send as context
    useEffect(() => {
        const fetchContext = async () => {
            try {
                const projectsSnap = await getDocs(collection(db, "projects"));
                const projects = projectsSnap.docs.map(doc => doc.data());

                const context = `
                    --- PROJECTS DATA ---
                    ${projects.map(p => `
                    - Title: ${p.title}
                    - Description: ${p.description}
                    - Category: ${p.category}
                    - Tech Stack: ${p.techStack || 'Not specified'}
                    `).join('\n')}
                `;
                setProjectContext(context);
            } catch (error) {
                console.error("Error fetching projects for AI:", error);
            }
        };

        if (isOpen && !projectContext) {
            fetchContext();
        }

        // Fetch Profile Avatar
        const fetchProfile = async () => {
            try {
                const docRef = doc(db, "settings", "profile");
                const docSnap = await getDoc(docRef);
                if (docSnap.exists() && docSnap.data().avatarUrl) {
                    setAvatarUrl(docSnap.data().avatarUrl);
                }
            } catch (e) {
                console.error("Error fetching avatar:", e);
            }
        };
        fetchProfile();

    }, [isOpen]);

    const handleSend = async (manualText = null) => {
        const textToSend = typeof manualText === 'string' ? manualText : input;
        if (!textToSend.trim()) return;

        const userMessage = textToSend;
        setInput('');
        if (!manualText) { // If manual, we already added it in the imperative handle, OR we add it here? 
            // Actually, let's keep it simple. The imperative handle sets state, then calls this.
            // Wait, setting state is async. 
        }

        // Refined Logic for handleSend to support both:
        // 1. Click Send (uses input state)
        // 2. Programmatic (uses argument)

        if (typeof manualText !== 'string') {
            // Normal send
            setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
        }

        setIsLoading(true);

        try {
            const chatWithGemini = httpsCallable(functions, 'chatWithGemini');

            const result = await chatWithGemini({
                message: userMessage,
                history: messages.map(m => ({ role: m.role, text: m.text })),
                context: projectContext
            });

            const response = result.data.response;
            setMessages(prev => [...prev, { role: 'assistant', text: response }]);

        } catch (error) {
            console.error("Chat Error:", error);
            let errorMessage = "Connection issue. Please try again.";

            if (error.code === 'resource-exhausted') {
                errorMessage = "Message limit reached. Try later.";
            } else if (error.message) {
                errorMessage = `Error: ${error.message}`;
            }

            setMessages(prev => [...prev, { role: 'assistant', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearChat = () => {
        setMessages([{ role: 'assistant', text: "Chat cleared! How can I help?" }]);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            {/* Chat Window */}
            {isOpen && (
                <div className="glass-panel w-[350px] md:w-[400px] rounded-3xl overflow-hidden mb-4 flex flex-col transition-all duration-300 animate-in slide-in-from-bottom-10 fade-in border border-gray-200 dark:border-white/20 shadow-2xl">

                    {/* Header */}
                    <div className="p-4 flex items-center justify-between border-b border-black/10 dark:border-white/10">
                        <div className="flex items-center gap-3">
                            <div className={`rounded-xl overflow-hidden shadow-sm flex items-center justify-center ${avatarUrl ? 'w-9 h-9' : 'bg-black dark:bg-white text-white dark:text-black p-2'}`}>
                                {avatarUrl ? (
                                    <img src={avatarUrl} alt="AI" className="w-full h-full object-cover" />
                                ) : (
                                    <Sparkles size={18} fill="currentColor" className="text-white" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-glossy font-heading text-sm">Portfolio AI</h3>
                                <p className="text-xs text-black/60 dark:text-gray-400 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Online
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-1">
                            <button onClick={handleClearChat} className="p-2 hover:bg-gray-100 dark:hover:bg-[#303134] rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors" title="Clear Chat">
                                <RefreshCw size={16} />
                            </button>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#303134] rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                                <X size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div
                        className="h-[400px] overflow-y-auto p-4 space-y-6 bg-transparent scroll-smooth z-10"
                        data-lenis-prevent // Prevents Lenis from hijacking scroll
                    >
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''} animate-in fade-in slide-in-from-bottom-2 duration-300`}>

                                {/* Avatar */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${msg.role === 'assistant'
                                    ? 'bg-black dark:bg-white text-white dark:text-black shadow-md'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300'
                                    }`}>
                                    {msg.role === 'assistant' ? (
                                        avatarUrl ? <img src={avatarUrl} alt="AI" className="w-full h-full object-cover" /> : <Sparkles size={14} fill="currentColor" />
                                    ) : <User size={14} />}
                                </div>

                                {/* Bubble */}
                                <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-black rounded-tr-sm shadow-md'
                                    : 'glass-panel text-black dark:text-gray-200 rounded-tl-sm'
                                    }`}>
                                    {/* Markdown Content */}
                                    <div className="prose dark:prose-invert prose-sm max-w-none">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                // Custom renderers to strip margins and ensure styling fits the bubble
                                                p: ({ node, ...props }) => <p className="mb-1 last:mb-0" {...props} />,
                                                ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2 space-y-1" {...props} />,
                                                ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2 space-y-1" {...props} />,
                                                li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                a: ({ node, ...props }) => <a className="text-black dark:text-white hover:opacity-80 underline cursor-pointer" target="_blank" rel="noopener noreferrer" {...props} />,
                                                strong: ({ node, ...props }) => <strong className="font-bold" {...props} />,
                                                code: ({ node, inline, className, children, ...props }) => {
                                                    return inline ?
                                                        <code className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5 text-xs font-mono" {...props}>{children}</code> :
                                                        <pre className="bg-black/10 dark:bg-white/10 rounded p-2 overflow-x-auto text-xs font-mono my-2"><code {...props}>{children}</code></pre>
                                                }
                                            }}
                                        >
                                            {msg.text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-black dark:bg-white flex items-center justify-center flex-shrink-0">
                                    <Loader2 size={14} className="animate-spin text-white" />
                                </div>
                                <div className="glass-panel px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex gap-1 items-center">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 border-t border-black/10 dark:border-white/10 z-10">
                        <div className="flex gap-2 bg-black/5 dark:bg-black/40 p-1.5 rounded-full border border-transparent focus-within:border-gray-800/50 dark:focus-within:border-white/50 focus-within:ring-2 focus-within:ring-black/20 dark:focus-within:ring-white/20 transition-all">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Message..."
                                className="flex-1 bg-transparent text-black dark:text-white px-4 py-2 text-sm focus:outline-none placeholder-black/50 dark:placeholder-white/50"
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="btn-3d p-2 rounded-full flex-shrink-0 disabled:opacity-50 disabled:scale-95 disabled:border-b-[4px] disabled:transform-none flex items-center justify-center"
                            >
                                <Send size={16} className={isLoading ? 'hidden' : 'ml-0.5'} />
                                {isLoading && <Loader2 size={16} className="animate-spin" />}
                            </button>
                        </div>
                        <div className="text-center mt-2">
                            <p className="text-[10px] text-gray-400">AI can make mistakes. Check important info.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Action Button */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="group flex items-center gap-3 px-6 py-4 bg-[#0a0a0a] hover:bg-black border border-white/20 text-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.5)] dark:shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all hover:scale-105 active:scale-95"
                >
                    <Sparkles size={20} fill="currentColor" />
                    <span className="font-semibold tracking-wide text-white">Ask AI</span>
                </button>
            )}
        </div>
    );
});

export default Chatbot;
