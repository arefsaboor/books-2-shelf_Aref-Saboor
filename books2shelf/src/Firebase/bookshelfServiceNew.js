/**
 * New Professional Bookshelf Service
 * Uses subcollections for better scalability and performance
 */

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  increment,
  writeBatch,
  Timestamp
} from "firebase/firestore";
import { db } from "./config";

// ==================== BOOK OPERATIONS ====================

/**
 * Add a book to user's bookshelf (subcollection)
 */
export const addBookToShelf = async (userId, bookData) => {
  try {
    const bookRef = doc(db, "bookshelves", userId, "books", bookData.id);
    
    const newBook = {
      ...bookData,
      addedAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
      status: bookData.status || "wantToRead",
      rating: bookData.rating || 0,
      review: bookData.review || "",
      yearOfOwnership: bookData.yearOfOwnership || new Date().getFullYear().toString(),
    };

    await setDoc(bookRef, newBook);

    // Update user stats
    await updateUserStats(userId, bookData.status || "wantToRead", "increment");

    return { 
      success: true, 
      book: newBook,
      message: "Book added to your shelf successfully!" 
    };
  } catch (error) {
    console.error("Error adding book:", error);
    return { 
      success: false, 
      message: "Failed to add book. Please try again." 
    };
  }
};

/**
 * Remove a book from user's bookshelf
 */
export const removeBookFromShelf = async (userId, bookId) => {
  try {
    // Get book to know which status to decrement
    const bookRef = doc(db, "bookshelves", userId, "books", bookId);
    const bookSnap = await getDoc(bookRef);
    
    if (!bookSnap.exists()) {
      throw new Error("Book not found");
    }

    const bookStatus = bookSnap.data().status;

    // Delete the book
    await deleteDoc(bookRef);

    // Update user stats
    await updateUserStats(userId, bookStatus, "decrement");

    return { 
      success: true,
      message: "Book removed from your shelf" 
    };
  } catch (error) {
    console.error("Error removing book:", error);
    return { 
      success: false, 
      message: "Failed to remove book. Please try again." 
    };
  }
};

/**
 * Update book status (wantToRead, currentlyReading, completed)
 */
