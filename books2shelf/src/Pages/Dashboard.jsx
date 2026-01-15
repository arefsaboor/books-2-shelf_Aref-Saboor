import React, { useState, useEffect } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../Firebase/config';
import { 
  getUserBookshelf, 
  updateBookStatus as updateBookStatusService,
  removeBookFromShelf
} from '../Firebase/bookshelfServiceNew';

const Dashboard = ({ onBrowseBooks, onViewBookDetails }) => {
  const { currentUser } = useAuth();
  const [hasShelf, setHasShelf] = useState(false);
  const [bookshelf, setBookshelf] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid', 'list', or 'table'
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);
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
        
        // Try to get books from new structure (subcollection)
        const books = await getUserBookshelf(currentUser.uid);
        
        // Books are already sorted by the service (newest first)
        setBookshelf(books);
        
        // Get stats from user document (already calculated by the service)
        if (userData.stats) {
          setStats({
            total: userData.stats.totalBooks || 0,
            wantToRead: userData.stats.wantToRead || 0,
            currentlyReading: userData.stats.currentlyReading || 0,
            completed: userData.stats.completed || 0
          });
        } else {
          // Fallback: calculate stats from books
          calculateStats(books);
        }
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
      // Find the current book to get its old status
      const currentBook = bookshelf.find(book => book.id === bookId);
      const oldStatus = currentBook?.status || 'wantToRead';
      
      // Use the new service to update book status
      await updateBookStatusService(currentUser.uid, bookId, newStatus, oldStatus);
      
      // Refresh the bookshelf to show updated data
      const updatedBooks = await getUserBookshelf(currentUser.uid);
      setBookshelf(updatedBooks);
      calculateStats(updatedBooks);
    } catch (error) {
      console.error('Error updating book status:', error);
      alert('Failed to update book status. Please try again.');
    }
  };

  const removeBook = async (bookId) => {
    try {
      // Use the new service to remove book
      await removeBookFromShelf(currentUser.uid, bookId);
      
      // Refresh the bookshelf
      const updatedBooks = await getUserBookshelf(currentUser.uid);
      setBookshelf(updatedBooks);
      calculateStats(updatedBooks);
    } catch (error) {
      console.error('Error removing book:', error);
      alert('Failed to remove book. Please try again.');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBook(null);
  };

  const generatePDF = () => {
    // Create HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>My Bookshelf</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              color: #333;
            }
            h1 {
              color: #2563eb;
              border-bottom: 3px solid #2563eb;
              padding-bottom: 10px;
              margin-bottom: 30px;
            }
            .user-info {
              margin-bottom: 30px;
              font-size: 14px;
              color: #666;
            }
            .stats {
              display: flex;
              gap: 20px;
              margin-bottom: 30px;
              padding: 15px;
              background: #f3f4f6;
              border-radius: 8px;
            }
            .stat-item {
              font-size: 14px;
            }
            .stat-label {
              font-weight: bold;
              color: #374151;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }
            thead {
              background: #2563eb;
              color: white;
            }
            th {
              padding: 12px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #e5e7eb;
              font-size: 13px;
            }
            tbody tr:hover {
              background: #f9fafb;
            }
            tbody tr:nth-child(even) {
              background: #f3f4f6;
            }
            .status-badge {
              padding: 4px 8px;
              border-radius: 12px;
              font-size: 11px;
              font-weight: 600;
            }
            .status-wantToRead {
              background: #ddd6fe;
              color: #6b21a8;
            }
            .status-currentlyReading {
              background: #bbf7d0;
              color: #15803d;
            }
            .status-completed {
              background: #fef3c7;
              color: #a16207;
            }
            .footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              text-align: center;
              font-size: 12px;
              color: #9ca3af;
            }
          </style>
        </head>
        <body>
          <h1>📚 My Bookshelf</h1>
          <div class="user-info">
            <strong>User:</strong> ${currentUser?.displayName || currentUser?.email || 'Book Lover'}<br>
            <strong>Generated:</strong> ${new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </div>
          
          <div class="stats">
            <div class="stat-item">
              <span class="stat-label">Total Books:</span> ${stats.total}
            </div>
            <div class="stat-item">
              <span class="stat-label">Want to Read:</span> ${stats.wantToRead}
            </div>
            <div class="stat-item">
              <span class="stat-label">Currently Reading:</span> ${stats.currentlyReading}
            </div>
            <div class="stat-item">
              <span class="stat-label">Completed:</span> ${stats.completed}
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th style="width: 5%">#</th>
                <th style="width: 40%">Book Name</th>
                <th style="width: 30%">Author(s)</th>
                <th style="width: 12%">Published</th>
                <th style="width: 13%">Status</th>
              </tr>
            </thead>
            <tbody>
              ${bookshelf.map((book, index) => `
                <tr>
                  <td>${index + 1}</td>
                  <td><strong>${book.title}</strong></td>
                  <td>${book.authors?.join(', ') || 'Unknown Author'}</td>
                  <td>${book.publishedDate ? book.publishedDate.split('-')[0] : 'N/A'}</td>
                  <td>
                    ${book.status ? `
                      <span class="status-badge status-${book.status}">
                        ${book.status === 'wantToRead' ? 'Want to Read' : 
                          book.status === 'currentlyReading' ? 'Reading' : 'Completed'}
                      </span>
                    ` : '-'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>

          <div class="footer">
            Generated from Books2Shelf - Your Digital Library
          </div>
        </body>
      </html>
    `;

    // Create a Blob from the HTML content
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `my-bookshelf-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Show success message
    alert('Bookshelf exported successfully! Open the HTML file and use your browser\'s "Print to PDF" option to save as PDF.');
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
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (!hasShelf) {
    return (
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-16 text-center border border-white/20">
            {/* Icon */}
            <div className="mb-8 flex justify-center">
              <div className="w-28 h-28 bg-linear-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300">
                <svg
                  className="w-14 h-14 text-white"
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
            <h1 className="text-4xl md:text-5xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
              Welcome to Your Dashboard!
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              You haven't created your bookshelf yet. Start your reading journey today!
            </p>

            {/* CTA Button */}
            <button
              onClick={createShelf}
              className="px-12 py-4 bg-linear-to-r from-amber-400 to-orange-500 text-white font-bold text-lg rounded-2xl hover:from-amber-500 hover:to-orange-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
            >
              Create Your Shelf ✨
            </button>

            {/* Additional Info */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-linear-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 hover:shadow-lg transition-shadow duration-300">
                <div className="text-blue-600 mb-3 flex justify-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-7 h-7"
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
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Search Books</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Find books by title, author, or ISBN from millions of books
                </p>
              </div>

              <div className="p-6 bg-linear-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-100 hover:shadow-lg transition-shadow duration-300">
                <div className="text-green-600 mb-3 flex justify-center">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-7 h-7"
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
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Add to Shelf</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Save your favorite books to your personal digital library
                </p>
              </div>

              <div className="p-6 bg-linear-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-100 hover:shadow-lg transition-shadow duration-300">
                <div className="text-purple-600 mb-3 flex justify-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <svg
                      className="w-7 h-7"
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
                </div>
                <h3 className="font-bold text-gray-900 mb-2 text-lg">Organize</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
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
      <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-10 text-center">
            <h1 className="text-5xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-3">My Bookshelf</h1>
            <p className="text-xl text-gray-600">Your personal digital library</p>
          </div>

          {/* Empty State */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-16 text-center border border-white/20">
            <div className="mb-8 flex justify-center">
              <div className="w-36 h-36 bg-linear-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-20 h-20 text-gray-400"
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

            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your shelf is empty!
            </h2>
            <p className="text-lg text-gray-600 mb-10 max-w-md mx-auto">
              Start building your digital library by browsing and adding books to your shelf.
            </p>

            <button
              onClick={onBrowseBooks}
              className="px-12 py-4 bg-linear-to-r from-amber-400 to-orange-500 text-white font-bold text-lg rounded-2xl hover:from-amber-500 hover:to-orange-600 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 hover:scale-105"
            >
              Browse Books 📚
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Shelf with books
  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Shelf Navbar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            {/* Left Side - Title */}
            <div>
              <h1 className="text-4xl font-bold bg-linear-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-2">Your Shelf</h1>
              <p className="text-gray-600 text-lg">Your Personal Digital Library</p>
            </div>
            
            {/* Right Side - Browse Button & Export */}
            <div className="flex items-center gap-3">
              <button
                onClick={generatePDF}
                className="px-5 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:border-gray-400 hover:bg-gray-50 transition-all duration-200 shadow-md hover:shadow-lg flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Export Shelf As PDF</span>
              </button>
              <button
                onClick={onBrowseBooks}
                className="px-6 py-3 bg-linear-to-r from-amber-400 to-orange-500 text-white font-bold rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center space-x-2 transform hover:-translate-y-0.5"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Browse Books</span>
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Total Books */}
          <div className="bg-linear-to-br from-amber-400 via-orange-400 to-orange-500 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border border-amber-300/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-sm font-semibold mb-2 uppercase tracking-wide">Total Books</p>
                <p className="text-5xl font-bold text-white drop-shadow-lg">{stats.total}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                <svg className="w-8 h-8 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          {/* Want to Read */}
          <div className="bg-linear-to-br from-purple-500 via-purple-600 to-indigo-600 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border border-purple-400/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-sm font-semibold mb-2 uppercase tracking-wide">Want to Read</p>
                <p className="text-5xl font-bold text-white drop-shadow-lg">{stats.wantToRead}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                <svg className="w-8 h-8 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Currently Reading */}
          <div className="bg-linear-to-br from-green-500 via-emerald-500 to-teal-600 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border border-green-400/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-sm font-semibold mb-2 uppercase tracking-wide">Currently Reading</p>
                <p className="text-5xl font-bold text-white drop-shadow-lg">{stats.currentlyReading}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                <svg className="w-8 h-8 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          {/* Completed */}
          <div className="bg-linear-to-br from-yellow-400 via-amber-500 to-orange-500 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 border border-yellow-300/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/90 text-sm font-semibold mb-2 uppercase tracking-wide">Completed</p>
                <p className="text-5xl font-bold text-white drop-shadow-lg">{stats.completed}</p>
              </div>
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg border border-white/30">
                <svg className="w-8 h-8 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle Container */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-5 mb-8 border border-white/20">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Options
            </h2>
            <div className="flex items-center space-x-2 bg-gray-100 rounded-xl p-1.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  viewMode === 'grid'
                    ? 'bg-white text-amber-600 shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Grid</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  viewMode === 'list'
                    ? 'bg-white text-amber-600 shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>List</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-5 py-2.5 rounded-lg font-semibold transition-all duration-200 flex items-center space-x-2 ${
                  viewMode === 'table'
                    ? 'bg-white text-amber-600 shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Table</span>
              </button>
            </div>
          </div>
        </div>

        {/* Books Grid View */}
        {viewMode === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {bookshelf.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full group"
            >
              {/* Book Cover - Fixed Height with Full Image */}
              <div className="relative h-80 bg-linear-to-br from-gray-100 to-gray-200 overflow-hidden">
                {book.thumbnail ? (
                  <img
                    src={book.thumbnail.replace('http://', 'https://')}
                    alt={book.title}
                    className="w-full h-full object-contain p-4"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-24 h-24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 2H6c-1.206 0-3 .799-3 3v14c0 2.201 1.794 3 3 3h15v-2H6.012C5.55 19.988 5 19.805 5 19s.55-.988 1.012-1H21V4c0-1.103-.897-2-2-2zm0 14H5V5c0-.806.55-.988 1-1h13v12z" />
                    </svg>
                  </div>
                )}
                
                {/* Status Badge */}
                {book.status && (
                  <div className="absolute top-3 right-3">
                    {book.status === 'wantToRead' && (
                      <span className="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-full shadow-lg">
                        Want to Read
                      </span>
                    )}
                    {book.status === 'currentlyReading' && (
                      <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full shadow-lg">
                        Reading
                      </span>
                    )}
                    {book.status === 'completed' && (
                      <span className="px-3 py-1 bg-yellow-600 text-white text-xs font-bold rounded-full shadow-lg">
                        Completed
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Book Info */}
              <div className="p-5 grow flex flex-col">
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
                  {book.title}
                </h3>
                <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                  <span className="font-medium">By:</span> {book.authors?.join(', ') || 'Unknown Author'}
                </p>
                {book.publishedDate && (
                  <p className="text-gray-500 text-xs mb-4">
                    📅 {book.publishedDate.split('-')[0]}
                  </p>
                )}

                {/* Spacer to push buttons to bottom */}
                <div className="grow"></div>

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  {/* View Book Details Button */}
                  <button
                    onClick={() => onViewBookDetails(book.id)}
                    className="w-full px-4 py-2.5 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-500 transition-colors flex items-center justify-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View Details</span>
                  </button>

                  {/* Status Dropdown */}
                  <select
                    value={book.status || ''}
                    onChange={(e) => updateBookStatus(book.id, e.target.value)}
                    className="w-full px-3 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                  >
                    <option value="">Set Status</option>
                    <option value="wantToRead">📚 Want to Read</option>
                    <option value="currentlyReading">📖 Currently Reading</option>
                    <option value="completed">✅ Completed</option>
                  </select>

                  {/* Remove Button */}
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to remove this book from your shelf?')) {
                        removeBook(book.id);
                      }
                    }}
                    className="w-full px-3 py-2.5 bg-red-50 text-red-600 text-sm font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center space-x-2"
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
        )}

        {/* Books List View */}
        {viewMode === 'list' && (
          <div className="space-y-4">
            {bookshelf.map((book) => (
              <div
                key={book.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col sm:flex-row"
              >
                {/* Book Cover */}
                <div className="w-full sm:w-48 h-64 sm:h-auto bg-linear-to-br from-gray-100 to-gray-200 shrink-0">
                  {book.thumbnail ? (
                    <img
                      src={book.thumbnail.replace('http://', 'https://')}
                      alt={book.title}
                      className="w-full h-full object-contain p-4"
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
                </div>

                {/* Book Info */}
                <div className="flex-1 p-6 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 text-xl mb-2">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 mb-2">
                        <span className="font-medium">By:</span> {book.authors?.join(', ') || 'Unknown Author'}
                      </p>
                      {book.publishedDate && (
                        <p className="text-gray-500 text-sm">
                          📅 Published: {book.publishedDate.split('-')[0]}
                        </p>
                      )}
                    </div>
                    
                    {/* Status Badge */}
                    {book.status && (
                      <div>
                        {book.status === 'wantToRead' && (
                          <span className="px-3 py-1.5 bg-purple-600 text-white text-sm font-bold rounded-full">
                            Want to Read
                          </span>
                        )}
                        {book.status === 'currentlyReading' && (
                          <span className="px-3 py-1.5 bg-green-600 text-white text-sm font-bold rounded-full">
                            Reading
                          </span>
                        )}
                        {book.status === 'completed' && (
                          <span className="px-3 py-1.5 bg-yellow-600 text-white text-sm font-bold rounded-full">
                            Completed
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 mt-auto">
                    <button
                      onClick={() => onViewBookDetails(book.id)}
                      className="px-6 py-2.5 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-500 transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      <span>View Details</span>
                    </button>

                    <select
                      value={book.status || ''}
                      onChange={(e) => updateBookStatus(book.id, e.target.value)}
                      className="px-4 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all"
                    >
                      <option value="">Set Status</option>
                      <option value="wantToRead">📚 Want to Read</option>
                      <option value="currentlyReading">📖 Currently Reading</option>
                      <option value="completed">✅ Completed</option>
                    </select>

                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to remove this book from your shelf?')) {
                          removeBook(book.id);
                        }
                      }}
                      className="px-6 py-2.5 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center space-x-2"
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
        )}

        {/* Table View */}
        {viewMode === 'table' && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Table Header with Download Button */}
            <div className="bg-amber-400 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white flex items-center space-x-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span>My Bookshelf ({bookshelf.length} {bookshelf.length === 1 ? 'Book' : 'Books'})</span>
              </h3>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-2 border-gray-300">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-12">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Book Name
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                      Author(s)
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-32">
                      Published
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-40">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider w-32">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookshelf.map((book, index) => (
                    <tr key={book.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="shrink-0 w-12 h-16 bg-gray-200 rounded overflow-hidden">
                            {book.thumbnail ? (
                              <img
                                src={book.thumbnail.replace('http://', 'https://')}
                                alt={book.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-400">
                                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M19 2H6c-1.206 0-3 .799-3 3v14c0 2.201 1.794 3 3 3h15v-2H6.012C5.55 19.988 5 19.805 5 19s.55-.988 1.012-1H21V4c0-1.103-.897-2-2-2zm0 14H5V5c0-.806.55-.988 1-1h13v12z" />
                                </svg>
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{book.title}</p>
                            {book.categories && book.categories.length > 0 && (
                              <p className="text-xs text-gray-500 mt-0.5">{book.categories[0]}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700">
                        {book.authors?.join(', ') || 'Unknown Author'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {book.publishedDate ? book.publishedDate.split('-')[0] : 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <select
                          value={book.status || 'wantToRead'}
                          onChange={(e) => updateBookStatus(book.id, e.target.value)}
                          className="text-sm px-3 py-1.5 rounded-full font-medium border-2 cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-amber-500"
                          style={{
                            backgroundColor:
                              book.status === 'wantToRead'
                                ? '#f3e8ff'
                                : book.status === 'currentlyReading'
                                ? '#dcfce7'
                                : '#fef3c7',
                            borderColor:
                              book.status === 'wantToRead'
                                ? '#a855f7'
                                : book.status === 'currentlyReading'
                                ? '#22c55e'
                                : '#eab308',
                            color:
                              book.status === 'wantToRead'
                                ? '#6b21a8'
                                : book.status === 'currentlyReading'
                                ? '#15803d'
                                : '#a16207',
                          }}
                        >
                          <option value="wantToRead">📚 Want to Read</option>
                          <option value="currentlyReading">📖 Reading</option>
                          <option value="completed">✅ Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => onViewBookDetails(book.id)}
                            className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to remove this book from your shelf?')) {
                                removeBook(book.id);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove Book"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center">
                Showing all {bookshelf.length} {bookshelf.length === 1 ? 'book' : 'books'} in your shelf
              </p>
            </div>
          </div>
        )}

        {/* Book Detail Modal */}
        {showModal && selectedBook && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={closeModal}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col md:flex-row">
                {/* Book Cover */}
                <div className="w-full md:w-1/3 bg-linear-to-br from-gray-100 to-gray-200 p-6 flex items-center justify-center">
                  {selectedBook.thumbnail ? (
                    <img
                      src={selectedBook.thumbnail.replace('http://', 'https://')}
                      alt={selectedBook.title}
                      className="w-full h-auto object-contain rounded-lg shadow-lg"
                    />
                  ) : (
                    <div className="w-full h-64 flex items-center justify-center text-gray-400">
                      <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 2H6c-1.206 0-3 .799-3 3v14c0 2.201 1.794 3 3 3h15v-2H6.012C5.55 19.988 5 19.805 5 19s.55-.988 1.012-1H21V4c0-1.103-.897-2-2-2zm0 14H5V5c0-.806.55-.988 1-1h13v12z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Book Details */}
                <div className="w-full md:w-2/3 p-6">
                  {/* Close Button */}
                  <button
                    onClick={closeModal}
                    className="float-right text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>

                  <h2 className="text-2xl font-bold text-gray-900 mb-3 pr-8">
                    {selectedBook.title}
                  </h2>

                  <div className="space-y-3 text-gray-700">
                    <p>
                      <span className="font-semibold">Author(s):</span>{' '}
                      {selectedBook.authors?.join(', ') || 'Unknown'}
                    </p>

                    {selectedBook.publishedDate && (
                      <p>
                        <span className="font-semibold">Published:</span>{' '}
                        {selectedBook.publishedDate}
                      </p>
                    )}

                    {selectedBook.categories && selectedBook.categories.length > 0 && (
                      <p>
                        <span className="font-semibold">Categories:</span>{' '}
                        {selectedBook.categories.join(', ')}
                      </p>
                    )}

                    {selectedBook.status && (
                      <p>
                        <span className="font-semibold">Status:</span>{' '}
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          selectedBook.status === 'wantToRead' ? 'bg-purple-100 text-purple-700' :
                          selectedBook.status === 'currentlyReading' ? 'bg-green-100 text-green-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {selectedBook.status === 'wantToRead' ? 'Want to Read' :
                           selectedBook.status === 'currentlyReading' ? 'Currently Reading' :
                           'Completed'}
                        </span>
                      </p>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={closeModal}
                      className="px-6 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
