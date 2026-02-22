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
import { Loader2, Github, Linkedin, Mail, FileText, Sparkles, Briefcase, Code2, Rocket, MessageCircle, Star } from 'lucide-react';
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
                    <div className="flex items-center gap-4 mb-6">
                        <div className="relative group">
                            {profile.avatarUrl ? (
                                <img
                                    src={profile.avatarUrl}
                                    alt="Profile"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-white dark:border-gray-800 shadow-xl relative z-10"
                                />
                            ) : (
                                <div className="w-16 h-16 rounded-full bg-[#1a73e8] dark:bg-[#8AB4F8] flex items-center justify-center text-2xl font-bold text-white dark:text-[#202124] shadow-md relative z-10">
                                    {profile.name.charAt(0)}{profile.name.split(' ')[1] ? profile.name.split(' ')[1].charAt(0) : ''}
                                </div>
                            )}
                        </div>
                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-[#5f6368] dark:text-[#9AA0A6] font-medium tracking-wide text-xs uppercase border border-gray-200 dark:border-gray-700">
                            Portfolio
                        </span>
                    </div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight text-[#202124] dark:text-white leading-tight">
                        Hi, I'm <span className="text-[#1a73e8] dark:text-[#8AB4F8]">{profile.name}</span>.
                    </h1>

                    <h2 className="text-2xl md:text-3xl text-[#5f6368] dark:text-[#E8EAED] font-light mb-8 max-w-2xl leading-relaxed">
                        {profile.tagline || "A Tech Explorer & Full Stack Developer making useful things for the web and mobile."}
                    </h2>

                    <p className="text-[#5f6368] dark:text-[#9AA0A6] text-lg leading-relaxed max-w-2xl mb-10">
                        Currently studying at <span className="text-[#202124] dark:text-white font-medium border-b-2 border-blue-500/30">KIIT</span>. I specialize in building clean, efficient applications using modern technologies like React, Firebase, and Tailwind CSS.
                    </p>

                    <div className="flex flex-wrap gap-4">
                        {profile.resumeUrl && (
                            <button
                                onClick={() => setIsResumeOpen(true)}
                                className="px-8 py-3 bg-[#1a73e8] dark:bg-[#8AB4F8] hover:bg-[#1557b0] dark:hover:bg-[#aecbfa] text-white dark:text-[#202124] rounded-full font-medium transition-colors flex items-center gap-2 shadow-sm"
                            >
                                <FileText size={18} /> View Resume
                            </button>
                        )}
                        {profile.githubUrl && (
                            <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white dark:bg-[#303134] border border-[#dadce0] dark:border-[#5f6368] hover:border-[#1a73e8] dark:hover:border-[#8AB4F8] text-[#202124] dark:text-[#E8EAED] rounded-full font-medium transition-colors flex items-center gap-2 shadow-sm">
                                <Github size={18} /> GitHub
                            </a>
                        )}
                        {profile.linkedinUrl && (
                            <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer" className="px-6 py-3 bg-white dark:bg-[#303134] border border-[#dadce0] dark:border-[#5f6368] hover:border-[#0a66c2] dark:hover:border-[#0a66c2] text-[#202124] dark:text-[#E8EAED] rounded-full font-medium transition-colors flex items-center gap-2 shadow-sm">
                                <Linkedin size={18} /> LinkedIn
                            </a>
                        )}
                        <a href={`mailto:${profile.email}`} className="px-6 py-3 bg-white dark:bg-[#303134] border border-[#dadce0] dark:border-[#5f6368] hover:border-[#ea4335] dark:hover:border-[#ea4335] text-[#202124] dark:text-[#E8EAED] rounded-full font-medium transition-colors flex items-center gap-2 shadow-sm">
                            <Mail size={18} /> Email
                        </a>
                        <ShareButton title={`${profile.name} - Portfolio`} text={profile.tagline} />
                    </div>

                    {/* AI Recommender Widget */}
                    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                        <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                            <Sparkles size={16} className="text-purple-500" />
                            Not sure where to start? Ask the AI:
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => handlePersonaClick('recruiter')}
                                className="px-4 py-2 bg-white dark:bg-[#303134] hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-2 group"
                            >
                                <Briefcase size={16} className="text-blue-500 group-hover:scale-110 transition-transform" />
                                I'm a Recruiter
                            </button>
                            <button
                                onClick={() => handlePersonaClick('developer')}
                                className="px-4 py-2 bg-white dark:bg-[#303134] hover:bg-green-50 dark:hover:bg-green-900/20 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-2 group"
                            >
                                <Code2 size={16} className="text-green-500 group-hover:scale-110 transition-transform" />
                                I'm a Developer
                            </button>
                            <button
                                onClick={() => handlePersonaClick('founder')}
                                className="px-4 py-2 bg-white dark:bg-[#303134] hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 transition-colors flex items-center gap-2 group"
                            >
                                <Rocket size={16} className="text-orange-500 group-hover:scale-110 transition-transform" />
                                I'm a Founder
                            </button>
                        </div>
                    </div>

                </AnimatedSection>
            </header>

            {/* Projects Section */}
            <main id="projects" className="max-w-7xl mx-auto px-6 pb-24 relative z-10">
                <AnimatedSection delay={0.2} className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-bold text-[#202124] dark:text-white">Selected Projects</h2>
                    <div className="hidden md:block h-px flex-1 bg-gradient-to-r from-gray-200 to-transparent dark:from-gray-700 ml-8"></div>
                </AnimatedSection>

                {/* Featured Project Spotlight */}
                {featuredProject && (
                    <AnimatedSection delay={0.1} className="mb-16">
                        <div className="relative group">
                            <div className="relative bg-white dark:bg-[#202124] ring-1 ring-gray-200 dark:ring-gray-700 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
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
                                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{featuredProject.title}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                                        {featuredProject.description}
                                    </p>
                                    <div className="flex gap-2 mb-8">
                                        <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium uppercase tracking-wider">
                                            {featuredProject.category}
                                        </span>
                                    </div>
                                    <div className="flex gap-4 mt-auto">
                                        {featuredProject.projectUrl && (
                                            <a href={featuredProject.projectUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-[#1a73e8] dark:bg-[#8AB4F8] hover:bg-[#1557b0] dark:hover:bg-[#aecbfa] text-white dark:text-[#202124] py-3 rounded-lg font-medium text-center transition-colors shadow-sm">
                                                View Live
                                            </a>
                                        )}
                                        {featuredProject.downloadUrl && (
                                            <a href={featuredProject.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex-1 bg-white dark:bg-[#303134] border border-[#dadce0] dark:border-[#5f6368] hover:border-[#1a73e8] dark:hover:border-[#8AB4F8] text-[#202124] dark:text-[#E8EAED] py-3 rounded-lg font-medium text-center transition-colors shadow-sm">
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
                            <div className="col-span-full py-20 text-center border border-dashed border-[#dadce0] dark:border-[#5f6368] rounded-2xl bg-white/50 dark:bg-[#202124]/50 backdrop-blur-sm">
                                <p className="text-[#5f6368] dark:text-[#9AA0A6] text-lg">No projects added yet.</p>
                                <a href="/admin" className="text-[#1a73e8] dark:text-[#8AB4F8] hover:underline mt-2 inline-block">
                                    Manage Projects
                                </a>
                            </div>
                        )}
                    </div>
                )}
            </main>





            {/* Contact Section */}
            <section id="contact" className="max-w-3xl mx-auto px-6 pb-24 relative z-10">
                <AnimatedSection delay={0.2} className="bg-white dark:bg-[#202124] rounded-2xl shadow-sm border border-[#dadce0] dark:border-[#3c4043] p-8 md:p-12 text-center">
                    <h2 className="text-3xl font-bold text-[#202124] dark:text-white mb-4">Let's Connect</h2>
                    <p className="text-[#5f6368] dark:text-[#9AA0A6] mb-8 max-w-lg mx-auto">
                        Have a project in mind, or just want to say hi? Send me a message and I'll get back to you as soon as I can.
                    </p>

                    <form onSubmit={handleContactSubmit} className="space-y-4 max-w-md mx-auto text-left">
                        <div>
                            <label className="block text-sm font-medium text-[#5f6368] dark:text-[#9AA0A6] mb-1">Name</label>
                            <input
                                type="text"
                                className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-[#dadce0] dark:border-[#5f6368] rounded-xl px-4 py-3 text-[#202124] dark:text-white focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent outline-none transition-all"
                                placeholder="John Doe"
                                value={contactForm.name}
                                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#5f6368] dark:text-[#9AA0A6] mb-1">Email</label>
                            <input
                                type="email"
                                className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-[#dadce0] dark:border-[#5f6368] rounded-xl px-4 py-3 text-[#202124] dark:text-white focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent outline-none transition-all"
                                placeholder="john@example.com"
                                value={contactForm.email}
                                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[#5f6368] dark:text-[#9AA0A6] mb-1">Message</label>
                            <textarea
                                rows={4}
                                className="w-full bg-[#f8f9fa] dark:bg-[#303134] border border-[#dadce0] dark:border-[#5f6368] rounded-xl px-4 py-3 text-[#202124] dark:text-white focus:ring-2 focus:ring-[#1a73e8] focus:border-transparent outline-none transition-all resize-none"
                                placeholder="What's on your mind?"
                                value={contactForm.message}
                                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                required
                            />
                        </div>

                        {submitMessage.text && (
                            <div className={`p-3 rounded-xl text-sm ${submitMessage.type === 'error' ? 'bg-red-50 text-red-600 dark:bg-red-900/20' : 'bg-green-50 text-green-600 dark:bg-green-900/20'} border ${submitMessage.type === 'error' ? 'border-red-200 dark:border-red-800' : 'border-green-200 dark:border-green-800'}`}>
                                {submitMessage.text}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#1a73e8] dark:bg-[#8AB4F8] hover:bg-[#1557b0] dark:hover:bg-[#aecbfa] text-white dark:text-[#202124] py-3 rounded-xl font-medium transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : null}
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </AnimatedSection>
            </section>

            <footer className="border-t border-[#dadce0] dark:border-[#3c4043]/50 py-12 text-center bg-[#f8f9fa]/80 dark:bg-[#202124]/80 backdrop-blur-md transition-colors relative z-10">
                <p className="text-[#5f6368] dark:text-[#9AA0A6] text-sm">
                    © {new Date().getFullYear()} {profile.name}. Built with React & Firebase.
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
