import React from 'react';
import { useAuth } from '../Firebase/AuthContext';

const Footer = ({ onNavigateHome, onNavigateDashboard, onNavigateToPrivacy, onNavigateToImpressum, onNavigateAbout, onNavigateContact }) => {
  const currentYear = new Date().getFullYear();
  const { currentUser } = useAuth();

  return (
    <footer className="bg-white border-t border-amber-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-8">
          {/* About Section */}
          <div className="max-w-md">
            <div className="flex items-center space-x-1 mb-4">
              <span className="text-2xl font-bold text-gray-800">BOOKS</span>
              <span className="text-2xl font-bold text-amber-600">2</span>
              <span className="text-2xl font-bold text-gray-800">SHELF</span>
            </div>
            <p className="text-gray-600 leading-relaxed">
              Your digital library companion. Organize, discover, and manage your book collection effortlessly. 
              Create your personalized shelf and never lose track of your reading journey.
            </p>
            <div className="flex space-x-4 mt-6">
              {/* Social Media Icons */}
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-amber-600 transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-amber-600 transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="https://www.github.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-amber-600 transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
                </svg>
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-amber-600 transition-colors duration-200">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-gray-800 font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={onNavigateHome}
                  className="px-4 py-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 rounded-lg inline-block"
                >
                  Home
                </button>
              </li>
              {currentUser && (
                <li>
                  <button
                    onClick={onNavigateDashboard}
                    className="px-4 py-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 rounded-lg inline-block"
                  >
                    My Shelf
                  </button>
                </li>
              )}
              <li>
                <button
                  onClick={onNavigateAbout}
                  className="px-4 py-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 rounded-lg inline-block"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  onClick={onNavigateContact}
                  className="px-4 py-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 rounded-lg inline-block"
                >
                  Contact
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-600 text-sm">
              © {currentYear} Books2Shelf. All rights reserved.
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToPrivacy}
                className="px-4 py-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 text-sm transition-all duration-200 rounded-lg"
              >
                Privacy Policy
              </button>
              <button
                onClick={onNavigateToImpressum}
                className="px-4 py-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 text-sm transition-all duration-200 rounded-lg"
              >
                Impressum
              </button>
              <button
                onClick={onNavigateContact}
                className="px-4 py-2 text-gray-600 hover:text-amber-600 hover:bg-amber-50 text-sm transition-all duration-200 rounded-lg"
              >
                Help
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
