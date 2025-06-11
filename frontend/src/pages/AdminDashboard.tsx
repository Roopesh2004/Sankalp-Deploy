import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Settings, Users, BookOpen, CheckCircle, X, Clock, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { mockCourses } from '../data/mockData';
import CourseUploadForm from '../components/CourseUploadForm';

export const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [pendingRequests] = useState(12); // Mock data
  const [data, setData] = useState([]);
  const [selectedRegistration, setSelectedRegistration] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);

  useEffect(() => {
    const fetchPendingRegistrations = async () => {
      try {
        const response = await fetch('https://sankalp-deploy-1.onrender.com/api/admin-check');
        if (!response.ok) throw new Error('Failed to fetch pending registrations');
        
        const result = await response.json();
        
        if (result.data) {
          // Transform data for display
          const formattedData = result.data.map(item => ({
            id: item.id,
            Name: item.name,
            Email: item.email,
            TransactionId: item.transactionid,
            ReferalId: item.referalid,
            Course: item.courseName,
            Amount: item.amount,
            CourseId: item.courseId,
            status: item.status,
            Date: new Date(item.created_at).toLocaleDateString()
          }));
          
          setData(formattedData);
        }
      } catch (error) {
        console.error('Error fetching pending registrations:', error);
      }
    };
    
    fetchPendingRegistrations();
  }, []);

  // Add loading state at the top with other state declarations
const [loadingApprovals, setLoadingApprovals] = useState(new Set());

