import React, { useState, useRef } from 'react'
import { AuthProvider } from './firebase/AuthContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Dashboard from './components/Dashboard'
import Profile from './components/Profile'

function App() {
  const [currentView, setCurrentView] = useState('home'); // 'home', 'dashboard', or 'profile'
  const searchBarRef = useRef(null);

  const navigateToHome = () => {
    setCurrentView('home');
    // Focus on search bar after navigation
    setTimeout(() => {
      if (searchBarRef.current) {
        searchBarRef.current.focus();
      }
    }, 100);
  };

  const navigateToDashboard = () => {
    setCurrentView('dashboard');
  };

  const navigateToProfile = () => {
    setCurrentView('profile');
  };

  return (
    <AuthProvider>
      <div className="min-h-screen bg-white">
        <Navbar 
          onNavigateHome={navigateToHome}
          onNavigateDashboard={navigateToDashboard}
          onNavigateProfile={navigateToProfile}
        />
        {currentView === 'home' && (
          <Hero 
            searchBarRef={searchBarRef} 
            onNavigateToDashboard={navigateToDashboard}
          />
        )}
        {currentView === 'dashboard' && (
          <Dashboard onBrowseBooks={navigateToHome} />
        )}
        {currentView === 'profile' && (
          <Profile onNavigateShelf={navigateToDashboard} />
        )}
      </div>
    </AuthProvider>
  )
}

export default App
