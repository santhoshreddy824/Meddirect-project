import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const TermsAndConditions = () => {
  const navigate = useNavigate();
  const lastUpdated = "October 22, 2025";

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <img
            src={assets.logo}
            alt="MedDirect Logo"
            className="mx-auto h-16 w-auto mb-6"
          />
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Terms and Conditions
          </h1>
          <p className="text-lg text-gray-600">Last updated: {lastUpdated}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 text-primary hover:text-primary/80 font-medium"
          >
            ← Back
          </button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                1. Agreement to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Welcome to MedDirect. These Terms and Conditions
                (&ldquo;Terms&rdquo;) govern your use of our healthcare platform
                and services. By accessing or using MedDirect, you agree to be
                bound by these Terms and our Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                If you do not agree to these Terms, please do not use our
                services. We reserve the right to update these Terms at any
                time, and your continued use constitutes acceptance of any
                changes.
              </p>
            </section>

            {/* Description of Services */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Description of Services
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                2.1 Platform Services
              </h3>
              <p className="text-gray-700 leading-relaxed">
                MedDirect provides a digital healthcare platform that
                facilitates:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
                <li>Online doctor appointment booking and management</li>
                <li>
                  Telemedicine consultations and virtual healthcare services
                </li>
                <li>Health assessment tools and medication guidance</li>
                <li>Secure patient-doctor communication</li>
                <li>
                  Integration with FDA databases for medication information
                </li>
                <li>Payment processing for healthcare services</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                2.2 Technology Platform
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Our platform uses modern web technologies including React,
                Node.js, MongoDB, and Firebase to provide secure, reliable
                healthcare services. We integrate with trusted third-party
                services for payments and authentication.
              </p>
            </section>

            {/* User Eligibility */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. User Eligibility and Registration
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                3.1 Age Requirements
              </h3>
              <p className="text-gray-700 leading-relaxed">
                You must be at least 18 years old to use MedDirect
                independently. Users under 18 may use our services only with
                parental or guardian consent and supervision.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                3.2 Account Registration
              </h3>
              <p className="text-gray-700 leading-relaxed">
                To access our services, you must create an account by providing
                accurate, complete information. You are responsible for:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
                <li>
                  Maintaining the confidentiality of your account credentials
                </li>
                <li>Keeping your account information current and accurate</li>
                <li>Notifying us immediately of any unauthorized access</li>
                <li>
                  Accepting responsibility for all activities under your account
                </li>
              </ul>
            </section>

            {/* Medical Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Medical Services and Disclaimers
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                4.1 Not Emergency Services
              </h3>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-red-700 font-medium">
                  IMPORTANT: MedDirect is not intended for medical emergencies.
                  In case of emergency, call 911 or go to your nearest emergency
                  room immediately.
                </p>
              </div>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                4.2 Healthcare Provider Relationships
              </h3>
              <p className="text-gray-700 leading-relaxed">
                MedDirect facilitates connections between patients and licensed
                healthcare providers. We do not:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
                <li>
                  Provide medical advice, diagnosis, or treatment directly
                </li>
                <li>
                  Practice medicine or replace your primary care physician
                </li>
                <li>
                  Guarantee the availability or quality of healthcare providers
                </li>
                <li>
                  Take responsibility for medical decisions made by healthcare
                  providers
                </li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                4.3 Medication Information
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Our medication guidance features use FDA databases and are for
                informational purposes only. Always consult with healthcare
                providers before making medication decisions. We are not
                responsible for medication-related adverse effects or drug
                interactions.
              </p>
            </section>

            {/* User Responsibilities */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. User Responsibilities and Conduct
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                5.1 Acceptable Use
              </h3>
              <p className="text-gray-700 leading-relaxed">You agree to:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
                <li>
                  Provide accurate health information to healthcare providers
                </li>
                <li>
                  Use the platform only for legitimate healthcare purposes
                </li>
                <li>Respect the privacy and confidentiality of other users</li>
                <li>Follow all applicable laws and regulations</li>
                <li>
                  Complete CAPTCHA verification when required for security
                </li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                5.2 Prohibited Activities
              </h3>
              <p className="text-gray-700 leading-relaxed">You may not:</p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
                <li>
                  Share false, misleading, or incomplete medical information
                </li>
                <li>
                  Attempt to circumvent security measures or access restrictions
                </li>
                <li>Use the platform for illegal activities or fraud</li>
                <li>
                  Harass, threaten, or abuse healthcare providers or other users
                </li>
                <li>
                  Attempt to reverse engineer or compromise our technology
                </li>
              </ul>
            </section>

            {/* Payment Terms */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Payment Terms
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                6.1 Payment Processing
              </h3>
              <p className="text-gray-700 leading-relaxed">
                We use secure third-party payment processors (Razorpay,
                Instamojo, Stripe) to handle transactions. By making payments,
                you agree to their respective terms and conditions.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                6.2 Fees and Billing
              </h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  Consultation fees are determined by individual healthcare
                  providers
                </li>
                <li>Platform service fees may apply to certain features</li>
                <li>
                  All fees are clearly displayed before payment confirmation
                </li>
                <li>
                  Payments are processed securely and receipts are provided
                  electronically
                </li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                6.3 Refunds and Cancellations
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Refund policies are subject to individual healthcare provider
                policies and applicable laws. Platform service fees are
                generally non-refundable except as required by law.
              </p>
            </section>

            {/* Privacy and Data Protection */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Privacy and Data Protection
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your privacy is important to us. Our collection, use, and
                protection of your personal and health information is governed
                by our Privacy Policy, which is incorporated into these Terms by
                reference. We comply with applicable healthcare privacy laws
                including HIPAA.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                7.1 Data Security
              </h3>
              <p className="text-gray-700 leading-relaxed">
                We implement industry-standard security measures including
                encryption, secure authentication, and access controls to
                protect your information. However, no system is 100% secure, and
                you use our services at your own risk.
              </p>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Intellectual Property Rights
              </h2>
              <p className="text-gray-700 leading-relaxed">
                MedDirect and its content, features, and functionality are owned
                by us or our licensors and are protected by copyright,
                trademark, and other intellectual property laws. You may not
                reproduce, distribute, or create derivative works without our
                written permission.
              </p>
            </section>

            {/* Service Availability */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Service Availability and Modifications
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                9.1 Platform Availability
              </h3>
              <p className="text-gray-700 leading-relaxed">
                We strive to maintain platform availability but cannot guarantee
                uninterrupted service. We may temporarily suspend services for
                maintenance, updates, or technical issues.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                9.2 Service Modifications
              </h3>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify, suspend, or discontinue any
                aspect of our services at any time with reasonable notice to
                users when possible.
              </p>
            </section>

            {/* Liability and Disclaimers */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. Limitation of Liability
              </h2>

              <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-4">
                <p className="text-yellow-700 font-medium">
                  TO THE MAXIMUM EXTENT PERMITTED BY LAW, MEDDIRECT SHALL NOT BE
                  LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL
                  DAMAGES ARISING FROM YOUR USE OF OUR SERVICES.
                </p>
              </div>

              <p className="text-gray-700 leading-relaxed">
                Our total liability to you for any claims arising from your use
                of our services shall not exceed the amount you paid to us in
                the 12 months preceding the claim.
              </p>
            </section>

            {/* Indemnification */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Indemnification
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify and hold MedDirect harmless from any
                claims, damages, or expenses arising from your use of our
                services, violation of these Terms, or infringement of any
                third-party rights.
              </p>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Governing Law and Dispute Resolution
              </h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms are governed by applicable healthcare laws and
                regulations. Any disputes will be resolved through binding
                arbitration, except for claims that may be brought in small
                claims court.
              </p>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                13. Termination
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Either party may terminate your account at any time. Upon
                termination, your right to use our services ceases immediately,
                though certain provisions of these Terms will survive
                termination.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                14. Contact Information
              </h2>
              <p className="text-gray-700 leading-relaxed">
                For questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> legal@meddirect.com
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> MedDirect Legal Department
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> 1-800-MED-LEGAL
                </p>
              </div>
            </section>

            {/* Acknowledgment */}
            <section className="mb-8">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Acknowledgment
                </h3>
                <p className="text-blue-800">
                  By using MedDirect, you acknowledge that you have read,
                  understood, and agree to be bound by these Terms and
                  Conditions and our Privacy Policy.
                </p>
              </div>
            </section>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            © 2025 MedDirect. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsAndConditions;
