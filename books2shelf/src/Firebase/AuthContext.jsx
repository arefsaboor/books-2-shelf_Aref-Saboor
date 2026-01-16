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
    try {
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
    } catch (error) {
      // Handle specific Firebase errors with user-friendly messages
      let errorMessage = 'An error occurred during signup. Please try again.';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered. Please sign in instead or use a different email.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters long.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled. Please contact support.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      // Handle specific Firebase errors with user-friendly messages
      let errorMessage = 'An error occurred during sign in. Please try again.';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email. Please sign up first.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed login attempts. Please try again later.';
          break;
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
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
    } catch (error) {
      // Handle specific Firebase errors with user-friendly messages
      let errorMessage = 'An error occurred during Google sign in. Please try again.';
      
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign in was cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Popup was blocked by your browser. Please allow popups and try again.';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Sign in was cancelled. Please try again.';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with this email but different sign-in method.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
      
      throw new Error(errorMessage);
    }
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
