import React, { useState, useEffect } from 'react';
import { useAuth } from '../Firebase/AuthContext';
import { addBookToShelf, isBookInShelf } from '../Firebase/bookshelfServiceNew';

const BookResults = ({ books, loading, error }) => {
  const { currentUser } = useAuth();
  const [addingBooks, setAddingBooks] = useState({});
  const [booksInShelf, setBooksInShelf] = useState({});
  const [selectedBook, setSelectedBook] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Check which books are already in the shelf
  useEffect(() => {
    const checkBooksInShelf = async () => {
      if (!currentUser || books.length === 0) {
        setBooksInShelf({});
        return;
      }

      const checkPromises = books.map(async (book) => {
        const inShelf = await isBookInShelf(currentUser.uid, book.id);
        return { bookId: book.id, inShelf };
      });

      const results = await Promise.all(checkPromises);
      const shelfStatus = {};
      results.forEach(({ bookId, inShelf }) => {
        shelfStatus[bookId] = inShelf;
      });
      
      setBooksInShelf(shelfStatus);
    };

    checkBooksInShelf();
  }, [books, currentUser]);

  const handleAddToShelf = async (book) => {
    if (!currentUser) {
      alert('Please sign in to add books to your shelf');
      return;
    }

    // If book is already in shelf, don't allow adding again
    if (booksInShelf[book.id]) {
      alert('This book is already in your shelf!');
      return;
    }

    setAddingBooks(prev => ({ ...prev, [book.id]: true }));

    try {
      const result = await addBookToShelf(currentUser.uid, book);
      if (result.success) {
        alert(result.message);
        // Update the shelf status
        setBooksInShelf(prev => ({ ...prev, [book.id]: true }));
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

  const openBookModal = (book) => {
    setSelectedBook(book);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBook(null);
  };
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
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
    <>
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {books.map((book) => {
          const bookInfo = book.volumeInfo;
          const thumbnail = bookInfo.imageLinks?.thumbnail || bookInfo.imageLinks?.smallThumbnail;
          
          return (
            <div
              key={book.id}
              className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group flex flex-col h-full"
            >
              {/* Book Cover - Fixed Height with Full Image Visible */}
              <div className="relative h-80 bg-linear-to-br from-gray-100 to-gray-200 overflow-hidden">
                {thumbnail ? (
                  <img
                    src={thumbnail.replace('http://', 'https://')}
                    alt={bookInfo.title}
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-24 h-24"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M19 2H6c-1.206 0-3 .799-3 3v14c0 2.201 1.794 3 3 3h15v-2H6.012C5.55 19.988 5 19.805 5 19s.55-.988 1.012-1H21V4c0-1.103-.897-2-2-2zm0 14H5V5c0-.806.55-.988 1-1h13v12z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Book Info - Flexible Content Area */}
              <div className="p-5 flex flex-col grow">
                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 min-h-14">
                  {bookInfo.title}
                </h3>
                
                <p className="text-gray-600 text-sm mb-2 line-clamp-1">
                  {bookInfo.authors?.join(', ') || 'Unknown Author'}
                </p>
                
                <div className="flex items-center gap-3 mb-3 text-xs text-gray-500">
                  {bookInfo.publishedDate && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {bookInfo.publishedDate.split('-')[0]}
                    </span>
                  )}
                  {bookInfo.pageCount && (
                    <span className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      {bookInfo.pageCount} pages
                    </span>
                  )}
                </div>

                {bookInfo.categories && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {bookInfo.categories.slice(0, 2).map((category, index) => (
                      <span
                        key={index}
                        className="text-xs bg-amber-50 text-amber-700 px-3 py-1 rounded-full font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                {/* Spacer to push buttons to bottom */}
                <div className="grow"></div>

                {/* Buttons - Always at Bottom */}
                <div className="space-y-2 mt-4">
                  <button 
                    onClick={() => openBookModal(book)}
                    className="w-full px-4 py-2.5 bg-white border-2 border-amber-400 text-amber-600 font-semibold rounded-lg hover:bg-amber-50 transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    View Book
                  </button>

                  <button 
                    onClick={() => handleAddToShelf(book)}
                    disabled={addingBooks[book.id] || booksInShelf[book.id]}
                    className={`w-full px-4 py-2.5 font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-md ${
                      booksInShelf[book.id]
                        ? 'bg-green-100 text-green-700 border-2 border-green-300 cursor-default'
                        : 'bg-amber-400 text-gray-900 hover:bg-amber-500 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {booksInShelf[book.id] ? (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                        Added to Shelf
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        {addingBooks[book.id] ? 'Adding...' : 'Add to Shelf'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Book Detail Modal */}
      {showModal && selectedBook && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">Book Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Book Cover */}
                <div className="md:col-span-1">
                  <div className="sticky top-6 bg-linear-to-br from-gray-100 to-gray-200 rounded-xl p-4 shadow-lg">
                    {(selectedBook.volumeInfo.imageLinks?.thumbnail || selectedBook.volumeInfo.imageLinks?.smallThumbnail) ? (
                      <img
                        src={`${selectedBook.volumeInfo.imageLinks?.thumbnail || selectedBook.volumeInfo.imageLinks?.smallThumbnail}`.replace('http://', 'https://')}
                        alt={selectedBook.volumeInfo.title}
                        className="w-full h-auto object-contain rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-96 flex items-center justify-center text-gray-400">
                        <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M19 2H6c-1.206 0-3 .799-3 3v14c0 2.201 1.794 3 3 3h15v-2H6.012C5.55 19.988 5 19.805 5 19s.55-.988 1.012-1H21V4c0-1.103-.897-2-2-2zm0 14H5V5c0-.806.55-.988 1-1h13v12z" />
                        </svg>
                      </div>
                    )}
                    
                    {/* Add to Shelf Button in Modal */}
                    <button 
                      onClick={() => {
                        handleAddToShelf(selectedBook);
                        closeModal();
                      }}
                      disabled={addingBooks[selectedBook.id]}
                      className="w-full mt-4 px-4 py-3 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                      </svg>
                      {addingBooks[selectedBook.id] ? 'Adding...' : 'Add to Shelf'}
                    </button>
                  </div>
                </div>

                {/* Book Information */}
                <div className="md:col-span-2 space-y-4">
                  <div>
                    <h3 className="text-3xl font-bold text-gray-900 mb-2">
                      {selectedBook.volumeInfo.title}
                    </h3>
                    {selectedBook.volumeInfo.subtitle && (
                      <p className="text-xl text-gray-600 mb-3">
                        {selectedBook.volumeInfo.subtitle}
                      </p>
                    )}
                  </div>

                  {/* Author */}
                  {selectedBook.volumeInfo.authors && (
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Author(s)</p>
                        <p className="text-gray-900">{selectedBook.volumeInfo.authors.join(', ')}</p>
                      </div>
                    </div>
                  )}

                  {/* Publisher & Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedBook.volumeInfo.publisher && (
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Publisher</p>
                          <p className="text-gray-900">{selectedBook.volumeInfo.publisher}</p>
                        </div>
                      </div>
                    )}

                    {selectedBook.volumeInfo.publishedDate && (
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Published</p>
                          <p className="text-gray-900">{selectedBook.volumeInfo.publishedDate}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Pages & Language */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {selectedBook.volumeInfo.pageCount && (
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Pages</p>
                          <p className="text-gray-900">{selectedBook.volumeInfo.pageCount}</p>
                        </div>
                      </div>
                    )}

                    {selectedBook.volumeInfo.language && (
                      <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                        </svg>
                        <div>
                          <p className="text-sm text-gray-500 font-medium">Language</p>
                          <p className="text-gray-900 uppercase">{selectedBook.volumeInfo.language}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Categories */}
                  {selectedBook.volumeInfo.categories && (
                    <div>
                      <p className="text-sm text-gray-500 font-medium mb-2">Categories</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedBook.volumeInfo.categories.map((category, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-amber-50 text-amber-700 rounded-full text-sm font-medium"
                          >
                            {category}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Average Rating */}
                  {selectedBook.volumeInfo.averageRating && (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">Rating</p>
                        <p className="text-gray-900">
                          {selectedBook.volumeInfo.averageRating} / 5 
                          {selectedBook.volumeInfo.ratingsCount && (
                            <span className="text-gray-500 text-sm ml-2">
                              ({selectedBook.volumeInfo.ratingsCount} ratings)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {selectedBook.volumeInfo.description && (
                    <div className="mt-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-3">Description</h4>
                      <div 
                        className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ 
                          __html: selectedBook.volumeInfo.description 
                        }}
                      />
                    </div>
                  )}

                  {/* ISBN */}
                  {selectedBook.volumeInfo.industryIdentifiers && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-500 font-medium mb-2">Identifiers</p>
                      <div className="space-y-1">
                        {selectedBook.volumeInfo.industryIdentifiers.map((identifier, index) => (
                          <p key={index} className="text-sm text-gray-700">
                            <span className="font-medium">{identifier.type}:</span> {identifier.identifier}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BookResults;
