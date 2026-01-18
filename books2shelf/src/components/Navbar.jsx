import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { useAuth } from '../Firebase/AuthContext';
import AuthModal from './AuthModal';
import ProfileDropdown from './ProfileDropdown';

const Navbar = forwardRef(({ onNavigateHome, onNavigateDashboard, onNavigateProfile, onNavigateAbout, onNavigateContact }, ref) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('signin');
  const [loggingOut, setLoggingOut] = useState(false);
  const { currentUser, logout } = useAuth();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleSignIn = () => {
    setAuthMode('signin');
    setAuthModalOpen(true);
  };

  const handleSignUp = () => {
    setAuthMode('signup');
    setAuthModalOpen(true);
  };

  // Expose handleSignUp via ref (no useEffect, no state updates!)
  useImperativeHandle(ref, () => ({
    openSignup: handleSignUp,
    openSignin: handleSignIn
  }));

  const handleLogout = async () => {
    setLoggingOut(true);
    
    // Add slight delay to make it feel more realistic
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      await logout();
      
      // Show goodbye message briefly
      setTimeout(() => {
        setLoggingOut(false);
        onNavigateHome(); // Navigate to home after logout
      }, 1500);
    } catch (error) {
      console.error('Failed to log out:', error);
      setLoggingOut(false);
    }
  };

  return (
    <>
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="shrink-0 flex items-center">
              <a href="/" className="flex items-center space-x-1">
                <span className="text-2xl font-bold text-gray-800">BOOKS</span>
                <span className="text-2xl font-bold text-amber-600">2</span>
                <span className="text-2xl font-bold text-gray-800">SHELF</span>
              </a>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-2">
              <button
                onClick={onNavigateHome}
                className="px-4 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 font-medium rounded-lg"
              >
                Home
              </button>
              <button
                onClick={onNavigateAbout}
                className="px-4 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 font-medium rounded-lg"
              >
                About
              </button>
              <button
                onClick={onNavigateContact}
                className="px-4 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 font-medium rounded-lg"
              >
                Contact
              </button>
            </div>

            {/* Desktop Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              {currentUser ? (
                <>
                  <button
                    onClick={onNavigateDashboard}
                    className="px-4 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 font-medium rounded-lg"
                  >
                    My Shelf
                  </button>
                  <ProfileDropdown 
                    onNavigateProfile={onNavigateProfile}
                    onNavigateShelf={onNavigateDashboard}
                    onLogout={handleLogout}
                  />
                </>
              ) : (
                <>
                  <button 
                    onClick={handleSignIn}
                    className="px-6 py-2 text-gray-700 font-medium border-2 border-gray-300 rounded-lg hover:border-amber-500 hover:text-amber-600 transition-all duration-200"
                  >
                    Sign In
                  </button>
                  <button 
                    onClick={handleSignUp}
                    className="px-6 py-2 bg-amber-400 text-gray-900 font-medium rounded-lg hover:bg-amber-500 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={toggleMenu}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-amber-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-amber-500 transition-all duration-200"
                aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Hamburger Icon */}
              {!isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-gray-50">
          <button
            onClick={onNavigateHome}
            className="block w-full text-left px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200"
          >
            Home
          </button>
          {currentUser && (
            <button
              onClick={onNavigateDashboard}
              className="block w-full text-left px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200"
            >
              My Shelf
            </button>
          )}
          <button
            onClick={onNavigateAbout}
            className="block w-full text-left px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200"
          >
            About
          </button>
          <button
            onClick={onNavigateContact}
            className="block w-full text-left px-4 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200"
          >
            Contact
          </button>
          <div className="pt-4 pb-2 space-y-2">
            {currentUser ? (
              <>
                <div className="px-3 py-2 text-gray-700 font-medium">
                  Welcome, {currentUser.displayName || currentUser.email}
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full px-6 py-2 text-gray-700 font-medium border-2 border-gray-300 rounded-lg hover:border-red-600 hover:text-red-600 transition-all duration-200"
                >
                  Log Out
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={handleSignIn}
                  className="w-full px-6 py-2 text-gray-700 font-medium border-2 border-gray-300 rounded-lg hover:border-amber-500 hover:text-amber-600 transition-all duration-200"
                >
                  Sign In
                </button>
                <button 
                  onClick={handleSignUp}
                  className="w-full px-6 py-2 bg-amber-400 text-gray-900 font-medium rounded-lg hover:bg-amber-500 transition-all duration-200 shadow-md"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
    
    {/* Auth Modal */}
    <AuthModal 
      isOpen={authModalOpen} 
      onClose={() => setAuthModalOpen(false)} 
      mode={authMode} 
    />

    {/* Logout Message */}
    {loggingOut && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-8 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-amber-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Goodbye!</h3>
          <p className="text-gray-600">See you soon.</p>
        </div>
      </div>
    )}
    </>
  );
});

Navbar.displayName = 'Navbar';

export default Navbar;
