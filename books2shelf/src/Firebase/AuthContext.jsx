import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from './config';
import { needsMigration, migrateUserBookshelf } from '../Firebase/bookshelfServiceNew';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Sign up with email and password
  const signup = async (email, password, displayName) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update user profile with display name
    if (displayName) {
      await updateProfile(user, { displayName });
      // Reload user to ensure the display name is updated in the auth state
      await user.reload();
    }

    // Create user document in Firestore with organized structure
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: displayName || '',
      displayNameLower: (displayName || '').toLowerCase(), // For case-insensitive search
      photoURL: '',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      stats: {
        totalBooks: 0,
        wantToRead: 0,
        currentlyReading: 0,
        completed: 0
      },
      bookshelf: [] // Will be removed after migration
    });

    // Return updated user credential
    return userCredential;
  };

  // Sign in with email and password
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Force account selection every time for better UX
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user document exists, if not create one
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || '',
        displayNameLower: (user.displayName || '').toLowerCase(),
        photoURL: user.photoURL || '',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        stats: {
          totalBooks: 0,
          wantToRead: 0,
          currentlyReading: 0,
          completed: 0
        }
      });
    } else {
      // Update last login time
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: new Date().toISOString(),
        displayNameLower: (user.displayName || '').toLowerCase()
      });
    }

    return userCredential;
  };

  // Sign out
  const logout = () => {
    return signOut(auth);
  };

  // Get user data from Firestore
  const getUserData = async (uid) => {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  };

  // Update user data in Firestore and optionally update Firebase Auth profile
  const updateUserData = async (data) => {
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }

    // Add displayNameLower if displayName is being updated
    const updateData = { ...data };
    if (data.displayName !== undefined) {
      updateData.displayNameLower = data.displayName.toLowerCase();
    }

    // Update Firestore document
    await setDoc(doc(db, 'users', currentUser.uid), updateData, { merge: true });

    // If photoURL or displayName is being updated, also update Firebase Auth profile
    if (data.photoURL !== undefined || data.displayName !== undefined) {
      const profileUpdates = {};
      if (data.photoURL !== undefined) profileUpdates.photoURL = data.photoURL;
      if (data.displayName !== undefined) profileUpdates.displayName = data.displayName;
      
      await updateProfile(currentUser, profileUpdates);
      
      // Reload the user to get the updated profile
      await currentUser.reload();
      
      // Force a state update by setting the user again
      setCurrentUser({ ...auth.currentUser });
    }
  };

  // Send verification email
  const sendVerificationEmail = async () => {
    if (currentUser) {
      await sendEmailVerification(currentUser);
    }
  };

  // Delete user account
  const deleteAccount = async (password) => {
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }

    try {
      // Re-authenticate user before deletion
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Delete user data from Firestore
      await deleteDoc(doc(db, 'users', currentUser.uid));

      // Delete the user account
      await deleteUser(currentUser);

      return { success: true };
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // Auto-migrate user if needed
      if (user) {
        try {
          const needsMig = await needsMigration(user.uid);
          if (needsMig) {
            console.log('Migrating user to new database structure...');
            await migrateUserBookshelf(user.uid);
            console.log('Migration completed successfully!');
          }
        } catch (error) {
          console.error('Auto-migration failed:', error);
          // Don't block login if migration fails
        }
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    signup,
    login,
    logout,
    signInWithGoogle,
    getUserData,
    updateUserData,
    sendVerificationEmail,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
