

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { mockSections } from '../../services/mockData';

interface Section {
    id: number;
    chapterId: number;
    sectionNumber: number;
    title: string;
    text: string;
}

const SectionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [section, setSection] = useState<Section | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchSection = () => {
            if (!id) return;
            setLoading(true);
            // Simulate network delay
            setTimeout(() => {
                try {
                    const sectionId = parseInt(id, 10);
                    const foundSection = mockSections.find(s => s.id === sectionId);
                    
                    if (foundSection) {
                        setSection(foundSection);
                    } else {
                        throw new Error(`Section with ID ${id} not found in mock data.`);
                    }
                } catch (err: any) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            }, 300);
        };
        fetchSection();
    }, [id]);

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
             <div className="mb-6">
                <button onClick={() => window.history.back()} className="text-gold hover:underline font-semibold cursor-pointer bg-transparent border-none p-0 text-left">
                    &larr; Back to Chapters
                </button>
            </div>
            <div className="bg-white dark:bg-navy p-8 sm:p-12 rounded-lg shadow-lg">
                {loading && <p className="text-center">Loading section...</p>}
                {error && <p className="text-center text-red-500 font-semibold">Error: {error}</p>}
                {section && (
                    <div className="space-y-6">
                        <header>
                            <p className="text-gold font-semibold">Section {section.sectionNumber}</p>
                            <h1 className="font-heading text-3xl sm:text-4xl font-bold text-navy dark:text-white mt-1">
                                {section.title}
                            </h1>
                        </header>
                        <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                            <h2 className="font-heading text-xl font-bold text-dark-gray dark:text-gray-200 mb-3">Official Text</h2>
                            <p className="text-dark-gray dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                {section.text}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SectionDetailPage;
