
import React from 'react';
import { NavLink } from 'react-router-dom';
import { LinkedinIcon, TwitterIcon, YoutubeIcon } from '../icons/Icons';

const Footer: React.FC = () => {
  return (
    <footer className="bg-navy text-light-neutral">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-4 md:mb-0">
            <p className="text-sm">&copy; {new Date().getFullYear()} Indian Legal Acts, An Aviyana RPG Group Company</p>
            <p className="text-xs text-gray-400">Navi Mumbai, Maharashtra, India</p>
          </div>
          <div className="flex space-x-4 mb-4 md:mb-0">
            <NavLink to="/privacy-policy" className="text-sm hover:text-gold transition-colors">Privacy Policy</NavLink>
            <NavLink to="/terms" className="text-sm hover:text-gold transition-colors">Terms & Conditions</NavLink>
            <NavLink to="/disclaimer" className="text-sm hover:text-gold transition-colors">Disclaimer</NavLink>
            <NavLink to="/faq" className="text-sm hover:text-gold transition-colors">FAQ</NavLink>
          </div>
          <div className="flex space-x-6">
            <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-gold transition-colors"><LinkedinIcon className="w-5 h-5" /></a>
            <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-gold transition-colors"><TwitterIcon className="w-5 h-5" /></a>
            <a href="#" aria-label="YouTube" className="text-gray-400 hover:text-gold transition-colors"><YoutubeIcon className="w-5 h-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;