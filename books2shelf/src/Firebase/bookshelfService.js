import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from './config';

// Add a book to user's bookshelf
export const addBookToShelf = async (userId, book) => {
  try {
    const userRef = doc(db, 'users', userId);
    
    // Create a simplified book object to store
    const bookData = {
      id: book.id,
      title: book.volumeInfo.title,
      authors: book.volumeInfo.authors || [],
      thumbnail: book.volumeInfo.imageLinks?.thumbnail || '',
      publishedDate: book.volumeInfo.publishedDate || '',
      categories: book.volumeInfo.categories || [],
      addedAt: new Date().toISOString()
    };

    await updateDoc(userRef, {
      bookshelf: arrayUnion(bookData)
    });

    return { success: true, message: 'Book added to your shelf!' };
  } catch (error) {
    console.error('Error adding book to shelf:', error);
    return { success: false, message: 'Failed to add book to shelf' };
  }
};

// Remove a book from user's bookshelf
export const removeBookFromShelf = async (userId, bookId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const bookToRemove = userData.bookshelf.find(book => book.id === bookId);
      
      if (bookToRemove) {
        await updateDoc(userRef, {
          bookshelf: arrayRemove(bookToRemove)
        });
        return { success: true, message: 'Book removed from your shelf!' };
      }
    }
    
    return { success: false, message: 'Book not found in shelf' };
  } catch (error) {
    console.error('Error removing book from shelf:', error);
    return { success: false, message: 'Failed to remove book from shelf' };
  }
};

// Get user's bookshelf
export const getUserBookshelf = async (userId) => {
  try {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data().bookshelf || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error getting user bookshelf:', error);
    return [];
  }
};

// Check if a book is in user's bookshelf
export const isBookInShelf = async (userId, bookId) => {
  try {
    const bookshelf = await getUserBookshelf(userId);
    return bookshelf.some(book => book.id === bookId);
  } catch (error) {
    console.error('Error checking if book is in shelf:', error);
    return false;
  }
};
