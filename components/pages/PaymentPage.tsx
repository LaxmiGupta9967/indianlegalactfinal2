
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabaseClient';
import { useAuth } from '../auth/AuthContext';
import { SparklesIcon, ExclamationTriangleIcon, BookOpenIcon } from '../icons/Icons';

// Add this declaration to inform TypeScript about the Razorpay object on the window
declare global {
    interface Window {
        Razorpay: any;
    }
}

const RAZORPAY_KEY_ID = 'rzp_live_RUv2nx9Eg3xoQf'; // Replace with your actual Razorpay Test Key ID

interface Plan {
    name: string;
    price: number;
    period: string;
}

interface PaymentRecord {
    id: number;
    amount: number;
    plan: string;
    payment_status: string;
    created_at: string;
}

const plans: Plan[] = [
    { name: 'Weekly', price: 99, period: '/ week' },
    { name: 'Monthly', price: 299, period: '/ month' },
    { name: 'Yearly', price: 999, period: '/ year' },
];

const PaymentPage: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [selectedPlan, setSelectedPlan] = useState<Plan>(plans[1]); // Default to Monthly
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [paymentHistory, setPaymentHistory] = useState<PaymentRecord[]>([]);
    const [historyLoading, setHistoryLoading] = useState(true);

    useEffect(() => {
        const fetchPaymentHistory = async () => {
            if (user) {
                try {
                    setHistoryLoading(true);
                    const { data, error } = await supabase
                        .from('payments')
                        .select('*')
                        .eq('user_id', user.id)
                        .order('created_at', { ascending: false });

                    if (error) throw error;
                    setPaymentHistory(data || []);
                } catch (err: any) {
                    console.error("Error fetching payment history:", err.message);
                } finally {
                    setHistoryLoading(false);
                }
            }
        };
        fetchPaymentHistory();
    }, [user]);

    const handlePayment = async () => {
        if (!user) {
            setError("You must be logged in to make a payment.");
            return;
        }
        setLoading(true);
        setError(null);
        
        // Fetch user profile to get contact details for prefill
        const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('mobile_number')
            .eq('id', user.id)
            .maybeSingle(); // Use maybeSingle() to handle cases where profile might not exist yet

        if (profileError) {
            setError("Could not fetch user profile for payment.");
            setLoading(false);
            return;
        }

        const options = {
            key: RAZORPAY_KEY_ID,
            amount: selectedPlan.price * 100, // Amount in paise
            currency: 'INR',
            name: 'Indian Legal Acts',
            description: `Premium Access - ${selectedPlan.name} Plan`,
            image: 'https://i.postimg.cc/C1wJWDR3/Professional-logo-for-Indian-Legal-Acts.png',
            handler: async (response: any) => {
                const { razorpay_payment_id } = response;
                
                // 1. Save payment details to Supabase
                const { error: paymentError } = await supabase.from('payments').insert({
                    user_id: user.id,
                    amount: selectedPlan.price * 100,
                    plan: selectedPlan.name,
                    payment_status: 'successful',
                    payment_id: razorpay_payment_id,
                });

                if (paymentError) {
                    setError(`Payment successful, but failed to save record: ${paymentError.message}`);
                    setLoading(false);
                    return;
                }

                // 2. Update user's profile to premium
                const { error: profileUpdateError } = await supabase
                    .from('profiles')
                    .update({ is_premium: true })
                    .eq('id', user.id);

                if (profileUpdateError) {
                    setError(`Payment successful, but failed to update profile: ${profileUpdateError.message}`);
                    setLoading(false);
                    return;
                }

                // 3. Redirect to dashboard with success message
                navigate('/dashboard', { 
                    state: { message: '🎉 Payment Successful! Premium features unlocked.' } 
                });
            },
            prefill: {
                name: user.user_metadata?.full_name || '',
                email: user.email,
                contact: profileData?.mobile_number || '',
            },
            theme: {
                color: '#0B2545', // navy
            },
            modal: {
                ondismiss: () => {
                    setLoading(false);
                    // You can optionally show a message here
                },
            },
        };
        
        try {
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (e) {
            setError("Failed to load Razorpay Checkout. Please check your internet connection and try again.");
            setLoading(false);
        }
    };
    
    return (
        <div className="py-12 container mx-auto px-4 sm:px-6 lg:px-8 animate-fade-in">
            <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                {/* Left Side: Payment Options */}
                <div className="bg-white dark:bg-navy p-8 rounded-lg shadow-2xl">
                    <div className="text-center">
                        <SparklesIcon className="mx-auto h-12 w-12 text-gold" />
                        <h1 className="mt-4 text-3xl font-bold font-heading tracking-tight text-navy dark:text-white">Upgrade to Premium</h1>
                        <p className="mt-2 text-dark-gray dark:text-gray-300">Get unlimited access to Case Analysis, AI Document Generator, and Saved Acts.</p>
                    </div>

                    <div className="mt-8">
                        <h2 className="text-lg font-semibold text-dark-gray dark:text-light-neutral">Select a Plan</h2>
                        <div className="mt-4 grid grid-cols-1 gap-4">
                            {plans.map((plan) => (
                                <button
                                    key={plan.name}
                                    onClick={() => setSelectedPlan(plan)}
                                    className={`p-4 border-2 rounded-lg text-left transition-all duration-200 ${
                                        selectedPlan.name === plan.name
                                            ? 'border-gold bg-gold/10'
                                            : 'border-gray-300 dark:border-gray-600 hover:border-gold/50'
                                    }`}
                                >
                                    <span className="font-bold text-lg text-navy dark:text-white">{plan.name} Plan</span>
                                    <div className="flex items-baseline gap-1">
                                         <span className="text-3xl font-bold text-gold">₹{plan.price}</span>
                                         <span className="text-dark-gray dark:text-gray-400">{plan.period}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <div className="mt-6 bg-red-100 dark:bg-red-900/50 border border-red-300 text-red-700 dark:text-red-200 px-4 py-3 rounded-md text-sm"><p>{error}</p></div>}

                    <div className="mt-8">
                        <button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-navy dark:text-navy bg-gold hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold disabled:opacity-50"
                        >
                            {loading ? 'Processing...' : `Pay ₹${selectedPlan.price} Now`}
                        </button>
                    </div>

                     <div className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                        <p>Payments are securely processed by Razorpay.</p>
                    </div>
                </div>

                {/* Right Side: Payment History */}
                <div className="bg-light-neutral dark:bg-dark-gray/50 p-8 rounded-lg shadow-lg">
                    <h2 className="font-heading text-2xl font-bold text-navy dark:text-white mb-4">Payment History</h2>
                    {historyLoading ? (
                        <p>Loading history...</p>
                    ) : paymentHistory.length > 0 ? (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {paymentHistory.map(p => (
                                <div key={p.id} className="bg-white dark:bg-navy p-4 rounded-md shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <p className="font-semibold text-navy dark:text-white">{p.plan} Plan</p>
                                        <p className="font-bold text-lg text-gold">₹{p.amount / 100}</p>
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                        <span>{new Date(p.created_at).toLocaleString()}</span>
                                        <span className={`ml-2 px-2 py-0.5 rounded-full text-white ${p.payment_status === 'successful' ? 'bg-green-500' : 'bg-red-500'}`}>
                                            {p.payment_status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10 text-dark-gray dark:text-gray-400">
                            <BookOpenIcon className="mx-auto h-12 w-12" />
                            <p className="mt-2 font-semibold">No payment history found.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;