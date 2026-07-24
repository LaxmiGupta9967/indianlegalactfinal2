

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { CaseDetails, AnalysisResult } from '../../types';
import { analyzeCase, continueChatWithGemini } from '../../services/geminiService';
import { DocumentMagnifyingGlassIcon, LightBulbIcon, ExclamationTriangleIcon, ArrowDownTrayIcon, ChatBubbleLeftRightIcon, XMarkIcon, LinkIcon, MicrophoneIcon, SparklesIcon } from '../icons/Icons';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../../services/supabaseClient';


// Fix: Add global declarations for browser-specific Speech Recognition APIs to resolve TypeScript errors.
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

// Define the shape of a chat message
interface ChatMessage {
    sender: 'user' | 'ai';
    message: string;
}

interface Profile {
    is_premium: boolean;
    analysis_count: number;
}


const CaseAnalysisPage: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    
    const [caseDetails, setCaseDetails] = useState<CaseDetails>({
        title: '',
        caseType: '',
        facts: '',
        parties: '',
        evidence: [],
        jurisdiction: ''
    });
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [evidenceInput, setEvidenceInput] = useState('');
    
    // State for the AI Chat Modal
    const [isChatModalOpen, setIsChatModalOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] =useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatContentRef = useRef<HTMLDivElement>(null);
    
    // State for Voice Recording
    const [isRecording, setIsRecording] = useState(false);
    const [speechError, setSpeechError] = useState<string | null>(null);
    const recognitionRef = useRef<any>(null);
    const speechToTextSupported = typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);

    // Profile and usage limit state
    const [profile, setProfile] = useState<Profile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return; // Wait until auth state is resolved

        if (!user) {
            navigate('/signup', {
                replace: true,
                state: { message: 'Please create an account to use the Case Analysis feature.' }
            });
            return;
        }

        const fetchProfile = async () => {
            setProfileLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('is_premium, analysis_count')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;

                if (data) {
                    setProfile(data);
                } else {
                    setProfile({ is_premium: false, analysis_count: 0 });
                }
            } catch (err: any) {
                setError("Could not load your user profile. Please try again later.");
                console.error(err);
            } finally {
                setProfileLoading(false);
            }
        };
        fetchProfile();
    }, [user, authLoading, navigate]);


    useEffect(() => {
        if (!speechToTextSupported) {
            console.warn("Speech recognition not supported by this browser.");
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-IN';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setChatInput(transcript);
        };

        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            if (event.error === 'not-allowed') {
                setSpeechError('Microphone access denied. Please allow microphone access in your browser settings to use this feature.');
            } else {
                setSpeechError(`An error occurred during speech recognition: ${event.error}`);
            }
            setIsRecording(false);
        };

        recognition.onend = () => {
            setIsRecording(false);
        };
        
        recognitionRef.current = recognition;

    }, [speechToTextSupported]);
    
    const handleToggleRecording = () => {
        if (!recognitionRef.current) return;

        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            setSpeechError(null); // Clear previous errors
            setChatInput(''); 
            recognitionRef.current.start();
            setIsRecording(true);
        }
    };


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCaseDetails(prev => ({ ...prev, [name]: value }));
    };

    const handleAddEvidence = () => {
        if (evidenceInput.trim()) {
            setCaseDetails(prev => ({
                ...prev,
                evidence: [...(prev.evidence || []), evidenceInput.trim()]
            }));
            setEvidenceInput('');
        }
    };
    
    const handleRemoveEvidence = (index: number) => {
        setCaseDetails(prev => ({
            ...prev,
            evidence: prev.evidence?.filter((_, i) => i !== index)
        }));
    };

    const analysisLimit = 2;
    const analysesRemaining = profile ? Math.max(0, analysisLimit - profile.analysis_count) : 0;
    const isLimitReached = !profile?.is_premium && (profile?.analysis_count ?? 0) >= analysisLimit;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isLimitReached) {
            setError("You've reached your limit of free case analyses. Please upgrade to continue.");
            return;
        }

        setLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const result = await analyzeCase(caseDetails);
            setAnalysisResult(result);
            
             // Increment count for free users on success
            if (user && profile && !profile.is_premium) {
                const newCount = profile.analysis_count + 1;
                const { error: updateError } = await supabase
                    .from('profiles')
                    .update({ analysis_count: newCount })
                    .eq('id', user.id);
                
                if (updateError) {
                    // Log this error, but don't block the user from seeing their result
                    console.error("Failed to update analysis count:", updateError.message);
                }
                
                // Update local state to reflect change immediately
                setProfile(prev => ({ ...prev!, analysis_count: newCount }));
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during analysis.');
        } finally {
            setLoading(false);
        }
    };
    
    // --- AI CHAT & REPORT FUNCTIONS ---

    const handleDownloadReport = () => {
        if (!analysisResult) return;
        const { title } = caseDetails;
        const { suggestedSections, issues, keywords, samplePlea, precedentCases } = analysisResult;

        let reportContent = `AI-Generated Legal Analysis Report\n`;
        reportContent += `=====================================\n\n`;
        reportContent += `Case Title: ${title}\n\n`;
        
        reportContent += `--- Suggested Sections ---\n`;
        suggestedSections.forEach(s => {
            reportContent += `\n- ${s.act} Section ${s.sectionNumber}: ${s.title}\n`;
            reportContent += `  Rationale: ${s.rationale}\n`;
            reportContent += `  Confidence: ${Math.round(s.confidence * 100)}%\n`;
        });

        reportContent += `\n--- Key Legal Issues ---\n`;
        issues.forEach(issue => { reportContent += `- ${issue}\n`; });

        reportContent += `\n--- Keywords ---\n`;
        reportContent += keywords.join(', ') + '\n';
        
        reportContent += `\n--- Precedent Cases ---\n`;
        precedentCases.forEach(pc => { reportContent += `- ${pc.title} (${pc.year})\n`; });

        reportContent += `\n--- Sample Plea / Argument ---\n`;
        reportContent += samplePlea;

        const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${title.replace(/\s+/g, '_')}_Analysis_Report.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenChat = () => {
        if (!analysisResult) return;
        setChatHistory([{
            sender: 'ai',
            message: "I have analyzed your case. How can I help you further? You can ask me to explain a section, suggest counter-arguments, or elaborate on a specific point."
        }]);
        setIsChatModalOpen(true);
    };

    const handleChatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim() || isChatLoading) return;
        
        const userMessage: ChatMessage = { sender: 'user', message: chatInput };
        const updatedHistory = [...chatHistory, userMessage];
        setChatHistory(updatedHistory);
        setChatInput('');
        setIsChatLoading(true);

        try {
            const aiResponse = await continueChatWithGemini(caseDetails, updatedHistory, chatInput);
            const aiMessage: ChatMessage = { sender: 'ai', message: aiResponse };
            setChatHistory(prev => [...prev, aiMessage]);
        } catch (err: any) {
            const errorMessage: ChatMessage = { sender: 'ai', message: `Sorry, I encountered an error: ${err.message}` };
            setChatHistory(prev => [...prev, errorMessage]);
        } finally {
            setIsChatLoading(false);
        }
    };
    
    useEffect(() => {
        // Auto-scroll chat content to the bottom
        if (chatContentRef.current) {
            chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
        }
    }, [chatHistory]);


    const isFormValid = caseDetails.title.trim() && caseDetails.caseType && caseDetails.facts.trim();
    const inputFieldClass = "mt-1 block w-full px-3 py-2 bg-light-neutral dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-gold focus:border-gold";

    if (authLoading || profileLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4 sm:px-6 lg:px-8">
            <div>
                <div className="text-center mb-12">
                    <DocumentMagnifyingGlassIcon className="mx-auto h-12 w-12 text-gold mb-4" />
                    <h1 className="mt-4 text-4xl font-bold font-heading text-navy dark:text-white">Case Analysis Assistant</h1>
                    <p className="mt-2 text-lg text-dark-gray dark:text-gray-300">
                        Input your case details to receive AI-powered suggestions on applicable sections.
                    </p>
                </div>
                
                 {profile && !profile.is_premium && (
                    <div className="mb-6 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center max-w-2xl mx-auto">
                        {isLimitReached ? (
                             <p className="font-semibold text-yellow-600 dark:text-yellow-400">You have used all your free analyses.</p>
                        ) : (
                            <p className="font-semibold text-navy dark:text-light-neutral">
                                You have <span className="text-gold text-lg">{analysesRemaining}</span> of {analysisLimit} free case analyses remaining.
                            </p>
                        )}
                    </div>
                )}


                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Input Form */}
                    <div className="bg-white dark:bg-navy p-6 rounded-lg shadow-lg space-y-4">
                         {isLimitReached && (
                            <div className="bg-gold/10 border-l-4 border-gold text-gold-800 dark:text-gold-200 p-4 rounded-md mb-6">
                                <h3 className="font-bold flex items-center gap-2"><SparklesIcon className="w-5 h-5" /> Free Limit Reached</h3>
                                <p className="mt-1 text-sm">Please upgrade to our Pro plan for unlimited case analyses and other premium features.</p>
                                <NavLink to="/pricing" className="mt-3 inline-block bg-gold text-navy px-4 py-2 rounded-md font-semibold text-sm hover:opacity-90">
                                    Upgrade to Pro
                                </NavLink>
                            </div>
                        )}
                        <h2 className="text-2xl font-bold font-heading text-gold">Case Details</h2>
                        <form onSubmit={handleSubmit} className={`space-y-4 ${isLimitReached ? 'opacity-50 pointer-events-none' : ''}`}>
                            <div>
                                <label htmlFor="title" className="block text-sm font-medium">Case Title*</label>
                                <input type="text" name="title" id="title" value={caseDetails.title} onChange={handleInputChange} required className={inputFieldClass} />
                            </div>
                            <div>
                                <label htmlFor="caseType" className="block text-sm font-medium">Case Type*</label>
                                <select name="caseType" id="caseType" value={caseDetails.caseType} onChange={handleInputChange} required className={inputFieldClass}>
                                    <option value="">Select a type</option>
                                    <option value="Criminal">Criminal</option>
                                    <option value="Civil">Civil</option>
                                    <option value="Public Safety">Public Safety</option>
                                    <option value="Evidence">Evidence</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="facts" className="block text-sm font-medium">Facts of the Case*</label>
                                <textarea name="facts" id="facts" value={caseDetails.facts} onChange={handleInputChange} required rows={6} className={inputFieldClass} />
                            </div>
                             <div>
                                <label htmlFor="parties" className="block text-sm font-medium">Parties Involved (Optional)</label>
                                <input type="text" name="parties" id="parties" value={caseDetails.parties} onChange={handleInputChange} className={inputFieldClass} />
                            </div>
                             <div>
                                <label htmlFor="jurisdiction" className="block text-sm font-medium">Jurisdiction (Optional)</label>
                                <input type="text" name="jurisdiction" id="jurisdiction" value={caseDetails.jurisdiction} onChange={handleInputChange} className={inputFieldClass} />
                            </div>

                             <div>
                                <label htmlFor="evidence" className="block text-sm font-medium">Key Evidence (Optional)</label>
                                <div className="flex gap-2 mt-1">
                                    <input type="text" value={evidenceInput} onChange={e => setEvidenceInput(e.target.value)} placeholder="Add one piece of evidence at a time" className={`flex-grow ${inputFieldClass}`}/>
                                    <button type="button" onClick={handleAddEvidence} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-md font-semibold text-sm self-end h-11">Add</button>
                                </div>
                                <ul className="mt-2 space-y-1">
                                    {caseDetails.evidence?.map((item, index) => (
                                        <li key={index} className="flex items-center justify-between bg-light-neutral dark:bg-gray-800/50 p-2 rounded text-sm">
                                            <span>{item}</span>
                                            <button type="button" onClick={() => handleRemoveEvidence(index)} className="text-red-500 hover:text-red-700">
                                                <XMarkIcon className="w-4 h-4" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <button type="submit" disabled={!isFormValid || loading || isLimitReached} className="w-full bg-navy text-white dark:bg-gold dark:text-navy px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                {loading ? 'Analyzing...' : 'Analyze Case'}
                            </button>
                        </form>
                    </div>

                    {/* Output/Results */}
                    <div className="bg-light-neutral dark:bg-gray-800/50 p-6 rounded-lg shadow-inner min-h-[400px]">
                        {loading && (
                             <div className="text-center py-10 flex flex-col items-center">
                                <svg className="animate-spin h-8 w-8 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <p className="mt-4 font-semibold text-lg text-navy dark:text-light-neutral">AI is analyzing your case...</p>
                                <p className="text-sm text-dark-gray dark:text-gray-400">This may take a moment.</p>
                            </div>
                        )}
                        {error && (
                            <div className="bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-md flex items-center gap-4">
                                <ExclamationTriangleIcon className="h-8 w-8 text-red-500" />
                                <div>
                                    <p className="font-bold">Analysis Failed</p>
                                    <p>{error}</p>
                                </div>
                            </div>
                        )}
                        {!loading && !error && !analysisResult && (
                             <div className="text-center py-20 text-dark-gray dark:text-gray-400">
                                <LightBulbIcon className="mx-auto h-16 w-16" />
                                <h2 className="mt-4 text-2xl font-bold font-heading text-navy dark:text-white">Awaiting Input</h2>
                                <p className="mt-2">Fill in the case details to get started.</p>
                            </div>
                        )}
                        {analysisResult && (
                            <div className="space-y-6">
                               <div className="flex justify-between items-center pb-3 border-b border-gray-300 dark:border-gray-600">
                                   <h2 className="text-2xl font-bold font-heading text-gold">Analysis Complete</h2>
                                   <div className="flex gap-2">
                                       <button onClick={handleDownloadReport} className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md font-semibold text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"><ArrowDownTrayIcon className="w-4 h-4" /> TXT</button>
                                       <button onClick={handleOpenChat} className="flex items-center gap-1 px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded-md font-semibold text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"><ChatBubbleLeftRightIcon className="w-4 h-4" /> Chat</button>
                                   </div>
                               </div>

                               <div>
                                    <h3 className="font-bold text-lg text-navy dark:text-light-neutral">Suggested Sections</h3>
                                    <div className="space-y-3 mt-2">
                                        {analysisResult.suggestedSections.map((section, index) => (
                                             <div key={index} className="bg-white dark:bg-navy p-3 rounded-md shadow">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <p className="font-bold text-navy dark:text-white">{section.act} - Section {section.sectionNumber}: {section.title}</p>
                                                        <p className="text-sm text-dark-gray dark:text-gray-400 mt-1">{section.rationale}</p>
                                                    </div>
                                                    <span className="text-xs font-mono px-2 py-1 bg-gold/20 text-gold rounded">{Math.round(section.confidence * 100)}%</span>
                                                </div>
                                                <NavLink 
                                                  to={`/search?q=${encodeURIComponent(`${section.act} ${section.sectionNumber}`)}`}
                                                  className="text-sm font-semibold text-gold hover:underline mt-2 inline-flex items-center gap-1"
                                                >
                                                    Explore Section <LinkIcon className="w-3 h-3" />
                                                </NavLink>
                                            </div>
                                        ))}
                                    </div>
                               </div>
                               <div>
                                    <h3 className="font-bold text-lg text-navy dark:text-light-neutral">Key Legal Issues</h3>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-dark-gray dark:text-gray-300">
                                        {analysisResult.issues.map((issue, i) => <li key={i}>{issue}</li>)}
                                    </ul>
                               </div>
                               <div>
                                    <h3 className="font-bold text-lg text-navy dark:text-light-neutral">Keywords</h3>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {analysisResult.keywords.map((kw, i) => <span key={i} className="px-2 py-1 bg-gold/20 text-gold text-xs font-medium rounded-full">{kw}</span>)}
                                    </div>
                               </div>
                               
                               <div>
                                    <h3 className="font-bold text-lg text-navy dark:text-light-neutral">Precedent Cases</h3>
                                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm text-dark-gray dark:text-gray-300">
                                        {analysisResult.precedentCases.map((pc, i) => <li key={i}>{pc.title} ({pc.year})</li>)}
                                    </ul>
                               </div>

                                {analysisResult.caseComparisons && analysisResult.caseComparisons.length > 0 && (
                                    <div>
                                        <h3 className="font-bold text-lg text-navy dark:text-light-neutral">Old Law vs. New Law Comparison</h3>
                                        <div className="space-y-3 mt-2">
                                            {analysisResult.caseComparisons.map((comp, index) => (
                                                <div key={index} className="bg-white dark:bg-navy p-4 rounded-md shadow">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                                            <p className="text-sm font-semibold text-red-800 dark:text-red-300 uppercase tracking-wider">Old Law</p>
                                                            <p className="font-bold text-lg text-red-600 dark:text-red-400 mt-1">{comp.oldLawSection}</p>
                                                        </div>
                                                        <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                                            <p className="text-sm font-semibold text-green-800 dark:text-green-300 uppercase tracking-wider">New Law</p>
                                                            <p className="font-bold text-lg text-green-600 dark:text-green-400 mt-1">{comp.newLawSection}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                                                        <p className="text-sm font-semibold text-navy dark:text-light-neutral">Key Changes & Implications:</p>
                                                        <p className="text-sm text-dark-gray dark:text-gray-300 mt-1 whitespace-pre-wrap">{comp.keyChanges}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                               <div>
                                    <h3 className="font-bold text-lg text-navy dark:text-light-neutral">Sample Plea / Argument</h3>
                                    <p className="whitespace-pre-wrap bg-white dark:bg-navy p-3 rounded-md shadow text-sm mt-2 text-dark-gray dark:text-gray-300">{analysisResult.samplePlea}</p>
                               </div>

                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {/* AI Chat Modal */}
            {isChatModalOpen && (
                 <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-light-neutral dark:bg-navy w-full max-w-2xl h-[80vh] rounded-lg shadow-2xl flex flex-col">
                        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <ChatBubbleLeftRightIcon className="w-6 h-6 text-gold" />
                                <h2 className="font-heading text-xl font-bold text-navy dark:text-white">AI Chat Assistant</h2>
                            </div>
                            <button onClick={() => setIsChatModalOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </header>
                        <div ref={chatContentRef} className="flex-grow p-4 space-y-4 overflow-y-auto">
                           {chatHistory.map((chat, index) => (
                                <div key={index} className={`flex gap-3 ${chat.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {chat.sender === 'ai' && <div className="w-8 h-8 rounded-full bg-gold flex-shrink-0 flex items-center justify-center font-bold text-navy text-sm">AI</div>}
                                    <div className={`max-w-md p-3 rounded-lg ${chat.sender === 'user' ? 'bg-navy text-white dark:bg-gold dark:text-navy' : 'bg-white dark:bg-gray-800'}`}>
                                        <p className="text-sm whitespace-pre-wrap">{chat.message}</p>
                                    </div>
                                </div>
                           ))}
                           {isChatLoading && (
                                <div className="flex justify-start gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gold flex-shrink-0 flex items-center justify-center font-bold text-navy text-sm">AI</div>
                                    <div className="max-w-md p-3 rounded-lg bg-white dark:bg-gray-800">
                                        <p className="text-sm italic">AI is thinking...</p>
                                    </div>
                                </div>
                           )}
                        </div>
                        <footer className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <form onSubmit={handleChatSubmit} className="flex gap-2 items-center">
                               {speechToTextSupported ? (
                                  <button
                                    type="button"
                                    onClick={handleToggleRecording}
                                    className={`p-2 rounded-full transition-colors flex-shrink-0 ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
                                    aria-label={isRecording ? 'Stop recording' : 'Start voice recording'}
                                  >
                                    <MicrophoneIcon className="w-6 h-6" />
                                  </button>
                                ) : <p className="text-xs text-gray-500 text-center">Voice input not supported.</p>
                               }
                                <input 
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder={isRecording ? "Listening..." : "Ask a follow-up question..."}
                                    className="flex-grow px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-gold"
                                    disabled={isChatLoading || isRecording}
                                />
                                <button type="submit" className="px-4 py-2 bg-navy text-white dark:bg-gold dark:text-navy rounded-full font-semibold disabled:opacity-50" disabled={isChatLoading || !chatInput.trim()}>
                                    Send
                                </button>
                            </form>
                             {speechError && (
                                <p className="mt-2 text-xs text-red-500 text-center">{speechError}</p>
                            )}
                        </footer>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default CaseAnalysisPage;
