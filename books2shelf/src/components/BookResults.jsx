import React, { useState } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { addBookToShelf } from '../firebase/bookshelfService';

const BookResults = ({ books, loading, error }) => {
  const { currentUser } = useAuth();
  const [addingBooks, setAddingBooks] = useState({});

  const handleAddToShelf = async (book) => {
    if (!currentUser) {
      alert('Please sign in to add books to your shelf');
      return;
    }

    setAddingBooks(prev => ({ ...prev, [book.id]: true }));

    try {
      const result = await addBookToShelf(currentUser.uid, book);
      if (result.success) {
        alert(result.message);
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error('Error adding book:', err);
      alert('Failed to add book to shelf');
    } finally {
      setAddingBooks(prev => ({ ...prev, [book.id]: false }));
    }
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  if (books.length === 0) {
    return null;
  }

  return (
    <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {books.map((book) => {
        const bookInfo = book.volumeInfo;
        const thumbnail = bookInfo.imageLinks?.thumbnail || bookInfo.imageLinks?.smallThumbnail;
        
        return (
          <div
            key={book.id}
            className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
          >
            {/* Book Cover */}
            <div className="relative h-64 bg-gray-100 overflow-hidden">
              {thumbnail ? (
                <img
                  src={thumbnail}
                  alt={bookInfo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg
                    className="w-20 h-20"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M19 2H6c-1.206 0-3 .799-3 3v14c0 2.201 1.794 3 3 3h15v-2H6.012C5.55 19.988 5 19.805 5 19s.55-.988 1.012-1H21V4c0-1.103-.897-2-2-2zm0 14H5V5c0-.806.55-.988 1-1h13v12z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Book Info */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                {bookInfo.title}
              </h3>
              
              <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                {bookInfo.authors?.join(', ') || 'Unknown Author'}
              </p>
              
              {bookInfo.publishedDate && (
                <p className="text-gray-500 text-xs mb-3">
                  Published: {bookInfo.publishedDate.split('-')[0]}
                </p>
              )}

              {bookInfo.categories && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {bookInfo.categories.slice(0, 2).map((category, index) => (
                    <span
                      key={index}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              )}

              <button 
                onClick={() => handleAddToShelf(book)}
                disabled={addingBooks[book.id]}
                className="w-full mt-2 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addingBooks[book.id] ? 'Adding...' : 'Add to Shelf'}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BookResults;
