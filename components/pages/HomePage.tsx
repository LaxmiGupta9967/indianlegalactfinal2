
import React, { useState, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { SearchIcon, LegalScaleIcon } from '../icons/Icons';
import { LegalUpdate } from '../../types';
import { mockLegalUpdates } from '../../services/mockData';

const ParticlesBackground: React.FC = () => {
    const particles = Array.from({ length: 75 });
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {particles.map((_, i) => {
                const size = Math.random() * 5 + 2; // size between 2px and 7px
                const duration = Math.random() * 15 + 10; // duration between 10s and 25s
                const delay = Math.random() * -25; // negative delay to start at different times
                const driftX = (Math.random() - 0.5) * 200; // horizontal drift

                return (
                    <div
                        key={i}
                        className="particle"
                        style={{
                            width: `${size}px`,
                            height: `${size}px`,
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${duration}s`,
                            animationDelay: `${delay}s`,
                            '--drift-x': `${driftX}px`
                        } as React.CSSProperties}
                    ></div>
                );
            })}
        </div>
    );
};


const HomePage: React.FC = () => {
    const [query, setQuery] = useState('');
    const navigate = useNavigate();
    const [updates, setUpdates] = useState<LegalUpdate[]>([]);
    const [updatesLoading, setUpdatesLoading] = useState<boolean>(true);

     useEffect(() => {
        const fetchUpdates = () => {
            setUpdatesLoading(true);
            // Simulate a network request with a timeout
            setTimeout(() => {
                try {
                    // Sort by date descending and take the top 15
                    const sortedUpdates = [...mockLegalUpdates]
                        .sort((a, b) => b.date.getTime() - a.date.getTime())
                        .slice(0, 15);
                    setUpdates(sortedUpdates);
                } catch (err) {
                    console.error("Failed to process mock legal updates:", err);
                } finally {
                    setUpdatesLoading(false);
                }
            }, 500); // 500ms delay to simulate loading
        };

        fetchUpdates();
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    const handleScroll = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
        e.preventDefault();
        const targetId = e.currentTarget.getAttribute('href')?.substring(1);
        if (targetId) {
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    };

    return (
        <div>
            {/* Hero Section */}
            <section className="relative flex flex-col justify-between text-center bg-gradient-to-b from-white to-gray-100 text-navy dark:from-navy dark:to-black dark:text-white -mx-4 sm:-mx-6 lg:-mx-8" style={{ minHeight: 'calc(100vh - 5rem)' }}>
                 <ParticlesBackground />
                <div className="relative z-10 p-4 flex-grow flex flex-col items-center justify-center">
                    <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold">
                        Access Indian Legal Acts — Search, Explore, Apply
                    </h1>
                    <p className="mt-6 font-semibold text-gold text-lg max-w-3xl mx-auto">
                        India’s first AI-powered platform for simplified legal research and instant PDF document generation.
                    </p>
                    <div className="mt-8 flex flex-wrap justify-center gap-4">
                        <NavLink
                            to="/acts"
                            className="bg-gold text-navy px-8 py-3 rounded-lg font-semibold text-lg hover:opacity-90 transition-opacity shadow-md"
                        >
                            Explore Sections
                        </NavLink>
                        <NavLink
                            to="/case-analysis"
                            className="bg-transparent border-2 border-gold text-gold px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gold hover:text-navy transition-colors"
                        >
                            Input Case Details
                        </NavLink>
                         {/* New button for AI Legal Templates */}
                        <NavLink
                            to="/legal-documents"
                            className="bg-transparent border-2 border-gold text-gold px-8 py-3 rounded-lg font-semibold text-lg hover:bg-gold hover:text-navy transition-colors"
                        >
                            AI-Generated Legal Templates
                        </NavLink>
                    </div>

                    <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-dark-gray dark:text-gray-300">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl" role="img" aria-label="Scales of Justice">⚖️</span>
                            <span className="font-semibold">Smart Legal Search</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl" role="img" aria-label="Document with text">📑</span>
                            <span className="font-semibold">AI-Generated Reports</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-2xl" role="img" aria-label="Magnifying glass">🔍</span>
                            <span className="font-semibold">Simplified Law Explanations</span>
                        </div>
                    </div>
                    
                    {/* Scroll Indicator */}
                    <div className="scroll-indicator text-center mt-10 text-dark-gray dark:text-gray-300">
                        <p className="text-sm mb-2 tracking-wide">Scroll to Explore</p>
                        <a href="#start-research" onClick={handleScroll} className="text-gold text-3xl animate-bounce inline-block">
                            ↓
                        </a>
                    </div>

                </div>

                { !updatesLoading && updates.length > 0 && (
                    <div className="relative z-10 w-full">
                        <div className="ticker-wrap">
                            <div className="ticker-track">
                                {[...updates, ...updates].map((update, index) => ( // Duplicate for seamless scroll
                                    <React.Fragment key={`${update.id}-${index}`}>
                                        <a href={update.link} target="_blank" rel="noopener noreferrer" className="ticker-item">
                                            <LegalScaleIcon className="w-4 h-4 text-gold flex-shrink-0" />
                                            <span className="truncate">{update.title}</span>
                                        </a>
                                        <span className="ticker-item-separator">&bull;</span>
                                    </React.Fragment>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </section>

            <div className="py-8 container mx-auto px-4 sm:px-6 lg:px-8">
                 {/* How it works */}
                <section className="py-16 text-center">
                    <h2 className="font-heading text-3xl font-bold text-navy dark:text-white mb-8">How It Works</h2>
                    <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        <div className="flex flex-col items-center">
                            <div className="text-3xl font-bold text-gold mb-2">1.</div>
                            <h3 className="font-semibold text-lg mb-1">Search or Input</h3>
                            <p className="text-sm text-dark-gray dark:text-gray-400">Search by keyword or input your case facts.</p>
                        </div>
                        <div className="flex flex-col items-center">
                             <div className="text-3xl font-bold text-gold mb-2">2.</div>
                            <h3 className="font-semibold text-lg mb-1">Get Suggestions</h3>
                            <p className="text-sm text-dark-gray dark:text-gray-400">Receive relevant sections and case links.</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="text-3xl font-bold text-gold mb-2">3.</div>
                            <h3 className="font-semibold text-lg mb-1">Download Report</h3>
                            <p className="text-sm text-dark-gray dark:text-gray-400">Download a PDF or chat with our AI assistant.</p>
                        </div>
                    </div>
                </section>

                {/* Search Section */}
                <section id="start-research" className="bg-white dark:bg-navy py-12 px-8 rounded-lg shadow-lg">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="font-heading text-3xl font-bold text-navy dark:text-white">Start Your Research</h2>
                        <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2">
                             <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search section number, keyword, or case..."
                                className="flex-grow px-4 py-3 bg-light-neutral dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                                aria-label="Search query"
                            />
                            <button
                                type="submit"
                                className="flex items-center justify-center gap-2 bg-navy text-white dark:bg-gold dark:text-navy px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md"
                            >
                                <SearchIcon className="w-5 h-5" />
                                Search
                            </button>
                        </form>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;
