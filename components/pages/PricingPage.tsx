
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { CheckIcon, SparklesIcon, BriefcaseIcon, XMarkIcon } from '../icons/Icons';

const PricingPage: React.FC = () => {
    const { user } = useAuth(); // to customize CTA buttons

    const features = [
        { name: 'Smart Legal Search', free: '5 per day', pro: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'AI-Generated Legal Reports', free: false, pro: true, enterprise: true },
        { name: 'AI Legal Template Generator', free: '2 per month', pro: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'Simplified Law Explanation', free: 'Preview', pro: 'Full Access', enterprise: 'Full Access' },
        { name: 'Document Vault (User Files)', free: '3 documents', pro: '25 documents', enterprise: 'Unlimited' },
        { name: 'AI Case Advisor / Chatbot', free: false, pro: true, enterprise: true },
        { name: 'Legal Updates Feed', free: true, pro: true, enterprise: true },
        { name: 'Case History', free: true, pro: true, enterprise: true },
        { name: 'Multi-user Licenses', free: false, pro: false, enterprise: true },
        { name: 'Dedicated Support', free: 'No', pro: 'Email Support', enterprise: 'Priority Support' },
    ];

    const renderFeatureValue = (value: string | boolean) => {
        if (typeof value === 'boolean') {
            return value ? <CheckIcon className="w-5 h-5 text-green-500 mx-auto" /> : <XMarkIcon className="w-5 h-5 text-gray-400 mx-auto" />;
        }
        return value;
    };


    return (
        <div className="py-12 bg-light-neutral dark:bg-dark-gray animate-fade-in">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="font-heading text-4xl sm:text-5xl font-extrabold text-navy dark:text-white">
                        Find the Right Plan for You
                    </h1>
                    <p className="mt-4 text-lg text-dark-gray dark:text-gray-300 max-w-2xl mx-auto">
                        Unlock powerful AI features to supercharge your legal research and drafting.
                    </p>
                </div>

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {/* Free Plan */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 flex flex-col">
                        <h3 className="font-heading text-2xl font-bold text-navy dark:text-white">Free</h3>
                        <p className="mt-2 text-dark-gray dark:text-gray-400">For students and basic exploration.</p>
                        <div className="mt-6">
                            <span className="text-5xl font-bold text-navy dark:text-white">₹0</span>
                            <span className="text-lg font-medium text-dark-gray dark:text-gray-400">/ forever</span>
                        </div>
                        <ul className="mt-8 space-y-4 text-sm text-dark-gray dark:text-gray-300 flex-grow">
                            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> 5 Smart Searches / day</li>
                            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> 2 AI Templates / month</li>
                            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> 3 Saved Documents</li>
                            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Legal Updates Feed</li>
                            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Case History</li>
                        </ul>
                        <NavLink to={user ? "/dashboard" : "/signup"} className="mt-8 w-full block text-center bg-gray-200 text-navy dark:bg-gray-700 dark:text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors">
                            {user ? "Your Current Plan" : "Sign Up for Free"}
                        </NavLink>
                    </div>

                    {/* Pro Plan */}
                    <div className="relative border-2 border-gold rounded-lg p-8 flex flex-col shadow-2xl">
                        <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                            <span className="px-4 py-1 bg-gold text-navy text-sm font-semibold rounded-full">Most Popular</span>
                        </div>
                        <h3 className="font-heading text-2xl font-bold text-gold flex items-center gap-2"><SparklesIcon className="w-6 h-6"/> Pro</h3>
                        <p className="mt-2 text-dark-gray dark:text-gray-400">For individual legal professionals.</p>
                        <div className="mt-6">
                            <span className="text-5xl font-bold text-navy dark:text-white">₹299</span>
                            <span className="text-lg font-medium text-dark-gray dark:text-gray-400">/ month</span>
                        </div>
                         <ul className="mt-8 space-y-4 text-sm text-dark-gray dark:text-gray-300 flex-grow">
                            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> <strong>Everything in Free, plus:</strong></li>
                            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Unlimited Smart Searches</li>
                            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Unlimited AI Legal Reports</li>
                            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Unlimited AI Legal Templates</li>
                            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Full Law Explanations</li>
                            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> AI Case Advisor Chatbot</li>
                            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> 25 Saved Documents</li>
                        </ul>
                        <NavLink to="/premium" className="mt-8 w-full block text-center bg-gold text-navy px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                            Upgrade to Pro
                        </NavLink>
                    </div>

                    {/* Enterprise Plan */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-8 flex flex-col">
                        <h3 className="font-heading text-2xl font-bold text-navy dark:text-white flex items-center gap-2"><BriefcaseIcon className="w-6 h-6"/> Enterprise</h3>
                        <p className="mt-2 text-dark-gray dark:text-gray-400">For law firms and institutions.</p>
                        <div className="mt-6">
                            <span className="text-4xl font-bold text-navy dark:text-white">Let's Talk</span>
                        </div>
                         <ul className="mt-8 space-y-4 text-sm text-dark-gray dark:text-gray-300 flex-grow">
                            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> <strong>Everything in Pro, plus:</strong></li>
                            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Multi-user licenses</li>
                            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Unlimited Document Vault</li>
                            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Dedicated Support</li>
                            <li className="flex items-center gap-3"><CheckIcon className="w-5 h-5 text-green-500" /> Custom Integrations</li>
                        </ul>
                        <NavLink to="/contact" className="mt-8 w-full block text-center bg-navy text-white dark:bg-gold dark:text-navy px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                            Contact Sales
                        </NavLink>
                    </div>
                </div>

                {/* Feature Comparison Table */}
                <div className="mt-20">
                    <h2 className="text-center font-heading text-3xl font-bold text-navy dark:text-white mb-8">
                        Compare Features
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full max-w-4xl mx-auto border-collapse text-sm text-left">
                            <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700">
                                    <th className="p-4 font-semibold text-navy dark:text-white">Feature</th>
                                    <th className="p-4 text-center font-semibold text-navy dark:text-white">Free</th>
                                    <th className="p-4 text-center font-semibold text-gold">Pro</th>
                                    <th className="p-4 text-center font-semibold text-navy dark:text-white">Enterprise</th>
                                </tr>
                            </thead>
                            <tbody>
                                {features.map(({ name, free, pro, enterprise }) => (
                                    <tr key={name} className="border-b border-gray-200 dark:border-gray-700">
                                        <td className="p-4 font-medium text-dark-gray dark:text-gray-200">{name}</td>
                                        <td className="p-4 text-center text-dark-gray dark:text-gray-300">{renderFeatureValue(free)}</td>
                                        <td className="p-4 text-center text-dark-gray dark:text-gray-300 font-semibold">{renderFeatureValue(pro)}</td>
                                        <td className="p-4 text-center text-dark-gray dark:text-gray-300">{renderFeatureValue(enterprise)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
