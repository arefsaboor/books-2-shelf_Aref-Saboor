import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../Firebase/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../Firebase/config';

const Profile = ({ onNavigateShelf }) => {
  const { currentUser, updateUserData, deleteAccount, sendVerificationEmail } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [bookCount, setBookCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteStep, setDeleteStep] = useState(1); // 1: confirm, 2: verify email, 3: enter password
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (currentUser) {
      setFormData({
        displayName: currentUser.displayName || '',
        email: currentUser.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Fetch book count
      fetchBookCount();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const fetchBookCount = async () => {
    if (!currentUser) return;
    
    try {
      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const bookshelf = userDoc.data().bookshelf || [];
        setBookCount(bookshelf.length);
      }
    } catch (error) {
      console.error('Error fetching book count:', error);
    }
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Please select an image file', type: 'error' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'Image size must be less than 5MB', type: 'error' });
      return;
    }

    setIsUploadingPhoto(true);
    setMessage({ text: '', type: '' });

    try {
      // Create a reference to the storage location
      const storageRef = ref(storage, `profile-pictures/${currentUser.uid}`);
      
      // Upload the file
      await uploadBytes(storageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update user data (this will update both Firestore and Firebase Auth)
      await updateUserData({ photoURL: downloadURL });
      
      setMessage({ text: 'Profile picture updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error uploading photo:', error);
      setMessage({ text: 'Failed to upload profile picture', type: 'error' });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    try {
      // Validate passwords if user is trying to change password
      if (formData.newPassword || formData.confirmPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({ text: 'New passwords do not match', type: 'error' });
          setIsSaving(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
          setIsSaving(false);
          return;
        }
        if (!formData.currentPassword) {
          setMessage({ text: 'Current password is required to change password', type: 'error' });
          setIsSaving(false);
          return;
        }
      }

      // Update display name
      if (formData.displayName !== currentUser.displayName) {
        // Update both Firestore and Firebase Auth using updateUserData
        await updateUserData({ displayName: formData.displayName });
      }

      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setIsEditing(false);
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ text: error.message || 'Failed to update profile', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      displayName: currentUser.displayName || '',
      email: currentUser.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setMessage({ text: '', type: '' });
  };

  const getInitials = () => {
    if (!currentUser) return 'U';
    
    const displayName = currentUser.displayName || currentUser.email || '';
    const names = displayName.split(' ');
    
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    } else if (names[0]) {
      return names[0].substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  const handleDeleteAccountClick = () => {
    setShowDeleteModal(true);
    setDeleteStep(1);
    setDeletePassword('');
  };

  const handleSendVerification = async () => {
    try {
      await sendVerificationEmail();
      setDeleteStep(2);
      setMessage({ text: 'Verification email sent! Please check your inbox.', type: 'success' });
    } catch (error) {
      console.error('Error sending verification:', error);
      setMessage({ text: 'Failed to send verification email', type: 'error' });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletePassword) {
      setMessage({ text: 'Please enter your password', type: 'error' });
      return;
    }

    setIsDeleting(true);
    setMessage({ text: '', type: '' });

    try {
      await deleteAccount(deletePassword);
      // Account deleted successfully, user will be logged out automatically
      setMessage({ text: 'Account deleted successfully', type: 'success' });
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting account:', error);
      if (error.code === 'auth/wrong-password') {
        setMessage({ text: 'Incorrect password', type: 'error' });
      } else if (error.code === 'auth/too-many-requests') {
        setMessage({ text: 'Too many attempts. Please try again later.', type: 'error' });
      } else {
        setMessage({ text: 'Failed to delete account. Please try again.', type: 'error' });
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setDeleteStep(1);
    setDeletePassword('');
    setMessage({ text: '', type: '' });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 mb-6 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Picture */}
            <div className="relative group">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="w-40 h-40 rounded-full object-cover border border-orange-700 shadow-xl"
                  key={currentUser.photoURL}
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-linear-to-br from-amber-400 via-orange-400 to-orange-500 text-white flex items-center justify-center font-bold text-5xl shadow-xl border border-orange-700">
                  {getInitials()}
                </div>
              )}
              
              {/* Upload Button */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                onClick={handlePhotoClick}
                disabled={isUploadingPhoto}
                className="absolute bottom-2 right-2 bg-linear-to-r from-amber-400 to-orange-500 text-white p-3 rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 border border-orange-700"
                title="Change profile picture"
              >
                {isUploadingPhoto ? (
                  <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-4xl font-bold text-orange-700 mb-3">
                {currentUser.displayName || 'User'}
              </h1>
              <p className="text-gray-700 mb-6 text-lg font-medium">{currentUser.email}</p>
              
              {/* Stats */}
              <div className="flex justify-center md:justify-start items-center space-x-4">
                <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl px-6 py-3 shadow-md h-12 border border-orange-700">
                  <p className="text-2xl font-bold bg-linear-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">{bookCount}</p>
                  <p className="text-sm text-gray-700 font-semibold">Books</p>
                </div>
                <button
                  onClick={onNavigateShelf}
                  className="px-6 py-3 h-12 bg-linear-to-r from-amber-400 to-orange-500 text-white rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 font-semibold"
                >
                  View My Shelf
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-shadow duration-300">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-orange-700">Profile Details</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-5 py-2.5 bg-linear-to-r from-amber-400 to-orange-500 text-white rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 flex items-center space-x-2 font-semibold"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {/* Message */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-xl backdrop-blur-sm ${
                message.type === 'success'
                  ? 'bg-green-100/80 text-green-800 border border-green-300 shadow-md'
                  : 'bg-red-100/80 text-red-800 border border-red-300 shadow-md'
              }`}
            >
              <div className="flex items-center space-x-2">
                {message.type === 'success' ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-100/50 disabled:cursor-not-allowed transition-all duration-200 backdrop-blur-sm"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl bg-gray-100/50 cursor-not-allowed backdrop-blur-sm"
              />
              <p className="mt-2 text-sm text-gray-500 flex items-center space-x-1">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span>Email cannot be changed</span>
              </p>
            </div>

            {/* Password Section - Only show when editing */}
            {isEditing && (
              <>
                <div className="border-t-2 border-gray-200 pt-6 mt-8">
                  <h3 className="text-xl font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-3">Change Password</h3>
                  <div className="bg-indigo-50/50 backdrop-blur-sm border border-indigo-200 rounded-xl p-4 mb-4">
                    <p className="text-sm text-indigo-700 flex items-start space-x-2">
                      <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <span>Leave password fields empty if you don't want to change your password.</span>
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200"
                    placeholder="Confirm new password"
                  />
                </div>
              </>
            )}

            {/* Action Buttons - Only show when editing */}
            {isEditing && (
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 pt-6">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-3.5 bg-linear-to-r from-amber-400 to-orange-500 text-white rounded-xl hover:from-amber-500 hover:to-orange-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl hover:scale-105 disabled:hover:scale-100 flex items-center justify-center space-x-2"
                >
                  {isSaving ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  <span>Cancel</span>
                </button>
              </div>
            )}

            {/* Delete Account Section */}
            {!isEditing && (
              <div className="pt-8 mt-8 border-t-2 border-gray-200">
                <div className="bg-red-50/80 backdrop-blur-sm border-2 border-red-200 rounded-xl p-6">
                  <p className="text-sm text-red-700 mb-4">
                    Once you delete your account, there is no going back. This action cannot be undone and will permanently delete all your data.
                  </p>
                  <button
                    type="button"
                    onClick={handleDeleteAccountClick}
                    className="px-6 py-3 bg-linear-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center space-x-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span>Delete Account</span>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8">
            {deleteStep === 1 && (
              <>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-red-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-red-600">Delete Account</h3>
                </div>
                <p className="text-gray-700 mb-4 text-base">
                  Are you sure you want to delete your account? This action cannot be undone and will:
                </p>
                <ul className="list-none text-gray-700 mb-6 space-y-2.5">
                  <li className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>Permanently delete all your data</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>Remove your bookshelf ({bookCount} books)</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>Delete your profile information</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span>Remove access to your account</span>
                  </li>
                </ul>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-amber-800 flex items-start space-x-2">
                    <svg className="w-5 h-5 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <span>To proceed, we'll send a verification email to <strong>{currentUser.email}</strong></span>
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleSendVerification}
                    className="flex-1 px-6 py-3.5 bg-linear-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl"
                  >
                    Send Verification Email
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 px-6 py-3.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {deleteStep === 2 && (
              <>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="bg-red-100 p-3 rounded-full">
                    <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-red-600">Verify Your Email</h3>
                </div>
                <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 mb-6">
                  <p className="text-green-800 flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>Verification email sent to <strong>{currentUser.email}</strong></span>
                  </p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <p className="text-sm text-amber-800">
                    Please check your email and click the verification link. Once verified, enter your password below to confirm account deletion.
                  </p>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Enter Your Password
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200"
                  />
                </div>
                {message.text && message.type === 'error' && (
                  <div className="mb-4 p-4 bg-red-100/80 border border-red-300 rounded-xl backdrop-blur-sm">
                    <p className="text-red-700 text-sm flex items-center space-x-2">
                      <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span>{message.text}</span>
                    </p>
                  </div>
                )}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting || !deletePassword}
                    className="flex-1 px-6 py-3.5 bg-linear-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                  >
                    {isDeleting ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <span>Confirm Delete</span>
                    )}
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    disabled={isDeleting}
                    className="flex-1 px-6 py-3.5 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
