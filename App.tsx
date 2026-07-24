import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';

// Layout
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './components/pages/HomePage';
import ActsPage from './components/pages/ActsPage';
import ActDetailPage from './components/pages/ActDetailPage';
import SectionDetailPage from './components/pages/SectionDetailPage';
import CaseAnalysisPage from './components/pages/CaseAnalysisPage';
import SearchResultsPage from './components/pages/SearchResultsPage';
import AboutPage from './components/pages/AboutPage';
import ContactPage from './components/pages/ContactPage';
import LegalUpdatesPage from './components/pages/LegalUpdatesPage';
import LegalDocumentsPage from './components/pages/LegalDocumentsPage';
import LoginPage from './components/pages/LoginPage';
import SignupPage from './components/pages/SignupPage';
import DashboardPage from './components/pages/DashboardPage';
import ProfilePage from './components/pages/ProfilePage';
import PricingPage from './components/pages/PricingPage';
import PaymentPage from './components/pages/PaymentPage';

// Auth
import { AuthProvider } from './components/auth/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// A component to handle scrolling to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};


const AppContent: React.FC = () => {
    const [isDarkMode, setIsDarkMode] = useState(() => {
        // Check for saved preference in localStorage, default to system preference or light mode
        const savedMode = localStorage.getItem('darkMode');
        if (savedMode) {
            return savedMode === 'true';
        }
        return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('darkMode', 'true');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('darkMode', 'false');
        }
    }, [isDarkMode]);

    const toggleDarkMode = () => {
        setIsDarkMode(prevMode => !prevMode);
    };

    return (
        <div className="flex flex-col min-h-screen bg-light-neutral text-dark-gray dark:bg-dark-gray dark:text-light-neutral">
            <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
            <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/acts" element={<ActsPage />} />
                    <Route path="/act/:slug" element={<ActDetailPage />} />
                    <Route path="/section/:id" element={<SectionDetailPage />} />
                    <Route path="/case-analysis" element={<CaseAnalysisPage />} />
                    <Route path="/search" element={<SearchResultsPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                    <Route path="/legal-updates" element={<LegalUpdatesPage />} />
                    <Route path="/legal-documents" element={<LegalDocumentsPage />} />
                    <Route path="/pricing" element={<PricingPage />} />
                    
                    {/* Public routes for auth */}
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />

                    {/* Protected routes */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/premium" element={<PaymentPage />} /> 
                    </Route>
                </Routes>
            </main>
            <Footer />
        </div>
    );
};


const App: React.FC = () => {
  return (
    <AuthProvider>
        <Router>
            <ScrollToTop />
            <AppContent />
        </Router>
    </AuthProvider>
  );
};

export default App;