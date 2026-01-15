import React from 'react';

const About = ({ onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-linear-to-br from-amber-50 via-yellow-50 to-orange-50 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={onNavigateHome}
          className="mb-8 inline-flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-amber-600 hover:bg-amber-50 transition-all duration-200 rounded-lg font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Home
        </button>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-1 mb-4">
              <span className="text-4xl font-bold text-gray-800">BOOKS</span>
              <span className="text-4xl font-bold text-amber-600">2</span>
              <span className="text-4xl font-bold text-gray-800">SHELF</span>
            </div>
            <p className="text-xl text-gray-600">Your Digital Library Companion</p>
          </div>

          {/* Mission Section */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-gray-700 leading-relaxed text-lg">
              Books2Shelf is dedicated to helping book lovers organize, discover, and manage their personal book collections effortlessly. 
              We believe that every reader deserves a simple, elegant way to keep track of their literary journey.
            </p>
          </div>

          {/* How It Works Section */}
          <div id="how-it-works" className="mb-10 scroll-mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How It Works</h2>
            <div className="space-y-6">
              {/* Step 1: Create Your Shelf */}
              <div className="flex gap-4 items-start">
                <div className="shrink-0">
                  <div className="w-12 h-12 bg-amber-400 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    1
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Create Your Shelf</h3>
                  <p className="text-gray-700 mb-3">
                    Sign up for a free account using your email or Google account. Once logged in, you'll automatically get your personal digital bookshelf ready to use.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2"><strong>Quick Start:</strong></p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Click "Sign Up" in the navigation bar</li>
                      <li>Enter your details or use Google Sign-In</li>
                      <li>Your shelf is created instantly!</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 2: Browse and Search Books */}
              <div className="flex gap-4 items-start">
                <div className="shrink-0">
                  <div className="w-12 h-12 bg-amber-400 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    2
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Browse and Search Books</h3>
                  <p className="text-gray-700 mb-3">
                    Use our powerful search feature to find any book from millions available through the Google Books API. Browse by categories or search by title, author, or ISBN.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2"><strong>Search Features:</strong></p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Search by book title, author, or ISBN</li>
                      <li>Browse pre-selected categories: Fiction, Philosophy, Psychology, Science, and more</li>
                      <li>View "Top Rated" books for recommendations</li>
                      <li>Get autocomplete suggestions as you type</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Step 3: Add Books to Your Shelf */}
              <div className="flex gap-4 items-start">
                <div className="shrink-0">
                  <div className="w-12 h-12 bg-amber-400 text-white rounded-full flex items-center justify-center font-bold text-lg">
                    3
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">Add Books to Your Shelf</h3>
                  <p className="text-gray-700 mb-3">
                    Found a book you love? Simply click the "Add to Shelf" button and it's instantly saved to your collection. Already added a book? You'll see a checkmark indicating it's in your shelf.
                  </p>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2"><strong>Managing Your Collection:</strong></p>
                    <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                      <li>Click "Add to Shelf" to save any book</li>
                      <li>Books already in your shelf show "Added to Shelf" with a ✓</li>
                      <li>View your complete collection in "My Shelf"</li>
                      <li>Switch between grid, list, or table views</li>
                      <li>Remove books anytime from your shelf page</li>
                      <li>Export your entire collection as PDF</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Additional Tips */}
              <div className="bg-amber-50 rounded-lg p-6 border-2 border-amber-200">
                <div className="flex items-start gap-3">
                  <svg className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">Pro Tips:</h4>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Your bookshelf syncs across all devices automatically</li>
                      <li>• Use the category buttons for quick browsing without typing</li>
                      <li>• Download your collection as PDF for backup or offline reference</li>
                      <li>• The search prevents duplicate books - each title can only be added once</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What We Offer */}
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Smart Search</h3>
                  <p className="text-gray-600">Search millions of books from Google Books API with instant results.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Personal Shelf</h3>
                  <p className="text-gray-600">Organize your books in a beautiful, customizable digital shelf.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Track Progress</h3>
                  <p className="text-gray-600">Monitor your reading status and keep track of your collection.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="shrink-0">
                  <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Export Data</h3>
                  <p className="text-gray-600">Download your book collection as PDF for offline access.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="bg-amber-50 rounded-xl p-8 mb-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Books2Shelf?</h2>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Simple and intuitive interface designed for book lovers</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Secure cloud storage with Firebase authentication</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Access your library from any device, anywhere</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-700">Completely free to use with no hidden costs</span>
              </li>
            </ul>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <p className="text-gray-600 mb-6">Ready to organize your reading life?</p>
            <button
              onClick={onNavigateHome}
              className="px-8 py-3 bg-amber-400 text-gray-900 font-semibold rounded-lg hover:bg-amber-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              Get Started
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
