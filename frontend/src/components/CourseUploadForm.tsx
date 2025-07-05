import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, X } from "lucide-react";

interface Module {
  title: string;
  day: number;
  week: number;
  videoUrl: string;
  materials: string[];
}

interface Week {
  weekNumber: number;
  title: string;
  description: string;
  modules: Module[];
}

interface CourseFormData {
  title: string;
  description: string;
  thumbnail: string;
  syllabus: string;
  weeks: Week[];
}

interface CourseUploadFormProps {
  onClose: () => void;
}

const CourseUploadForm: React.FC<CourseUploadFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<CourseFormData>({
    title: "",
    description: "",
    thumbnail: "",
    syllabus: "",
    weeks: [
      {
        weekNumber: 1,
        title: "Week 1",
        description: "Week 1 content and materials",
        modules: [
          { title: "", day: 1, week: 1, videoUrl: "", materials: [""] },
        ],
      },
    ],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWeekChange = (
    weekIndex: number,
    field: "title" | "description",
    value: string
  ) => {
    setFormData((prev) => {
      const updatedWeeks = [...prev.weeks];
      updatedWeeks[weekIndex] = { ...updatedWeeks[weekIndex], [field]: value };
      return { ...prev, weeks: updatedWeeks };
    });
  };

  const handleModuleChange = (
    weekIndex: number,
    moduleIndex: number,
    field: keyof Module,
    value: string | number
  ) => {
    setFormData((prev) => {
      const updatedWeeks = [...prev.weeks];
      const updatedModules = [...updatedWeeks[weekIndex].modules];
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        [field]: value,
      };
      updatedWeeks[weekIndex] = {
        ...updatedWeeks[weekIndex],
        modules: updatedModules,
      };
      return { ...prev, weeks: updatedWeeks };
    });
  };

  const handleMaterialChange = (
    weekIndex: number,
    moduleIndex: number,
    materialIndex: number,
    value: string
  ) => {
    setFormData((prev) => {
      const updatedWeeks = [...prev.weeks];
      const updatedModules = [...updatedWeeks[weekIndex].modules];
      const updatedMaterials = [...updatedModules[moduleIndex].materials];
      updatedMaterials[materialIndex] = value;
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        materials: updatedMaterials,
      };
      updatedWeeks[weekIndex] = {
        ...updatedWeeks[weekIndex],
        modules: updatedModules,
      };
      return { ...prev, weeks: updatedWeeks };
    });
  };

  const addWeek = () => {
    const newWeekNumber = formData.weeks.length + 1;
    const totalDays = formData.weeks.reduce(
      (total, week) => total + week.modules.length,
      0
    );

    setFormData((prev) => ({
      ...prev,
      weeks: [
        ...prev.weeks,
        {
          weekNumber: newWeekNumber,
          title: `Week ${newWeekNumber}`,
          description: `Week ${newWeekNumber} content and materials`,
          modules: [
            {
              title: "",
              day: totalDays + 1,
              week: newWeekNumber,
              videoUrl: "",
              materials: [""],
            },
          ],
        },
      ],
    }));
  };

  const removeWeek = (weekIndex: number) => {
    if (formData.weeks.length === 1) return; // Don't allow removing the last week

    setFormData((prev) => {
      const updatedWeeks = prev.weeks.filter((_, i) => i !== weekIndex);
      // Recalculate week numbers and day numbers
      let dayCounter = 1;
      return {
        ...prev,
        weeks: updatedWeeks.map((week, i) => ({
          ...week,
          weekNumber: i + 1,
          title: `Week ${i + 1}`,
          modules: week.modules.map((module) => ({
            ...module,
            day: dayCounter++,
            week: i + 1,
          })),
        })),
      };
    });
  };

  const addDay = (weekIndex: number) => {
    const totalDays = formData.weeks.reduce((total, week, index) => {
      if (index < weekIndex) return total + week.modules.length;
      return total;
    }, 0);

    setFormData((prev) => {
      const updatedWeeks = [...prev.weeks];
      const newDayNumber =
        totalDays + updatedWeeks[weekIndex].modules.length + 1;
      updatedWeeks[weekIndex] = {
        ...updatedWeeks[weekIndex],
        modules: [
          ...updatedWeeks[weekIndex].modules,
          {
            title: "",
            day: newDayNumber,
            week: updatedWeeks[weekIndex].weekNumber,
            videoUrl: "",
            materials: [""],
          },
        ],
      };
      return { ...prev, weeks: updatedWeeks };
    });
  };

  const removeDay = (weekIndex: number, moduleIndex: number) => {
    if (formData.weeks[weekIndex].modules.length === 1) return; // Don't allow removing the last day

    setFormData((prev) => {
      const updatedWeeks = [...prev.weeks];
      updatedWeeks[weekIndex] = {
        ...updatedWeeks[weekIndex],
        modules: updatedWeeks[weekIndex].modules.filter(
          (_, i) => i !== moduleIndex
        ),
      };

      // Recalculate all day numbers
      let dayCounter = 1;
      updatedWeeks.forEach((week) => {
        week.modules.forEach((module) => {
          module.day = dayCounter++;
        });
      });

      return { ...prev, weeks: updatedWeeks };
    });
  };

  const addMaterial = (weekIndex: number, moduleIndex: number) => {
    setFormData((prev) => {
      const updatedWeeks = [...prev.weeks];
      const updatedModules = [...updatedWeeks[weekIndex].modules];
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        materials: [...updatedModules[moduleIndex].materials, ""],
      };
      updatedWeeks[weekIndex] = {
        ...updatedWeeks[weekIndex],
        modules: updatedModules,
      };
      return { ...prev, weeks: updatedWeeks };
    });
  };

  const removeMaterial = (
    weekIndex: number,
    moduleIndex: number,
    materialIndex: number
  ) => {
    setFormData((prev) => {
      const updatedWeeks = [...prev.weeks];
      const updatedModules = [...updatedWeeks[weekIndex].modules];
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        materials: updatedModules[moduleIndex].materials.filter(
          (_, i) => i !== materialIndex
        ),
      };
      updatedWeeks[weekIndex] = {
        ...updatedWeeks[weekIndex],
        modules: updatedModules,
      };
      return { ...prev, weeks: updatedWeeks };
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const modules = formData.weeks.flatMap((week) => week.modules);

      const courseData = {
        title: formData.title,
        description: formData.description,
        thumbnail: formData.thumbnail,
        syllabus: formData.syllabus,
        weeks: formData.weeks,
        modules: modules,
      };

      console.log(courseData);

      const response = await fetch(
        "https://sankalp-deploy-1.onrender.com/api/courses",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(courseData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create course");
      }

      const result = await response.json();
      setSuccess(`Course created successfully with ID: ${result.courseId}`);

      // Reset form after success
      setFormData({
        title: "",
        description: "",
        thumbnail: "",
        syllabus: "",
        weeks: [
          {
            weekNumber: 1,
            title: "Week 1",
            description: "Week 1 content and materials",
            modules: [
              { title: "", day: 1, week: 1, videoUrl: "", materials: [""] },
            ],
          },
        ],
      });

      // Close form after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      setError(error.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-blue-400">Upload New Course</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 text-red-400 p-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 text-green-400 p-3 rounded-lg mb-4">
            {success}
          </div>
        )}

        <div className="space-y-6">
          {/* Course Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-blue-400 mb-1">
                Course Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-200 focus:border-blue-400 focus:outline-none"
                placeholder="Enter course title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-400 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-200 focus:border-blue-400 focus:outline-none"
                placeholder="Enter course description"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-400 mb-1">
                Thumbnail URL
              </label>
              <input
                type="text"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-200 focus:border-blue-400 focus:outline-none"
                placeholder="Enter thumbnail URL (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-400 mb-1">
                Syllabus URL
              </label>
              <input
                type="text"
                name="syllabus"
                value={formData.syllabus}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg p-3 text-gray-200 focus:border-blue-400 focus:outline-none"
                placeholder="Enter syllabus URL (optional)"
              />
            </div>
          </div>

          {/* Weeks and Modules */}
          <div>
            <h3 className="text-lg font-semibold text-blue-400 mb-4">
              Course Structure
            </h3>

            {formData.weeks.map((week, weekIndex) => (
              <div
                key={weekIndex}
                className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-6"
              >
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-medium text-gray-200 text-lg">
                    {week.title}
                  </h4>
                  {formData.weeks.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeWeek(weekIndex)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-400 mb-1">
                      Week Title
                    </label>
                    <input
                      type="text"
                      value={week.title}
                      onChange={(e) =>
                        handleWeekChange(weekIndex, "title", e.target.value)
                      }
                      className="w-full bg-gray-600 border border-gray-500 rounded-lg p-3 text-gray-200 focus:border-blue-400 focus:outline-none"
                      placeholder="Enter week title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-blue-400 mb-1">
                      Week Description
                    </label>
                    <textarea
                      value={week.description}
                      onChange={(e) =>
                        handleWeekChange(
                          weekIndex,
                          "description",
                          e.target.value
                        )
                      }
                      rows={2}
                      className="w-full bg-gray-600 border border-gray-500 rounded-lg p-3 text-gray-200 focus:border-blue-400 focus:outline-none"
                      placeholder="Enter week description"
                    />
                  </div>
                </div>

                {/* Modules for this week */}
                <div className="space-y-4">
                  <h5 className="font-medium text-gray-300">Days/Modules</h5>

                  {week.modules.map((module, moduleIndex) => (
                    <div
                      key={moduleIndex}
                      className="bg-gray-600 border border-gray-500 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center mb-3">
                        <h6 className="font-medium text-gray-200">
                          Day {module.day}
                        </h6>
                        {week.modules.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeDay(weekIndex, moduleIndex)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-blue-400 mb-1">
                            Module Title
                          </label>
                          <input
                            type="text"
                            value={module.title}
                            onChange={(e) =>
                              handleModuleChange(
                                weekIndex,
                                moduleIndex,
                                "title",
                                e.target.value
                              )
                            }
                            required
                            className="w-full bg-gray-500 border border-gray-400 rounded-lg p-3 text-gray-200 focus:border-blue-400 focus:outline-none"
                            placeholder="Enter module title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-blue-400 mb-1">
                            Video URL (YouTube)
                          </label>
                          <input
                            type="text"
                            value={module.videoUrl}
                            onChange={(e) =>
                              handleModuleChange(
                                weekIndex,
                                moduleIndex,
                                "videoUrl",
                                e.target.value
                              )
                            }
                            required
                            className="w-full bg-gray-500 border border-gray-400 rounded-lg p-3 text-gray-200 focus:border-blue-400 focus:outline-none"
                            placeholder="Enter YouTube video URL"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-blue-400 mb-1">
                            Materials
                          </label>
                          {module.materials.map((material, materialIndex) => (
                            <div
                              key={materialIndex}
                              className="flex items-center mb-2"
                            >
                              <input
                                type="text"
                                value={material}
                                onChange={(e) =>
                                  handleMaterialChange(
                                    weekIndex,
                                    moduleIndex,
                                    materialIndex,
                                    e.target.value
                                  )
                                }
                                className="flex-1 bg-gray-500 border border-gray-400 rounded-lg p-3 text-gray-200 focus:border-blue-400 focus:outline-none"
                                placeholder="Enter material name"
                              />
                              {module.materials.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeMaterial(
                                      weekIndex,
                                      moduleIndex,
                                      materialIndex
                                    )
                                  }
                                  className="ml-2 text-red-400 hover:text-red-300"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addMaterial(weekIndex, moduleIndex)}
                            className="text-blue-400 hover:text-blue-300 flex items-center text-sm"
                          >
                            <Plus className="w-4 h-4 mr-1" /> Add Material
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addDay(weekIndex)}
                    className="bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-medium rounded-lg px-4 py-2 transition duration-200 flex items-center"
                  >
                    <Plus className="w-4 h-4 mr-1" /> Add Day
                  </button>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addWeek}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 transition duration-200 flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" /> Add Week
            </button>
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-gray-300 font-medium rounded-lg px-6 py-3 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-6 py-3 transition duration-200 disabled:opacity-70"
            >
              {isSubmitting ? "Uploading..." : "Upload Course"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CourseUploadForm;