// Fixed approval function with better data identification
const approveUser = useCallback(async (email: string, userId: string, itemData: any) => {
  console.log('Approving user:', { email, userId, courseName: itemData.Course }); // Debug log
  
  // Add to loading set
  setLoadingApprovals(prev => new Set(prev).add(userId));
  
  try {
    const response = await fetch('https://sankalp-deploy-1.onrender.com/api/admin-approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        value: 1, 
        email,
        userId: userId, // Include userId for better tracking
        courseId: itemData.CourseId // Include courseId for verification
      }),
    });

    if (!response.ok) {
      throw new Error('Approval failed');
    }

    // Only update UI after successful API call using multiple identifiers
    setData(prevData => 
      prevData.map(item => 
        item.id === userId && item.Email === email && item.CourseId === itemData.CourseId
          ? { ...item, status: 1 } 
          : item
      )
    );
  } catch (error) {
    console.error('Approve error:', error);
    alert('Failed to approve user. Please try again.'); // User feedback
  } finally {
    // Remove from loading set
    setLoadingApprovals(prev => {
      const newSet = new Set(prev);
      newSet.delete(userId);
      return newSet;
    });
  }
}, []);

  // Memoize course stats calculation
  const courseStats = useMemo(() => 
    mockCourses.map(course => ({
      id: course.id,
      title: course.title,
      enrolledStudents: Math.floor(Math.random() * 50) + 10,
      pendingRequests: Math.floor(Math.random() * 8)
    })), 
    []
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  const viewRegistrationDetails = (registration) => {
    setSelectedRegistration(registration);
    setShowDetailsModal(true);
  };

  return (
    <div className="min-h-screen bg-dark-300">
      <nav className="bg-dark-200 border-b border-primary-800/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <motion.h1 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                className="text-2xl font-bold text-primary-400"
              >
                Sankalp Training Admin
              </motion.h1>
            </div>
            <div className="flex items-center space-x-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center text-gray-400"
              >
                <Settings className="w-5 h-5 mr-2" />
                <span>{user?.name}</span>
              </motion.div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={logout}
                className="btn-secondary rounded-lg px-4 py-2 flex items-center"
              >
                <LogOut className="w-5 h-5 mr-2" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <motion.div
            variants={itemVariants}
            className="card p-6 flex items-center"
          >
            <div className="rounded-full bg-primary-500/20 p-3 mr-4">
              <Users className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Total Students</h3>
              <p className="text-2xl font-bold text-primary-400">156</p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="card p-6 flex items-center"
          >
            <div className="rounded-full bg-primary-500/20 p-3 mr-4">
              <BookOpen className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Active Courses</h3>
              <p className="text-2xl font-bold text-primary-400">{mockCourses.length}</p>
            </div>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="card p-6 flex items-center"
          >
            <div className="rounded-full bg-primary-500/20 p-3 mr-4">
              <CheckCircle className="w-6 h-6 text-primary-400" />
            </div>
            <div>
              <h3 className="text-gray-400 text-sm">Pending Requests</h3>
              <p className="text-2xl font-bold text-primary-400">{pendingRequests}</p>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="card p-6"
        >
          <h2 className="text-xl font-bold text-primary-400 mb-6">Course Statistics</h2>
          <div className="space-y-4">
            {courseStats.map((course) => (
              <motion.div
                key={course.id}
                variants={itemVariants}
                className="bg-dark-100 rounded-lg p-4 border border-primary-800/20"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-200">{course.title}</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary px-4 py-2 rounded-lg text-sm"
                  >
                    View Details
                  </motion.button>
                </div>
                <div className="mt-2 flex space-x-4">
                  <div className="text-gray-400">
                    <span className="font-medium text-primary-400">{course.enrolledStudents}</span> enrolled
                  </div>
                  <div className="text-gray-400">
                    <span className="font-medium text-primary-400">{course.pendingRequests}</span> pending
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="card p-6 mt-6"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-primary-400">Course Management</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUploadForm(true)}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg px-4 py-2 transition duration-200 flex items-center"
            >
              <Plus className="w-5 h-5 mr-1" /> Upload New Course
            </motion.button>
          </div>
          
          <div className="space-y-4">
            {mockCourses.map((course) => (
              <motion.div
                key={course.id}
                variants={itemVariants}
                className="bg-dark-100 rounded-lg p-4 border border-primary-800/20 flex justify-between items-center"
              >
                <div>
                  <h3 className="text-lg font-semibold text-gray-200">{course.title}</h3>
                  <p className="text-gray-400 text-sm">{course.modules?.length || 0} modules</p>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-dark-300 hover:bg-dark-400 text-primary-400 font-medium rounded-lg px-4 py-2 transition duration-200 text-sm"
                  >
                    Edit
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {data && data.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="card p-6 mt-6"
          >
            <h2 className="text-xl font-bold text-primary-400 mb-6">Approval Requests</h2>
            <div className="space-y-6">
              {data.map((item, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  className="bg-dark-100 rounded-lg p-6 border border-primary-800/20"
                >
                  <div className="flex flex-col md:flex-row justify-between gap-6">
                    <div className="space-y-3 flex-1">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-200">{item.Name}</h3>
                        <p className="text-gray-400">{item.Email}</p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-primary-400">Course Details</h4>
                          <p className="text-gray-300 font-medium">{item.Course}</p>
                          <p className="text-gray-400 text-sm">Course ID: {item.CourseId}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium text-primary-400">Payment Details</h4>
                          <p className="text-gray-300">Amount: ₹{item.Amount}</p>
                          <p className="text-gray-300 break-all">
                            <span className="text-gray-400 text-sm">Transaction ID: </span>
                            {item.TransactionId}
                          </p>
                          {item.ReferalId && 
                          <p className="text-gray-300 break-all">
                            <span className="text-gray-400 text-sm">Referal ID: </span>
                            {item.ReferalId}
                          </p>
                          }
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="text-sm font-medium text-primary-400">Registration Date</h4>
                        <p className="text-gray-300">{item.Date}</p>
                      </div>
                    </div>
                    
                    <div className="flex flex-col justify-center items-center gap-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => viewRegistrationDetails(item)}
                        className="bg-dark-300 hover:bg-dark-400 text-primary-400 font-medium rounded-lg px-4 py-2 transition duration-200 w-full"
                      >
                        View Details
                      </motion.button>
                      
                      {item.status === 1 ? (
                        <span className="px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-center w-full">
                          Approved
                        </span>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => approveUser(item.Email, item.id, item)}
                          disabled={loadingApprovals.has(item.id)}
                          className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium rounded-lg px-4 py-2 transition duration-200 w-full"
                        >
                          {loadingApprovals.has(item.id) ? 'Approving...' : 'Approve'}
                        </motion.button>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="card p-6 mt-6 text-center"
          >
            <div className="text-primary-400 text-5xl mb-4">🎉</div>
            <h3 className="text-xl font-semibold text-primary-400 mb-2">No Pending Approvals</h3>
            <p className="text-gray-300">
              All course registration requests have been processed.
            </p>
          </motion.div>
        )}
      </main>

      {showDetailsModal && selectedRegistration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
          onClick={() => setShowDetailsModal(false)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-dark-200 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-primary-400">Registration Details</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="p-2 rounded-full bg-dark-100 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-primary-400 mb-1">Student Information</h3>
                <div className="bg-dark-100 p-4 rounded-lg">
                  <p className="text-lg font-semibold text-gray-200">{selectedRegistration.Name}</p>
                  <p className="text-gray-400">{selectedRegistration.Email}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-primary-400 mb-1">Course Information</h3>
                <div className="bg-dark-100 p-4 rounded-lg">
                  <p className="text-lg font-semibold text-gray-200">{selectedRegistration.Course}</p>
                  <p className="text-gray-400">Course ID: {selectedRegistration.CourseId}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-primary-400 mb-1">Payment Details</h3>
                <div className="bg-dark-100 p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-gray-400">Amount:</span>
                    <span className="text-gray-200 font-medium">₹{selectedRegistration.Amount}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-gray-400">Transaction ID:</span>
                    <span className="text-gray-200 font-medium break-all">{selectedRegistration.TransactionId}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-primary-400 mb-1">Registration Date</h3>
                <div className="bg-dark-100 p-4 rounded-lg">
                  <p className="text-gray-200">{selectedRegistration.Date}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-primary-400 mb-1">Status</h3>
                <div className="bg-dark-100 p-4 rounded-lg">
                  {selectedRegistration.status === 1 ? (
                    <div className="flex items-center">
                      <div className="bg-green-500/20 p-2 rounded-full mr-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      </div>
                      <span className="text-green-400">Approved</span>
                    </div>
                  ) : (
                    <div className="flex items-center">
                      <div className="bg-yellow-500/20 p-2 rounded-full mr-2">
                        <Clock className="w-4 h-4 text-yellow-400" />
                      </div>
                      <span className="text-yellow-400">Pending Approval</span>
                    </div>
                  )}
                </div>
              </div>
              
              {selectedRegistration.status === 0 && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    approveUser(selectedRegistration.Email, selectedRegistration.id, selectedRegistration);
                    setShowDetailsModal(false);
                  }}
                  className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition duration-200"
                >
                  Approve Registration
                </motion.button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
      {showUploadForm && (
        <CourseUploadForm onClose={() => setShowUploadForm(false)} />
      )}
    </div>
  );
};
