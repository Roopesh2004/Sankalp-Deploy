import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogIn, ArrowRight, Eye, EyeOff } from 'lucide-react';

interface LoginFormProps {
  type: 'student' | 'admin' | 'employee';
  onRegisterClick?: () => void;
  onForgotPassword?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  type,
  onRegisterClick,
  onForgotPassword,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const { login, loading, error, employee_login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      if (type === 'student' || type === 'admin') {
        await login(email, password);
      } else if (type === 'employee') {
        await employee_login(email, password);
      }
      // On success, redirect or perform any action needed
    } catch (err) {
      setFormError((err as Error).message || 'Login failed. Please try again.');
    }
  };

  // Helper to get the correct label
  const getTypeLabel = () => {
    if (type === 'admin') return 'Admin';
    if (type === 'employee') return 'Employee';
    return 'Student';
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

      <form
        onSubmit={handleSubmit}
        className="form-container bg-black/80 backdrop-blur-lg border border-gray-800 p-8 rounded-2xl shadow-xl"
      >
        <div
          className="flex items-center justify-center mb-8 opacity-0"
          style={{ animation: 'slideInUp 0.5s ease-out 0.1s forwards' }}
        >
          <div className="bg-primary-900/30 p-3 rounded-full icon-container">
            <LogIn className="w-6 h-6 text-primary-300" />
          </div>
          <h2 className="ml-3 text-2xl font-bold text-white">
            <span className="text-primary-400">
              {getTypeLabel()} <span className="text-white">Login</span>
            </span>
          </h2>
        </div>

        {(formError === 'Invalid email or password' ||
          error === 'Invalid email or password') && (
          <div
            className="mb-6 bg-red-900/20 border border-red-800 text-red-400 px-4 py-3 rounded-lg"
            style={{ animation: 'slideInUp 0.4s ease-out forwards' }}
          >
            {formError || error}
          </div>
        )}

        <div className="mb-5 input-group input-group-1">
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="mb-6 input-group input-group-2">
          <label
            className="block text-gray-300 text-sm font-medium mb-2"
            htmlFor="password"
          >
            Password
          </label>
          <div className="relative">
            <input
              className="w-full bg-gray-900/50 border border-gray-700 text-gray-200 py-3 px-4 pr-12 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors"
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {onForgotPassword && (
          <div
            className="flex justify-end mb-4 opacity-0"
            style={{ animation: 'slideInUp 0.4s ease-out 0.3s forwards' }}
          >
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-primary-400 hover:text-primary-300 text-sm transition-colors"
            >
              Forgot Password?
            </button>
          </div>
        )}

        <div className="flex items-center justify-between mt-8 opacity-0 input-group button-group">
          <button
            className="bg-primary-600 text-white px-6 py-3 rounded-full font-medium flex items-center justify-center gap-2 btn-primary"
            type="submit"
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
            <span className="arrow-animation">
              <ArrowRight size={18} />
            </span>
          </button>

          {(type === 'student' || type === 'employee') && onRegisterClick && (
            <button
              type="button"
              onClick={onRegisterClick}
              className="border-2 border-gray-700 text-gray-300 px-5 py-2 rounded-full font-medium btn-secondary"
            >
              Register
            </button>
          )}
        </div>
      </form>
    </div>
  );
};