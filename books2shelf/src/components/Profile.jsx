import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../firebase/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';

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
  const [verificationSent, setVerificationSent] = useState(false);
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
      
      // Update Firestore with the new photo URL
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        photoURL: downloadURL
      });
      
      // Update auth context
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

      // Update display name in Firestore
      if (formData.displayName !== currentUser.displayName) {
        const userDocRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userDocRef, {
          displayName: formData.displayName
        });
        
        // Update auth context
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
    setVerificationSent(false);
  };

  const handleSendVerification = async () => {
    try {
      await sendVerificationEmail();
      setVerificationSent(true);
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
    setVerificationSent(false);
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
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Profile Picture */}
            <div className="relative">
              {currentUser.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-500"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-4xl border-4 border-blue-700">
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
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full shadow-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
                title="Change profile picture"
              >
                {isUploadingPhoto ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {currentUser.displayName || 'User'}
              </h1>
              <p className="text-gray-600 mb-4">{currentUser.email}</p>
              
              {/* Stats */}
              <div className="flex justify-center md:justify-start space-x-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{bookCount}</p>
                  <p className="text-sm text-gray-600">Books</p>
                </div>
                <button
                  onClick={onNavigateShelf}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View My Shelf
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Profile Details</h2>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
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
              className={`mb-4 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 text-green-800 border border-green-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Display Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
              <p className="mt-1 text-sm text-gray-500">Email cannot be changed</p>
            </div>

            {/* Password Section - Only show when editing */}
            {isEditing && (
              <>
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Leave password fields empty if you don't want to change your password.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}

            {/* Action Buttons - Only show when editing */}
            {isEditing && (
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed font-medium"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Delete Account Section */}
            {!isEditing && (
              <div className="pt-6 mt-6 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-4">
                  Once you delete your account, there is no going back. This action cannot be undone.
                </p>
                <button
                  type="button"
                  onClick={handleDeleteAccountClick}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Delete Account
                </button>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            {deleteStep === 1 && (
              <>
                <h3 className="text-2xl font-bold text-red-600 mb-4">Delete Account</h3>
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete your account? This action cannot be undone and will:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-6 space-y-2">
                  <li>Permanently delete all your data</li>
                  <li>Remove your bookshelf ({bookCount} books)</li>
                  <li>Delete your profile information</li>
                  <li>Remove access to your account</li>
                </ul>
                <p className="text-sm text-gray-600 mb-6">
                  To proceed, we'll send a verification email to <strong>{currentUser.email}</strong>
                </p>
                <div className="flex space-x-4">
                  <button
                    onClick={handleSendVerification}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    Send Verification Email
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}

            {deleteStep === 2 && (
              <>
                <h3 className="text-2xl font-bold text-red-600 mb-4">Verify Your Email</h3>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800">
                    ✓ Verification email sent to <strong>{currentUser.email}</strong>
                  </p>
                </div>
                <p className="text-gray-700 mb-4">
                  Please check your email and click the verification link. Once verified, enter your password below to confirm account deletion.
                </p>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Your Password
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                {message.text && message.type === 'error' && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm">{message.text}</p>
                  </div>
                )}
                <div className="flex space-x-4">
                  <button
                    onClick={handleConfirmDelete}
                    disabled={isDeleting || !deletePassword}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-red-400 disabled:cursor-not-allowed font-medium"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button
                    onClick={handleCancelDelete}
                    disabled={isDeleting}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
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
