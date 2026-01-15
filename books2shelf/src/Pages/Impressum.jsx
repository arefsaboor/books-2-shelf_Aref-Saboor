import React from 'react';

const Impressum = ({ onNavigateHome }) => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <button
            onClick={onNavigateHome}
            className="mb-4 text-amber-600 hover:text-amber-700 flex items-center space-x-2 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Home</span>
          </button>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Impressum</h1>
          <p className="text-gray-600">Legal Information & Disclosure</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Company Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Service Provider</h2>
            <div className="space-y-2 text-gray-700">
              <p><strong>Books2Shelf</strong></p>
              <p>Digital Library Management Services</p>
              <p className="mt-4">
                <strong>Operated by:</strong><br />
                Books2Shelf GmbH
              </p>
            </div>
          </section>

          {/* Contact Information */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Address:</strong><br />
                Sample Street 123<br />
                12345 Sample City<br />
                Germany
              </p>
              <p className="mt-4">
                <strong>Phone:</strong> +49 (0) 123 456789
              </p>
              <p>
                <strong>Email:</strong> contact@books2shelf.com
              </p>
              <p>
                <strong>Website:</strong> www.books2shelf.com
              </p>
            </div>
          </section>

          {/* Legal Representatives */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Legal Representatives</h2>
            <div className="text-gray-700">
              <p>
                <strong>Managing Director:</strong> [Name]
              </p>
            </div>
          </section>

          {/* Registration */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Commercial Registration</h2>
            <div className="space-y-2 text-gray-700">
              <p>
                <strong>Register Court:</strong> Sample District Court
              </p>
              <p>
                <strong>Registration Number:</strong> HRB 12345
              </p>
              <p>
                <strong>VAT ID:</strong> DE123456789
              </p>
            </div>
          </section>

          {/* Responsible for Content */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Responsible for Content</h2>
            <div className="text-gray-700">
              <p>
                According to § 55 Abs. 2 RStV:<br />
                [Name]<br />
                Sample Street 123<br />
                12345 Sample City<br />
                Germany
              </p>
            </div>
          </section>

          {/* Dispute Resolution */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Online Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed">
              The European Commission provides a platform for online dispute resolution (ODR):
            </p>
            <a 
              href="https://ec.europa.eu/consumers/odr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-amber-600 hover:text-amber-700 underline"
            >
              https://ec.europa.eu/consumers/odr
            </a>
            <p className="text-gray-700 leading-relaxed mt-4">
              We are not willing or obliged to participate in dispute resolution proceedings before a consumer 
              arbitration board.
            </p>
          </section>

          {/* Liability for Content */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Liability for Content</h2>
            <p className="text-gray-700 leading-relaxed">
              As a service provider, we are responsible for our own content on these pages in accordance with § 7 
              para.1 TMG (German Telemedia Act). However, according to §§ 8 to 10 TMG, we are not obligated to 
              monitor transmitted or stored third-party information or to investigate circumstances that indicate 
              illegal activity.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Obligations to remove or block the use of information under general law remain unaffected. However, 
              liability in this regard is only possible from the time of knowledge of a specific infringement. 
              Upon becoming aware of corresponding legal violations, we will remove this content immediately.
            </p>
          </section>

          {/* Liability for Links */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Liability for Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Our website contains links to external third-party websites over whose content we have no influence. 
              Therefore, we cannot assume any liability for this external content. The respective provider or 
              operator of the pages is always responsible for the content of the linked pages.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              The linked pages were checked for possible legal violations at the time of linking. Illegal content 
              was not recognizable at the time of linking. However, permanent monitoring of the content of the 
              linked pages is not reasonable without concrete evidence of an infringement. Upon becoming aware of 
              legal violations, we will remove such links immediately.
            </p>
          </section>

          {/* Copyright */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Copyright</h2>
            <p className="text-gray-700 leading-relaxed">
              The content and works created by the site operators on these pages are subject to German copyright law. 
              The reproduction, editing, distribution, and any kind of use outside the limits of copyright require 
              the written consent of the respective author or creator.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Downloads and copies of this site are only permitted for private, non-commercial use. Insofar as the 
              content on this site was not created by the operator, the copyrights of third parties are respected. 
              In particular, third-party content is identified as such. Should you nevertheless become aware of a 
              copyright infringement, please inform us accordingly. Upon becoming aware of legal violations, we will 
              remove such content immediately.
            </p>
          </section>

          {/* Data Protection */}
          <section className="bg-amber-50 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Protection</h2>
            <p className="text-gray-700 leading-relaxed">
              For information on how we handle your personal data, please refer to our{' '}
              <button
                onClick={() => window.location.hash = 'privacy'}
                className="text-amber-600 hover:text-amber-700 underline font-semibold"
              >
                Privacy Policy
              </button>
              .
            </p>
          </section>

          {/* Source Credits */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Source Credits</h2>
            <p className="text-gray-700 leading-relaxed">
              Book information and cover images are provided by the Google Books API. All book-related content 
              remains the property of their respective publishers and authors.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Impressum;