export const updateBookStatus = async (userId, bookId, newStatus, oldStatus) => {
  try {
    const bookRef = doc(db, "bookshelves", userId, "books", bookId);
    
    await updateDoc(bookRef, {
      status: newStatus,
      lastUpdated: Timestamp.now(),
    });

    // Update stats: decrement old status, increment new status
    if (oldStatus !== newStatus) {
      await updateUserStats(userId, oldStatus, "decrement");
      await updateUserStats(userId, newStatus, "increment");
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating book status:", error);
    throw error;
  }
};

/**
 * Update book details (rating, review, etc.)
 */
export const updateBookDetails = async (userId, bookId, updates) => {
  try {
    const bookRef = doc(db, "bookshelves", userId, "books", bookId);
    
    await updateDoc(bookRef, {
      ...updates,
      lastUpdated: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating book details:", error);
    throw error;
  }
};

/**
 * Get user's entire bookshelf (sorted by date added, newest first)
 */
export const getUserBookshelf = async (userId) => {
  try {
    const booksRef = collection(db, "bookshelves", userId, "books");
    const q = query(booksRef, orderBy("addedAt", "desc"));
    const snapshot = await getDocs(q);

    const books = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return books;
  } catch (error) {
    console.error("Error getting bookshelf:", error);
    return [];
  }
};

/**
 * Get books by status with pagination
 */
export const getBooksByStatus = async (userId, status, limitCount = 20) => {
  try {
    const booksRef = collection(db, "bookshelves", userId, "books");
    const q = query(
      booksRef,
      where("status", "==", status),
      orderBy("addedAt", "desc"),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);

    const books = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return books;
  } catch (error) {
    console.error("Error getting books by status:", error);
    return [];
  }
};

/**
 * Check if a book is in user's shelf
 */
export const isBookInShelf = async (userId, bookId) => {
  try {
    const bookRef = doc(db, "bookshelves", userId, "books", bookId);
    const bookSnap = await getDoc(bookRef);
    return bookSnap.exists();
  } catch (error) {
    console.error("Error checking book:", error);
    return false;
  }
};

/**
 * Get a specific book
 */
export const getBook = async (userId, bookId) => {
  try {
    const bookRef = doc(db, "bookshelves", userId, "books", bookId);
    const bookSnap = await getDoc(bookRef);
    
    if (bookSnap.exists()) {
      return { id: bookSnap.id, ...bookSnap.data() };
    }
    return null;
  } catch (error) {
    console.error("Error getting book:", error);
    return null;
  }
};

/**
 * Real-time listener for bookshelf changes
 */
export const subscribeToBookshelf = (userId, callback) => {
  const booksRef = collection(db, "bookshelves", userId, "books");
  const q = query(booksRef, orderBy("addedAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const books = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    callback(books);
  });
};

// ==================== USER STATS OPERATIONS ====================

/**
 * Update user statistics (book counts)
 */
const updateUserStats = async (userId, status, operation) => {
  try {
    const userRef = doc(db, "users", userId);
    
    const statusField = `stats.${status}`;
    const totalField = "stats.totalBooks";

    const incrementValue = operation === "increment" ? 1 : -1;

    await updateDoc(userRef, {
      [statusField]: increment(incrementValue),
      [totalField]: increment(incrementValue),
    });
  } catch (error) {
    console.error("Error updating user stats:", error);
  }
};

/**
 * Initialize user stats (call when creating new user)
 */
export const initializeUserStats = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    
    await setDoc(userRef, {
      stats: {
        totalBooks: 0,
        wantToRead: 0,
        currentlyReading: 0,
        completed: 0,
      }
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error("Error initializing user stats:", error);
    throw error;
  }
};

/**
 * Recalculate user stats from scratch (useful for fixing inconsistencies)
 */
export const recalculateUserStats = async (userId) => {
  try {
    const books = await getUserBookshelf(userId);
    
    const stats = {
      totalBooks: books.length,
      wantToRead: books.filter(b => b.status === "wantToRead").length,
      currentlyReading: books.filter(b => b.status === "currentlyReading").length,
      completed: books.filter(b => b.status === "completed").length,
    };

    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, { stats });

    return stats;
  } catch (error) {
    console.error("Error recalculating stats:", error);
    throw error;
  }
};

// ==================== NOTES OPERATIONS ====================

/**
 * Save/update notes for a specific book
 */
export const saveBookNotes = async (userId, bookId, notesContent) => {
  try {
    const noteRef = doc(db, "notes", userId, "bookNotes", bookId);
    
    const noteData = {
      content: notesContent,
      plainText: notesContent.replace(/<[^>]*>/g, ''), // Strip HTML for search
      lastModified: Timestamp.now(),
      characterCount: notesContent.length,
      createdAt: Timestamp.now(),
    };

    await setDoc(noteRef, noteData, { merge: true });

    return { success: true };
  } catch (error) {
    console.error("Error saving notes:", error);
    throw error;
  }
};

/**
 * Get notes for a specific book
 */
export const getBookNotes = async (userId, bookId) => {
  try {
    const noteRef = doc(db, "notes", userId, "bookNotes", bookId);
    const noteSnap = await getDoc(noteRef);
    
    if (noteSnap.exists()) {
      return noteSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting notes:", error);
    return null;
  }
};

/**
 * Delete notes for a specific book
 */
export const deleteBookNotes = async (userId, bookId) => {
  try {
    const noteRef = doc(db, "notes", userId, "bookNotes", bookId);
    await deleteDoc(noteRef);
    return { success: true };
  } catch (error) {
    console.error("Error deleting notes:", error);
    throw error;
  }
};

/**
 * Get all notes for a user
 */
export const getAllUserNotes = async (userId) => {
  try {
    const notesRef = collection(db, "notes", userId, "bookNotes");
    const snapshot = await getDocs(notesRef);

    const notes = snapshot.docs.map((doc) => ({
      bookId: doc.id,
      ...doc.data(),
    }));

    return notes;
  } catch (error) {
    console.error("Error getting all notes:", error);
    return [];
  }
};

// ==================== MIGRATION OPERATIONS ====================

/**
 * Migrate user from old structure (array) to new structure (subcollections)
 */
export const migrateUserBookshelf = async (userId) => {
  try {
    console.log(`Starting migration for user: ${userId}`);
    
    // Get old bookshelf array
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      throw new Error("User not found");
    }

    const userData = userSnap.data();
    const oldBookshelf = userData.bookshelf || [];

    if (oldBookshelf.length === 0) {
      console.log("No books to migrate");
      return { success: true, migratedBooks: 0 };
    }

    // Use batch for better performance
    const batch = writeBatch(db);
    
    // Migrate each book to subcollection
    oldBookshelf.forEach((book) => {
      const bookRef = doc(db, "bookshelves", userId, "books", book.id);
      batch.set(bookRef, {
        ...book,
        lastUpdated: Timestamp.now(),
      });
    });

    // Calculate stats
    const stats = {
      totalBooks: oldBookshelf.length,
      wantToRead: oldBookshelf.filter(b => b.status === "wantToRead").length,
      currentlyReading: oldBookshelf.filter(b => b.status === "currentlyReading").length,
      completed: oldBookshelf.filter(b => b.status === "completed").length,
    };

    // Prepare user document updates
    const userUpdates = {
      stats,
      bookshelf: null, // Remove old array
      migratedAt: Timestamp.now(),
      lastLoginAt: new Date().toISOString()
    };

    // Add displayNameLower if displayName exists and displayNameLower doesn't
    if (userData.displayName && !userData.displayNameLower) {
      userUpdates.displayNameLower = userData.displayName.toLowerCase();
    }

    // Update user document with stats and remove old bookshelf array
    batch.update(userRef, userUpdates);

    await batch.commit();

    console.log(`Migration completed: ${oldBookshelf.length} books migrated`);
    return { success: true, migratedBooks: oldBookshelf.length, stats };
  } catch (error) {
    console.error("Error during migration:", error);
    throw error;
  }
};

/**
 * Check if user needs migration
 */
export const needsMigration = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);
    
    if (!userSnap.exists()) {
      return false;
    }

    const userData = userSnap.data();
    
    // If user has bookshelf array and hasn't been migrated
    return userData.bookshelf && 
           Array.isArray(userData.bookshelf) && 
           userData.bookshelf.length > 0 &&
           !userData.migratedAt;
  } catch (error) {
    console.error("Error checking migration status:", error);
    return false;
  }
};
