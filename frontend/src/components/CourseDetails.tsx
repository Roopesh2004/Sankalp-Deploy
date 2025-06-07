import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Award, QrCode, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface Material {
  id?: number;
  content: string;
}

interface Module {
  id: number;
  title: string;
  description?: string;
  day: number;
  videoUrl?: string;
  materials: string[];
}

interface CourseDetailsProps {
  course: {
    id: number;
    title: string;
    description: string;
    duration: string;
    level: string;
    price: number;
    image?: string;
    modules: Module[];
  };
  onBack: () => void;
  email?: string;
  name?: string;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({ course, onBack, email, name }) => {
  const { user } = useAuth();
  const [activeModule, setActiveModule] = useState<number | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [referalId, setReferalId] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [registrationStatus, setRegistrationStatus] = useState<'not_registered' | 'pending' | 'approved' | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const [videoToken, setVideoToken] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);

  // Function to get video token
  const getVideoToken = async (moduleId: number) => {
    if (!email) return null;
    
    setIsLoadingVideo(true);
    try {
      const response = await fetch('https://sankalp-deploy-1.onrender.com/api/generate-video-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, moduleId }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get video access');
      }
      
      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error('Error getting video token:', error);
      return null;
    } finally {
      setIsLoadingVideo(false);
    }
  };

  // Update the video selection handler to open the video directly
  const handleVideoSelect = async (moduleId: number) => {
    setSelectedVideo(moduleId);
    setIsLoadingVideo(true);
    
    try {
      const token = await getVideoToken(moduleId);
      if (token) {
        // Open the secure video player in a new tab
        window.open(`https://sankalp-deploy-1.onrender.com/api/secure-video/${moduleId}?token=${token}`, '_blank');
      } else {
        console.error('Failed to get video token');
      }
    } catch (error) {
      console.error('Error playing video:', error);
    } finally {
      setIsLoadingVideo(false);
    }
  };

  // Check if user has already registered or has been approved for this course
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!email) {
        setRegistrationStatus('not_registered');
        setIsCheckingStatus(false);
        return;
      }
      
      setIsCheckingStatus(true);
      
      try {
        // Check pending status
        const pendingResponse = await fetch('https://sankalp-deploy-1.onrender.com/api/pending-check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, courseId: course.id }),
        });
        
        const pendingData = await pendingResponse.json();
        
        if (pendingData.value === 1) {
          setRegistrationStatus('approved');
          setIsCheckingStatus(false);
          return;
        } else if (pendingData.value === 0) {
          setRegistrationStatus('pending');
          setIsCheckingStatus(false);
          return;
        }
        
        // If not in pending, check if already has access
        const accessResponse = await fetch('https://sankalp-deploy-1.onrender.com/api/check-course-access', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, courseId: course.id }),
        });
        
        const accessData = await accessResponse.json();
        
        if (accessData.hasAccess) {
          setRegistrationStatus('approved');
        } else {
          setRegistrationStatus('not_registered');
        }
      } catch (error) {
        console.error('Error checking registration status:', error);
        setRegistrationStatus('not_registered');
      } finally {
        setIsCheckingStatus(false);
      }
    };
    
    checkRegistrationStatus();
  }, [email, course.id]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionId.trim()) {
      setErrorMessage('Transaction ID is required');
      return;
    }
    
    if (!acceptedTerms) {
      setErrorMessage('Please accept the terms and conditions to proceed');
      return;
    }
    
    setIsSubmitting(true);
    setErrorMessage('');
    
    try {
      const response = await fetch('https://sankalp-deploy-1.onrender.com/api/pending', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name || user?.name || 'Unknown User',
          email: email,
          transid: transactionId,
          refid: referalId,
          courseName: course.title,
          amt: course.price,
          courseId: course.id
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }
      
      setRegistrationStatus('pending');
    } catch (error) {
      console.error('Registration error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Failed to register for the course. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render different content based on registration status
  const renderContent = () => {
    switch (registrationStatus) {
      case 'approved':
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-primary-400">Course Modules</h3>
            <div className="space-y-4">
              {course.modules.map((module) => (
                <div key={module.id} className="bg-dark-200 rounded-lg overflow-hidden">
                  <motion.button
                    whileHover={{ backgroundColor: 'rgba(124, 58, 237, 0.1)' }}
                    onClick={() => setActiveModule(activeModule === module.id ? null : module.id)}
                    className="w-full p-4 flex justify-between items-center text-left"
                  >
                    <div>
                      <div className="flex items-center">
                        <span className="text-primary-400 font-medium">Day {module.day}:</span>
                        <h4 className="ml-2 font-semibold text-gray-200">{module.title}</h4>
                      </div>
                      <p className="text-sm text-gray-400 mt-1">{module.description}</p>
                    </div>
                    <div className="text-primary-400">
                      {activeModule === module.id ? '−' : '+'}
                    </div>
                  </motion.button>
                  
                  {activeModule === module.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="px-4 pb-4"
                    >
                      <div className="mb-4">
                        <button
                          onClick={() => handleVideoSelect(module.id)}
                          className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition duration-200"
                          disabled={isLoadingVideo}
                        >
                          <Play className="w-4 h-4" />
                          <span>{isLoadingVideo ? 'Loading...' : 'Watch Video'}</span>
                        </button>
                      </div>
                      
                      <h5 className="text-sm font-medium text-primary-400 mb-2">Materials:</h5>
                      <ul className="space-y-2 text-gray-300">
                        {module.materials && module.materials.length > 0 ? (
                          module.materials.map((material, index) => (
                            <li key={index} className="bg-dark-300 p-3 rounded">
                              {material}
                            </li>
                          ))
                        ) : (
                          <li className="bg-dark-300 p-3 rounded text-gray-400">
                            No materials available for this module.
                          </li>
                        )}
                      </ul>
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
        
      case 'pending':
        return (
          <div className="bg-dark-200 p-6 rounded-lg text-center">
            <div className="text-yellow-400 text-5xl mb-4">⏳</div>
            <h3 className="text-xl font-semibold text-primary-400 mb-2">Registration Under Review</h3>
            <p className="text-gray-300">
              Your registration for this course is currently being reviewed. 
              You'll gain access to the course content once your registration is approved.
            </p>
          </div>
        );
        
      case 'not_registered':
      default:
        return (
          <div className="bg-dark-200 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-primary-400 mb-4">Register for this Course</h3>
            
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <p className="text-gray-300 mb-4">
                  To access this course, please make a payment using the QR code and enter your transaction ID below.
                </p>
                
                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label htmlFor="transactionId" className="block text-sm font-medium text-gray-400 mb-1">
                      Transaction ID *
                    </label>
                    <input
                      type="text"
                      id="transactionId"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full p-2 bg-dark-300 border border-dark-100 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter your transaction ID"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="referalId" className="block text-sm font-medium text-gray-400 mb-1">
                      Referral ID (Optional)
                    </label>
                    <input
                      type="text"
                      id="referalId"
                      value={referalId}
                      onChange={(e) => setReferalId(e.target.value)}
                      className="w-full p-2 bg-dark-300 border border-dark-100 rounded-md text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Enter referral ID (if any)"
                    />
                  </div>

                  {/* Terms and Conditions Checkbox */}
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      id="acceptTerms"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 text-primary-600 bg-dark-300 border-dark-100 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    <label htmlFor="acceptTerms" className="text-sm text-gray-300">
                      I accept the{' '}
                      <button
                        type="button"
                        className="text-primary-400 hover:text-primary-300 underline"
                        onClick={() => {
                          // You can implement a modal or redirect to terms page here
                          alert('Terms and conditions would open here');
                        }}
                      >
                        terms and conditions
                      </button>
                      {' '}and{' '}
                      <button
                        type="button"
                        className="text-primary-400 hover:text-primary-300 underline"
                        onClick={() => {
                          // You can implement a modal or redirect to privacy policy page here
                          alert('Privacy policy would open here');
                        }}
                      >
                        privacy policy
                      </button>
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                  </div>
                  
                  {errorMessage && (
                    <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-md">
                      <p className="text-red-400 text-sm">{errorMessage}</p>
                    </div>
                  )}
                  
                  <button
                    type="submit"
                    disabled={isSubmitting || !transactionId.trim() || !acceptedTerms}
                    className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Submitting...' : 'Register for Course'}
                  </button>
                </form>
              </div>
              
              <div className="flex-1 flex justify-center items-center">
                <div className="bg-white p-4 rounded-lg">
                  <QrCode size={150} className="text-dark-300" />
                  <p className="text-dark-300 text-center mt-2 text-sm">Scan to pay ₹{course.price}</p>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="mr-4 p-2 rounded-full bg-dark-200 text-primary-400"
        >
          <ArrowLeft className="w-5 h-5" />
        </motion.button>
        <h2 className="text-2xl font-bold text-primary-400">{course.title}</h2>
      </div>
      
      <div className="bg-dark-200 p-4 rounded-lg">
        <div className="flex flex-wrap gap-4 mb-4">
          <div className="flex items-center text-gray-400">
            <Clock className="w-4 h-4 mr-2" />
            <span>{course.duration}</span>
          </div>
          <div className="flex items-center text-gray-400">
            <Award className="w-4 h-4 mr-2" />
            <span>{course.level}</span>
          </div>
          <div className="flex items-center text-gray-400">
            <BookOpen className="w-4 h-4 mr-2" />
            <span>{course.modules.length} Modules</span>
          </div>
        </div>
        <p className="text-gray-300">{course.description}</p>
      </div>
      
      {/* Show loading state while checking registration status */}
      {isCheckingStatus ? (
        <div className="bg-dark-200 p-6 rounded-lg text-center">
          <div className="text-primary-400 text-4xl mb-4">⏳</div>
          <h3 className="text-lg font-semibold text-primary-400 mb-2">Checking Registration Status</h3>
          <p className="text-gray-400">Please wait while we verify your access...</p>
        </div>
      ) : (
        renderContent()
      )}
    </div>
  );
};

export default CourseDetails;