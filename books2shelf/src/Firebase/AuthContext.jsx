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
import { auth } from './config';
import { createUserData, getUserData, updateUserData, createUserProfile } from './userService';

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
      await user.reload();
    }

    // Create user data in new structure
    await createUserData(user.uid, {
      email: user.email,
      displayName: displayName || '',
    });

    // Create user profile
    await createUserProfile(user.uid, {
      photoURL: '',
      bio: '',
      location: '',
      favoriteGenres: [],
      readingGoal: 0,
    });

    return userCredential;
  };

  // Sign in with email and password
  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    // Check if user data exists
    const userData = await getUserData(user.uid);
    if (!userData) {
      // Create new user
      await createUserData(user.uid, {
        email: user.email,
        displayName: user.displayName || '',
      });
      
      await createUserProfile(user.uid, {
        photoURL: user.photoURL || '',
        bio: '',
        location: '',
        favoriteGenres: [],
        readingGoal: 0,
      });
    } else {
      // Update last login
      await updateUserData(user.uid, {
        lastLoginAt: new Date().toISOString(),
      });
    }

    return userCredential;
  };

  // Sign out
  const logout = () => {
    return signOut(auth);
  };

  // Update user data wrapper
  const updateUserDataWrapper = async (data) => {
    if (!currentUser) {
      throw new Error('No user is currently signed in');
    }

    // Update Firestore userData
    await updateUserData(currentUser.uid, data);

    // If displayName is being updated, also update Firebase Auth profile
    if (data.displayName !== undefined) {
      await updateProfile(currentUser, { displayName: data.displayName });
      await currentUser.reload();
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

      // Delete user data (this will delete all subcollections too if you set up Firebase rules)
      // Note: You may need to manually delete subcollections or use Cloud Functions
      
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
    updateUserData: updateUserDataWrapper,
    sendVerificationEmail,
    deleteAccount
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
