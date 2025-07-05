import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { UserPlus, ArrowRight } from "lucide-react";

interface RegisterFormProps {
  onLoginClick: () => void;
  reg: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onLoginClick,
  reg,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [otp, setOtp] = useState("");

  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const url =
      reg === "student"
        ? "https://sankalp-deploy-1.onrender.com/api/register"
        : "https://sankalp-deploy-1.onrender.com/api/employee_register";

    try {
      // Send data to backend API
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setSuccess(
        "OTP sent to your email. Please verify to complete registration."
      );
      setIsVerifying(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "https://sankalp-deploy-1.onrender.com/api/verify-registration",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: formData.email, otp, reg }),
        }
      );

      const data = await response.json();

      console.log(response);

      if (!response.ok) {
        throw new Error(data.message || "Verification failed");
      }

      // Call the auth context register function if needed
      register(formData);

      setSuccess("Registration successful!");
      setIsVerifying(false);

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
      });
      setOtp("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
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
        .input-group-3 { animation: slideInUp 0.4s ease-out 0.4s forwards; }
        .input-group-4 { animation: slideInUp 0.4s ease-out 0.5s forwards; }
        .button-group { animation: slideInUp 0.4s ease-out 0.6s forwards; }
        
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
          background: rgba(255, 255, 255, 0.3);
          transition: transform 0.5s ease;
        }
        
        .btn-primary:hover::before {
          transform: translateX(200%);
        }
        
        .btn-secondary {
          transition: transform 0.2s ease, border-color 0.3s ease, color 0.3s ease, box-shadow 0.3s ease;
        }
        
        .btn-secondary:hover {
          transform: scale(1.05);
          border-color: rgb(124, 58, 237);
          color: rgb(167, 139, 250);
          box-shadow: 0 0 15px rgba(124, 58, 237, 0.2);
        }
        
        .btn-secondary:active {
          transform: scale(0.95);
        }
        
        @keyframes arrowMove {
          0% { transform: translateX(0); }
          50% { transform: translateX(5px); }
          100% { transform: translateX(0); }
        }
        
        .arrow-animation {
          animation: arrowMove 1s infinite;
        }
      `}</style>

      {!isVerifying && (
        <form
          onSubmit={handleSubmit}
          className="form-container bg-black/80 backdrop-blur-lg border border-gray-800 p-8 rounded-2xl shadow-xl"
        >
          <div
            className="flex items-center justify-center mb-8 opacity-0"
            style={{ animation: "slideInUp 0.5s ease-out 0.1s forwards" }}
          >
            <div className="bg-primary-900/30 p-3 rounded-full icon-container">
              <UserPlus className="w-6 h-6 text-primary-300" />
            </div>
            <h2 className="ml-3 text-2xl font-bold text-white">
              <span className="text-primary-400">
                {reg === "student" ? "Student" : "Employee"}{" "}
                <span className="text-white">Registration</span>
              </span>
            </h2>
          </div>

          {error && (
            <div
              className="mb-6 bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg"
              style={{ animation: "slideInUp 0.4s ease-out forwards" }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              className="mb-6 bg-green-900/20 border border-green-800 text-green-400 px-4 py-3 rounded-lg"
              style={{ animation: "slideInUp 0.4s ease-out forwards" }}
            >
              {success}
            </div>
          )}

          <div className="mb-5 input-group input-group-1">
            <label
              className="block text-gray-300 text-sm font-medium mb-2"
              htmlFor="name"
            >
              Full Name
            </label>
            <input
              className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 py-3 px-4 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-5 input-group input-group-2">
            <label
              className="block text-gray-300 text-sm font-medium mb-2"
              htmlFor="email"
            >
              Email
            </label>
            <input
              className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 py-3 px-4 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-5 input-group input-group-3">
            <label
              className="block text-gray-300 text-sm font-medium mb-2"
              htmlFor="phone"
            >
              Phone Number
            </label>
            <input
              className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 py-3 px-4 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              required
            />
          </div>

          <div className="mb-6 input-group input-group-4">
            <label
              className="block text-gray-300 text-sm font-medium mb-2"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 py-3 px-4 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              required
            />
          </div>

          <div className="flex items-center justify-between mt-8 opacity-0 input-group button-group">
            <button
              className="bg-primary-600 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 btn-primary"
              type="submit"
              disabled={loading}
            >
              {loading ? "Registering..." : "Register"}
              <span className="arrow-animation">
                <ArrowRight size={18} />
              </span>
            </button>

            <button
              type="button"
              onClick={onLoginClick}
              className="border-2 border-gray-700 text-gray-300 px-5 py-2 rounded-full font-medium btn-secondary"
            >
              Back to Login
            </button>
          </div>
        </form>
      )}

      {isVerifying && (
        <form onSubmit={handleVerifyOTP} className="mt-4">
          <div className="mb-4">
            <label
              htmlFor="otp"
              className="block text-sm font-medium uppercase bg-white text-gray-700 p-4 mb-5"
            >
              Enter OTP sent to your email
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="text-black mt-1 block w-full rounded-md border-gray-300 p-4 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}
    </div>
  );
};
