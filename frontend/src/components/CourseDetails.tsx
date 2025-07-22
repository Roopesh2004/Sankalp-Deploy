import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BookOpen,
  Clock,
  Award,
  QrCode,
  Play,
  X,
  Lock,
  Download,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

interface Material {
  id?: number;
  content: string;
}

interface Module {
  id: number;
  title: string;
  description?: string;
  day: number;
  week: number;
  videoUrl?: string;
  materials: string[];
}

interface Week {
  weekNumber: number;
  title: string;
  description?: string;
  modules: Module[];
  isAccessible: boolean;
}

interface CourseDetailsProps {
  course: {
    id: number;
    title: string;
    description: string;
    thumbnail: string;
    duration: string;
    syllabus: string;
    level: string;
    price: number;
    image?: string;
    modules: Module[];
  };
  onBack: () => void;
  email?: string;
  name?: string;
  reg?: string;
}

const CourseDetails: React.FC<CourseDetailsProps> = ({
  course,
  onBack,
  email,
  name,
  reg,
}) => {
  const { user } = useAuth();
  const [activeWeek, setActiveWeek] = useState<number | null>(null);
  const [activeDay, setActiveDay] = useState<number | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [referalId, setReferalId] = useState("");
  const [registrationStatus, setRegistrationStatus] = useState<
    "not_registered" | "pending" | "approved" | "not_paid_maintenance" | null
  >(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null);
  const [videoToken, setVideoToken] = useState<string | null>(null);
  const [isLoadingVideo, setIsLoadingVideo] = useState(false);
  const [grantedDate, setGrantedDate] = useState<number>(0);
  const [finalWeekOpened, setFinalWeekOpened] = useState(false);

  // New states for terms and conditions modal
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [pendingRegistrationData, setPendingRegistrationData] =
    useState<any>(null);
  const [isConfirmingRegistration, setIsConfirmingRegistration] =
    useState(false);

  // Function to calculate accessible weeks based on days passed
  const calculateAccessibleWeeks = (daysPassed: number): number => {
    // Week 1 is accessible from day 0 (immediately)
    // Week 2 is accessible from day 7 (after 1 week)
    // Week 3 is accessible from day 14 (after 2 weeks)
    // And so on...
    return Math.floor(daysPassed / 7) + 1;
  };

  // Function to group modules by week with accessibility check
  const groupModulesByWeek = (
    modules: Module[],
    daysPassed: number
  ): Week[] => {
    const weekMap = new Map<number, Module[]>();
    const accessibleWeeks = calculateAccessibleWeeks(daysPassed);

    modules.forEach((module) => {
      const weekNumber = module.week;
      if (!weekMap.has(weekNumber)) {
        weekMap.set(weekNumber, []);
      }
      weekMap.get(weekNumber)!.push(module);
    });

    const weeks: Week[] = [];
    weekMap.forEach((modules, weekNumber) => {
      weeks.push({
        weekNumber,
        title: `Week ${weekNumber}`,
        description: `Week ${weekNumber} content and materials`,
        modules: modules.sort((a, b) => a.day - b.day),
        isAccessible: weekNumber <= accessibleWeeks,
      });
    });

    return weeks.sort((a, b) => a.weekNumber - b.weekNumber);
  };

  // Function that triggers when final week is opened
  const handleFinalWeekOpen = () => {
    console.log("Final week has been opened!");
    setFinalWeekOpened(true);

    // Add your custom operations here
    // Example operations:
    // - Update completion status
    // - Send analytics event
    // - Trigger certificate generation
    // - Update user progress

    // You can add API calls or other operations here
    // Example:
    // updateCourseCompletion();
    // trackFinalWeekAccess();
  };

  // Function to handle certificate download
  const handleCertificateDownload = async () => {
    try {
      const certificateData = {
        name: name || user?.name || 'Student',
        domain: course.title,
        start_date: 'May 1, 2025', // You can calculate this based on course start date
        end_date: 'June 30, 2025', // You can calculate this based on course end date
        gender: 'other' // Default gender, can be made configurable later
      };

      const response = await fetch("https://sankalp-deploy-1.onrender.com/generate-certificate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(certificateData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${certificateData.name}_Certificate.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } else {
        console.error("Failed to download certificate");
        alert("Failed to generate certificate. Please try again.");
      }
    } catch (error) {
      console.error("Error downloading certificate:", error);
      alert("An error occurred while generating the certificate.");
    }
  };

  const submit_Maintenance = async (e?: React.FormEvent) => {
    e?.preventDefault(); // Prevent default form submission

    if (!transactionId.trim()) {
      setErrorMessage("Transaction ID is required");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    const registrationData = {
      name: name,
      email: email,
      transid: transactionId,
      courseName: course.title,
    };

    try {
      const response = await fetch(
        "https://sankalp-deploy-1.onrender.com/api/maintenance",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ registrationData, reg }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Success - clear form and update status
      setTransactionId("");
      setErrorMessage("");
      setRegistrationStatus("pending");
      setPendingRegistrationData(null);
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to register for the course. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVideoToken = async (moduleId: number) => {
    if (!email) return null;

    setIsLoadingVideo(true);
    try {
      const response = await fetch(
        "https://sankalp-deploy-1.onrender.com/api/generate-video-token",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, moduleId, reg }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to get video access");
      }

      const data = await response.json();
      return data.token;
    } catch (error) {
      console.error("Error getting video token:", error);
      return null;
    } finally {
      setIsLoadingVideo(false);
    }
  };

  const openSyllabus = (driveLink) => {
    window.open(driveLink, "_blank");
  };

  const openMaterial = (driveLink) => {
    window.open(driveLink, "_blank");
  };
  // Update the video selection handler to open the video directly
  const handleVideoSelect = async (moduleId: number) => {
    setSelectedVideo(moduleId);
    setIsLoadingVideo(true);

    try {
      const token = await getVideoToken(moduleId);
      if (token) {
        // Open the secure video player in a new tab
        window.open(
          `https://sankalp-deploy-1.onrender.com/api/secure-video/${moduleId}?token=${token}`,
          "_blank"
        );
      } else {
        console.error("Failed to get video token");
      }
    } catch (error) {
      console.error("Error playing video:", error);
    } finally {
      setIsLoadingVideo(false);
    }
  };

  // Check if user has already registered or has been approved for this course
  useEffect(() => {
    const checkRegistrationStatus = async () => {
      if (!email) {
        setRegistrationStatus("not_registered");
        setIsCheckingStatus(false);
        return;
      }

      setIsCheckingStatus(true);

      try {
        // Check pending status
        const pendingResponse = await fetch(
          "https://sankalp-deploy-1.onrender.com/api/pending-check",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, courseId: course.id, reg }),
          }
        );

        const pendingData = await pendingResponse.json();

        console.log("Pending data: ", pendingData);

        if (
          pendingData.value.status === 0 &&
          pendingData.value.maintenance_fee === 1
        ) {
          setRegistrationStatus("pending");
          setIsCheckingStatus(false);
          return;
        } else if (
          pendingData.value.status === 0 &&
          pendingData.value.maintenance_fee === 0
        ) {
          setRegistrationStatus("not_paid_maintenance");
          setIsCheckingStatus(false);
          return;
        }else if(
          pendingData.value.status === 1 &&
          pendingData.value.maintenance_fee === 1
        ){
          setRegistrationStatus("approved");
          setIsCheckingStatus(false);
          return;
        }

        // If not in pending, check if already has access
        const accessResponse = await fetch(
          "https://sankalp-deploy-1.onrender.com/api/check-course-access",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, courseId: course.id, reg }),
          }
        );

        const accessData = await accessResponse.json();

        if (accessData.hasAccess) {
          setRegistrationStatus("approved");
          const diffInMs =
            new Date().getTime() - new Date(accessData.grantedDate).getTime();
          const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
          setGrantedDate(diffInDays);
        } else {
          setRegistrationStatus("not_registered");
        }
      } catch (error) {
        console.error("Error checking registration status:", error);
        setRegistrationStatus("not_registered");
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkRegistrationStatus();
  }, [email, course.id]);

  // First step: Save transaction and referral IDs, then show terms modal
  const handleInitialRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!transactionId.trim()) {
      setErrorMessage("Transaction ID is required");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      // Save the registration data temporarily
      const registrationData = {
        name: name || user?.name || "Unknown User",
        email: email,
        transid: transactionId,
        refid: referalId,
        courseName: course.title,
        amt: course.price,
        courseId: course.id,
      };

      // Store the data for later use
      setPendingRegistrationData(registrationData);

      // Show terms and conditions modal
      setShowTermsModal(true);
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to process registration. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Final step: Confirm registration after accepting terms
  const handleConfirmRegistration = async () => {
    if (!pendingRegistrationData) return;

    setIsConfirmingRegistration(true);
    setErrorMessage("");

    try {
      const response = await fetch(
        "https://sankalp-deploy-1.onrender.com/api/pending",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pendingRegistrationData, reg }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }
      setTransactionId("");
      setRegistrationStatus("not_paid_maintenance");
      setShowTermsModal(false);
      setPendingRegistrationData(null);
    } catch (error) {
      console.error("Registration error:", error);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Failed to register for the course. Please try again."
      );
    } finally {
      setIsConfirmingRegistration(false);
    }
  };

  // Terms and Conditions Modal Component
  const TermsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-dark-100 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center p-6 border-b border-dark-200">
          <h3 className="text-xl font-semibold text-primary-400">
            Terms and Conditions
          </h3>
          <button
            onClick={() => {
              setShowTermsModal(false);
              setPendingRegistrationData(null);
            }}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="text-gray-300 space-y-4">
            <h4 className="text-lg font-medium text-primary-400">
              Course Registration Terms
            </h4>
            <p>
              By registering for this course, you agree to the following terms
              and conditions:
            </p>

            <div className="space-y-3">
              <div>
                <h5 className="font-medium text-gray-200">
                  1. Payment and Refunds
                </h5>
                <p className="text-sm">
                  All payments are final. Refunds will only be processed in
                  exceptional circumstances and at the sole discretion of the
                  course provider.
                </p>
              </div>

              <div>
                <h5 className="font-medium text-gray-200">2. Course Access</h5>
                <p className="text-sm">
                  Access to course materials will be granted upon verification
                  of payment. Course access is non-transferable and limited to
                  the registered user only.
                </p>
              </div>

              <div>
                <h5 className="font-medium text-gray-200">
                  3. Intellectual Property
                </h5>
                <p className="text-sm">
                  All course materials are protected by copyright. Sharing,
                  copying, or distributing course content is strictly
                  prohibited.
                </p>
              </div>

              <div>
                <h5 className="font-medium text-gray-200">4. User Conduct</h5>
                <p className="text-sm">
                  Users must maintain professional conduct and respect towards
                  instructors and fellow students throughout the course
                  duration.
                </p>
              </div>

              <div>
                <h5 className="font-medium text-gray-200">5. Privacy Policy</h5>
                <p className="text-sm">
                  Your personal information will be used solely for course
                  administration and will not be shared with third parties
                  without your explicit consent.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-dark-200">
          {errorMessage && (
            <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-md mb-4">
              <p className="text-red-400 text-sm">{errorMessage}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowTermsModal(false);
                setPendingRegistrationData(null);
              }}
              className="flex-1 py-2 px-4 border border-gray-600 text-gray-300 rounded-md hover:bg-dark-200 transition duration-200"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRegistration}
              disabled={isConfirmingRegistration}
              className="flex-1 py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isConfirmingRegistration
                ? "Confirming..."
                : "Accept and Register"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Render different content based on registration status
  const renderContent = () => {
    switch (registrationStatus) {
      case "approved":
        const weeks = groupModulesByWeek(course.modules, grantedDate);
        const accessibleWeeks = calculateAccessibleWeeks(grantedDate);
        const finalWeekNumber = Math.max(
          ...weeks.map((week) => week.weekNumber)
        );

        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-primary-400">
                Course Content
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-400">
                  {grantedDate === 0 ? (
                    <span>
                      Course started today • Week {accessibleWeeks} available
                    </span>
                  ) : (
                    <span>Week {accessibleWeeks} available</span>
                  )}
                </div>
                {/* Certificate Download Button - Only show when final week is opened */}
                {finalWeekOpened && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCertificateDownload}
                    className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition duration-200"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Certificate</span>
                  </motion.button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {weeks.map((week) => (
                <div
                  key={week.weekNumber}
                  className={`rounded-lg overflow-hidden ${
                    week.isAccessible ? "bg-dark-200" : "bg-dark-200 opacity-60"
                  }`}
                >
                  {/* Week Header */}
                  <motion.button
                    whileHover={
                      week.isAccessible
                        ? { backgroundColor: "rgba(124, 58, 237, 0.1)" }
                        : {}
                    }
                    onClick={() => {
                      if (week.isAccessible) {
                        const newActiveWeek =
                          activeWeek === week.weekNumber
                            ? null
                            : week.weekNumber;
                        setActiveWeek(newActiveWeek);

                        // Check if this is the final week being opened
                        if (
                          newActiveWeek === finalWeekNumber &&
                          newActiveWeek !== null
                        ) {
                          handleFinalWeekOpen();
                        }
                      }
                    }}
                    className={`w-full p-4 flex justify-between items-center text-left border-b border-dark-100 ${
                      !week.isAccessible ? "cursor-not-allowed" : ""
                    }`}
                    disabled={!week.isAccessible}
                  >
                    <div>
                      <div className="flex items-center">
                        <h4
                          className={`font-semibold text-lg ${
                            week.isAccessible
                              ? "text-primary-400"
                              : "text-gray-500"
                          }`}
                        >
                          {week.title}
                          {week.weekNumber === finalWeekNumber && (
                            <span className="ml-2 text-xs bg-gold-500 text-black px-2 py-1 rounded-full">
                              Final
                            </span>
                          )}
                        </h4>
                        {!week.isAccessible && (
                          <Lock className="w-4 h-4 ml-2 text-gray-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-400 mt-1">
                        {week.isAccessible
                          ? week.description
                          : `Unlocks on day ${(week.weekNumber - 1) * 7 + 1}`}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {week.modules.length} days
                      </p>
                    </div>
                    <div
                      className={`text-xl ${
                        week.isAccessible ? "text-primary-400" : "text-gray-500"
                      }`}
                    >
                      {week.isAccessible
                        ? activeWeek === week.weekNumber
                          ? "−"
                          : "+"
                        : "🔒"}
                    </div>
                  </motion.button>

                  {/* Days within Week - Only show if week is accessible and expanded */}
                  {week.isAccessible && activeWeek === week.weekNumber && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="bg-dark-300"
                    >
                      {week.modules.map((module) => (
                        <div
                          key={module.id}
                          className="border-b border-dark-100 last:border-b-0"
                        >
                          {/* Day Header */}
                          <motion.button
                            whileHover={{
                              backgroundColor: "rgba(124, 58, 237, 0.05)",
                            }}
                            onClick={() =>
                              setActiveDay(
                                activeDay === module.id ? null : module.id
                              )
                            }
                            className="w-full p-4 flex justify-between items-center text-left"
                          >
                            <div>
                              <div className="flex items-center">
                                <span className="text-primary-300 font-medium">
                                  Day {module.day}:
                                </span>
                                <h5 className="ml-2 font-medium text-gray-200">
                                  {module.title}
                                </h5>
                              </div>
                              <p className="text-sm text-gray-400 mt-1">
                                {module.description}
                              </p>
                            </div>
                            <div className="text-primary-300">
                              {activeDay === module.id ? "−" : "+"}
                            </div>
                          </motion.button>

                          {/* Day Content - Video and Materials */}
                          {activeDay === module.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-4 pb-4 bg-dark-400"
                            >
                              {/* Video Section */}
                              <div className="mb-4 p-3 bg-dark-200 rounded-lg">
                                <h6 className="text-sm font-medium text-primary-400 mb-2">
                                  Video Lecture:
                                </h6>
                                <button
                                  onClick={() => handleVideoSelect(module.id)}
                                  className="flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md transition duration-200"
                                  disabled={isLoadingVideo}
                                >
                                  <Play className="w-4 h-4" />
                                  <span>
                                    {isLoadingVideo &&
                                    selectedVideo === module.id
                                      ? "Loading..."
                                      : "Watch Video"}
                                  </span>
                                </button>
                              </div>

                              {/* Materials Section */}
                              <div className="p-3 bg-dark-200 rounded-lg">
                                <h6 className="text-sm font-medium text-primary-400 mb-2">
                                  Course Materials:
                                </h6>
                                <ul className="space-y-2 text-gray-300">
                                  {module.materials &&
                                  module.materials.length > 0 ? (
                                    module.materials.map(
                                      (material, index) =>
                                        material && (
                                          <li
                                            key={index}
                                            className="bg-dark-300 p-3 rounded-md text-sm"
                                          >
                                            <div className="flex items-start">
                                              <BookOpen className="w-4 h-4 mr-2 mt-0.5 text-primary-400 flex-shrink-0" />
                                              <span
                                                onClick={() =>
                                                  openMaterial(material)
                                                }
                                                style={{ cursor: "pointer" }}
                                              >
                                                Material {index + 1}
                                              </span>
                                            </div>
                                          </li>
                                        )
                                    )
                                  ) : (
                                    <li className="bg-dark-300 p-3 rounded-md text-gray-400 text-sm">
                                      No materials available for this day.
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case "pending":
        return (
          <div className="bg-dark-200 p-6 rounded-lg text-center">
            <div className="text-yellow-400 text-5xl mb-4">⏳</div>
            <h3 className="text-xl font-semibold text-primary-400 mb-2">
              Registration Under Review
            </h3>
            <p className="text-gray-300">
              Your registration for this course is currently being reviewed.
              You'll gain access to the course content once your registration is
              approved.
            </p>
          </div>
        );

      case "not_paid_maintenance":
        return (
          <div className="bg-dark-200 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-primary-400 mb-4">
              Pay Maintenance_Fee
            </h3>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <p className="text-gray-300 mb-4">
                  To access this course, please make a payment using the QR code
                  and enter your transaction ID below.
                </p>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submit_Maintenance(e);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="transactionId"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
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

                  {errorMessage && (
                    <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-md">
                      <p className="text-red-400 text-sm">{errorMessage}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !transactionId.trim()}
                    className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Processing..." : "Submit"}
                  </button>
                </form>
              </div>

              <div className="flex-1 flex justify-center items-center">
                <div className="bg-white p-4 rounded-lg">
                  <img
                    src="/qr_scan.jpg"
                    alt="QR Code"
                    className="w-[150px] h-[150px] object-contain"
                  />
                  <p className="text-dark-300 text-center mt-2 text-sm">
                    Scan to pay ₹999
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case "not_registered":
      default:
        return (
          <div className="bg-dark-200 p-6 rounded-lg">
            <h3 className="text-xl font-semibold text-primary-400 mb-4">
              Register for this Course
            </h3>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <p className="text-gray-300 mb-4">
                  To access this course, please make a payment using the QR code
                  and enter your transaction ID below.
                </p>

                <form
                  onSubmit={handleInitialRegistration}
                  className="space-y-4"
                >
                  <div>
                    <label
                      htmlFor="transactionId"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
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
                    <label
                      htmlFor="referalId"
                      className="block text-sm font-medium text-gray-400 mb-1"
                    >
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

                  {errorMessage && (
                    <div className="p-3 bg-red-900/20 border border-red-500/30 rounded-md">
                      <p className="text-red-400 text-sm">{errorMessage}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !transactionId.trim()}
                    className="w-full py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Processing..." : "Submit"}
                  </button>
                </form>
              </div>

              <div className="flex-1 flex justify-center items-center">
                <div className="bg-white p-4 rounded-lg">
                  <img
                    src="/qr_scan.jpg"
                    alt="QR Code"
                    className="w-[150px] h-[150px] object-contain"
                  />
                  {reg === "student" ? (
                    <p className="text-dark-300 text-center mt-2 text-sm">
                      Scan to pay ₹{course.price}
                    </p>
                  ) : (
                    <p className="text-dark-300 text-center mt-2 text-sm">
                      ₹3999
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
    }
  };
  console.log(course.thumbnail);

  return (
    <>
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
          <h2 className="text-2xl font-bold text-primary-400">
            {course.title}
          </h2>
        </div>

        <img
          className="w-full h-[30vh] object-fill rounded-lg"
          src={course.thumbnail}
        ></img>
        <div className="flex flex-row justify-between items-start gap-4 bg-dark-200">
          {/* Left content: course tile and description */}
          <div className="flex-1 bg-dark-200 p-4 rounded-lg">
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
                <span>{course.modules.length} Days</span>
              </div>
            </div>
            <p className="text-gray-300">{course.description}</p>
          </div>

          {/* Right content: button */}
          {registrationStatus === "approved" && (
            <div className="flex-shrink-0 p-4 my-auto">
              <button
                onClick={() => openSyllabus(course.syllabus)}
                className="py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Download Syllabus
              </button>
            </div>
          )}
        </div>

        {/* Show loading state while checking registration status */}
        {isCheckingStatus ? (
          <div className="bg-dark-200 p-6 rounded-lg text-center">
            <div className="text-primary-400 text-4xl mb-4">⏳</div>
            <h3 className="text-lg font-semibold text-primary-400 mb-2">
              Checking Registration Status
            </h3>
            <p className="text-gray-400">
              Please wait while we verify your access...
            </p>
          </div>
        ) : (
          renderContent()
        )}
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && <TermsModal />}
    </>
  );
};

export default CourseDetails;
