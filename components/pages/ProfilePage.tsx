
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import { UserCircleIcon } from '../icons/Icons';

const ProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState({
        full_name: '',
        user_type: '',
        institution_firm: '',
        practice_area: '',
        bar_council_no: '',
        experience_year: '',
        mobile_number: '',
        location: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            if (user) {
                try {
                    setLoading(true);
                    const { data, error } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', user.id)
                        .maybeSingle(); // Use maybeSingle() to handle cases where profile might not exist yet

                    if (error) throw error;
                    if (data) setProfile(data);
                } catch (error: any) {
                    setError('Failed to load profile data.');
                    console.error(error.message);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchProfile();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setProfile(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        setError(null);
        setSuccess(null);

        const updates = {
            id: user.id,
            ...profile,
            updated_at: new Date(),
        };

        const { error } = await supabase.from('profiles').upsert(updates);

        if (error) {
            setError(error.message);
        } else {
            setSuccess('Profile updated successfully!');
        }
        setSaving(false);
    };
    
    const inputClass = "block w-full px-3 py-2 bg-light-neutral dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-gold focus:border-gold sm:text-sm";
    const labelClass = "block text-sm font-medium text-dark-gray dark:text-gray-300";

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gold"></div>
            </div>
        );
    }

    return (
        <div className="py-12 container mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="max-w-3xl mx-auto">
                <div className="text-center">
                    <UserCircleIcon className="mx-auto h-12 w-12 text-gold" />
                    <h1 className="mt-4 text-3xl font-bold font-heading tracking-tight text-navy dark:text-white">Your Profile</h1>
                    <p className="mt-2 text-sm text-dark-gray dark:text-gray-400">Manage your professional information.</p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 bg-white dark:bg-navy p-8 rounded-lg shadow-lg space-y-6">
                    {error && <div className="bg-red-100 dark:bg-red-900/50 border border-red-300 text-red-700 dark:text-red-200 px-4 py-3 rounded-md text-sm"><p>{error}</p></div>}
                    {success && <div className="bg-green-100 dark:bg-green-900/50 border border-green-300 text-green-700 dark:text-green-200 px-4 py-3 rounded-md text-sm"><p>{success}</p></div>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="email" className={labelClass}>Email Address</label>
                            <input type="email" id="email" value={user?.email || ''} disabled className={`${inputClass} bg-gray-100 dark:bg-gray-700 cursor-not-allowed`} />
                        </div>
                         <div>
                            <label htmlFor="full_name" className={labelClass}>Full Name</label>
                            <input type="text" name="full_name" id="full_name" required className={inputClass} value={profile.full_name || ''} onChange={handleChange} />
                        </div>
                        <div>
                            <label htmlFor="user_type" className={labelClass}>I am a...</label>
                            <select name="user_type" id="user_type" required className={inputClass} value={profile.user_type || ''} onChange={handleChange}>
                                <option value="">Select your role</option>
                                <option value="Lawyer">Lawyer</option>
                                <option value="Researcher">Legal Researcher</option>
                                <option value="Law Student">Law Student</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="institution_firm" className={labelClass}>Institution / Firm Name</label>
                            <input type="text" name="institution_firm" id="institution_firm" required className={inputClass} value={profile.institution_firm || ''} onChange={handleChange} />
                        </div>
                        {profile.user_type === 'Lawyer' && (
                            <div>
                                <label htmlFor="bar_council_no" className={labelClass}>Bar Council Registration No. (Optional)</label>
                                <input type="text" name="bar_council_no" id="bar_council_no" className={inputClass} value={profile.bar_council_no || ''} onChange={handleChange} />
                            </div>
                        )}
                        <div>
                            <label htmlFor="practice_area" className={labelClass}>Practice or Research Area (Optional)</label>
                            <input type="text" name="practice_area" id="practice_area" className={inputClass} placeholder="e.g., Criminal Law" value={profile.practice_area || ''} onChange={handleChange} />
                        </div>
                         <div>
                            <label htmlFor="experience_year" className={labelClass}>{profile.user_type === 'Law Student' ? 'Year of Study' : 'Years of Experience'} (Optional)</label>
                            <input type="text" name="experience_year" id="experience_year" className={inputClass} value={profile.experience_year || ''} onChange={handleChange} />
                        </div>
                         <div>
                            <label htmlFor="mobile_number" className={labelClass}>Mobile Number (Optional)</label>
                            <input type="tel" name="mobile_number" id="mobile_number" className={inputClass} value={profile.mobile_number || ''} onChange={handleChange} />
                        </div>
                         <div>
                            <label htmlFor="location" className={labelClass}>City / State (Optional)</label>
                            <input type="text" name="location" id="location" className={inputClass} placeholder="e.g., Mumbai, Maharashtra" value={profile.location || ''} onChange={handleChange} />
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                         <Link to="/dashboard" className="px-6 py-2 rounded-md text-sm font-medium text-dark-gray dark:text-light-neutral hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            Back to Dashboard
                        </Link>
                        <button
                            type="submit"
                            disabled={saving}
                            className="w-48 flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-navy dark:text-navy bg-gold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold disabled:opacity-50"
                        >
                            {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;
