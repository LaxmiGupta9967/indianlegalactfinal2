import React, { useState } from 'react';
import { BriefcaseIcon } from '../icons/Icons';

// The URL for the *second* Google Apps Script project, the one with the doPost function.
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzSPha2a9NsuiTI83wDa2ie6Ih_18u3Xz4op5OCtQeH3Zqs1JxnfkXqobwXMWhBsWxd/exec';

const ContactPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('submitting');
        setErrorMessage('');

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            // Fix: Explicitly cast value to string. `Object.entries` can infer `value` as `unknown`,
            // which is not assignable to `FormData.append`. We are certain the values are strings.
            data.append(key, value as string);
        });

        fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            body: data,
            mode: 'no-cors', // This is the crucial part to prevent the CORS error
        })
        .then(() => {
            // In 'no-cors' mode, we can't read the response, so we assume success if no network error occurs.
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' }); // Reset form
        })
        .catch((err) => {
            console.error('Form submission error:', err);
            setStatus('error');
            setErrorMessage('There was a network error. Please try again.');
        });
    };

    const inputFieldClass = "mt-1 block w-full px-3 py-2 bg-light-neutral dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-gold focus:border-gold";

    return (
        <div className="py-8 md:py-12 container mx-auto px-4 sm:px-6 lg:px-8">
            <header className="text-center mb-12 max-w-3xl mx-auto px-4">
                <BriefcaseIcon className="w-12 h-12 mx-auto text-gold mb-4" />
                <h1 className="font-heading text-4xl font-bold text-navy dark:text-white">Contact Us</h1>
                <p className="mt-2 text-lg text-dark-gray dark:text-gray-300">We'd love to hear from you. Reach out with any questions or feedback.</p>
            </header>

            <div className="bg-white dark:bg-navy rounded-lg shadow-2xl overflow-hidden">
                <div className="grid md:grid-cols-2">
                    {/* Contact Form */}
                    <div className="p-8 lg:p-12">
                        <h2 className="text-2xl font-bold font-heading text-gold mb-6">Send a Message</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium">Full Name</label>
                                <input type="text" name="name" id="name" value={formData.name} onChange={handleInputChange} required className={inputFieldClass} />
                            </div>
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium">Email Address</label>
                                <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} required className={inputFieldClass} />
                            </div>
                            <div>
                                <label htmlFor="subject" className="block text-sm font-medium">Subject</label>
                                <input type="text" name="subject" id="subject" value={formData.subject} onChange={handleInputChange} required className={inputFieldClass} />
                            </div>
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium">Message</label>
                                <textarea name="message" id="message" value={formData.message} onChange={handleInputChange} required rows={5} className={inputFieldClass}></textarea>
                            </div>
                            <button 
                                type="submit" 
                                disabled={status === 'submitting'}
                                className="w-full bg-navy text-white dark:bg-gold dark:text-navy px-4 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity shadow-md disabled:opacity-50 disabled:cursor-wait"
                            >
                                {status === 'submitting' ? 'Submitting...' : 'Submit'}
                            </button>
                            {status === 'success' && <p className="mt-4 text-center text-sm text-green-600 dark:text-green-400">Thank you for your message! We will get back to you shortly.</p>}
                            {status === 'error' && <p className="mt-4 text-center text-sm text-red-500 dark:text-red-400">{errorMessage}</p>}
                        </form>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-light-neutral dark:bg-dark-gray text-dark-gray dark:text-gray-300 p-8 lg:p-12">
                         <div className="space-y-8">
                            <div>
                                <h3 className="font-heading text-xl font-bold text-navy dark:text-white mb-2">Head Office - West</h3>
                                <p className="whitespace-pre-line leading-relaxed">
                                    {`Aviyana House, 609-Parth Solitaire Commercial Complex,
                                    Plot No-2, Sector-9E, Kalamboli, Roadpali,
                                    Near D-Mart, Opposite Dominos & Above ICICI Bank,
                                    Navi Mumbai-410218, Maharashtra`}
                                </p>
                                 <p className="mt-3">
                                    <strong>Contact:</strong> <a href="tel:+918779101817" className="text-gold hover:underline">+918779101817</a>, <a href="tel:+918779102007" className="text-gold hover:underline">+918779102007</a>
                                </p>
                            </div>
                             <div>
                                <h3 className="font-heading text-xl font-bold text-navy dark:text-white mb-2">Email Us</h3>
                                <p>For general inquiries, please email us at:</p>
                                <a href="mailto:connect@aviyanaventures.com" className="text-gold hover:underline">connect@aviyanaventures.com</a>
                            </div>
                             <div>
                                <h3 className="font-heading text-xl font-bold text-navy dark:text-white mb-2">Find Us on the Map</h3>
                                <div className="mt-2 rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 shadow-md">
                                    <iframe 
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.026749035251!2d73.10425867520515!3d19.06253418214041!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3be7c1d1a6aaaaab%3A0x53b75488478446e1!2sParth%20Solitaire!5e0!3m2!1sen!2sin!4v1717596161321!5m2!1sen!2sin" 
                                        width="100%" 
                                        height="250" 
                                        style={{ border: 0 }} 
                                        allowFullScreen={true}
                                        loading="lazy" 
                                        referrerPolicy="no-referrer-when-downgrade"
                                        title="Aviyana Legal Head Office Location"
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
