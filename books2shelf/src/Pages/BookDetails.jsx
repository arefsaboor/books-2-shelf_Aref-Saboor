import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Firebase/AuthContext';
import { 
  getBook, 
  updateBookDetails, 
  updateBookStatus as updateBookStatusService,
  getBookNotes,
  saveBookNotes
} from '../Firebase/bookshelfServiceNew';

const BookDetails = ({ bookId, onBack }) => {
  const { currentUser } = useAuth();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editingDetails, setEditingDetails] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  // Form states
  const [status, setStatus] = useState('Want to Read');
  const [yearOfOwnership, setYearOfOwnership] = useState('');
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [notes, setNotes] = useState('');
  
  // Store original values for cancel functionality
  const [originalYearOfOwnership, setOriginalYearOfOwnership] = useState('');
  const [originalRating, setOriginalRating] = useState(0);
  const [originalReview, setOriginalReview] = useState('');
  const [originalNotes, setOriginalNotes] = useState('');
  
  // Rich text editor states
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState('16');
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');
  const [textAlign, setTextAlign] = useState('left');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAdvancedToolbar, setShowAdvancedToolbar] = useState(false);
  
  const editorRef = useRef(null);

  useEffect(() => {
    loadBookDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  const loadBookDetails = async () => {
    try {
      setLoading(true);
      
      // Use new service to get book from subcollection
      const foundBook = await getBook(currentUser.uid, bookId);
      
      if (foundBook) {
        setBook(foundBook);
        
        // Map status values from Database format
        let displayStatus = foundBook.status || 'Want to Read';
        if (foundBook.status === 'wantToRead') displayStatus = 'Want to Read';
        else if (foundBook.status === 'currentlyReading') displayStatus = 'Reading';
        else if (foundBook.status === 'completed') displayStatus = 'Completed';
        
        const year = foundBook.yearOfOwnership || '';
        const bookRating = foundBook.rating || 0;
        const bookReview = foundBook.review || '';
        
        setStatus(displayStatus);
        setYearOfOwnership(year);
        setRating(bookRating);
        setReview(bookReview);
        
        // Load notes separately from notes collection
        const bookNotesData = await getBookNotes(currentUser.uid, bookId);
        const bookNotes = bookNotesData?.content || '';
        setNotes(bookNotes);
        
        // Save original values for cancel functionality
        setOriginalYearOfOwnership(year);
        setOriginalRating(bookRating);
        setOriginalReview(bookReview);
        setOriginalNotes(bookNotes);
      }
    } catch (error) {
      console.error('Error loading book details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      // Convert status back to database format
      let dbStatus = status;
      if (status === 'Want to Read') dbStatus = 'wantToRead';
      else if (status === 'Reading') dbStatus = 'currentlyReading';
      else if (status === 'Completed') dbStatus = 'completed';
      
      // Get old status for stats update
      const oldStatus = book.status;
      
      // Update book details (excluding notes)
      await updateBookDetails(currentUser.uid, bookId, {
        rating,
        review,
        yearOfOwnership
      });
      
      // Update status separately if changed (for stats)
      if (dbStatus !== oldStatus) {
        await updateBookStatusService(currentUser.uid, bookId, dbStatus, oldStatus);
      }
      
      // Save notes separately in notes collection
      if (notes !== originalNotes) {
        await saveBookNotes(currentUser.uid, bookId, notes);
      }

      // Reload book details
      await loadBookDetails();
      setEditingDetails(false);
      setEditingNotes(false);
      setHasUnsavedChanges(false);
      alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const insertEmoji = (emoji) => {
    // Insert emoji at current caret position inside contentEditable
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(emoji));
    // Move caret after inserted emoji
    range.collapse(false);
    sel.removeAllRanges();
    sel.addRange(range);
    // Update notes state
    if (editorRef.current) {
      setNotes(editorRef.current.innerHTML);
      editorRef.current.focus();
    }
  };

  const handleCancelDetails = () => {
    // Revert to original values
    setYearOfOwnership(originalYearOfOwnership);
    setRating(originalRating);
    setReview(originalReview);
    setEditingDetails(false);
  };

  const handleCancelNotes = () => {
    // Revert to original notes
    setNotes(originalNotes);
    setEditingNotes(false);
  };

  // Apply inline style to current selection by wrapping with a span
  const applyInlineStyle = (styleProp, styleValue) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (range.collapsed) return; // no selection
    const span = document.createElement('span');
    span.style[styleProp] = styleValue;
    // Extract selected contents and wrap
    const contents = range.extractContents();
    span.appendChild(contents);
    range.insertNode(span);
    // Move cursor after the inserted span
    range.setStartAfter(span);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    // Normalize and update state
    if (editorRef.current) {
      setNotes(editorRef.current.innerHTML);
      setHasUnsavedChanges(true);
    }
  };

  // Exec command helpers for common formats
  const toggleBold = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('bold');
    setHasUnsavedChanges(true);
  };
  
  const toggleItalic = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('italic');
    setHasUnsavedChanges(true);
  };
  
  const toggleUnderline = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('underline');
    setHasUnsavedChanges(true);
  };
  
  const toggleStrikethrough = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('strikeThrough');
    if (editorRef.current) {
      setNotes(editorRef.current.innerHTML);
      setHasUnsavedChanges(true);
    }
  };
  
  const applyTextColor = (color) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('foreColor', false, color);
    setHasUnsavedChanges(true);
  };
  
  const applyHighlight = (color) => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('hiliteColor', false, color);
    setHasUnsavedChanges(true);
  };
  
  const clearFormatting = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('removeFormat');
    if (editorRef.current) {
      setNotes(editorRef.current.innerHTML);
      setHasUnsavedChanges(true);
    }
  };
  
  const alignLeft = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('justifyLeft');
    if (editorRef.current) {
      setNotes(editorRef.current.innerHTML);
      setHasUnsavedChanges(true);
    }
  };
  
  const alignCenter = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('justifyCenter');
    if (editorRef.current) {
      setNotes(editorRef.current.innerHTML);
      setHasUnsavedChanges(true);
    }
  };
  
  const alignRight = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('justifyRight');
    if (editorRef.current) {
      setNotes(editorRef.current.innerHTML);
      setHasUnsavedChanges(true);
    }
  };
  
  const alignJustify = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('justifyFull');
    if (editorRef.current) {
      setNotes(editorRef.current.innerHTML);
      setHasUnsavedChanges(true);
    }
  };
  
  // Additional formatting functions
  const toggleSubscript = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('subscript');
    if (editorRef.current) {
      setNotes(editorRef.current.innerHTML);
      setHasUnsavedChanges(true);
    }
  };
  
  const toggleSuperscript = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('superscript');
    if (editorRef.current) {
      setNotes(editorRef.current.innerHTML);
      setHasUnsavedChanges(true);
    }
  };
  
  const insertHorizontalRule = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('insertHorizontalRule');
    if (editorRef.current) {
      setNotes(editorRef.current.innerHTML);
      setHasUnsavedChanges(true);
    }
  };
  
  const insertLink = () => {
    if (!editorRef.current) return;
    const url = prompt('Enter URL:');
    if (url) {
      editorRef.current.focus();
      document.execCommand('createLink', false, url);
      if (editorRef.current) {
        setNotes(editorRef.current.innerHTML);
        setHasUnsavedChanges(true);
      }
    }
  };
  
  const removeLink = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
    document.execCommand('unlink');
    if (editorRef.current) {
      setNotes(editorRef.current.innerHTML);
      setHasUnsavedChanges(true);
    }
  };
  
  const insertImage = () => {
    if (!editorRef.current) return;
    const url = prompt('Enter image URL:');
    if (url) {
      editorRef.current.focus();
      document.execCommand('insertImage', false, url);
      if (editorRef.current) {
        setNotes(editorRef.current.innerHTML);
        setHasUnsavedChanges(true);
      }
    }
  };
  
  // Get plain text character count (excluding HTML tags)
  const getCharacterCount = () => {
    if (!notes) return 0;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = notes;
    return (tempDiv.textContent || tempDiv.innerText || '').length;
  };

  // Initialize editor content when entering edit mode
  // Initialize editor content when switching to edit mode (only if empty)
  useEffect(() => {
    if (editingNotes && editorRef.current && editorRef.current.innerHTML === '') {
      editorRef.current.innerHTML = notes || '';
      // Place caret at end
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [editingNotes, notes]);

  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= 1900; year--) {
      years.push(year);
    }
    return years;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading book details...</p>
        </div>
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen bg-linear-to-br from-amber-50 via-yellow-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Book not found</p>
          <button
            onClick={onBack}
            className="px-6 py-2 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-500 transition-colors"
          >
            Back to Shelf
          </button>
        </div>
      </div>
    );
  }

  // Comprehensive emoji list
  const emojiList = {
    'Smileys': ['😀', '😃', '😄', '😁', '😆', '�', '😂', '🤣', '�😊', '😇', '🙂', '🙃', '😉', '😌', '�', '🥰', '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🤩', '🥳'],
    'Emotions': ['😏', '😒', '😞', '😔', '😟', '😕', '🙁', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤', '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓'],
    'Books': ['�📚', '📖', '📕', '📗', '📘', '📙', '📓', '📔', '📒', '📑', '🔖', '🏷️', '📜', '📃', '📄', '📰', '🗞️', '📑'],
    'Hearts': ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝'],
    'Symbols': ['⭐', '🌟', '✨', '�', '⚡', '�', '�', '✔️', '✅', '❌', '⭕', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪'],
    'Objects': ['💡', '🎯', '🎨', '🖊️', '✏️', '📝', '💭', '🗨️', '💬', '🗯️', '📢', '📣', '�', '🎵', '🎶', '�', '🎧']
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-yellow-50 to-orange-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 rounded-lg font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Shelf
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Right Side - Book Info Container */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 sticky top-6">
              {/* Book Cover */}
              <div className="mb-6">
                {book.thumbnail ? (
                  <img
                    src={book.thumbnail.replace('http://', 'https://')}
                    alt={book.title}
                    className="w-full h-80 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-full h-80 bg-gray-200 rounded-lg flex items-center justify-center">
                    <svg className="w-20 h-20 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Book Title and Authors */}
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{book.title}</h1>
              {book.authors && book.authors.length > 0 && (
                <p className="text-gray-600 mb-4">by {book.authors.join(', ')}</p>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  className="w-full px-4 py-2 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-500 transition-colors"
                >
                  {showDetails ? 'Hide Details' : 'View Details'}
                </button>
                <button
                  onClick={onBack}
                  className="w-full px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:border-amber-500 hover:text-amber-600 transition-colors"
                >
                  Back to Shelf
                </button>
              </div>

              {/* Book Details (expandable) */}
              {showDetails && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="font-bold text-gray-900 mb-3">Book Information</h3>
                  <div className="space-y-2 text-sm">
                    {book.publishedDate && (
                      <p><span className="font-semibold">Published:</span> {book.publishedDate}</p>
                    )}
                    {book.publisher && (
                      <p><span className="font-semibold">Publisher:</span> {book.publisher}</p>
                    )}
                    {book.pageCount && (
                      <p><span className="font-semibold">Pages:</span> {book.pageCount}</p>
                    )}
                    {book.categories && book.categories.length > 0 && (
                      <p><span className="font-semibold">Categories:</span> {book.categories.join(', ')}</p>
                    )}
                    {book.language && (
                      <p><span className="font-semibold">Language:</span> {book.language.toUpperCase()}</p>
                    )}
                    {book.description && (
                      <div className="mt-4">
                        <p className="font-semibold mb-2">Description:</p>
                        <p className="text-gray-600 text-sm leading-relaxed">{book.description}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Left Side - Details and Notes Containers */}
          <div className="lg:col-span-2 space-y-6">
            {/* Details Container */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Details</h2>
                <button
                  onClick={() => editingDetails ? handleCancelDetails() : setEditingDetails(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    editingDetails
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  {editingDetails ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {/* Status Section - Read Only */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    status === 'Completed' ? 'bg-yellow-100 text-yellow-800' :
                    status === 'Reading' ? 'bg-green-100 text-green-800' :
                    status === 'Want to Read' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {status}
                  </span>
                </div>
              </div>

              {/* Year of Ownership */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Year of buying/owning this book:
                </label>
                {editingDetails ? (
                  <select
                    value={yearOfOwnership}
                    onChange={(e) => {
                      setYearOfOwnership(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select year...</option>
                    {generateYearOptions().map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                ) : (
                  <div className="px-4 py-2 bg-gray-50 rounded-lg">
                    {yearOfOwnership || 'Not set'}
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => {
                        if (editingDetails) {
                          setRating(star);
                          setHasUnsavedChanges(true);
                        }
                      }}
                      disabled={!editingDetails}
                      className={`transition-all ${editingDetails ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
                    >
                      <svg
                        className={`w-8 h-8 transition-colors ${
                          star <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300 fill-gray-300'
                        } ${editingDetails && star > rating ? 'hover:text-yellow-400 hover:fill-yellow-400' : ''}`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </button>
                  ))}
                  <span className="ml-2 text-gray-600">
                    {rating > 0 ? `${rating}/5` : 'Not rated'}
                  </span>
                </div>
              </div>

              {/* Review */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Review</label>
                {editingDetails ? (
                  <textarea
                    value={review}
                    onChange={(e) => {
                      setReview(e.target.value);
                      setHasUnsavedChanges(true);
                    }}
                    placeholder="Write your review about this book..."
                    rows="4"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                  />
                ) : (
                  <div className="px-4 py-3 bg-gray-50 rounded-lg min-h-24">
                    {review ? (
                      <p className="text-gray-700 whitespace-pre-wrap">{review}</p>
                    ) : (
                      <p className="text-gray-400 italic">No review yet</p>
                    )}
                  </div>
                )}
              </div>

              {/* Save Changes Button */}
              {editingDetails && (
                <div className="flex justify-end">
                  <button
                    onClick={async () => {
                      await handleSaveChanges();
                      setEditingDetails(false);
                    }}
                    disabled={saving}
                    className="px-6 py-2.5 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Notes and Thoughts Container */}
            <div className="bg-white rounded-2xl shadow-xl p-6">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">Notes and Thoughts</h2>
                  <p className="text-gray-600 text-sm">
                    Write or edit your thoughts, reviews or memorable quotes from this book.
                  </p>
                </div>
                <button
                  onClick={() => editingNotes ? handleCancelNotes() : setEditingNotes(true)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    editingNotes
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
                  }`}
                >
                  {editingNotes ? 'Cancel' : 'Edit'}
                </button>
              </div>

              {/* Modern Professional Toolbar - Only when editing */}
              {editingNotes && (
                <div className="mb-4 bg-linear-to-r from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl shadow-lg overflow-visible">
                  {/* Primary Toolbar Row */}
                  <div className="flex flex-wrap items-center gap-2 p-3 bg-white border-b border-gray-200">
                    {/* Text Formatting Group */}
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-200 h-12">
                      <span className="text-xs font-medium text-gray-500 mr-1">Format</span>
                      <button
                        onClick={() => {
                          setIsBold(!isBold);
                          toggleBold();
                          if (editorRef.current) setNotes(editorRef.current.innerHTML);
                        }}
                        className={`p-2 rounded-md transition-all hover:scale-105 ${
                          isBold ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                        title="Bold (Ctrl+B)"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6zM6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
                        </svg>
                      </button>

                      <button
                        onClick={() => {
                          setIsItalic(!isItalic);
                          toggleItalic();
                          if (editorRef.current) setNotes(editorRef.current.innerHTML);
                        }}
                        className={`p-2 rounded-md transition-all hover:scale-105 ${
                          isItalic ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                        title="Italic (Ctrl+I)"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4M14 4l-4 16M6 20h4" />
                        </svg>
                      </button>

                      <button
                        onClick={() => {
                          setIsUnderline(!isUnderline);
                          toggleUnderline();
                          if (editorRef.current) setNotes(editorRef.current.innerHTML);
                        }}
                        className={`p-2 rounded-md transition-all hover:scale-105 ${
                          isUnderline ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                        title="Underline (Ctrl+U)"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v8a7 7 0 0014 0V3M5 21h14" />
                        </svg>
                      </button>

                      <button
                        onClick={() => toggleStrikethrough()}
                        className="p-2 rounded-md bg-white text-gray-700 hover:bg-gray-100 transition-all hover:scale-105"
                        title="Strikethrough"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 7c0-1.5 1-3 3.5-3h3c2.5 0 3.5 1.5 3.5 3s-1 3-3.5 3h-3c-2.5 0-3.5 1.5-3.5 3s1 3 3.5 3h3c2.5 0 3.5-1.5 3.5-3" />
                        </svg>
                      </button>
                    </div>

                    {/* Font Controls Group */}
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-200 h-12">
                      <span className="text-xs font-medium text-gray-500 mr-1">Font</span>
                      <select
                        value={fontFamily}
                        onChange={(e) => {
                          setFontFamily(e.target.value);
                          if (editingNotes) applyInlineStyle('fontFamily', e.target.value);
                        }}
                        className="h-8 px-2 py-1 border border-gray-300 rounded-md text-xs font-medium bg-white hover:border-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all"
                      >
                        <option value="Arial">Arial</option>
                        <option value="Georgia">Georgia</option>
                        <option value="Times New Roman">Times</option>
                        <option value="Courier New">Courier</option>
                        <option value="Verdana">Verdana</option>
                        <option value="Helvetica">Helvetica</option>
                      </select>

                      <select
                        value={fontSize}
                        onChange={(e) => {
                          setFontSize(e.target.value);
                          if (editingNotes) applyInlineStyle('fontSize', `${e.target.value}px`);
                        }}
                        className="h-8 px-2 py-1 border border-gray-300 rounded-md text-xs font-medium bg-white hover:border-amber-400 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 outline-none transition-all w-16"
                      >
                        <option value="10">10</option>
                        <option value="12">12</option>
                        <option value="14">14</option>
                        <option value="16">16</option>
                        <option value="18">18</option>
                        <option value="20">20</option>
                        <option value="24">24</option>
                        <option value="28">28</option>
                        <option value="32">32</option>
                        <option value="36">36</option>
                        <option value="48">48</option>
                      </select>
                    </div>

                    {/* Alignment Group */}
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-200 h-12">
                      <span className="text-xs font-medium text-gray-500 mr-1">Align</span>
                      <button
                        onClick={() => {
                          setTextAlign('left');
                          alignLeft();
                        }}
                        className={`p-2 rounded-md transition-all hover:scale-105 ${
                          textAlign === 'left' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                        title="Align Left"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
                        </svg>
                      </button>

                      <button
                        onClick={() => {
                          setTextAlign('center');
                          alignCenter();
                        }}
                        className={`p-2 rounded-md transition-all hover:scale-105 ${
                          textAlign === 'center' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                        title="Align Center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M7 12h10M4 18h16" />
                        </svg>
                      </button>

                      <button
                        onClick={() => {
                          setTextAlign('right');
                          alignRight();
                        }}
                        className={`p-2 rounded-md transition-all hover:scale-105 ${
                          textAlign === 'right' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                        title="Align Right"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M10 12h10M4 18h16" />
                        </svg>
                      </button>

                      <button
                        onClick={() => {
                          setTextAlign('justify');
                          alignJustify();
                        }}
                        className={`p-2 rounded-md transition-all hover:scale-105 ${
                          textAlign === 'justify' ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                        title="Justify"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                      </button>
                    </div>

                    {/* Color & Tools Group */}
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-200 h-12">
                      <span className="text-xs font-medium text-gray-500 mr-1">Color</span>
                      <div className="relative group">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => {
                            setTextColor(e.target.value);
                            applyTextColor(e.target.value);
                            if (editorRef.current) setNotes(editorRef.current.innerHTML);
                          }}
                          className="w-8 h-8 rounded-md cursor-pointer border-2 border-gray-300 hover:border-amber-400 transition-all"
                          title="Text Color"
                        />
                      </div>

                      {/* Highlighter Tool */}
                      <div className="relative group">
                        <input
                          type="color"
                          value={highlightColor}
                          onChange={(e) => {
                            setHighlightColor(e.target.value);
                            applyHighlight(e.target.value);
                            if (editorRef.current) setNotes(editorRef.current.innerHTML);
                          }}
                          className="w-8 h-8 rounded-md cursor-pointer border-2 border-amber-300 hover:border-amber-500 transition-all"
                          title="Highlight Color"
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border border-white"></div>
                      </div>

                      <button
                        onClick={clearFormatting}
                        className="p-2 rounded-md bg-white text-red-600 hover:bg-red-50 transition-all hover:scale-105"
                        title="Clear Formatting"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Emoji Picker */}
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-200 h-12 relative">
                      <span className="text-xs font-medium text-gray-500 mr-1">Emoji</span>
                      <button
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className="p-2 rounded-md bg-white text-gray-700 hover:bg-amber-50 transition-all hover:scale-105 text-base"
                        title="Insert Emoji"
                      >
                        😊
                      </button>
                      
                      {/* Emoji Dropdown */}
                      {showEmojiPicker && (
                        <div className="absolute top-full left-0 mt-2 bg-white border-2 border-gray-200 rounded-xl shadow-2xl p-4 z-100 w-80 max-h-64 overflow-y-auto">
                          {Object.entries(emojiList).map(([category, emojis]) => (
                            <div key={category} className="mb-3">
                              <h4 className="text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">{category}</h4>
                              <div className="flex flex-wrap gap-1">
                                {emojis.map((emoji, idx) => (
                                  <button
                                    key={idx}
                                    onClick={() => {
                                      insertEmoji(emoji);
                                      setShowEmojiPicker(false);
                                    }}
                                    className="w-8 h-8 hover:bg-amber-100 rounded-lg transition-all hover:scale-110 text-lg flex items-center justify-center"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* More Options */}
                    <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-50 rounded-lg border border-gray-200 h-12">
                      <span className="text-xs font-medium text-gray-500 mr-1">More</span>
                      <button
                        onClick={() => setShowAdvancedToolbar(!showAdvancedToolbar)}
                        className={`p-2 rounded-md transition-all hover:scale-105 ${
                          showAdvancedToolbar ? 'bg-amber-500 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-amber-50'
                        }`}
                        title="More Options"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                        </svg>
                      </button>
                    </div>

                    {/* Character Counter */}
                    <div className="ml-auto px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200 h-12 flex items-center">
                      <span className="text-xs font-semibold text-gray-600">
                        {getCharacterCount()} chars
                      </span>
                    </div>
                  </div>

                  {/* Advanced Toolbar Row */}
                  {showAdvancedToolbar && (
                    <div className="flex flex-wrap items-center gap-2 p-3 bg-linear-to-r from-amber-50 to-yellow-50 border-t border-gray-200">
                      {/* Special Formatting */}
                      <div className="flex items-center gap-1 px-2 py-1.5 bg-white rounded-lg border border-gray-200 h-12">
                        <span className="text-xs font-medium text-gray-500 mr-1">Special</span>
                        <button
                          onClick={toggleSubscript}
                          className="p-2 rounded-md bg-gray-50 hover:bg-amber-100 transition-all hover:scale-105"
                          title="Subscript"
                        >
                          <span className="text-xs font-medium">X<sub>2</sub></span>
                        </button>
                        <button
                          onClick={toggleSuperscript}
                          className="p-2 rounded-md bg-gray-50 hover:bg-amber-100 transition-all hover:scale-105"
                          title="Superscript"
                        >
                          <span className="text-xs font-medium">X<sup>2</sup></span>
                        </button>
                        <button
                          onClick={insertHorizontalRule}
                          className="p-2 rounded-md bg-gray-50 hover:bg-amber-100 transition-all hover:scale-105"
                          title="Horizontal Line"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                          </svg>
                        </button>
                      </div>

                      {/* Link Tools */}
                      <div className="flex items-center gap-1 px-2 py-1.5 bg-white rounded-lg border border-gray-200 h-12">
                        <span className="text-xs font-medium text-gray-500 mr-1">Link</span>
                        <button
                          onClick={insertLink}
                          className="p-2 rounded-md bg-gray-50 hover:bg-amber-100 transition-all hover:scale-105"
                          title="Insert Link"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                        </button>
                        <button
                          onClick={removeLink}
                          className="p-2 rounded-md bg-gray-50 hover:bg-red-100 text-red-600 transition-all hover:scale-105"
                          title="Remove Link"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      {/* Image Tools */}
                      <div className="flex items-center gap-1 px-2 py-1.5 bg-white rounded-lg border border-gray-200 h-12">
                        <span className="text-xs font-medium text-gray-500 mr-1">Image</span>
                        <button
                          onClick={insertImage}
                          className="p-2 rounded-md bg-gray-50 hover:bg-amber-100 transition-all hover:scale-105"
                          title="Insert Image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ContentEditable Editor with placeholder overlay */}
              <div className="relative">
                {/* Placeholder overlay (visible when not editing) */}
                {(!notes || notes.trim() === '') && !editingNotes && (
                  <div className="absolute inset-0 pointer-events-none text-gray-400 italic p-6">
                    Click Edit to add your thoughts, memorable quotes, or book summaries...
                  </div>
                )}
                <div
                  ref={editorRef}
                  contentEditable={editingNotes}
                  onInput={() => {
                    if (editorRef.current) {
                      setNotes(editorRef.current.innerHTML);
                      setHasUnsavedChanges(true);
                    }
                  }}
                  className={`min-h-100 p-6 rounded-lg transition-all ${
                    editingNotes
                      ? 'border-2 border-amber-400 bg-white shadow-sm'
                      : 'border border-gray-200 bg-gray-50'
                  } focus:outline-none`}
                  style={{ lineHeight: '1.75' }}
                >
                  {/* Initial content rendered only when not editing */}
                  {!editingNotes && (notes ? (
                    <div dangerouslySetInnerHTML={{ __html: notes }} />
                  ) : null)}
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 pt-6 border-t border-gray-200 flex justify-between items-center">
                <p className="text-sm text-gray-500">
                  Added: {new Date(book.addedAt || Date.now()).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <button
                  onClick={handleSaveChanges}
                  disabled={saving || !hasUnsavedChanges}
                  className="px-6 py-2 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetails;
