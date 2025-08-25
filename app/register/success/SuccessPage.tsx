"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CheckCircle,
  Home,
  Phone,
  Mail,
  Calendar,
  Download,
  Share2,
  ArrowRight,
  Copy,
} from "lucide-react";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const registrationId = searchParams.get("id");
  const projectId = searchParams.get("projectId"); // Get project ID from URL
  const [registrationData, setRegistrationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (registrationId) {
      fetchRegistrationData();
    }
  }, [registrationId]);

  const fetchRegistrationData = async () => {
    try {
      const response = await fetch(`/api/registration/${registrationId}`);
      if (response.ok) {
        const data = await response.json();
        setRegistrationData(data);
      }
    } catch (error) {
      console.error("Error fetching registration data:", error);
    } finally {
      setLoading(false);
    }
  };

  const copyProjectId = async () => {
    try {
      await navigator.clipboard.writeText(projectId || registrationData?.projectId || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy project ID');
    }
  };

  const generatePDF = () => {
    console.log("Generating PDF...");
  };

  const shareRegistration = () => {
    const projectIdToShare = projectId || registrationData?.projectId;
    if (navigator.share) {
      navigator.share({
        title: "HIGBEC Project Registration",
        text: `I've successfully registered my project "${registrationData?.projectTitle}" with HIGBEC! Project ID: ${projectIdToShare}`,
        url: window.location.href,
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading registration details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Registration <span className="text-gradient">Successful!</span>
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Congratulations! Your project has been successfully registered
              with HIGBEC. We'll contact you soon to discuss the next steps.
            </p>

            {/* Project ID Display - Prominent */}
            {(projectId || registrationData?.projectId) && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mt-6 max-w-md mx-auto">
                <h3 className="text-lg font-semibold text-blue-800 mb-2">Your Project ID</h3>
                <div className="flex items-center justify-center space-x-3">
                  <span className="text-3xl font-bold text-blue-600 font-mono">
                    {projectId || registrationData?.projectId}
                  </span>
                  <button
                    onClick={copyProjectId}
                    className="p-2 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                    title="Copy Project ID"
                  >
                    {copied ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Copy className="w-5 h-5 text-blue-500" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-blue-600 mt-2">
                  {copied ? 'Copied to clipboard!' : 'Click to copy'}
                </p>
              </div>
            )}
          </motion.div>

          {/* Registration Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                Registration Details
              </h2>
              <div className="flex space-x-3">
                <button
                  onClick={generatePDF}
                  className="btn-secondary text-sm py-2 px-4 flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </button>
                <button
                  onClick={shareRegistration}
                  className="btn-secondary text-sm py-2 px-4 flex items-center"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </button>
              </div>
            </div>

            {registrationData && (
              <div className="grid md:grid-cols-2 gap-8">
                {/* Personal Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-600">
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <strong className="w-32 text-gray-700">Name:</strong>
                      <span className="text-gray-800">
                        {registrationData.fullName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="w-32 text-gray-700">Email:</strong>
                      <span className="text-gray-800">
                        {registrationData.email}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="w-32 text-gray-700">Phone:</strong>
                      <span className="text-gray-800">
                        {registrationData.phoneNumber}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="w-32 text-gray-700">Project ID:</strong>
                      <span className="text-blue-600 font-mono font-semibold">
                        {projectId || registrationData?.projectId}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="w-32 text-gray-700">
                        Registration ID:
                      </strong>
                      <span className="text-gray-600 font-mono">
                        {registrationId}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Academic Information */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-blue-600">
                    Academic Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <strong className="w-32 text-gray-700">College:</strong>
                      <span className="text-gray-800">
                        {registrationData.collegeName}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="w-32 text-gray-700">Branch:</strong>
                      <span className="text-gray-800">
                        {registrationData.branch}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="w-32 text-gray-700">Semester:</strong>
                      <span className="text-gray-800">
                        {registrationData.semester}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="w-32 text-gray-700">
                        Batch Type:
                      </strong>
                      <span className="text-gray-800">
                        {registrationData.batchType}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Project Information */}
                <div className="md:col-span-2">
                  <h3 className="text-lg font-semibold mb-4 text-blue-600">
                    Project Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <strong className="w-40 text-gray-700">
                        Project Title:
                      </strong>
                      <span className="text-gray-800 flex-1">
                        {registrationData.projectTitle}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <strong className="w-40 text-gray-700">
                        Registration Type:
                      </strong>
                      <span className="text-gray-800">
                        {registrationData.registrationType}
                      </span>
                    </div>

                    {registrationData.groupMembers &&
                      registrationData.groupMembers.length > 0 && (
                        <div>
                          <strong className="text-gray-700">
                            Group Members:
                          </strong>
                          <div className="mt-2 space-y-2">
                            {registrationData.groupMembers.map(
                              (member: any, index: number) => (
                                <div
                                  key={index}
                                  className="bg-gray-50 p-3 rounded-lg"
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium">
                                      {member.name}
                                    </span>
                                    <span className="text-gray-600">
                                      {member.phoneNumber}
                                    </span>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="bg-blue-50 rounded-2xl p-8 mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              What Happens Next?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2">Review & Verification</h3>
                <p className="text-sm text-gray-600">
                  Our team will review your registration and verify the payment details
                  within 24 hours.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2">Initial Consultation</h3>
                <p className="text-sm text-gray-600">
                  We'll schedule a consultation call to discuss your project
                  requirements and assign a mentor.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2">Project Kickoff</h3>
                <p className="text-sm text-gray-600">
                  Begin your project development journey with dedicated mentor
                  support and resources.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
              Need Help?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="font-semibold mb-2">Call Us</h3>
                <p className="text-blue-600">+91 7994572595</p>
                <p className="text-sm text-gray-600">Mon-Fri, 9 AM - 6 PM</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="font-semibold mb-2">Email Us</h3>
                <p className="text-blue-600">contactus.higbec@gmail.com</p>
                <p className="text-sm text-gray-600">
                  We respond within 24 hours
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="font-semibold mb-2">Schedule Meeting</h3>
                <p className="text-blue-600">Book a consultation</p>
                <p className="text-sm text-gray-600">Free 30-min session</p>
              </div>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-center space-y-4"
          >
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Link
                href="/"
                className="btn-primary flex items-center justify-center"
              >
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </Link>
              <Link
                href="/register"
                className="btn-secondary flex items-center justify-center"
              >
                Register Another Project
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Please save your Project ID:{" "}
                <span className="font-mono text-yellow-900 font-bold">
                  {projectId || registrationData?.projectId}
                </span>
              </p>
              <p className="text-xs text-yellow-700 mt-1">
                You'll need this ID for all future communications about your project.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}