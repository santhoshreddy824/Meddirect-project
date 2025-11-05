import { useState } from 'react';
import { X, Shield, Eye, Lock, Users, FileText, Phone } from 'lucide-react';

const PrivacyPolicy = ({ isOpen, onClose }) => {
  const [activeSection, setActiveSection] = useState('overview');

  if (!isOpen) return null;

  const sections = [
    { id: 'overview', title: 'Overview', icon: Shield },
    { id: 'collection', title: 'Information We Collect', icon: FileText },
    { id: 'usage', title: 'How We Use Your Information', icon: Eye },
    { id: 'sharing', title: 'Information Sharing', icon: Users },
    { id: 'security', title: 'Data Security', icon: Lock },
    { id: 'contact', title: 'Contact Us', icon: Phone }
  ];

  const sectionContent = {
    overview: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Privacy Policy Overview</h3>
        <p className="text-gray-600 leading-relaxed">
          At MedDirect, we are committed to protecting your privacy and ensuring the security of your personal information. 
          This Privacy Policy explains how we collect, use, and safeguard your information when you use our healthcare platform.
        </p>
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <p className="text-blue-800">
            <strong>Last Updated:</strong> October 22, 2025
          </p>
          <p className="text-blue-800 mt-2">
            <strong>Effective Date:</strong> October 22, 2025
          </p>
        </div>
        <p className="text-gray-600">
          By using MedDirect, you consent to the practices described in this Privacy Policy. 
          We encourage you to read this policy carefully to understand how we handle your information.
        </p>
      </div>
    ),
    collection: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Information We Collect</h3>
        <div className="space-y-3">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Personal Information</h4>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Name, email address, and phone number</li>
              <li>Date of birth and gender</li>
              <li>Address and location information</li>
              <li>Profile picture (optional)</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Health Information</h4>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Medical history and symptoms</li>
              <li>Appointment details and preferences</li>
              <li>Prescription and medication information</li>
              <li>Insurance information (if provided)</li>
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Technical Information</h4>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>IP address and device information</li>
              <li>Browser type and version</li>
              <li>Usage patterns and preferences</li>
              <li>Cookies and similar technologies</li>
            </ul>
          </div>
        </div>
      </div>
    ),
    usage: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">How We Use Your Information</h3>
        <div className="grid gap-4">
          <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <h4 className="font-semibold text-green-800 mb-2">Service Provision</h4>
            <p className="text-green-700">
              We use your information to provide healthcare services, book appointments, 
              and connect you with qualified healthcare professionals.
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
            <h4 className="font-semibold text-blue-800 mb-2">Communication</h4>
            <p className="text-blue-700">
              To send appointment reminders, health tips, service updates, 
              and respond to your inquiries.
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
            <h4 className="font-semibold text-purple-800 mb-2">Improvement</h4>
            <p className="text-purple-700">
              To analyze usage patterns, improve our services, and develop new features 
              that better serve your healthcare needs.
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
            <h4 className="font-semibold text-orange-800 mb-2">Legal Compliance</h4>
            <p className="text-orange-700">
              To comply with healthcare regulations, legal requirements, 
              and protect our users and platform.
            </p>
          </div>
        </div>
      </div>
    ),
    sharing: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Information Sharing</h3>
        <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500 mb-4">
          <p className="text-red-800 font-semibold">
            We do not sell, rent, or trade your personal information to third parties.
          </p>
        </div>
        <p className="text-gray-600 mb-4">
          We may share your information only in the following circumstances:
        </p>
        <div className="space-y-3">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Healthcare Providers</h4>
            <p className="text-gray-600">
              With doctors and healthcare professionals to provide you with medical services 
              and consultations through our platform.
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Service Providers</h4>
            <p className="text-gray-600">
              With trusted third-party service providers who help us operate our platform, 
              such as payment processors and cloud storage providers.
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">Legal Requirements</h4>
            <p className="text-gray-600">
              When required by law, court order, or to protect the rights, property, 
              or safety of MedDirect, our users, or others.
            </p>
          </div>
        </div>
      </div>
    ),
    security: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Data Security</h3>
        <p className="text-gray-600">
          We implement industry-standard security measures to protect your personal information:
        </p>
        <div className="grid gap-4 mt-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-semibold text-green-800 flex items-center mb-2">
              <Lock className="w-5 h-5 mr-2" />
              Encryption
            </h4>
            <p className="text-green-700">
              All data is encrypted in transit and at rest using advanced encryption standards.
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 flex items-center mb-2">
              <Shield className="w-5 h-5 mr-2" />
              Access Controls
            </h4>
            <p className="text-blue-700">
              Strict access controls ensure only authorized personnel can access your data.
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-semibold text-purple-800 flex items-center mb-2">
              <Eye className="w-5 h-5 mr-2" />
              Monitoring
            </h4>
            <p className="text-purple-700">
              24/7 monitoring and regular security audits to detect and prevent threats.
            </p>
          </div>
        </div>
        <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500 mt-4">
          <p className="text-yellow-800">
            <strong>Your Role:</strong> Please keep your account credentials secure and notify us 
            immediately if you suspect any unauthorized access to your account.
          </p>
        </div>
      </div>
    ),
    contact: (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-800">Contact Us</h3>
        <p className="text-gray-600">
          If you have any questions about this Privacy Policy or our privacy practices, 
          please contact us:
        </p>
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="space-y-3">
            <div className="flex items-center">
              <Phone className="w-5 h-5 text-blue-600 mr-3" />
              <span className="text-gray-700">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center">
              <svg className="w-5 h-5 text-blue-600 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <span className="text-gray-700">privacy@meddirect.com</span>
            </div>
            <div className="flex items-start">
              <svg className="w-5 h-5 text-blue-600 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-gray-700">MedDirect Privacy Office</p>
                <p className="text-gray-600 text-sm">123 Healthcare Ave, Suite 100</p>
                <p className="text-gray-600 text-sm">Medical City, MC 12345</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <p className="text-blue-800">
            <strong>Response Time:</strong> We will respond to your privacy inquiries within 48 hours 
            during business days.
          </p>
        </div>
      </div>
    )
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex overflow-hidden">
        {/* Sidebar */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-800">Privacy Policy</h2>
          </div>
          <nav className="space-y-2">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors flex items-center ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  <span className="text-sm font-medium">{section.title}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Shield className="w-6 h-6 text-blue-600 mr-2" />
              <h1 className="text-2xl font-bold text-gray-800">MedDirect Privacy Policy</h1>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          <div className="prose max-w-none">
            {sectionContent[activeSection]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
