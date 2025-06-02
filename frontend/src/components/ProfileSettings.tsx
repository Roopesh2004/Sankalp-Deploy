import React, { useState } from 'react';
import { User } from '../types';
import { Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface ProfileSettingsProps {
  user: User;
  onSave: (userData: Partial<User>) => void;
  onClose: () => void;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: user.name || '',
    email: user.email || '',
    phone: user.phone || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      // Call API to update user data
      const response = await fetch('https://sankalp-deploy-1.onrender.com/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalEmail: user.email, // Used to identify the user
          ...formData
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      
      setSuccess('Profile updated successfully');
      
      // Call the onSave callback to update the UI
      onSave(formData);
      
      // Close the form after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm h-screen flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        transition={{ duration: 0.2 }}
        className="bg-gray-900 border border-gray-700/50 rounded-2xl shadow-2xl shadow-black/50 p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-2xl font-bold text-white">Profile Settings</h2>
            <p className="text-gray-400 text-sm mt-1">Update your personal information</p>
          </motion.div>
          <motion.button
            whileHover={{ scale: 1.1, backgroundColor: 'rgba(75, 85, 99, 0.5)' }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-full"
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Status Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 backdrop-blur-sm"
          >
            <div className="flex items-center">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              {error}
            </div>
          </motion.div>
        )}
        
        {success && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl mb-6 backdrop-blur-sm"
          >
            <div className="flex items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
              {success}
            </div>
          </motion.div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="block text-gray-200 text-sm font-semibold mb-3" htmlFor="name">
              Full Name
            </label>
            <input
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="block text-gray-200 text-sm font-semibold mb-3" htmlFor="email">
              Email Address
            </label>
            <input
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
              id="email"
              type="email"
              placeholder="Enter your email address"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="block text-gray-200 text-sm font-semibold mb-3" htmlFor="phone">
              Phone Number
            </label>
            <input
              className="w-full bg-gray-800/50 border border-gray-600/50 rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 backdrop-blur-sm"
              id="phone"
              type="tel"
              placeholder="Enter your phone number"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </motion.div>

          {/* Action Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex gap-3 pt-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700/50 hover:bg-gray-600/50 text-gray-300 hover:text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 border border-gray-600/30"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)' }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600 disabled:to-gray-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/25 transition-all duration-200 disabled:shadow-none disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </motion.button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileSettings;