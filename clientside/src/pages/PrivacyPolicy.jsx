import React from "react";
import { useNavigate } from "react-router-dom";
import { assets } from "../assets/assets";

const PrivacyPolicy = () => {
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
            Privacy Policy
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
                1. Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                MedDirect ("we," "our," or "us") is committed to protecting your
                privacy and ensuring the security of your personal health
                information. This Privacy Policy explains how we collect, use,
                disclose, and safeguard your information when you use our
                healthcare appointment booking and telemedicine platform.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                By using MedDirect, you agree to the collection and use of
                information in accordance with this policy. We comply with
                applicable healthcare privacy laws, including HIPAA (Health
                Insurance Portability and Accountability Act) where applicable.
              </p>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                2. Information We Collect
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                2.1 Personal Information
              </h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Full name, email address, and phone number</li>
                <li>Date of birth and gender</li>
                <li>Address and location information</li>
                <li>Government-issued ID information for verification</li>
                <li>Insurance information and billing details</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                2.2 Health Information
              </h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Medical history and current health conditions</li>
                <li>Symptoms and health assessment responses</li>
                <li>Prescription and medication information</li>
                <li>Appointment notes and consultation records</li>
                <li>Test results and medical reports shared with doctors</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                2.3 Technical Information
              </h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>IP address and device information</li>
                <li>Browser type and operating system</li>
                <li>Usage patterns and platform interaction data</li>
                <li>Firebase authentication tokens and session data</li>
              </ul>
            </section>

            {/* How We Use Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                3. How We Use Your Information
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                3.1 Healthcare Services
              </h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Facilitating doctor appointments and consultations</li>
                <li>Providing medication guidance and FDA drug information</li>
                <li>Conducting health assessments and risk evaluations</li>
                <li>
                  Enabling secure communication between patients and doctors
                </li>
                <li>Processing payments for medical services</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                3.2 Platform Operations
              </h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>Creating and managing user accounts</li>
                <li>Authenticating users and preventing fraud</li>
                <li>Improving platform functionality and user experience</li>
                <li>Sending appointment reminders and health notifications</li>
                <li>Providing customer support and technical assistance</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                4. Information Sharing and Disclosure
              </h2>

              <h3 className="text-xl font-medium text-gray-800 mb-3">
                4.1 Healthcare Providers
              </h3>
              <p className="text-gray-700 leading-relaxed">
                We share relevant health information with licensed healthcare
                providers on our platform to facilitate your medical care. This
                includes appointment details, medical history, and consultation
                notes necessary for treatment.
              </p>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                4.2 Service Providers
              </h3>
              <ul className="list-disc pl-6 text-gray-700 space-y-2">
                <li>
                  Payment processors (Razorpay, Instamojo, Stripe) for
                  transaction handling
                </li>
                <li>Cloud storage providers for secure data storage</li>
                <li>Authentication services (Firebase) for account security</li>
                <li>FDA API services for medication information</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-3 mt-6">
                4.3 Legal Requirements
              </h3>
              <p className="text-gray-700 leading-relaxed">
                We may disclose information when required by law, court order,
                or government regulation, or to protect the rights, property, or
                safety of MedDirect, our users, or others.
              </p>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                5. Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We implement industry-standard security measures to protect your
                information:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
                <li>End-to-end encryption for data transmission</li>
                <li>Secure authentication using Firebase and JWT tokens</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>
                  Access controls limiting data access to authorized personnel
                </li>
                <li>Secure cloud infrastructure with redundant backups</li>
                <li>CAPTCHA protection against automated attacks</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                6. Your Rights and Choices
              </h2>
              <p className="text-gray-700 leading-relaxed">
                You have the right to:
              </p>
              <ul className="list-disc pl-6 text-gray-700 space-y-2 mt-4">
                <li>Access and review your personal and health information</li>
                <li>Request corrections to inaccurate information</li>
                <li>Request deletion of your account and associated data</li>
                <li>Opt out of non-essential communications</li>
                <li>Download a copy of your data in a portable format</li>
                <li>Restrict certain uses of your information</li>
              </ul>
            </section>

            {/* Cookies and Tracking */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                7. Cookies and Tracking Technologies
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We use cookies and similar technologies to enhance your
                experience, maintain user sessions, and analyze platform usage.
                You can control cookie settings through your browser, though
                this may affect platform functionality.
              </p>
            </section>

            {/* Third-Party Services */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                8. Third-Party Services
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Our platform integrates with third-party services including
                Google Firebase for authentication, FDA API for medication data,
                and payment processors. These services have their own privacy
                policies governing their use of your information.
              </p>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                9. Children's Privacy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                MedDirect is not intended for users under 18 years of age. We do
                not knowingly collect personal information from children. If you
                believe we have collected information from a minor, please
                contact us immediately.
              </p>
            </section>

            {/* International Users */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                10. International Data Transfers
              </h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in
                countries other than your own. We ensure appropriate safeguards
                are in place to protect your information during international
                transfers.
              </p>
            </section>

            {/* Changes to Policy */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                11. Changes to This Privacy Policy
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy periodically. We will notify
                you of significant changes through the platform or via email.
                Your continued use of MedDirect after changes constitutes
                acceptance of the updated policy.
              </p>
            </section>

            {/* Contact Information */}
            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                12. Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about this Privacy Policy or our privacy
                practices, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mt-4">
                <p className="text-gray-700">
                  <strong>Email:</strong> privacy@meddirect.com
                </p>
                <p className="text-gray-700">
                  <strong>Address:</strong> MedDirect Privacy Office
                </p>
                <p className="text-gray-700">
                  <strong>Phone:</strong> 1-800-MED-DIRECT
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

export default PrivacyPolicy;
