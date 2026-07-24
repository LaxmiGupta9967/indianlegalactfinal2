

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { User } from '@supabase/supabase-js';

import { getDocumentSuggestion, generateDocumentTemplate } from '../../services/geminiService';
import { GeneratedDocumentTemplate } from '../../types';
import { 
    BriefcaseIcon,
    ExclamationTriangleIcon,
    ArrowDownTrayIcon,
    SearchIcon,
    FilterIcon,
    ChatBubbleLeftRightIcon,
    XMarkIcon,
    DocumentTextIcon,
    PencilSquareIcon,
    SparklesIcon,
    ClipboardDocumentIcon
} from '../icons/Icons';

// --- DATA & TYPES ---
type DocumentCategory = 'Agreement' | 'Notice' | 'Affidavit' | 'Petition' | 'Deed';

interface Document {
  id: number;
  title: string;
  description: string;
  state: string;
  category: DocumentCategory;
  downloadLink: string;
}

interface ChatMessage {
    sender: 'user' | 'ai';
    message: string;
}

// Fix: Add a Profile interface to type the user's profile data.
interface Profile {
    is_premium: boolean;
    template_generation_count: number;
}


const indianStates = [
    'All', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Andaman and Nicobar Islands', 'Chandigarh', 'Dadra and Nagar Haveli and Daman and Diu', 'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Lakshadweep', 'Puducherry'
];

const documentCategories: DocumentCategory[] = ['Agreement', 'Notice', 'Affidavit', 'Petition', 'Deed'];

const allDocuments: Document[] = [
    { id: 1, title: 'Rent Agreement', description: 'A contract for leasing a residential property, outlining terms for landlord and tenant.', state: 'Maharashtra', category: 'Agreement', downloadLink: 'https://drive.google.com/file/d/1sDHU10QY3egTf4AgMPuV3kWs-LKXiG4-/view?usp=sharing' },
    { id: 2, title: 'Memorandum of Understanding (MOU)', description: 'Outlines the broad strokes of an agreement between parties before a final contract.', state: 'Delhi', category: 'Agreement', downloadLink: 'https://drive.google.com/file/d/1gA21N4x22KHmPw2RYlX7ZpLqLeo19iZN/view?usp=sharing' },
    { id: 3, title: 'Partnership Deed', description: 'A legal document defining the terms, responsibilities, and profit-sharing between business partners.', state: 'Karnataka', category: 'Deed', downloadLink: 'https://drive.google.com/file/d/1SLF549N5TuEgB2Ph-fb8Y_zahVFd7j9T/view?usp=sharing' },
    { id: 4, title: 'General Affidavit', description: 'A sworn written statement of fact, used as evidence in court or for administrative purposes.', state: 'Uttar Pradesh', category: 'Affidavit', downloadLink: 'https://drive.google.com/file/d/1pJ6SF-alXiRYUVvCW0Zf-bHtjJY9Sy8w/view?usp=sharing' },
    { id: 5, title: 'Legal Notice for Dues Recovery', description: 'A formal communication to an entity, informing them of intent to undertake legal proceedings for non-payment.', state: 'Tamil Nadu', category: 'Notice', downloadLink: 'https://drive.google.com/file/d/12eONrgKiOnN47JmmZ-ltq2y2ob5h3nD5/view?usp=sharing' },
    { id: 6, title: 'Writ Petition (Sample)', description: 'A formal request to a High Court or the Supreme Court to issue a writ for constitutional remedies.', state: 'All', category: 'Petition', downloadLink: 'https://drive.google.com/file/d/1vj5BQSJ_j3lRmAiqlzyIE9lrdpYJEpbo/view?usp=sharing' },
    { id: 7, title: 'Sale Deed for Property', description: 'A legal document that acts as proof of sale and transfer of ownership of a property from a seller to a buyer.', state: 'Gujarat', category: 'Deed', downloadLink: 'https://drive.google.com/file/d/1HFfja8XrXdnvBVXlxvsT58apkqmsNaWj/view?usp=sharing' },
    { id: 8, title: 'Lease Agreement (Commercial)', description: 'A contract for leasing a commercial property, specifying terms for business use.', state: 'Maharashtra', category: 'Agreement', downloadLink: 'https://drive.google.com/file/d/1x5urltGEMHiMxDCop2R4DPYGEOWbhVId/view?usp=sharing' },
    { id: 9, title: 'Affidavit for Name Change', description: 'A sworn statement declaring a change of name, often required for official documents.', state: 'All', category: 'Affidavit', downloadLink: 'https://drive.google.com/file/d/1rGrV54kKrp0aQpSz1FFgZfboOwUVr4wt/view?usp=sharing' },
    { id: 10, title: 'Notice of Eviction', description: 'A formal notice from a landlord to a tenant to vacate the property, stating the reason and timeline.', state: 'Delhi', category: 'Notice', downloadLink: 'https://drive.google.com/file/d/1qUKBqvuEXWsWisTR5E2LNRlp12oCJOQ0/view?usp=sharing' },
    { id: 11, title: 'Special Leave Petition (SLP)', description: 'A petition seeking permission to appeal against a judgment of a lower court to the Supreme Court.', state: 'All', category: 'Petition', downloadLink: 'https://drive.google.com/file/d/1f_5KHhyezcOfJWiYa1IKwCwgn_GW1oF2/view?usp=sharing' },
    { id: 12, title: 'Gift Deed', description: 'A document used to legally transfer property or ownership to another person as a gift without any exchange of money.', state: 'Rajasthan', category: 'Deed', downloadLink: 'https://drive.google.com/file/d/1hNCOfX7EeT_E2zP-oxVuDzb2P4eF8Lof/view?usp=sharing' },
    { id: 13, title: 'Non-Disclosure Agreement (NDA)', description: 'A confidentiality agreement to protect sensitive information shared between parties.', state: 'Karnataka', category: 'Agreement', downloadLink: 'https://drive.google.com/file/d/1QtVls0r5D6dBQ0MRzU8cuhVH7M4NSuI7/view?usp=sharing' },
];

