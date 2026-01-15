/**
 * Migration Utility Component
 * Run this once to migrate all users from old to new structure
 */

import React, { useState } from 'react';
import { migrateUserBookshelf, needsMigration } from '../Firebase/bookshelfServiceNew';
import { useAuth } from '../firebase/AuthContext';

export default function MigrationUtility() {
  const { currentUser } = useAuth();
  const [migrating, setMigrating] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [error, setError] = useState(null);

  const handleMigration = async () => {
    if (!currentUser) {
      setError('No user logged in');
      return;
    }

    setMigrating(true);
    setError(null);
    setMigrationStatus(null);

    try {
      // Check if migration is needed
      const needsMig = await needsMigration(currentUser.uid);
      
      if (!needsMig) {
        setMigrationStatus({
          success: true,
          message: 'Your bookshelf is already up to date! No migration needed.',
          migratedBooks: 0
        });
        setMigrating(false);
        return;
      }

      // Perform migration
      const result = await migrateUserBookshelf(currentUser.uid);

      setMigrationStatus({
        success: true,
        message: `Successfully migrated ${result.migratedBooks} books to the new structure!`,
        migratedBooks: result.migratedBooks,
        stats: result.stats
      });
    } catch (err) {
      console.error('Migration error:', err);
      setError(err.message || 'An error occurred during migration');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800">Database Migration</h2>
        </div>

        <div className="space-y-4 mb-6">
          <p className="text-gray-600">
            We've upgraded our database structure for better performance and scalability! 🚀
          </p>
          
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <h3 className="font-semibold text-orange-900 mb-2">What's New:</h3>
            <ul className="space-y-1 text-sm text-orange-800">
              <li>✅ Faster loading times</li>
              <li>✅ Better organization</li>
              <li>✅ Improved search and filtering</li>
              <li>✅ Support for more books</li>
              <li>✅ Separate notes storage</li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Migration Process:</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• All your books will be preserved</li>
              <li>• All data (ratings, reviews, notes) will be kept</li>
              <li>• Takes only a few seconds</li>
              <li>• One-time process</li>
            </ul>
          </div>
        </div>

        {!migrationStatus && (
          <button
            onClick={handleMigration}
            disabled={migrating}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${
              migrating
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-orange-600 hover:bg-orange-700 hover:shadow-lg'
            }`}
          >
            {migrating ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Migrating Your Bookshelf...
              </span>
            ) : (
              'Start Migration'
            )}
          </button>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="font-semibold text-red-900">Migration Failed</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {migrationStatus && migrationStatus.success && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <svg className="w-5 h-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="font-semibold text-green-900">Migration Successful!</h3>
                <p className="text-sm text-green-700 mt-1">{migrationStatus.message}</p>
                
                {migrationStatus.stats && (
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-600">Total Books</p>
                      <p className="text-lg font-bold text-gray-900">{migrationStatus.stats.totalBooks}</p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-600">Want to Read</p>
                      <p className="text-lg font-bold text-blue-600">{migrationStatus.stats.wantToRead}</p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-600">Reading</p>
                      <p className="text-lg font-bold text-purple-600">{migrationStatus.stats.currentlyReading}</p>
                    </div>
                    <div className="bg-white rounded p-2">
                      <p className="text-xs text-gray-600">Completed</p>
                      <p className="text-lg font-bold text-green-600">{migrationStatus.stats.completed}</p>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => window.location.reload()}
                  className="mt-4 w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
                >
                  Refresh Page to See Changes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Need help? Contact support at{' '}
          <a href="mailto:support@books2shelf.com" className="text-orange-600 hover:underline">
            support@books2shelf.com
          </a>
        </p>
      </div>
    </div>
  );
}
