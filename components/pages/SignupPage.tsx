
import React, { useState } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { UserCircleIcon, EyeIcon, EyeSlashIcon } from '../icons/Icons';

const SignupPage: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        userType: '',
        institution: '',
        practiceArea: '',
        barCouncilNo: '',
        sadsanMembershipId: '',
        experienceYear: '',
        mobile: '',
        location: '',
        agreedToTerms: false,
    });
    const [passwordVisible, setPasswordVisible] = useState(false);
    const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(location.state?.message || null);


    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        // --- Validation ---
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        if (formData.userType === 'Lawyer' && !formData.barCouncilNo.trim()) {
            setError("Bar Council Number is required for lawyers.");
            return;
        }
        if (!formData.agreedToTerms) {
            setError("You must agree to the Terms & Conditions and Privacy Policy.");
            return;
        }
        
        setLoading(true);

        const { data, error: signUpError } = await supabase.auth.signUp({
            email: formData.email,
            password: formData.password,
            options: {
                data: {
                    full_name: formData.fullName,
                    user_type: formData.userType,
                    institution_firm: formData.institution,
                    practice_area: formData.practiceArea,
                    bar_council_no: formData.barCouncilNo,
                    sadsan_membership_id: formData.sadsanMembershipId,
                    experience_year: formData.experienceYear,
                    mobile_number: formData.mobile,
                    location: formData.location,
                    analysis_count: 0, // Initialize analysis count
                }
            }
        });

        if (signUpError) {
            setError(signUpError.message);
        } else {
            navigate('/dashboard', { state: { message: "Account created successfully! Welcome to Indian Legal Acts." } });
        }
        
        setLoading(false);
    };

    const inputClass = "block w-full px-3 py-2 bg-light-neutral dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-gold focus:border-gold sm:text-sm";
    const labelClass = "block text-sm font-medium text-dark-gray dark:text-gray-300";

    return (
        <div className="py-12 px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="max-w-3xl mx-auto">
                <div className="text-center">
                    <UserCircleIcon className="mx-auto h-12 w-12 text-gold" />
                    <h2 className="mt-4 text-3xl font-bold font-heading tracking-tight text-navy dark:text-white">Create a Professional Account</h2>
                    <p className="mt-2 text-sm text-dark-gray dark:text-gray-400">
                        Already have an account?{' '}
                        <NavLink to="/login" className="font-medium text-gold hover:text-yellow-600">
                            Sign in here
                        </NavLink>
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="mt-8 bg-white dark:bg-navy p-8 rounded-lg shadow-lg space-y-6">
                    {message && <div className="bg-green-100 dark:bg-green-900/50 border-l-4 border-green-500 text-green-800 dark:text-green-200 p-4 rounded-md text-sm text-center"><p>{message}</p></div>}
                    {error && <div className="bg-red-100 dark:bg-red-900/50 border border-red-300 text-red-700 dark:text-red-200 px-4 py-3 rounded-md text-sm"><p>{error}</p></div>}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="fullName" className={labelClass}>Full Name*</label>
                            <input type="text" name="fullName" id="fullName" required className={inputClass} value={formData.fullName} onChange={handleChange} />
                        </div>
                        <div>
                            <label htmlFor="email" className={labelClass}>Email Address*</label>
                            <input type="email" name="email" id="email" autoComplete="email" required className={inputClass} value={formData.email} onChange={handleChange} />
                        </div>
                        <div className="relative">
                            <label htmlFor="password-signup" className={labelClass}>Password*</label>
                            <input type={passwordVisible ? 'text' : 'password'} name="password" id="password-signup" required className={inputClass} value={formData.password} onChange={handleChange} />
                            <button type="button" onClick={() => setPasswordVisible(!passwordVisible)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5">
                                {passwordVisible ? <EyeSlashIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
                            </button>
                        </div>
                        <div className="relative">
                            <label htmlFor="confirmPassword" className={labelClass}>Confirm Password*</label>
                            <input type={confirmPasswordVisible ? 'text' : 'password'} name="confirmPassword" id="confirmPassword" required className={inputClass} value={formData.confirmPassword} onChange={handleChange} />
                             <button type="button" onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)} className="absolute inset-y-0 right-0 top-6 pr-3 flex items-center text-sm leading-5">
                                {confirmPasswordVisible ? <EyeSlashIcon className="h-5 w-5 text-gray-500" /> : <EyeIcon className="h-5 w-5 text-gray-500" />}
                            </button>
                        </div>
                        <div>
                            <label htmlFor="userType" className={labelClass}>I am a...*</label>
                            <select name="userType" id="userType" required className={inputClass} value={formData.userType} onChange={handleChange}>
                                <option value="">Select your role</option>
                                <option value="Lawyer">Lawyer</option>
                                <option value="Researcher">Legal Researcher</option>
                                <option value="Law Student">Law Student</option>
                            </select>
                        </div>
                         <div>
                            <label htmlFor="institution" className={labelClass}>Institution / Firm Name*</label>
                            <input type="text" name="institution" id="institution" required className={inputClass} value={formData.institution} onChange={handleChange} />
                        </div>
                        {formData.userType === 'Lawyer' && (
                            <>
                                <div>
                                    <label htmlFor="barCouncilNo" className={labelClass}>Bar Council Number*</label>
                                    <input type="text" name="barCouncilNo" id="barCouncilNo" required className={inputClass} value={formData.barCouncilNo} onChange={handleChange} />
                                </div>
                                <div>
                                    <label htmlFor="sadsanMembershipId" className={labelClass}>Sadsan / Membership ID (Optional)</label>
                                    <input type="text" name="sadsanMembershipId" id="sadsanMembershipId" className={inputClass} value={formData.sadsanMembershipId} onChange={handleChange} />
                                </div>
                            </>
                        )}
                        <div>
                            <label htmlFor="practiceArea" className={labelClass}>Practice or Research Area (Optional)</label>
                            <input type="text" name="practiceArea" id="practiceArea" className={inputClass} value={formData.practiceArea} onChange={handleChange} placeholder="e.g., Criminal Law, Corporate Law" />
                        </div>
                         <div>
                            <label htmlFor="experienceYear" className={labelClass}>{formData.userType === 'Law Student' ? 'Year of Study' : 'Years of Experience'} (Optional)</label>
                            <input type="text" name="experienceYear" id="experienceYear" className={inputClass} value={formData.experienceYear} onChange={handleChange} />
                        </div>
                         <div>
                            <label htmlFor="mobile" className={labelClass}>Mobile Number (Optional)</label>
                            <input type="tel" name="mobile" id="mobile" className={inputClass} value={formData.mobile} onChange={handleChange} />
                        </div>
                         <div>
                            <label htmlFor="location" className={labelClass}>City / State (Optional)</label>
                            <input type="text" name="location" id="location" className={inputClass} value={formData.location} onChange={handleChange} placeholder="e.g., Mumbai, Maharashtra" />
                        </div>
                    </div>
                    
                    <div className="flex items-start">
                        <div className="flex h-5 items-center">
                            <input id="agreedToTerms" name="agreedToTerms" type="checkbox" className="h-4 w-4 rounded border-gray-300 text-gold focus:ring-gold" checked={formData.agreedToTerms} onChange={handleChange} />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="agreedToTerms" className="font-medium text-dark-gray dark:text-gray-300">
                                I agree to the{' '}
                                <NavLink to="/terms" target="_blank" className="text-gold hover:underline">Terms & Conditions</NavLink> and{' '}
                                <NavLink to="/privacy-policy" target="_blank" className="text-gold hover:underline">Privacy Policy</NavLink>.
                            </label>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-navy dark:text-navy bg-gold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold disabled:opacity-50"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignupPage;
