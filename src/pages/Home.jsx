import React, { useEffect, useState, useRef } from 'react';
import { collection, getDocs, query, orderBy, doc, getDoc, updateDoc, increment, setDoc, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import ProjectCard from '../components/ProjectCard';
import ThemeToggle from '../components/ThemeToggle';
import Chatbot from '../components/Chatbot';
import ResumeModal from '../components/ResumeModal';
import ParticleBackground from '../components/ParticleBackground';
import SkeletonCard from '../components/SkeletonCard';
import SEO from '../components/SEO';
import ShareButton from '../components/ShareButton';
import AnimatedSection from '../components/AnimatedSection';
import Tilt from 'react-parallax-tilt';
import { Github, Linkedin, Mail, FileText, ChevronRight, ExternalLink, Star, Code2, Briefcase, Rocket, Sparkles, Loader2, FolderOpen } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import ImageLightbox from '../components/ImageLightbox';

const Home = () => {
    const [projects, setProjects] = useState([]);
    const [featuredProject, setFeaturedProject] = useState(null);

    const [loading, setLoading] = useState(true);
    const [profile, setProfile] = useState({
        name: 'Aditya Raj',
        tagline: 'A Tech Explorer & Full Stack Developer making useful things for the web and mobile.',
        resumeUrl: '',
        githubUrl: 'https://github.com/Aditya-raj11',
        linkedinUrl: 'https://www.linkedin.com/in/aditya-raj-3027302ba/',
        email: 'adityaraj110405@gmail.com'
    });

    // Control the Resume Modal
    // Control the Resume Modal
    const [isResumeOpen, setIsResumeOpen] = useState(false);
    const [isFeaturedLightboxOpen, setIsFeaturedLightboxOpen] = useState(false);

    // Contact Form State
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        if (!contactForm.name || !contactForm.email || !contactForm.message) {
            setSubmitMessage({ type: 'error', text: 'Please fill in all fields.' });
            return;
        }
        setIsSubmitting(true);
        setSubmitMessage({ type: '', text: '' });
        try {
            await addDoc(collection(db, "messages"), {
                ...contactForm,
                createdAt: new Date().toISOString(),
                read: false
            });
            setSubmitMessage({ type: 'success', text: 'Message sent successfully! I will get back to you soon.' });
            setContactForm({ name: '', email: '', message: '' });
        } catch (error) {
            console.error("Error sending message: ", error);
            setSubmitMessage({ type: 'error', text: 'Failed to send message. Please try again later.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const chatbotRef = useRef(null);

    const handlePersonaClick = (type) => {
        let prompt = "";
        switch (type) {
            case 'recruiter':
                prompt = "Hi! I am a recruiter looking for a skilled Full Stack Developer. Can you show me your best professional projects and explain why I should hire you?";
                break;
            case 'developer':
                prompt = "Hey! I'm a developer too. I'm interested in your technical depth. Show me your most complex projects and explain the tech stack and architectural decisions.";
                break;
            case 'founder':
                prompt = "Hello! I'm a founder looking for someone to build an MVP. Do you have experience building complete products? Show me examples of launched apps.";
                break;
            default:
                prompt = "Tell me about your best work.";
        }
        chatbotRef.current?.openWithPrompt(prompt);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Projects
                const q = query(collection(db, "projects"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);

                const projectsData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Sort by 'order' if exists
                projectsData.sort((a, b) => {
                    const orderA = a.order !== undefined ? a.order : 9999;
                    const orderB = b.order !== undefined ? b.order : 9999;
                    return orderA - orderB;
                });

                setProjects(projectsData);

                // Find featured project (first one found)
                const featured = projectsData.find(p => p.featured);
                setFeaturedProject(featured || null);

                // 2. Fetch Profile
                const profileDoc = await getDoc(doc(db, "settings", "profile"));
                if (profileDoc.exists()) {
                    setProfile(prev => ({ ...prev, ...profileDoc.data() }));
                }
            } catch (error) {
                console.error("Error fetching data: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();

        // 3. Track Visits (Session-based)
        const trackVisit = async () => {
            const hasVisited = sessionStorage.getItem('hasVisited');
            if (!hasVisited) {
                try {
                    const statsRef = doc(db, "stats", "visitors");
                    const statsSnap = await getDoc(statsRef);

                    if (statsSnap.exists()) {
                        await updateDoc(statsRef, {
                            totalVisits: increment(1),
                            lastVisit: new Date().toISOString()
                        });
                    } else {
                        await setDoc(statsRef, {
                            totalVisits: 1,
                            lastVisit: new Date().toISOString()
                        });
                    }

                    // Also track daily stats for the graph
                    const today = new Date().toISOString().split('T')[0];
                    const dailyRef = doc(db, "stats", "visits", "daily", today);
                    const dailySnap = await getDoc(dailyRef);

                    if (dailySnap.exists()) {
                        await updateDoc(dailyRef, { count: increment(1) });
                    } else {
                        await setDoc(dailyRef, { date: today, count: 1 });
                    }

                    sessionStorage.setItem('hasVisited', 'true');
                } catch (e) {
                    console.error("Error tracking visit:", e);
                }
            }
        };

        // Only track in production or if not localhost (optional, mostly just tracking session)
        trackVisit();

    }, []);

    return (
        <div className="min-h-screen transition-colors duration-300 overflow-x-hidden">

            {/* 1. Interactive Background */}
            <ParticleBackground />

            <SEO
                title={`${profile.name} - Portfolio`}
                description={profile.tagline}
                image={profile.avatarUrl}
            />

            {/* Hero Section */}
            <header className="max-w-7xl mx-auto px-6 py-12 md:py-24 relative">
                <div className="absolute top-6 right-6 z-50">
                    <ThemeToggle />
                </div>

                <AnimatedSection delay={0.1} className="max-w-4xl mt-12 relative z-10">
                    <div className="flex items-center gap-4 mb-12">
                        <div className="relative group">
                            {profile.avatarUrl ? (
                                <img
                                    src={profile.avatarUrl}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-slate-200 dark:border-white/20 shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:shadow-[0_0_15px_rgba(255,255,255,0.1)] relative z-10"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-black flex items-center justify-center text-2xl font-bold text-white shadow-md relative z-10 border border-white/10">
                                    {profile.name.charAt(0)}{profile.name.split(' ')[1] ? profile.name.split(' ')[1].charAt(0) : ''}
                                </div>
                            )}
                        </div>
                        <a href="/" className="inline-block">
                            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-heading text-3xl transition-colors text-glossy underline-offset-4 hover:underline px-4 py-2 cursor-pointer">
                                {profile.name}
                            </button>
                        </a>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-heading mb-6 tracking-tight text-glossy leading-tight">
                        Hi, I'm <br /><span>{profile.name}</span>.
                    </h1>

                    <h2 className="text-2xl md:text-3xl font-heading text-black/80 dark:text-gray-200 font-light mb-8 max-w-2xl leading-relaxed">
                        {profile.tagline || "A Tech Explorer & Full Stack Developer making useful things for the web and mobile."}
                    </h2>

                    <p className="text-black/80 dark:text-gray-300 text-lg leading-relaxed max-w-2xl mb-10">
                        Currently studying at <span className="text-black dark:text-white font-bold border-b-2 border-black/30 dark:border-white/30">KIIT</span>. I specialize in building clean, efficient applications using modern technologies like React, Firebase, and Tailwind CSS.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        {profile.resumeUrl && (
                            <button
                                onClick={() => setIsResumeOpen(true)}
                                className="px-8 py-3 btn-3d rounded-full flex items-center gap-2 z-20"
                            >
                                <FileText size={18} /> View Resume
                            </button>
                        )}
                        {profile.githubUrl && (
                            <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 btn-3d rounded-full flex items-center gap-2 z-20">
                                <Github size={18} /> GitHub
                            </a>
                        )}
                        {profile.linkedinUrl && (
                            <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 btn-3d rounded-full flex items-center gap-2 z-20">
                                <Linkedin size={18} /> LinkedIn
                            </a>
                        )}
                        <a href={`mailto:${profile.email}`} className="px-6 py-3 btn-3d rounded-full flex items-center gap-2 z-20">
                            <Mail size={18} /> Email
                        </a>
                        <ShareButton title={`${profile.name} - Portfolio`} text={profile.tagline} />
                    </div>

                    {/* AI Recommender Widget */}
                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                            <Sparkles size={16} className="text-black dark:text-white" />
                            Not sure where to start? Ask the AI:
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => handlePersonaClick('recruiter')}
                                className="px-4 py-2 btn-3d rounded-lg text-sm transition-all flex items-center gap-2 group cursor-pointer"
                            >
                                <Briefcase size={16} className="text-black dark:text-white group-hover:scale-110 transition-transform" />
                                I'm a Recruiter
                            </button>
                            <button
                                onClick={() => handlePersonaClick('developer')}
                                className="px-4 py-2 btn-3d rounded-lg text-sm transition-all flex items-center gap-2 group cursor-pointer"
                            >
                                <Code2 size={16} className="text-black dark:text-white group-hover:scale-110 transition-transform" />
                                I'm a Developer
                            </button>
                            <button
                                onClick={() => handlePersonaClick('founder')}
                                className="px-4 py-2 btn-3d rounded-lg text-sm transition-all flex items-center gap-2 group cursor-pointer"
                            >
                                <Sparkles size={16} className="text-black dark:text-white group-hover:scale-110 transition-transform" />
                                I'm a Founder
                            </button>
                        </div>
                    </div>

                </AnimatedSection>
            </header>

            {/* Projects Section */}
            <main id="projects" className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
                <AnimatedSection delay={0.2} className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-heading text-glossy">Selected Projects</h2>
                    <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-700 ml-8"></div>
                </AnimatedSection>

                {/* Featured Project Spotlight */}
                {featuredProject && (
                    <AnimatedSection delay={0.1} className="mb-16">
                        <div className="relative group">
                            <div className="relative glass-panel rounded-xl overflow-hidden flex flex-col md:flex-row hover:shadow-[0_8px_32px_rgba(59,130,246,0.15)] transition-all">
                                <div
                                    className={`md:w-3/5 h-64 md:h-auto overflow-hidden relative ${featuredProject.imageUrl ? 'cursor-zoom-in' : ''}`}
                                    onClick={() => {
                                        if (featuredProject.imageUrl) {
                                            setIsFeaturedLightboxOpen(true);
                                        } else {
                                            alert("No image available to preview.");
                                        }
                                    }}
                                >
                                    <img src={featuredProject.imageUrl} alt={featuredProject.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute top-4 left-4 bg-[#1a73e8] dark:bg-[#8AB4F8] text-white dark:text-[#202124] text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                        <Star size={12} fill="currentColor" /> SPOTLIGHT
                                    </div>
                                </div>
                                <div className="md:w-2/5 p-8 flex flex-col justify-center">
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">{featuredProject.title}</h3>
                                    <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                                        {featuredProject.description}
                                    </p>
                                    <div className="flex gap-2 mb-8">
                                        <span className="px-3 py-1 glass-panel text-black dark:text-white rounded-full text-xs font-bold uppercase tracking-wider">
                                            {featuredProject.category}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 mt-auto">
                                        {featuredProject.projectUrl && (
                                            <a href={featuredProject.projectUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-black dark:bg-white text-white dark:text-black hover:bg-[#222] dark:hover:bg-gray-200 py-3 rounded-xl font-bold text-center transition-all shadow-lg">
                                                View Live
                                            </a>
                                        )}
                                        {featuredProject.downloadUrl && (
                                            <a href={featuredProject.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex-1 glass-panel hover:scale-105 py-3 rounded-xl font-bold text-center transition-all text-black dark:text-white">
                                                Download APK
                                            </a>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </AnimatedSection>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {projects.length > 0 ? (
                            projects.map((project, idx) => (
                                <AnimatedSection key={project.id} delay={idx * 0.1}>
                                    <Tilt
                                        tiltMaxAngleX={5}
                                        tiltMaxAngleY={5}
                                        scale={1.02}
                                        transitionSpeed={2000}
                                        className="h-full"
                                    >
                                        <ProjectCard project={project} />
                                    </Tilt>
                                </AnimatedSection>
                            ))
                        ) : (
                            <div className="col-span-full py-24 text-center glass-panel rounded-3xl flex flex-col items-center justify-center border-dashed border-2 dark:border-white/10 border-black/10">
                                <div className="bg-gray-100 dark:bg-white/5 p-4 rounded-full mb-4">
                                    <FolderOpen size={32} className="text-slate-400 dark:text-white" />
                                </div>
                                <h3 className="text-xl font-bold text-black dark:text-white mb-2">No Projects Found</h3>
                                <p className="text-black/60 dark:text-gray-400 text-md max-w-sm mx-auto mb-6">You haven't added any projects to your portfolio yet. Head over to the admin dashboard to create your first one.</p>
                                <a href="/admin" className="px-8 py-3 btn-3d inline-block mt-2 rounded-full">
                                    Manage Projects
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </main>





            {/* Contact Section */}
            <section id="contact" className="max-w-3xl mx-auto px-6 pb-24 relative z-10">
                <AnimatedSection delay={0.2} className="glass-panel rounded-3xl p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none"></div>

                    <h2 className="text-3xl font-heading text-glossy mb-4">Let's Connect</h2>
                    <p className="text-black/80 dark:text-gray-300 mb-8 max-w-lg mx-auto">
                        Have a project in mind, or just want to say hi? Send me a message and I'll get back to you as soon as I can.
                    </p>

                    <form onSubmit={handleContactSubmit} className="space-y-4 max-w-md mx-auto text-left relative z-10">
                        <div>
                            <label className="block text-sm font-bold text-black dark:text-gray-300 mb-1">Name</label>
                            <input
                                type="text"
                                className="w-full bg-gray-100/50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all placeholder-black/40 dark:placeholder-gray-500"
                                placeholder="John Doe"
                                value={contactForm.name}
                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black dark:text-gray-300 mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full bg-gray-100/50 dark:bg-[#111] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all placeholder-black/40 dark:placeholder-gray-500"
                                placeholder="john@example.com"
                                value={contactForm.email}
                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-black dark:text-gray-300 mb-1">Message</label>
                            <textarea
                                rows={4}
                                className="w-full bg-gray-100/50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-black dark:text-white focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all resize-none placeholder-gray-400"
                                placeholder="What's on your mind?"
                                value={contactForm.message}
                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                required
                            />
                        </div>

                        {submitMessage.text && (
                            <div className={`p-3 rounded-xl text-sm ${submitMessage.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/40 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-900/40 dark:text-green-400'} border ${submitMessage.type === 'error' ? 'border-red-200 dark:border-red-800' : 'border-green-200 dark:border-green-800'}`}>
                                {submitMessage.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full py-4 btn-3d flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:border-b-[4px]"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </AnimatedSection>
            </section>

            <footer className="border-t border-gray-200 dark:border-white/10 py-12 text-center bg-gray-50/80 dark:bg-black/40 backdrop-blur-md transition-colors relative z-10">
                <p className="text-black/70 dark:text-gray-400 text-sm">
                    © {new Date().getFullYear()} {profile.name}. All rights reserved.
                </p>
            </footer>

            {/* AI Chatbot */}
            <Chatbot ref={chatbotRef} />

            {/* Resume Viewer Modal */}
            <ResumeModal
                isOpen={isResumeOpen}
                onClose={() => setIsResumeOpen(false)}
                resumeUrl={profile.resumeUrl}
                userName={profile.name}
            />
            {/* Featured Project Lightbox */}
            {featuredProject && (
                <ImageLightbox
                    isOpen={isFeaturedLightboxOpen}
                    onClose={() => setIsFeaturedLightboxOpen(false)}
                    images={[featuredProject.imageUrl, ...(featuredProject.imageUrls || [])].filter(Boolean)}
                    initialIndex={0}
                />
            )}
        </div >
    );
};

export default Home;
