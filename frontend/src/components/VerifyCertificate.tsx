import React, { useState } from "react";
import { CheckCircle, XCircle, Loader2, Shield } from "lucide-react";

export default function CertificateVerifier() {
  const [formData, setFormData] = useState({
    holderName: "",
    domainName: "",
    issueDate: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const verifyCertificate = async () => {
    // Reset previous results
    setError("");
    setVerificationResult(null);

    // Validate inputs
    if (
      !formData.holderName.trim() ||
      !formData.domainName.trim() ||
      !formData.issueDate.trim()
    ) {
      setError("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      // Replace this URL with your actual API endpoint
      const response = await fetch(
        "https://sankalp-deploy-1.onrender.com/api/verify-certificate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();

      // Assuming the API returns { verification: 1 } or { verification: 0 }
      setVerificationResult(result.value === 1);
    } catch (err) {
      setError("Failed to verify certificate. Please try again.");
      console.error("Verification error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      holderName: "",
      domainName: "",
      issueDate: "",
    });
    setVerificationResult(null);
    setError("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <Shield className="mx-auto h-12 w-12 text-blue-600 mb-2" />
            <h1 className="text-2xl font-bold text-gray-900">
              Certificate Verification
            </h1>
            <p className="text-gray-600 mt-1">
              Verify the authenticity of your certificate
            </p>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="holderName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Certificate Holder Name
              </label>
              <input
                type="text"
                id="holderName"
                name="holderName"
                value={formData.holderName}
                onChange={handleInputChange}
                placeholder="Enter holder's name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="domainName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Holder's Domain
              </label>
              <input
                type="text"
                id="domainName"
                name="domainName"
                value={formData.domainName}
                onChange={handleInputChange}
                placeholder="Enter holder's domain"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="issueDate"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Issue Date
              </label>
              <input
                type="date"
                id="issueDate"
                name="issueDate"
                value={formData.issueDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Verification Result */}
          {verificationResult !== null && (
            <div
              className={`mt-4 p-4 rounded-lg border-2 ${
                verificationResult
                  ? "bg-green-50 border-green-200"
                  : "bg-red-50 border-red-200"
              }`}
            >
              <div className="flex items-center">
                {verificationResult ? (
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 mr-2" />
                )}
                <div>
                  <h3
                    className={`font-semibold ${
                      verificationResult ? "text-green-800" : "text-red-800"
                    }`}
                  >
                    {verificationResult
                      ? "Certificate Verified"
                      : "Certificate Not Verified"}
                  </h3>
                  <p
                    className={`text-sm ${
                      verificationResult ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {verificationResult
                      ? "This certificate is genuine and valid."
                      : "This certificate could not be verified or is invalid."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={verifyCertificate}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Verifying...
                </>
              ) : (
                "Verify Certificate"
              )}
            </button>

            <button
              onClick={resetForm}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Reset
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
          <h3 className="font-medium text-gray-900 mb-2">How to use:</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>
              • Enter the certificate ID exactly as shown on your certificate
            </li>
            <li>• Provide the full name of the certificate holder</li>
            <li>• Select the date when the certificate was issued</li>
            <li>• Click "Verify Certificate" to check authenticity</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
