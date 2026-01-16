import React, { useRef } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate, useParams } from 'react-router-dom'
import { AuthProvider } from './Firebase/AuthContext'
import Navbar from './components/Navbar'
import Hero from './Sections/Hero'
import Dashboard from './Pages/Dashboard'
import Profile from './Pages/Profile'
import About from './Pages/About'
import Contact from './Pages/Contact'
import BookDetails from './Pages/BookDetails'
import Footer from './components/Footer'
import PrivacyPolicy from './Pages/PrivacyPolicy'
import Impressum from './Pages/Impressum'

// Wrapper component to handle BookDetails with URL params
function BookDetailsWrapper() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  
  return <BookDetails bookId={bookId} onBack={() => navigate('/dashboard')} />;
}

// Main App Content component
function AppContent() {
  const searchBarRef = useRef(null);
  const navigate = useNavigate();

  const navigateToHome = () => {
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Focus on search bar after navigation
    setTimeout(() => {
      if (searchBarRef.current) {
        searchBarRef.current.focus();
      }
    }, 100);
  };

  const navigateToDashboard = () => {
    navigate('/dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToProfile = () => {
    navigate('/profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToAbout = (section = null) => {
    navigate('/about');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // If a section is specified, scroll to it after the view changes
    if (section) {
      setTimeout(() => {
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    }
  };

  const navigateToContact = () => {
    navigate('/contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToPrivacy = () => {
    navigate('/privacy');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToImpressum = () => {
    navigate('/impressum');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navigateToBookDetails = (bookId) => {
    navigate(`/book/${bookId}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar 
        onNavigateHome={navigateToHome}
        onNavigateDashboard={navigateToDashboard}
        onNavigateProfile={navigateToProfile}
        onNavigateAbout={navigateToAbout}
        onNavigateContact={navigateToContact}
      />
      <main className="grow">
        <Routes>
          <Route 
            path="/" 
            element={
              <Hero 
                searchBarRef={searchBarRef} 
                onNavigateToDashboard={navigateToDashboard}
                onNavigateToAbout={navigateToAbout}
              />
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <Dashboard 
                onBrowseBooks={navigateToHome} 
                onViewBookDetails={navigateToBookDetails} 
              />
            } 
          />
          <Route 
            path="/profile" 
            element={
              <Profile onNavigateShelf={navigateToDashboard} />
            } 
          />
          <Route 
            path="/book/:bookId" 
            element={<BookDetailsWrapper />} 
          />
          <Route 
            path="/about" 
            element={
              <About onNavigateHome={navigateToHome} />
            } 
          />
          <Route 
            path="/contact" 
            element={
              <Contact onNavigateHome={navigateToHome} />
            } 
          />
          <Route 
            path="/privacy" 
            element={
              <PrivacyPolicy onNavigateHome={navigateToHome} />
            } 
          />
          <Route 
            path="/impressum" 
            element={
              <Impressum onNavigateHome={navigateToHome} />
            } 
          />
        </Routes>
      </main>
      <Footer 
        onNavigateHome={navigateToHome}
        onNavigateDashboard={navigateToDashboard}
        onNavigateToPrivacy={navigateToPrivacy}
        onNavigateToImpressum={navigateToImpressum}
        onNavigateAbout={navigateToAbout}
        onNavigateContact={navigateToContact}
      />
    </div>
  )
}

// Main App component with Router
function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
