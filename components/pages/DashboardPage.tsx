
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../../services/supabaseClient';
import { 
    UserCircleIcon,
    BookOpenIcon, 
    ArrowDownTrayIcon, 
    ClipboardDocumentIcon,
    SparklesIcon,
    SearchIcon,
    BellIcon,
} from '../icons/Icons';

interface Profile {
    full_name?: string;
    user_type?: string;
    institution_firm?: string;
    is_premium?: boolean;
    // Fix: Add fields to track user activity.
    analysis_count?: number;
    template_generation_count?: number;
}


// Sub-component for statistic cards
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string | number }> = ({ icon, label, value }) => (
    <div className="bg-light-neutral dark:bg-dark-gray/50 p-4 rounded-lg shadow-md flex items-center gap-4">
        <div className="text-gold bg-gold/10 p-3 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-dark-gray dark:text-gray-400">{label}</p>
            <p className="text-xl font-bold text-navy dark:text-white">{value}</p>
        </div>
    </div>
);

// Sub-component for dashboard widgets
const WidgetCard: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode }> = ({ icon, title, children }) => (
    <div className="bg-white dark:bg-navy p-6 rounded-lg shadow-lg flex flex-col">
        <div className="flex items-center gap-4 mb-4">
            <div className="text-gold">{icon}</div>
            <h3 className="font-heading text-xl font-bold text-navy dark:text-white">{title}</h3>
        </div>
        <div className="text-dark-gray dark:text-gray-300 text-sm space-y-2 flex-grow">
            {children}
        </div>
    </div>
);

const DashboardPage: React.FC = () => {
    const { user } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [successMessage, setSuccessMessage] = useState(location.state?.message || null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    setLoading(true);
                    // Fix: Select all relevant profile fields including usage counts.
                    const { data, error, status } = await supabase
                        .from('profiles')
                        .select(`full_name, user_type, institution_firm, is_premium, analysis_count, template_generation_count`)
                        .eq('id', user.id)
                        .maybeSingle();

                    if (error && status !== 406) {
                        throw error;
                    }

                    if (data) {
                        setProfile(data);
                    }
                } catch (error: any) {
                    console.error('Error fetching profile:', error.message);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [user]);
    
    useEffect(() => {
        if(successMessage) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                window.history.replaceState({}, document.title)
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    if (loading) {
        return (
             <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }
    
    return (
        <div className="py-8 container mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
             {successMessage && (
                <div className="mb-6 bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 text-green-800 dark:text-green-200 p-4 rounded-md shadow-lg text-center animate-fade-in">
                    <p className="font-bold">{successMessage}</p>
                </div>
            )}

            <header className="mb-8">
                <div className="flex flex-wrap justify-between items-center gap-4">
                     <div>
                        <h1 className="font-heading text-4xl font-bold text-navy dark:text-white">
                            Welcome, {profile?.full_name || user?.email}
                        </h1>
                        <p className="mt-2 text-lg text-dark-gray dark:text-gray-300">
                            Your AI-powered legal research dashboard.
                        </p>
                    </div>
                     {profile?.is_premium && (
                         <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 text-gold font-semibold">
                            <SparklesIcon className="w-5 h-5" />
                            <span>Premium Member</span>
                        </div>
                    )}
                </div>
            </header>
            
            {/* User Stats Section */}
            <section className="mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={<SparklesIcon className="w-6 h-6" />} label="Account Type" value={profile?.is_premium ? 'Premium' : 'Free'} />
                    {/* Fix: Display dynamic usage counts from the user's profile. */}
                    <StatCard icon={<ClipboardDocumentIcon className="w-6 h-6" />} label="Cases Analyzed" value={profile?.analysis_count ?? 0} />
                    <StatCard icon={<ArrowDownTrayIcon className="w-6 h-6" />} label="Documents Generated" value={profile?.template_generation_count ?? 0} />
                    <StatCard icon={<UserCircleIcon className="w-6 h-6" />} label="Subscription" value={profile?.is_premium ? 'Active' : 'N/A'} />
                </div>
            </section>
            
            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-8">
                    <WidgetCard icon={<SearchIcon className="w-8 h-8" />} title="Smart Legal Search">
                        <p className="mb-4">Instantly search across Indian Acts, Sections, and Judgments.</p>
                        <form onSubmit={handleSearchSubmit}>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search section number, keyword..."
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
                            </div>
                        </form>
                    </WidgetCard>
                    
                    <WidgetCard icon={<BookOpenIcon className="w-8 h-8" />} title="Recent Activity">
                        <p>You have no recent activity. Start exploring to see your history here.</p>
                        <div className="mt-4 flex flex-wrap gap-4">
                            <Link to="/acts" className="font-semibold text-gold hover:underline">Browse Acts</Link>
                            <Link to="/case-analysis" className="font-semibold text-gold hover:underline">Analyze a Case</Link>
                            <Link to="/legal-documents" className="font-semibold text-gold hover:underline">Generate a Document</Link>
                        </div>
                    </WidgetCard>
                </div>
                
                {/* Right Column */}
                <div className="space-y-8">
                     <WidgetCard icon={<BellIcon className="w-8 h-8" />} title="AI Notifications">
                         <p>No new notifications.</p>
                         <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">AI will notify you about new judgments related to your interests.</p>
                     </WidgetCard>

                     <WidgetCard icon={<UserCircleIcon className="w-8 h-8"/>} title="Profile & Settings">
                        <div className="space-y-3">
                            <p>Manage your account details and preferences.</p>
                            <p><strong>Email:</strong> <span className="text-dark-gray dark:text-gray-200">{user?.email}</span></p>
                        </div>
                        <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4 flex flex-col gap-3">
                             <Link to="/profile" className="font-semibold text-gold hover:underline">Edit Profile</Link>
                             {!profile?.is_premium && (
                                <Link to="/pricing" className="block w-full text-center bg-gold text-navy px-4 py-2 rounded-md font-semibold text-sm hover:opacity-90 transition-opacity">
                                    Upgrade to Premium
                                </Link>
                             )}
                        </div>
                    </WidgetCard>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
