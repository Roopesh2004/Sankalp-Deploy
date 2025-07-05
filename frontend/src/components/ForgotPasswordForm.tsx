import React, { useState } from "react";
import { KeyRound, ArrowLeft, Mail, Lock, CheckCircle } from "lucide-react";

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin,
}) => {
  const [step, setStep] = useState<"email" | "otp" | "reset" | "success">(
    "email"
  );
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://sankalp-deploy-1.onrender.com/api/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send OTP");
      }

      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "https://sankalp-deploy-1.onrender.com/api/verify-otp",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid OTP");
      }

      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        "https://sankalp-deploy-1.onrender.com/api/reset-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to reset password");
      }

      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md relative z-10">
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
        .button-group { animation: slideInUp 0.4s ease-out 0.4s forwards; }
      `}</style>

      <div className="form-container bg-black/80 backdrop-blur-lg border border-gray-800 p-8 rounded-2xl shadow-xl">
        <div
          className="flex items-center justify-between mb-8 opacity-0"
          style={{ animation: "slideInUp 0.5s ease-out 0.1s forwards" }}
        >
          <button
            onClick={onBackToLogin}
            className="text-gray-400 hover:text-white transition-colors flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </button>

          <div className="flex items-center">
            <div className="bg-primary-900/30 p-3 rounded-full">
              {step === "email" && (
                <Mail className="w-5 h-5 text-primary-300" />
              )}
              {step === "otp" && (
                <KeyRound className="w-5 h-5 text-primary-300" />
              )}
              {(step === "reset" || step === "success") && (
                <Lock className="w-5 h-5 text-primary-300" />
              )}
            </div>
            <h2 className="ml-3 text-xl font-bold text-white">
              <span className="text-primary-400">
                {step === "email" && "Forgot Password"}
                {step === "otp" && "Verify OTP"}
                {step === "reset" && "Reset Password"}
                {step === "success" && "Success"}
              </span>
            </h2>
          </div>
        </div>

        {error && (
          <div
            className="mb-6 bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg"
            style={{ animation: "slideInUp 0.4s ease-out forwards" }}
          >
            {error}
          </div>
        )}

        {step === "email" && (
          <form onSubmit={handleRequestOTP}>
            <div className="mb-5 input-group input-group-1">
              <label
                className="block text-gray-300 text-sm font-medium mb-2"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 py-3 px-4 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="mt-6 opacity-0 button-group">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-500 hover:to-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all duration-300 btn-primary"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </div>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOTP}>
            <div className="mb-5 input-group input-group-1">
              <label
                className="block text-gray-300 text-sm font-medium mb-2"
                htmlFor="otp"
              >
                Enter OTP
              </label>
              <input
                className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 py-3 px-4 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                id="otp"
                type="text"
                placeholder="Enter the OTP sent to your email"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
              />
              <p className="mt-2 text-sm text-gray-400">
                We've sent a one-time password to {email}
              </p>
            </div>

            <div className="mt-6 opacity-0 button-group">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-500 hover:to-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all duration-300 btn-primary"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword}>
            <div className="mb-5 input-group input-group-1">
              <label
                className="block text-gray-300 text-sm font-medium mb-2"
                htmlFor="password"
              >
                New Password
              </label>
              <input
                className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 py-3 px-4 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                id="password"
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="mb-5 input-group input-group-2">
              <label
                className="block text-gray-300 text-sm font-medium mb-2"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 py-3 px-4 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <div className="mt-6 opacity-0 button-group">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-500 hover:to-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all duration-300 btn-primary"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}

        {step === "success" && (
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Password Reset Successful
            </h3>
            <p className="text-gray-400 mb-6">
              Your password has been reset successfully.
            </p>
            <button
              onClick={onBackToLogin}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-500 hover:to-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-opacity-50 transition-all duration-300 btn-primary"
            >
              Back to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