const documentSummaryForAI = allDocuments.map(d => `${d.title} (${d.category}) for ${d.state}`).join('; ');

// --- Sub-Components ---

// Fix: Add isGenerationDisabled prop to conditionally disable the "Generate with AI" button.
const DocumentCard: React.FC<{ doc: Document; onGenerateClick: (doc: Document) => void; isGenerationDisabled: boolean; }> = ({ doc, onGenerateClick, isGenerationDisabled }) => {
  return (
    <div className="bg-white dark:bg-navy p-6 rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col animate-fade-in">
      <h3 className="font-heading text-xl font-bold text-navy dark:text-white mb-2">{doc.title}</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 rounded-full">{doc.state}</span>
        <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full">{doc.category}</span>
      </div>
      <p className="text-dark-gray dark:text-gray-300 text-sm mb-6 flex-grow">{doc.description}</p>
      <div className="mt-auto grid grid-cols-1 sm:grid-cols-2 gap-2">
         <a
          href={doc.downloadLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 bg-gold text-navy px-4 py-2 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity shadow-md text-center"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Download PDF
        </a>
        <button
          onClick={() => onGenerateClick(doc)}
          disabled={isGenerationDisabled}
          className="inline-flex items-center justify-center gap-2 bg-gray-200 text-navy dark:bg-gray-700 dark:text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SparklesIcon className="w-4 h-4" />
          Generate with AI
        </button>
      </div>
    </div>
  );
};

const StateSpecificInfo: React.FC<{ stateName: string }> = ({ stateName }) => (
    <div className="my-8 p-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-lg animate-fade-in">
        <h3 className="font-heading text-2xl font-bold text-navy dark:text-white mb-4">
            Legal Requirements for {stateName}
        </h3>
        <div className="grid md:grid-cols-2 gap-6 text-sm text-dark-gray dark:text-gray-300">
            <div>
                <p className="mb-2">
                    Please note that legal requirements such as stamp duty, registration fees, and notarization processes are specific to each state. The templates provided are a starting point.
                </p>
                <p>
                    For <strong className="text-navy dark:text-white">{stateName}</strong>, it is crucial to verify the current stamp duty rates and ensure the document is registered with the local sub-registrar office where applicable.
                </p>
            </div>
            <div>
                <h4 className="font-semibold text-md text-navy dark:text-white mb-2">General Checklist:</h4>
                <ul className="list-disc list-inside space-y-1">
                    <li>Identity proof of all parties (Aadhaar, PAN Card).</li>
                    <li>Address proof of all parties.</li>
                    <li>Passport-sized photographs.</li>
                    <li>Proof of ownership (for property documents).</li>
                    <li>Two witnesses with valid ID.</li>
                </ul>
            </div>
        </div>
    </div>
);

// Fix: Update props to include user and a success callback to handle usage counting.
const AiGeneratedDocumentModal: React.FC<{ doc: Document; onClose: () => void; user: User | null; onGenerationSuccess: () => void; }> = ({ doc, onClose, user, onGenerationSuccess }) => {
    const [template, setTemplate] = useState<GeneratedDocumentTemplate | null>(null);
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [copyStatus, setCopyStatus] = useState('Copy Text');

    useEffect(() => {
        const generate = async () => {
            if (!user) {
                setStatus('error');
                setErrorMessage('You must be logged in to generate a document.');
                return;
            };

            setStatus('loading');
            try {
                const result = await generateDocumentTemplate(doc.title);
                setTemplate(result);
                setStatus('success');
                
                // Fix: Increment usage count for free users after successful generation.
                const { data: currentProfile } = await supabase
                    .from('profiles')
                    .select('is_premium, template_generation_count')
                    .eq('id', user.id)
                    .single();

                if (currentProfile && !currentProfile.is_premium) {
                    const newCount = (currentProfile.template_generation_count || 0) + 1;
                    const { error: updateError } = await supabase
                        .from('profiles')
                        .update({ template_generation_count: newCount })
                        .eq('id', user.id);
                    
                    if (updateError) {
                        console.error("Failed to update template count:", updateError.message);
                    } else {
                        onGenerationSuccess();
                    }
                }

            } catch (err: any) {
                setErrorMessage(err.message || 'An unknown error occurred.');
                setStatus('error');
            }
        };
        generate();
    }, [doc, user, onGenerationSuccess]);


    const handleCopy = () => {
        if (template?.template_text) {
            navigator.clipboard.writeText(template.template_text).then(() => {
                setCopyStatus('Copied!');
                setTimeout(() => setCopyStatus('Copy Text'), 2000);
            }, () => {
                setCopyStatus('Failed to copy');
            });
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-light-neutral dark:bg-navy w-full max-w-3xl h-[90vh] rounded-lg shadow-2xl flex flex-col animate-fade-in">
                <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-6 h-6 text-gold" />
                        <h2 className="font-heading text-xl font-bold text-navy dark:text-white">AI Generated Template: {doc.title}</h2>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                
                <div className="p-6 flex-grow overflow-y-auto">
                    {status === 'loading' && (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <svg className="animate-spin h-8 w-8 text-gold" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                            <p className="mt-4 font-semibold text-lg text-navy dark:text-light-neutral">AI is drafting your document...</p>
                            <p className="text-sm text-dark-gray dark:text-gray-400">This may take a few seconds.</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center justify-center h-full text-center bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                            <ExclamationTriangleIcon className="w-10 h-10 text-red-500 mb-4" />
                            <h3 className="font-bold text-red-800 dark:text-red-300">Generation Failed</h3>
                            <p className="text-sm text-red-700 dark:text-red-300 mt-2">{errorMessage}</p>
                        </div>
                    )}

                    {status === 'success' && template && (
                        <div className="space-y-4">
                            <p className="text-sm p-4 bg-gold/10 text-gold-800 dark:text-gold-200 rounded-md">{template.description}</p>
                            <div>
                                <h3 className="font-semibold mb-2">Placeholders to fill:</h3>
                                <div className="flex flex-wrap gap-2">
                                    {template.placeholders.map(p => <code key={p} className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">{p}</code>)}
                                </div>
                            </div>
                            <pre className="whitespace-pre-wrap break-words font-mono text-sm p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md overflow-x-auto">
                                <code>{template.template_text}</code>
                            </pre>
                        </div>
                    )}
                </div>

                {status === 'success' && (
                    <footer className="p-4 border-t border-gray-200 dark:border-gray-700 text-right flex-shrink-0">
                        <button
                            onClick={handleCopy}
                            className="px-5 py-2 bg-navy text-white dark:bg-gold dark:text-navy rounded-md font-semibold flex items-center gap-2"
                        >
                            <ClipboardDocumentIcon className="w-5 h-5" />
                            {copyStatus}
                        </button>
                    </footer>
                )}
            </div>
        </div>
    );
};


// --- Main Page Component ---
const LegalDocumentsPage: React.FC = () => {
    // Fix: Add state for authentication, profile loading, and usage limits.
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedState, setSelectedState] = useState('All');
    const [activeCategory, setActiveCategory] = useState<DocumentCategory | 'All'>('All');
    
    // AI Chat State
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);
    const chatContentRef = useRef<HTMLDivElement>(null);
    
    // Generate Document Modal State
    const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
    const [docToGenerate, setDocToGenerate] = useState<Document | null>(null);

    // Fix: Add useEffect for authentication check and profile fetching.
    useEffect(() => {
        if (authLoading) return;

        if (!user) {
            navigate('/signup', {
                replace: true,
                state: { message: 'Please create an account to access Legal Documents.' }
            });
            return;
        }

        const fetchProfile = async () => {
            setProfileLoading(true);
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('is_premium, template_generation_count')
                    .eq('id', user.id)
                    .single();

                if (error) throw error;
                setProfile(data);
            } catch (err: any) {
                console.error(err);
            } finally {
                setProfileLoading(false);
            }
        };

        fetchProfile();
    }, [user, authLoading, navigate]);


    const filteredDocuments = useMemo(() => {
        return allDocuments.filter(doc => {
            const matchesState = selectedState === 'All' || doc.state === 'All' || doc.state === selectedState;
            const matchesCategory = activeCategory === 'All' || doc.category === activeCategory;
            const matchesSearch = searchQuery.trim() === '' ||
                doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.state.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesState && matchesCategory && matchesSearch;
        });
    }, [searchQuery, selectedState, activeCategory]);

    useEffect(() => {
        if (isChatOpen && chatContentRef.current) {
            chatContentRef.current.scrollTop = chatContentRef.current.scrollHeight;
        }
    }, [chatHistory, isChatOpen]);

    const handleOpenChat = () => {
        setChatHistory([{
            sender: 'ai',
            message: "Hi! I’m your Indian Legal Acts Assistant. Tell me your state and what legal document you need, and I’ll guide you to the correct template."
        }]);
        setIsChatOpen(true);
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
            const aiResponse = await getDocumentSuggestion(updatedHistory, chatInput, documentSummaryForAI);
            setChatHistory(prev => [...prev, { sender: 'ai', message: aiResponse }]);
        } catch (err: any) {
            setChatHistory(prev => [...prev, { sender: 'ai', message: `Sorry, an error occurred: ${err.message}` }]);
        } finally {
            setIsChatLoading(false);
        }
    };

    const handleOpenGenerateModal = (doc: Document) => {
        setDocToGenerate(doc);
        setIsGenerateModalOpen(true);
    };

    const handleCloseGenerateModal = () => {
        setIsGenerateModalOpen(false);
        setDocToGenerate(null);
    };

    // Fix: Add handler to update profile state after a successful generation.
    const handleGenerationSuccess = () => {
        setProfile(prev => prev ? { ...prev, template_generation_count: prev.template_generation_count + 1 } : null);
    };

    // Fix: Calculate usage limits for free users.
    const generationLimit = 2;
    const templatesRemaining = profile ? Math.max(0, generationLimit - (profile.template_generation_count || 0)) : 0;
    const isLimitReached = !profile?.is_premium && (profile?.template_generation_count ?? 0) >= generationLimit;


    if (authLoading || profileLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="py-8 animate-fade-in container mx-auto px-4 sm:px-6 lg:px-8">
            {/* --- HEADER --- */}
            <header className="text-center mb-12">
                <BriefcaseIcon className="w-12 h-12 mx-auto text-gold mb-4" />
                <h1 className="font-heading text-4xl font-bold text-navy dark:text-white">
                    State-Wise Legal Document Templates
                </h1>
                <p className="mt-2 text-lg text-dark-gray dark:text-gray-300 max-w-2xl mx-auto">
                    Download professionally drafted templates for common legal documents. These templates serve as a starting point and should be customized by a legal professional.
                </p>
                <div className="mt-6 max-w-3xl mx-auto bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 p-4 rounded-md text-left">
                    <div className="flex">
                        <div className="flex-shrink-0">
                           <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm">
                                <strong>Disclaimer:</strong> These documents are for informational purposes only and do not constitute legal advice. Always consult a qualified legal professional for your specific needs.
                            </p>
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Fix: Add usage info and upgrade prompt for free users. */}
            {profile && !profile.is_premium && (
                <div className="mb-8 max-w-3xl mx-auto">
                    {isLimitReached ? (
                        <div className="bg-gold/10 border-l-4 border-gold text-gold-800 dark:text-gold-200 p-4 rounded-md text-center">
                            <h3 className="font-bold flex items-center justify-center gap-2"><SparklesIcon className="w-5 h-5" /> Free Limit Reached</h3>
                            <p className="mt-1 text-sm">Please upgrade to our Pro plan for unlimited AI document generations.</p>
                            <NavLink to="/pricing" className="mt-3 inline-block bg-gold text-navy px-4 py-2 rounded-md font-semibold text-sm hover:opacity-90">
                                Upgrade to Pro
                            </NavLink>
                        </div>
                    ) : (
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                            <p className="font-semibold text-navy dark:text-light-neutral">
                                You have <span className="text-gold text-lg">{templatesRemaining}</span> of {generationLimit} free AI template generations remaining.
                            </p>
                        </div>
                    )}
                </div>
            )}


            {/* --- FILTER CONTROLS --- */}
            <div className="sticky top-[80px] bg-light-neutral/80 dark:bg-dark-gray/80 backdrop-blur-sm z-30 p-4 rounded-lg shadow-md mb-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <SearchIcon className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by name or state (e.g., Rent Agreement Maharashtra)"
                            className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                        />
                    </div>
                    <select
                        value={selectedState}
                        onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-gold"
                    >
                        {indianStates.map(state => <option key={state} value={state}>{state === 'All' ? 'Select your State' : state}</option>)}
                    </select>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm flex items-center gap-1"><FilterIcon className="w-4 h-4" />Categories:</span>
                    <button
                        onClick={() => setActiveCategory('All')}
                        className={`px-3 py-1 text-sm rounded-full transition-colors ${activeCategory === 'All' ? 'bg-gold text-navy font-bold' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                    >
                        All
                    </button>
                    {documentCategories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-3 py-1 text-sm rounded-full transition-colors ${activeCategory === cat ? 'bg-gold text-navy font-bold' : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                        >
                            {cat}s
                        </button>
                    ))}
                </div>
            </div>

            {/* --- STATE-SPECIFIC INFO PANEL --- */}
            {selectedState !== 'All' && <StateSpecificInfo stateName={selectedState} />}


            {/* --- DOCUMENT GRID --- */}
            {filteredDocuments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredDocuments.map(doc => <DocumentCard key={doc.id} doc={doc} onGenerateClick={handleOpenGenerateModal} isGenerationDisabled={isLimitReached} />)}
                </div>
            ) : (
                <div className="text-center py-16 text-dark-gray dark:text-gray-400">
                    <DocumentTextIcon className="mx-auto h-16 w-16" />
                    <h2 className="mt-4 text-2xl font-bold font-heading text-navy dark:text-white">No Matching Documents</h2>
                    <p className="mt-2">Try adjusting your search or filter settings.</p>
                </div>
            )}

            {/* --- AI CHAT FAB & MODAL --- */}
            <button
                onClick={handleOpenChat}
                className="fixed bottom-6 right-6 bg-gold text-navy p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-40 flex items-center gap-2"
                aria-label="Ask Indian Legal Acts Assistant"
            >
                <span className="hidden sm:inline font-semibold text-sm">Ask Indian Legal Acts Assistant</span>
                <span>💬</span>
            </button>

            {isChatOpen && (
                 <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-light-neutral dark:bg-navy w-full max-w-lg h-[70vh] rounded-lg shadow-2xl flex flex-col">
                        <header className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <ChatBubbleLeftRightIcon className="w-6 h-6 text-gold" />
                                <h2 className="font-heading text-xl font-bold text-navy dark:text-white">AI Assistant</h2>
                            </div>
                            <button onClick={() => setIsChatOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
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
                                <input 
                                    type="text"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    placeholder="e.g., 'rent agreement for gujarat'"
                                    className="flex-grow px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full focus:outline-none focus:ring-2 focus:ring-gold"
                                    disabled={isChatLoading}
                                />
                                <button type="submit" className="px-4 py-2 bg-navy text-white dark:bg-gold dark:text-navy rounded-full font-semibold disabled:opacity-50" disabled={isChatLoading || !chatInput.trim()}>
                                    Send
                                </button>
                            </form>
                        </footer>
                    </div>
                 </div>
            )}
            
            {/* Generate Document Modal */}
            {isGenerateModalOpen && docToGenerate && (
                <AiGeneratedDocumentModal doc={docToGenerate} onClose={handleCloseGenerateModal} user={user} onGenerationSuccess={handleGenerationSuccess} />
            )}

        </div>
    );
};

export default LegalDocumentsPage;