/**
 * User Service for New Firebase Structure
 * 
 * Structure:
 * Users/
 *   └── [userId]/
 *       ├── userData/      (basic user info)
 *       ├── userProfile/   (profile details, settings)
 *       └── userShelf/     (books collection)
 *           └── [bookId]   (individual book)
 */

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  Timestamp
} from "firebase/firestore";
import { db } from "./config";

// ==================== USER DATA OPERATIONS ====================

/**
 * Create user data when signing up
 */
export const createUserData = async (userId, userData) => {
  try {
    console.log('Creating user data for:', userId);
    
    const userDataRef = doc(db, "Users", userId, "userData", "info");
    
    await setDoc(userDataRef, {
      uid: userId,
      email: userData.email,
      displayName: userData.displayName || "",
      displayNameLower: (userData.displayName || "").toLowerCase(),
      createdAt: Timestamp.now(),
      lastLoginAt: Timestamp.now(),
    });

    console.log('User data created successfully');
    return { success: true };
  } catch (error) {
    console.error("Error creating user data:", error);
    throw error;
  }
};

/**
 * Get user data
 */
export const getUserData = async (userId) => {
  try {
    const userDataRef = doc(db, "Users", userId, "userData", "info");
    const snapshot = await getDoc(userDataRef);
    
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user data:", error);
    return null;
  }
};

/**
 * Update user data
 */
