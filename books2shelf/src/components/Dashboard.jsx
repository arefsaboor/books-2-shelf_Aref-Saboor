import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const Dashboard = ({ onBrowseBooks }) => {
  const { currentUser } = useAuth();
  const [hasShelf, setHasShelf] = useState(false);
  const [bookshelf, setBookshelf] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    wantToRead: 0,
    currentlyReading: 0,
    completed: 0
  });

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
        const books = userData.bookshelf || [];
        setBookshelf(books);
        
        // Calculate statistics
        calculateStats(books);
      }
    } catch (error) {
      console.error('Error checking user shelf:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (books) => {
    const total = books.length;
    const wantToRead = books.filter(book => book.status === 'wantToRead').length;
    const currentlyReading = books.filter(book => book.status === 'currentlyReading').length;
    const completed = books.filter(book => book.status === 'completed').length;
    
    setStats({
      total,
      wantToRead,
      currentlyReading,
      completed
    });
  };

  const updateBookStatus = async (bookId, newStatus) => {
    try {
      const updatedBookshelf = bookshelf.map(book => 
        book.id === bookId ? { ...book, status: newStatus } : book
      );
      
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        bookshelf: updatedBookshelf
      });
      
      setBookshelf(updatedBookshelf);
      calculateStats(updatedBookshelf);
    } catch (error) {
      console.error('Error updating book status:', error);
      alert('Failed to update book status. Please try again.');
    }
  };

  const removeBook = async (bookId) => {
    try {
      const updatedBookshelf = bookshelf.filter(book => book.id !== bookId);
      
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        bookshelf: updatedBookshelf
      });
      
      setBookshelf(updatedBookshelf);
      calculateStats(updatedBookshelf);
    } catch (error) {
      console.error('Error removing book:', error);
      alert('Failed to remove book. Please try again.');
    }
  };

  const createShelf = async () => {
    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await setDoc(userRef, { hasShelf: true, bookshelf: [] }, { merge: true });
      setHasShelf(true);
      setBookshelf([]);
    } catch (error) {
      console.error('Error creating shelf:', error);
      alert('Failed to create shelf. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!hasShelf) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
            {/* Icon */}
            <div className="mb-6 flex justify-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-12 h-12 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>

            {/* Message */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome to Your Dashboard!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              You haven't created any shelf yet.
            </p>

            {/* CTA Button */}
            <button
              onClick={createShelf}
              className="px-10 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Create Your Shelf
            </button>

            {/* Additional Info */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-blue-600 mb-2">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Search Books</h3>
                <p className="text-sm text-gray-600">
                  Find books by title, author, or ISBN from Google Books API
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-blue-600 mb-2">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Add to Shelf</h3>
                <p className="text-sm text-gray-600">
                  Save your favorite books to your personal digital shelf
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="text-blue-600 mb-2">
                  <svg
                    className="w-8 h-8"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">Organize</h3>
                <p className="text-sm text-gray-600">
                  Keep all your books organized in one beautiful place
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Shelf exists but empty
  if (bookshelf.length === 0) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Bookshelf</h1>
            <p className="text-gray-600">Your personal digital library</p>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-2xl shadow-xl p-12 text-center">
            <div className="mb-6 flex justify-center">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-16 h-16 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              You have no books in your shelf!
            </h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Start building your digital library by browsing and adding books to your shelf.
            </p>

            <button
              onClick={onBrowseBooks}
              className="px-10 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Browse Books
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Shelf with books
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Shelf Navbar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            {/* Left Side - Title */}
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">Your Shelf</h1>
              <p className="text-gray-600">User's Personal Library</p>
            </div>
            
            {/* Right Side - Browse Button */}
            <button
              onClick={onBrowseBooks}
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Browse Books</span>
            </button>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Total Books */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Books</p>
                <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          {/* Want to Read */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Want to Read</p>
                <p className="text-3xl font-bold text-gray-900">{stats.wantToRead}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Currently Reading */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Currently Reading</p>
                <p className="text-3xl font-bold text-gray-900">{stats.currentlyReading}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-600">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Completed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completed}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Books Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bookshelf.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              {/* Book Cover */}
              <div className="relative h-64 bg-gray-100">
                {book.thumbnail ? (
                  <img
                    src={book.thumbnail}
                    alt={book.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-20 h-20"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 2H6c-1.206 0-3 .799-3 3v14c0 2.201 1.794 3 3 3h15v-2H6.012C5.55 19.988 5 19.805 5 19s.55-.988 1.012-1H21V4c0-1.103-.897-2-2-2zm0 14H5V5c0-.806.55-.988 1-1h13v12z" />
                    </svg>
                  </div>
                )}
                
                {/* Status Badge */}
                {book.status && (
                  <div className="absolute top-2 right-2">
                    {book.status === 'wantToRead' && (
                      <span className="px-2 py-1 bg-purple-600 text-white text-xs font-semibold rounded-full">
                        Want to Read
                      </span>
                    )}
                    {book.status === 'currentlyReading' && (
                      <span className="px-2 py-1 bg-green-600 text-white text-xs font-semibold rounded-full">
                        Reading
                      </span>
                    )}
                    {book.status === 'completed' && (
                      <span className="px-2 py-1 bg-yellow-600 text-white text-xs font-semibold rounded-full">
                        Completed
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div className="p-4 grow flex flex-col">
                <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                  {book.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                  {book.authors?.join(', ') || 'Unknown Author'}
                </p>
                {book.publishedDate && (
                  <p className="text-gray-500 text-xs mb-4">
                    {book.publishedDate.split('-')[0]}
                  </p>
                )}

                {/* Status Buttons */}
                <div className="mt-auto space-y-2">
                  <select
                    value={book.status || ''}
                    onChange={(e) => updateBookStatus(book.id, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Set Status</option>
                    <option value="wantToRead">Want to Read</option>
                    <option value="currentlyReading">Currently Reading</option>
                    <option value="completed">Completed</option>
                  </select>

                  {/* Remove Button */}
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to remove this book from your shelf?')) {
                        removeBook(book.id);
                      }
                    }}
                    className="w-full px-3 py-2 bg-red-50 text-red-600 text-sm font-medium rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
