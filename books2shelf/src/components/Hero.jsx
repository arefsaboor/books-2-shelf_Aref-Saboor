import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import BookResults from './BookResults';

const Hero = ({ searchBarRef, onNavigateToDashboard }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Top Rated');
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasShelf, setHasShelf] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [booksPerPage] = useState(12);
  const suggestionsRef = useRef(null);
  const { currentUser } = useAuth();

  const categories = [
    { name: 'Top Rated', query: 'toprated' },
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

  const loadTopRated = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');

    try {
      const startIndex = (page - 1) * booksPerPage;
      
      // Fetch top rated books using different strategies
      // Google Books API doesn't have a direct "rating" filter, so we use highly-rated popular books
      const queries = [
        'fiction+5+stars',
        'bestseller+highly+rated',
        'award+winning+books',
        'critically+acclaimed',
        'Pulitzer+prize',
        'Man+Booker+prize',
        'National+Book+Award'
      ];
      
      const randomQuery = queries[Math.floor(Math.random() * queries.length)];
      
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(randomQuery)}&orderBy=relevance&startIndex=${startIndex}&maxResults=${booksPerPage}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      const data = await response.json();
      setBooks(data.items || []);
      setTotalResults(data.totalItems || 0);
      setCurrentPage(page);
      
      if (!data.items || data.items.length === 0) {
        setError('No books found. Try a different search term.');
      }
    } catch (err) {
      setError('Failed to fetch books. Please try again.');
      console.error('Error fetching books:', err);
    } finally {
      setLoading(false);
    }
  }, [booksPerPage]);

  // Load top rated books automatically when component mounts
  useEffect(() => {
    loadTopRated();
  }, [loadTopRated]);

  const searchBooks = async (query, categoryQuery = '', page = 1) => {
    if (!query && !categoryQuery) {
      setError('Please enter a search term or select a category');
      return;
    }

    setLoading(true);
    setError('');
    setShowSuggestions(false);

    try {
      const startIndex = (page - 1) * booksPerPage;
      let searchTerm = query;
      let apiUrl = '';
      
      if (categoryQuery) {
        if (categoryQuery === 'toprated') {
          // For top rated, combine user query with highly rated books if query exists
          if (query) {
            searchTerm = `${query}+highly+rated`;
          } else {
            // If no query, just load top rated books
            await loadTopRated(page);
            return;
          }
        } else {
          searchTerm = query ? `${query}+${categoryQuery}` : categoryQuery.replace('subject:', '');
        }
      }

      apiUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchTerm)}&startIndex=${startIndex}&maxResults=${booksPerPage}`;

      const response = await fetch(apiUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch books');
      }

      const data = await response.json();
      setBooks(data.items || []);
      setTotalResults(data.totalItems || 0);
      setCurrentPage(page);
      
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

  // Fetch autocomplete suggestions
  const fetchSuggestions = async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoadingSuggestions(true);
    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`
      );

      if (!response.ok) throw new Error('Failed to fetch suggestions');

      const data = await response.json();
      if (data.items && data.items.length > 0) {
        setSuggestions(data.items);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error('Error fetching suggestions:', err);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  // Debounce function
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        fetchSuggestions(searchQuery);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (book) => {
    const title = book.volumeInfo.title;
    setSearchQuery(title);
    setShowSuggestions(false);
    // Search without category filter to get exact book results
    searchBooks(title, '', 1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const categoryQuery = categories.find(cat => cat.name === selectedCategory)?.query || '';
    searchBooks(searchQuery, categoryQuery, 1);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category.name);
    setCurrentPage(1); // Reset to page 1 when changing category
    searchBooks(searchQuery, category.query, 1);
  };

  const handlePageChange = (newPage) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const categoryQuery = categories.find(cat => cat.name === selectedCategory)?.query || '';
    
    if (selectedCategory === 'Top Rated' && !searchQuery) {
      loadTopRated(newPage);
    } else {
      searchBooks(searchQuery, categoryQuery, newPage);
    }
  };

  const totalPages = Math.ceil(totalResults / booksPerPage);

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

                {/* Autocomplete Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                  <div 
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-2 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-96 overflow-y-auto"
                  >
                    {loadingSuggestions ? (
                      <div className="p-4 text-center text-gray-500">Loading suggestions...</div>
                    ) : (
                      suggestions.map((book) => {
                        const { volumeInfo } = book;
                        const thumbnail = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail || 'https://via.placeholder.com/80x120?text=No+Cover';
                        const title = volumeInfo.title || 'Unknown Title';
                        const authors = volumeInfo.authors?.join(', ') || 'Unknown Author';

                        return (
                          <div
                            key={book.id}
                            onClick={() => handleSuggestionClick(book)}
                            className="flex items-center gap-4 p-4 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-100 last:border-b-0"
                          >
                            {/* Book Thumbnail */}
                            <img
                              src={thumbnail}
                              alt={title}
                              className="w-12 h-16 object-cover rounded shadow-sm shrink-0"
                            />
                            
                            {/* Book Info */}
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-gray-900 truncate">{title}</h4>
                              <p className="text-sm text-gray-600 truncate mt-1">
                                <span className="font-medium">By:</span> {authors}
                              </p>
                            </div>

                            {/* Arrow Icon */}
                            <svg
                              className="w-5 h-5 text-gray-400 shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
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
          
          {/* Pagination */}
          {!loading && books.length > 0 && totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center gap-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex gap-2">
                {/* First Page */}
                {currentPage > 3 && (
                  <>
                    <button
                      onClick={() => handlePageChange(1)}
                      className="px-4 py-2 rounded-lg font-medium bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-all duration-200"
                    >
                      1
                    </button>
                    {currentPage > 4 && (
                      <span className="px-2 py-2 text-gray-400">...</span>
                    )}
                  </>
                )}

                {/* Current and nearby pages */}
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let actualPage;
                  if (currentPage <= 3) {
                    actualPage = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    actualPage = totalPages - 4 + i;
                  } else {
                    actualPage = currentPage - 2 + i;
                  }
                  
                  if (actualPage < 1 || actualPage > totalPages) return null;
                  
                  return (
                    <button
                      key={actualPage}
                      onClick={() => handlePageChange(actualPage)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                        currentPage === actualPage
                          ? 'bg-blue-600 text-white shadow-lg'
                          : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                      }`}
                    >
                      {actualPage}
                    </button>
                  );
                })}

                {/* Last Page */}
                {currentPage < totalPages - 2 && (
                  <>
                    {currentPage < totalPages - 3 && (
                      <span className="px-2 py-2 text-gray-400">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      className="px-4 py-2 rounded-lg font-medium bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600 transition-all duration-200"
                    >
                      {totalPages}
                    </button>
                  </>
                )}
              </div>

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  currentPage === totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:text-blue-600'
                }`}
              >
                Next
              </button>
            </div>
          )}

          {/* Results Info */}
          {!loading && books.length > 0 && (
            <div className="mt-4 text-center text-gray-600">
              Showing {((currentPage - 1) * booksPerPage) + 1} - {Math.min(currentPage * booksPerPage, totalResults)} of {totalResults} results
            </div>
          )}
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