export const updateUserData = async (userId, updates) => {
  try {
    const userDataRef = doc(db, "Users", userId, "userData", "info");
    
    // If updating displayName, also update displayNameLower
    if (updates.displayName) {
      updates.displayNameLower = updates.displayName.toLowerCase();
    }
    
    await updateDoc(userDataRef, {
      ...updates,
      lastUpdated: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
};

// ==================== USER PROFILE OPERATIONS ====================

/**
 * Create user profile
 */
export const createUserProfile = async (userId, profileData) => {
  try {
    console.log('Creating user profile for:', userId);
    
    const profileRef = doc(db, "Users", userId, "userProfile", "info");
    
    await setDoc(profileRef, {
      photoURL: profileData.photoURL || "",
      bio: profileData.bio || "",
      location: profileData.location || "",
      favoriteGenres: profileData.favoriteGenres || [],
      readingGoal: profileData.readingGoal || 0,
      createdAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
    });

    console.log('User profile created successfully');
    return { success: true };
  } catch (error) {
    console.error("Error creating user profile:", error);
    throw error;
  }
};

/**
 * Get user profile
 */
export const getUserProfile = async (userId) => {
  try {
    const profileRef = doc(db, "Users", userId, "userProfile", "info");
    const snapshot = await getDoc(profileRef);
    
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const profileRef = doc(db, "Users", userId, "userProfile", "info");
    
    await updateDoc(profileRef, {
      ...updates,
      lastUpdated: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// ==================== USER SHELF OPERATIONS ====================

/**
 * Add a book to user's shelf
 */
export const addBookToShelf = async (userId, bookData) => {
  try {
    console.log('Adding book to shelf:', { userId, bookId: bookData.id });
    
    // Flatten Google Books API structure if needed
    const volumeInfo = bookData.volumeInfo || bookData;
    const bookId = bookData.id || bookData.bookId;
    
    if (!bookId) {
      throw new Error("Book ID is required");
    }
    
    const bookRef = doc(db, "Users", userId, "userShelf", bookId);
    
    // Extract thumbnail URL and convert to HTTPS
    const imageLinks = volumeInfo.imageLinks || bookData.imageLinks || {};
    const thumbnailUrl = imageLinks.thumbnail || imageLinks.smallThumbnail || "";
    const httpsThumnail = thumbnailUrl ? thumbnailUrl.replace('http://', 'https://') : "";
    
    const newBook = {
      id: bookId,
      title: volumeInfo.title || bookData.title || "Unknown Title",
      authors: volumeInfo.authors || bookData.authors || ["Unknown Author"],
      publisher: volumeInfo.publisher || bookData.publisher || "",
      publishedDate: volumeInfo.publishedDate || bookData.publishedDate || "",
      description: volumeInfo.description || bookData.description || "",
      pageCount: volumeInfo.pageCount || bookData.pageCount || 0,
      categories: volumeInfo.categories || bookData.categories || [],
      imageLinks: imageLinks,
      thumbnail: httpsThumnail, // Direct thumbnail URL for easy access
      language: volumeInfo.language || bookData.language || "en",
      previewLink: volumeInfo.previewLink || bookData.previewLink || "",
      infoLink: volumeInfo.infoLink || bookData.infoLink || "",
      // User-specific fields
      addedAt: Timestamp.now(),
      lastUpdated: Timestamp.now(),
      status: bookData.status || "wantToRead",
      rating: bookData.rating || 0,
      review: bookData.review || "",
      yearOfOwnership: bookData.yearOfOwnership || new Date().getFullYear().toString(),
    };

    console.log('Book to be saved:', newBook);

    await setDoc(bookRef, newBook);

    console.log('Book saved successfully to Firebase');

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
 * Remove a book from user's shelf
 */
export const removeBookFromShelf = async (userId, bookId) => {
  try {
    const bookRef = doc(db, "Users", userId, "userShelf", bookId);
    await deleteDoc(bookRef);

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
 * Get all books from user's shelf
 */
export const getUserShelf = async (userId) => {
  try {
    console.log('Getting user shelf for:', userId);
    
    const shelfRef = collection(db, "Users", userId, "userShelf");
    const q = query(shelfRef, orderBy("addedAt", "desc"));
    const snapshot = await getDocs(q);

    const books = snapshot.docs.map((doc) => {
      const bookData = {
        id: doc.id,
        ...doc.data(),
      };
      
      return bookData;
    });

    console.log(`getUserShelf - Retrieved ${books.length} books`);
    if (books.length > 0) {
      console.log('First book:', books[0]);
    }
    
    return books;
  } catch (error) {
    console.error("Error getting user shelf:", error);
    return [];
  }
};

/**
 * Get a single book from user's shelf
 */
export const getBookFromShelf = async (userId, bookId) => {
  try {
    const bookRef = doc(db, "Users", userId, "userShelf", bookId);
    const snapshot = await getDoc(bookRef);
    
    if (snapshot.exists()) {
      return {
        id: snapshot.id,
        ...snapshot.data(),
      };
    }
    return null;
  } catch (error) {
    console.error("Error getting book:", error);
    return null;
  }
};

/**
 * Update book details (status, rating, review, etc.)
 */
export const updateBookInShelf = async (userId, bookId, updates) => {
  try {
    const bookRef = doc(db, "Users", userId, "userShelf", bookId);
    
    await updateDoc(bookRef, {
      ...updates,
      lastUpdated: Timestamp.now(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error updating book:", error);
    throw error;
  }
};

/**
 * Check if a book is already in the shelf
 */
export const isBookInShelf = async (userId, bookId) => {
  try {
    const bookRef = doc(db, "Users", userId, "userShelf", bookId);
    const snapshot = await getDoc(bookRef);
    return snapshot.exists();
  } catch (error) {
    console.error("Error checking book:", error);
    return false;
  }
};

/**
 * Get books by status
 */
export const getBooksByStatus = async (userId, status) => {
  try {
    const shelfRef = collection(db, "Users", userId, "userShelf");
    const q = query(
      shelfRef, 
      where("status", "==", status),
      orderBy("addedAt", "desc")
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
 * Get shelf statistics
 */
export const getShelfStats = async (userId) => {
  try {
    const books = await getUserShelf(userId);
    
    const stats = {
      total: books.length,
      wantToRead: books.filter(book => book.status === 'wantToRead').length,
      currentlyReading: books.filter(book => book.status === 'currentlyReading').length,
      completed: books.filter(book => book.status === 'completed').length,
    };

    return stats;
  } catch (error) {
    console.error("Error getting shelf stats:", error);
    return {
      total: 0,
      wantToRead: 0,
      currentlyReading: 0,
      completed: 0,
    };
  }
};

// ==================== USER DELETION ====================

/**
 * Delete all user data from Firestore
 * This must be called BEFORE deleting the user from Firebase Auth
 */
export const deleteAllUserData = async (userId) => {
  try {
    console.log('Starting deletion of all user data for:', userId);
    
    // 1. Delete all books from userShelf subcollection
    const shelfRef = collection(db, "Users", userId, "userShelf");
    const booksSnapshot = await getDocs(shelfRef);
    console.log(`Deleting ${booksSnapshot.docs.length} books from shelf...`);
    
    const bookDeletePromises = booksSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(bookDeletePromises);
    
    // 2. Delete userProfile
    const profileRef = doc(db, "Users", userId, "userProfile", "info");
    const profileDoc = await getDoc(profileRef);
    if (profileDoc.exists()) {
      console.log('Deleting user profile...');
      await deleteDoc(profileRef);
    }
    
    // 3. Delete userData
    const userDataRef = doc(db, "Users", userId, "userData", "info");
    const userDataDoc = await getDoc(userDataRef);
    if (userDataDoc.exists()) {
      console.log('Deleting user data...');
      await deleteDoc(userDataRef);
    }
    
    // 4. Delete the parent Users document (if it exists as a document)
    const userDocRef = doc(db, "Users", userId);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      console.log('Deleting user document...');
      await deleteDoc(userDocRef);
    }
    
    console.log('All user data deleted successfully from Firestore');
    return { success: true };
  } catch (error) {
    console.error("Error deleting user data:", error);
    throw error;
  }
};
