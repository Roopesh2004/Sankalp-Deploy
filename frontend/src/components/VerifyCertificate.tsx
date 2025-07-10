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
    setError("");
    setVerificationResult(null);
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
      const response = await fetch(
        "https://sankalp-deploy-1.onrender.com/api/verify-certificate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );
      if (!response.ok) throw new Error("Network response was not ok");
      const result = await response.json();
      setVerificationResult(result.value === 1);
    } catch (err) {
      setError("Failed to verify certificate. Please try again.");
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
    <div className="w-full max-w-md relative z-10 px-2 sm:px-0">
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px);}
          to { opacity: 1; transform: translateY(0);}
        }
        .form-container {
          animation: slideInUp 0.5s ease-out forwards;
        }
        .input-group {
          opacity: 0;
          transform: translateY(10px);
        }
        .input-group-1 { animation: slideInUp 0.4s ease-out 0.2s forwards; }
        .input-group-2 { animation: slideInUp 0.4s ease-out 0.3s forwards; }
        .input-group-3 { animation: slideInUp 0.4s ease-out 0.4s forwards; }
        .button-group { animation: slideInUp 0.4s ease-out 0.5s forwards; }
        .icon-container {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .icon-container:hover {
          transform: scale(1.05);
          box-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
        }
        .btn-primary {
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.3s ease;
        }
        .btn-primary:hover {
          transform: scale(1.05);
          box-shadow: 0 0 25px rgba(124, 58, 237, 0.5);
        }
        .btn-primary:active {
          transform: scale(0.95);
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: rgba(255,255,255,0.2);
          transition: transform 0.5s ease;
        }
        .btn-primary:hover::before {
          transform: translateX(200%);
        }
        .feedback {
          animation: slideInUp 0.4s ease-out forwards;
        }
        @media (max-width: 640px) {
          .form-container { padding: 1.5rem !important; border-radius: 1rem !important; }
          .input-group input { font-size: 1rem !important; padding: 0.75rem 1rem !important; }
          .btn-primary { width: 100% !important; padding: 1rem 0 !important; font-size: 1rem !important; margin-bottom: 0.75rem;}
          .flex.items-center.justify-center.mb-8 { flex-direction: column !important; gap: 0.5rem;}
          h2 { font-size: 1.5rem !important; text-align: center;}
        }
        @media (max-width: 400px) {
          .form-container { padding: 1rem !important; }
          h2 { font-size: 1.2rem !important; }
        }
      `}</style>
      <form
        className="form-container bg-black/80 backdrop-blur-lg border border-gray-800 p-8 rounded-2xl shadow-xl"
        onSubmit={e => { e.preventDefault(); verifyCertificate(); }}
      >
        <div className="flex items-center justify-center mb-8 opacity-0" style={{ animation: 'slideInUp 0.5s ease-out 0.1s forwards' }}>
          <div className="bg-primary-900/30 p-3 rounded-full icon-container">
            <Shield className="w-6 h-6 text-primary-300" />
          </div>
          <h2 className="ml-3 text-2xl font-bold text-white">
            <span className="text-primary-400">Certificate <span className="text-white">Verification</span></span>
          </h2>
        </div>

        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg feedback">
            {error}
          </div>
        )}

        {verificationResult !== null && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg flex items-center gap-2 feedback ${
              verificationResult
                ? "bg-green-900/20 border border-green-800 text-green-400"
                : "bg-yellow-900/20 border border-yellow-800 text-yellow-400"
            }`}
          >
            {verificationResult ? (
              <>
                <CheckCircle className="w-6 h-6" />
                This certificate is genuine and valid.
              </>
            ) : (
              <>
                <XCircle className="w-6 h-6" />
                This certificate could not be verified or is invalid.
              </>
            )}
            <button
              type="button"
              onClick={resetForm}
              className="ml-auto text-primary-400 hover:text-primary-300 transition-colors underline"
            >
              Verify Another
            </button>
          </div>
        )}

        <div className="mb-5 input-group input-group-1">
          <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="holderName">
            Certificate Holder Name
          </label>
          <input
            className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 py-3 px-4 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
            id="holderName"
            name="holderName"
            type="text"
            placeholder="Enter holder's name"
            value={formData.holderName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-5 input-group input-group-2">
          <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="domainName">
            Domain Name
          </label>
          <input
            className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 py-3 px-4 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
            id="domainName"
            name="domainName"
            type="text"
            placeholder="Enter domain name"
            value={formData.domainName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="mb-6 input-group input-group-3">
          <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="issueDate">
            Issue Date
          </label>
          <input
            className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 py-3 px-4 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
            id="issueDate"
            name="issueDate"
            type="date"
            value={formData.issueDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="flex items-center justify-center mt-8 opacity-0 input-group button-group">
          <button
            className="bg-primary-600 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 btn-primary"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Verifying...
              </>
            ) : (
              <>
                Verify Certificate
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
