

import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { BookOpenIcon, ChevronDownIcon } from '../icons/Icons';
import { mockChapters, mockSections } from '../../services/mockData';

// Flat interfaces for data from the mock data
interface Chapter {
    id: number;
    actSlug: string;
    chapterNumber: number;
    title: string;
    description: string;
}

interface Section {
    id: number;
    chapterId: number;
    sectionNumber: number;
    title: string;
    text: string;
}

const ActDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [sections, setSections] = useState<Record<number, Section[]>>({});
    const [loadingChapters, setLoadingChapters] = useState(true);
    const [loadingSections, setLoadingSections] = useState<Record<number, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const [activeChapterId, setActiveChapterId] = useState<number | null>(null);

    // 1. Fetch the list of chapters from mock data when the component loads
    useEffect(() => {
        const fetchChapters = () => {
            if (!slug) return;
            setLoadingChapters(true);
            setError(null);
            // Simulate network delay
            setTimeout(() => {
                try {
                    const actChapters = mockChapters.filter(c => c.actSlug === slug);
                    setChapters(actChapters);
                } catch (err: any) {
                    setError("Failed to load chapters from mock data.");
                } finally {
                    setLoadingChapters(false);
                }
            }, 300);
        };
        fetchChapters();
    }, [slug]);

    // 2. Load sections for a chapter from mock data when its accordion is opened
    const handleChapterToggle = (chapterId: number) => {
        const isOpening = activeChapterId !== chapterId;
        setActiveChapterId(isOpening ? chapterId : null);

        // Fetch only if we're opening the accordion and haven't fetched these sections before
        if (isOpening && !sections[chapterId]) {
            setLoadingSections(prev => ({ ...prev, [chapterId]: true }));
            // Simulate network delay
            setTimeout(() => {
                try {
                    const chapterSections = mockSections.filter(s => s.chapterId === chapterId);
                    setSections(prev => ({ ...prev, [chapterId]: chapterSections }));
                } catch (err: any) {
                    setError("Failed to load sections from mock data.");
                } finally {
                    setLoadingSections(prev => ({ ...prev, [chapterId]: false }));
                }
            }, 300);
        }
    };

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
                <NavLink to="/acts" className="text-gold hover:underline font-semibold">
                    &larr; Back to All Acts
                </NavLink>
            </div>

            <div className="bg-white dark:bg-navy p-6 sm:p-8 rounded-lg shadow-lg">
                <div className="text-center mb-8 border-b border-gray-200 dark:border-gray-700 pb-8">
                    <BookOpenIcon className="mx-auto h-12 w-12 text-gold mb-4" />
                    <h1 className="font-heading text-4xl font-bold text-navy dark:text-white">
                        {slug?.toUpperCase()}
                    </h1>
                    <p className="mt-2 text-lg text-dark-gray dark:text-gray-300">Chapters & Sections</p>
                </div>

                {loadingChapters && <p className="text-center py-10">Loading chapters...</p>}
                {error && <p className="text-center text-red-500 font-semibold py-10">{error}</p>}
                
                {!loadingChapters && chapters.length === 0 && !error && (
                    <p className="text-center text-gray-500 py-10">No chapters found for this act.</p>
                )}
                
                <div className="space-y-4">
                    {chapters.map((chapter) => (
                        <div key={chapter.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                            <button
                                onClick={() => handleChapterToggle(chapter.id)}
                                className="w-full flex justify-between items-center p-4 text-left bg-light-neutral dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors"
                                aria-expanded={activeChapterId === chapter.id}
                            >
                                <div>
                                    <h2 className="font-bold font-heading text-lg text-gold">Chapter {chapter.chapterNumber}: {chapter.title}</h2>
                                    <p className="text-sm text-dark-gray dark:text-gray-400">{chapter.description}</p>
                                </div>
                                <ChevronDownIcon className={`w-6 h-6 transform transition-transform ${activeChapterId === chapter.id ? 'rotate-180' : ''}`} />
                            </button>
                            {activeChapterId === chapter.id && (
                                <div className="p-4 space-y-3 bg-white dark:bg-navy">
                                    {loadingSections[chapter.id] && <p className="text-dark-gray dark:text-gray-300">Loading sections...</p>}
                                    {sections[chapter.id] && sections[chapter.id].map(section => (
                                        <NavLink
                                            key={section.id}
                                            to={`/section/${section.id}`}
                                            className="block p-3 border-l-4 border-gold bg-light-neutral dark:bg-gray-800/50 rounded-r-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors"
                                        >
                                            <h3 className="font-bold text-navy dark:text-light-neutral">Section {section.sectionNumber}: {section.title}</h3>
                                            <p className="mt-1 text-sm text-dark-gray dark:text-gray-300 line-clamp-2">{section.text}</p>
                                        </NavLink>
                                    ))}
                                    {sections[chapter.id] && sections[chapter.id].length === 0 && (
                                        <p className="text-sm text-gray-500">No sections found for this chapter.</p>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ActDetailPage;
