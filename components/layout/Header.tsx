
import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { SunIcon, MoonIcon, HamburgerIcon, XMarkIcon, SparklesIcon, ChevronDownIcon } from '../icons/Icons';
import { useAuth } from '../auth/AuthContext';
import { supabase } from '../../services/supabaseClient';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isPremium, setIsPremium] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const checkPremiumStatus = async () => {
        if (user) {
            const { data } = await supabase
                .from('profiles')
                .select('is_premium')
                .eq('id', user.id)
                .maybeSingle();
            setIsPremium(data?.is_premium || false);
        } else {
            setIsPremium(false);
        }
    };
    checkPremiumStatus();
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsMenuOpen(false);
    setIsMoreMenuOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `px-3 py-2 rounded-md text-base font-semibold transition-colors duration-200 ${
      isActive
        ? 'text-gold'
        : 'text-dark-gray dark:text-light-neutral hover:text-gold dark:hover:text-gold'
    }`;
    
  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `block px-3 py-2 rounded-md text-lg font-semibold ${
      isActive
        ? 'bg-gold text-navy dark:bg-gold dark:text-navy'
        : 'text-dark-gray dark:text-light-neutral hover:bg-gray-200 dark:hover:bg-gray-700'
    }`;

  const dropdownLinkClass = ({ isActive }: { isActive: boolean }): string =>
    `block px-4 py-2 text-sm font-semibold transition-colors ${
      isActive 
      ? 'text-gold' 
      : 'text-dark-gray dark:text-light-neutral hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  // Effect to prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  // Effect to close "More" dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
            setIsMoreMenuOpen(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [moreMenuRef]);


  const SecondaryNavLinks: React.FC<{ isDropdown?: boolean }> = ({ isDropdown = false }) => {
    const commonOnClick = () => {
      if(isDropdown) setIsMoreMenuOpen(false);
    }
    const className = isDropdown ? dropdownLinkClass : navLinkClass;
    
    return (
        <>
            <NavLink to="/legal-updates" className={className} onClick={commonOnClick}>Legal Updates</NavLink>
            <NavLink to="/legal-documents" className={className} onClick={commonOnClick}>Documents</NavLink>
            {user && <NavLink to="/dashboard" className={className} onClick={commonOnClick}>Dashboard</NavLink>}
            <NavLink to="/about" className={className} onClick={commonOnClick}>About</NavLink>
            <NavLink to="/contact" className={className} onClick={commonOnClick}>Contact</NavLink>
        </>
    );
  };

  return (
    <>
      <header className="bg-light-neutral dark:bg-navy shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 md:h-24">
            <div className="flex items-center">
              <NavLink to="/" onClick={() => isMenuOpen && setIsMenuOpen(false)} className="flex-shrink-0 flex items-center gap-2 text-navy dark:text-light-neutral">
                <img src="https://i.postimg.cc/C1wJWDR3/Professional-logo-for-Indian-Legal-Acts.png" alt="Indian Legal Acts Logo" className="h-16 md:h-20 w-auto" />
              </NavLink>
            </div>
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center">
              <div className="ml-10 flex items-baseline space-x-1 lg:space-x-4">
                <NavLink to="/" className={navLinkClass}>Home</NavLink>
                <NavLink to="/acts" className={navLinkClass}>Acts</NavLink>
                <NavLink to="/case-analysis" className={navLinkClass}>Case Analysis</NavLink>
                <NavLink to="/pricing" className={navLinkClass}>Pricing</NavLink>
                
                {/* Links visible on extra-large screens */}
                <div className="hidden xl:flex items-baseline space-x-1 lg:space-x-4">
                  <SecondaryNavLinks />
                </div>
              </div>

              {/* "More" Dropdown for medium/large screens */}
              <div className="relative hidden md:block xl:hidden" ref={moreMenuRef}>
                 <button 
                  onClick={() => setIsMoreMenuOpen(prev => !prev)} 
                  className="px-3 py-2 rounded-md text-base font-semibold transition-colors duration-200 flex items-center gap-1 text-dark-gray dark:text-light-neutral hover:text-gold dark:hover:text-gold"
                  aria-haspopup="true"
                  aria-expanded={isMoreMenuOpen}
                >
                    More
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isMoreMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                {isMoreMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md shadow-lg bg-light-neutral dark:bg-navy ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <SecondaryNavLinks isDropdown={true} />
                        </div>
                    </div>
                )}
              </div>
            </nav>
            <div className="flex items-center">
               <button
                onClick={toggleDarkMode}
                className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold"
                aria-label="Toggle dark mode"
              >
                {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
              </button>

              <div className="hidden md:flex items-center ml-2 space-x-2">
                {user ? (
                    <>
                        {isPremium ? (
                             <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/20 text-xs font-semibold text-gold">
                                <SparklesIcon className="w-4 h-4"/>
                                Premium Member
                            </span>
                        ) : (
                            <NavLink to="/pricing" className="bg-gold text-navy px-4 py-2 rounded-md font-semibold text-base hover:opacity-90 transition-opacity">Upgrade</NavLink>
                        )}
                        <button onClick={handleLogout} className="px-4 py-2 rounded-md text-base font-semibold text-dark-gray dark:text-light-neutral hover:text-gold dark:hover:text-gold transition-colors">Logout</button>
                    </>
                ) : (
                  <div className="flex items-center space-x-2">
                    <NavLink to="/login" className="px-4 py-2 rounded-md text-base font-semibold text-dark-gray dark:text-light-neutral hover:text-gold dark:hover:text-gold transition-colors">Login</NavLink>
                    <NavLink to="/signup" className="bg-gold text-navy px-4 py-2 rounded-md font-semibold text-base hover:opacity-90 transition-opacity">Sign Up</NavLink>
                  </div>
                )}
              </div>

              {/* Hamburger Menu Button */}
              <div className="md:hidden ml-2">
                  <button 
                      onClick={() => setIsMenuOpen(!isMenuOpen)}
                      className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold"
                      aria-controls="mobile-menu"
                      aria-expanded={isMenuOpen}
                  >
                      <span className="sr-only">Open main menu</span>
                      {isMenuOpen ? <XMarkIcon className="block h-6 w-6" /> : <HamburgerIcon className="block h-6 w-6" />}
                  </button>
              </div>
            </div>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!isMenuOpen}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`fixed top-0 right-0 h-full w-64 bg-light-neutral dark:bg-navy shadow-lg p-5 transform transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex justify-between items-center mb-6">
              <span className="font-heading font-bold text-lg text-navy dark:text-white">Menu</span>
              <button onClick={() => setIsMenuOpen(false)} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                  <XMarkIcon className="h-6 w-6"/>
              </button>
          </div>
          <nav className="space-y-2">
            <NavLink to="/" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Home</NavLink>
            <NavLink to="/acts" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Acts</NavLink>
            <NavLink to="/case-analysis" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Case Analysis</NavLink>
            <NavLink to="/pricing" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Pricing</NavLink>
            <NavLink to="/legal-updates" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Legal Updates</NavLink>
            <NavLink to="/legal-documents" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Documents</NavLink>
            {user && <NavLink to="/dashboard" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>}
            <NavLink to="/about" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>About</NavLink>
            <NavLink to="/contact" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Contact</NavLink>

            <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
              {user ? (
                <div className="space-y-2">
                  {!isPremium && <NavLink to="/pricing" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Upgrade to Premium</NavLink>}
                  <button onClick={handleLogout} className="w-full text-left px-3 py-2 rounded-md text-lg font-semibold text-dark-gray dark:text-light-neutral hover:bg-gray-200 dark:hover:bg-gray-700">Logout</button>
                </div>
              ) : (
                <>
                  <NavLink to="/login" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Login</NavLink>
                  <NavLink to="/signup" className={mobileNavLinkClass} onClick={() => setIsMenuOpen(false)}>Sign Up</NavLink>
                </>
              )}
            </div>
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;