import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import BookResults from './BookResults';

const Hero = ({ searchBarRef, onNavigateToDashboard }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Bestsellers');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasShelf, setHasShelf] = useState(false);
  const { currentUser } = useAuth();

  const categories = [
    { name: 'Bestsellers', query: 'bestsellers' },
    { name: 'Fiction', query: 'subject:fiction' },
    { name: 'Non-Fiction', query: 'subject:nonfiction' },
    { name: 'Philosophy', query: 'subject:philosophy' },
    { name: 'Psychology', query: 'subject:psychology' },
    { name: 'Science', query: 'subject:science' }
  ];

  // Check if user has a shelf
  useEffect(() => {
    if (currentUser) {
      checkUserShelf();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const checkUserShelf = async () => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        setHasShelf(userData.hasShelf || false);
      }
    } catch (error) {
      console.error('Error checking user shelf:', error);
    }
  };

  // Load bestsellers automatically when component mounts
  useEffect(() => {
    loadBestsellers();
  }, []);

  const loadBestsellers = async () => {
    setLoading(true);
    setError('');

    try {
      // Fetch popular/bestselling books
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=bestseller&orderBy=relevance&maxResults=12`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      const data = await response.json();
      setBooks(data.items || []);
      
      if (!data.items || data.items.length === 0) {
        setError('No books found. Try a different search term.');
      }
    } catch (err) {
      setError('Failed to fetch books. Please try again.');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchBooks = async (query, categoryQuery = '') => {
    if (!query && !categoryQuery) {
      setError('Please enter a search term or select a category');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let searchTerm = query;
      if (categoryQuery) {
        if (categoryQuery === 'bestsellers') {
          // If Bestsellers category, use the loadBestsellers function
          await loadBestsellers();
          return;
        }
        searchTerm = query ? `${query}+${categoryQuery}` : categoryQuery.replace('subject:', '');
      }

      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}&maxResults=12`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      const data = await response.json();
      setBooks(data.items || []);
      
      if (!data.items || data.items.length === 0) {
        setError('No books found. Try a different search term.');
      }
    } catch (err) {
      setError('Failed to fetch books. Please try again.');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const categoryQuery = categories.find(cat => cat.name === selectedCategory)?.query || '';
    searchBooks(searchQuery, categoryQuery);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
    searchBooks(searchQuery, category.query);
  };

  return (
    <section className="relative bg-linear-to-br from-blue-50 via-white to-purple-50 py-20 md:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Container with vertical gap */}
          <div className="flex flex-col gap-8 md:gap-10">
            {/* Hero Message */}
            <div className="space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-900 leading-tight">
                Ever thought to organize the books you have and try to create a{' '}
                <span className="bg-linear-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Digital Shelf
                </span>{' '}
                for them?
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mt-6">
                Search, organize, and manage your book collection effortlessly in one beautiful digital space.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {currentUser && hasShelf ? (
                <button 
                  onClick={onNavigateToDashboard}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Go To Your Shelf
                </button>
              ) : (
                <button 
                  onClick={currentUser ? onNavigateToDashboard : null}
                  className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Create Your Shelf
                </button>
              )}
              <button className="w-full sm:w-auto px-8 py-4 text-gray-700 font-semibold text-lg border-2 border-gray-300 rounded-lg hover:border-blue-600 hover:text-blue-600 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5">
                Learn More
              </button>
            </div>

            {/* Search Bar Container */}
            <div className="mt-4">
              <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
                <div className="flex items-center bg-white rounded-full shadow-lg border-2 border-gray-200 hover:border-blue-400 transition-all duration-200">
                  {/* Search Icon */}
                  <div className="pl-6 pr-3">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                  
                  {/* Search Input */}
                  <input
                    type="text"
                    ref={searchBarRef}
                    placeholder="Search by title, author, or ISBN..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 py-4 px-2 bg-transparent outline-none text-gray-700 placeholder-gray-400"
                  />
                  
                  {/* Search Button */}
                  <button 
                    type="submit"
                    className="m-1 px-8 py-3 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Search
                  </button>
                </div>
              </form>

              {/* Category Buttons */}
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryClick(category)}
                    className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                      selectedCategory === category.name
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Book Results Section */}
        <div className="mt-12">
          <BookResults books={books} loading={loading} error={error} />
        </div>
      </div>

      {/* Background Decorative Circles */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </section>
  );
};

export default Hero;
