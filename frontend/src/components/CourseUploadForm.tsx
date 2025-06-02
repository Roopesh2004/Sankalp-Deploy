import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, X } from 'lucide-react';

interface Module {
  title: string;
  day: number;
  videoUrl: string;
  materials: string[];
}

interface CourseFormData {
  title: string;
  description: string;
  thumbnail: string;
  modules: Module[];
}

interface CourseUploadFormProps {
  onClose: () => void;
}

const CourseUploadForm: React.FC<CourseUploadFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<CourseFormData>({
    title: '',
    description: '',
    thumbnail: '',
    modules: [{ title: '', day: 1, videoUrl: '', materials: [''] }]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleModuleChange = (index: number, field: keyof Module, value: string | number) => {
    setFormData(prev => {
      const updatedModules = [...prev.modules];
      updatedModules[index] = { ...updatedModules[index], [field]: value };
      return { ...prev, modules: updatedModules };
    });
  };

  const handleMaterialChange = (moduleIndex: number, materialIndex: number, value: string) => {
    setFormData(prev => {
      const updatedModules = [...prev.modules];
      const updatedMaterials = [...updatedModules[moduleIndex].materials];
      updatedMaterials[materialIndex] = value;
      updatedModules[moduleIndex] = { ...updatedModules[moduleIndex], materials: updatedMaterials };
      return { ...prev, modules: updatedModules };
    });
  };

  const addModule = () => {
    setFormData(prev => ({
      ...prev,
      modules: [...prev.modules, { title: '', day: prev.modules.length + 1, videoUrl: '', materials: [''] }]
    }));
  };

  const removeModule = (index: number) => {
    setFormData(prev => {
      const updatedModules = prev.modules.filter((_, i) => i !== index);
      // Update day numbers
      return { ...prev, modules: updatedModules.map((m, i) => ({ ...m, day: i + 1 })) };
    });
  };

  const addMaterial = (moduleIndex: number) => {
    setFormData(prev => {
      const updatedModules = [...prev.modules];
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        materials: [...updatedModules[moduleIndex].materials, '']
      };
      return { ...prev, modules: updatedModules };
    });
  };

  const removeMaterial = (moduleIndex: number, materialIndex: number) => {
    setFormData(prev => {
      const updatedModules = [...prev.modules];
      updatedModules[moduleIndex] = {
        ...updatedModules[moduleIndex],
        materials: updatedModules[moduleIndex].materials.filter((_, i) => i !== materialIndex)
      };
      return { ...prev, modules: updatedModules };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await fetch('http://localhost:5000/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create course');
      }
      
      const result = await response.json();
      setSuccess(`Course created successfully with ID: ${result.courseId}`);
      
      // Reset form after success
      setFormData({
        title: '',
        description: '',
        thumbnail: '',
        modules: [{ title: '', day: 1, videoUrl: '', materials: [''] }]
      });
      
      // Close form after 2 seconds
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (error) {
      setError(error.message || 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-dark-200 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-primary-400">Upload New Course</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
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
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-primary-400 mb-1">
                Course Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-dark-100 border border-primary-800/20 rounded-lg p-3 text-gray-200"
                placeholder="Enter course title"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-400 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={3}
                className="w-full bg-dark-100 border border-primary-800/20 rounded-lg p-3 text-gray-200"
                placeholder="Enter course description"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-primary-400 mb-1">
                Thumbnail URL
              </label>
              <input
                type="text"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className="w-full bg-dark-100 border border-primary-800/20 rounded-lg p-3 text-gray-200"
                placeholder="Enter thumbnail URL (optional)"
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-primary-400 mb-4">Course Modules</h3>
            
            {formData.modules.map((module, moduleIndex) => (
              <div 
                key={moduleIndex}
                className="bg-dark-100 border border-primary-800/20 rounded-lg p-4 mb-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-200">Module {module.day}</h4>
                  {formData.modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeModule(moduleIndex)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-primary-400 mb-1">
                      Module Title
                    </label>
                    <input
                      type="text"
                      value={module.title}
                      onChange={(e) => handleModuleChange(moduleIndex, 'title', e.target.value)}
                      required
                      className="w-full bg-dark-300 border border-primary-800/20 rounded-lg p-3 text-gray-200"
                      placeholder="Enter module title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary-400 mb-1">
                      Video URL (YouTube)
                    </label>
                    <input
                      type="text"
                      value={module.videoUrl}
                      onChange={(e) => handleModuleChange(moduleIndex, 'videoUrl', e.target.value)}
                      required
                      className="w-full bg-dark-300 border border-primary-800/20 rounded-lg p-3 text-gray-200"
                      placeholder="Enter YouTube video URL"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-primary-400 mb-1">
                      Materials
                    </label>
                    {module.materials.map((material, materialIndex) => (
                      <div key={materialIndex} className="flex items-center mb-2">
                        <input
                          type="text"
                          value={material}
                          onChange={(e) => handleMaterialChange(moduleIndex, materialIndex, e.target.value)}
                          className="flex-1 bg-dark-300 border border-primary-800/20 rounded-lg p-3 text-gray-200"
                          placeholder="Enter material name"
                        />
                        {module.materials.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMaterial(moduleIndex, materialIndex)}
                            className="ml-2 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => addMaterial(moduleIndex)}
                      className="text-primary-400 hover:text-primary-300 flex items-center text-sm"
                    >
                      <Plus className="w-4 h-4 mr-1" /> Add Material
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addModule}
              className="bg-primary-600/20 hover:bg-primary-600/30 text-primary-400 font-medium rounded-lg px-4 py-2 transition duration-200 flex items-center"
            >
              <Plus className="w-5 h-5 mr-1" /> Add Module
            </button>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="bg-dark-300 hover:bg-dark-400 text-gray-300 font-medium rounded-lg px-6 py-3 transition duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg px-6 py-3 transition duration-200 disabled:opacity-70"
            >
              {isSubmitting ? 'Uploading...' : 'Upload Course'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CourseUploadForm;