import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Video,
  BookOpen,
  Send,
  X,
  Loader,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

/**
 * Training Assignment Modal Component
 * Admin uses this to schedule training and exam for employees with skill gaps
 */
const TrainingCard = ({
  isOpen,
  onClose,
  employeeData,
  skillData,
  onSubmit,
}) => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("training"); // training | exam | materials

  const [trainingData, setTrainingData] = useState({
    training_date: "",
    training_time: "",
    training_location: "",
    trainer_name: "",
    remarks: "",
  });

  const [examData, setExamData] = useState({
    exam_date: "",
    exam_time: "",
    exam_location: "",
    exam_type: "Theory",
    passing_marks: 70,
    total_marks: 100,
    examiner_name: "",
    remarks: "",
  });

  const [selectedMaterials, setSelectedMaterials] = useState([]);

  // Sample training materials (will come from API in future)
  const availableMaterials = [
    {
      id: "1",
      title: "CNC Turning Basics - Video Tutorial",
      type: "Video",
      duration: "45 mins",
    },
    {
      id: "2",
      title: "Safety Guidelines - PDF Document",
      type: "PDF",
      duration: "10 mins",
    },
    {
      id: "3",
      title: "Advanced Techniques - PowerPoint",
      type: "PPT",
      duration: "30 mins",
    },
  ];

  const handleMaterialToggle = (materialId) => {
    setSelectedMaterials((prev) =>
      prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId]
    );
  };

  const handleSubmit = async () => {
    // Validation
    if (!trainingData.training_date || !trainingData.training_time) {
      alert("Please fill training date and time");
      return;
    }

    if (!examData.exam_date || !examData.exam_time) {
      alert("Please fill exam date and time");
      return;
    }

    setLoading(true);

    const assignmentPayload = {
      employee_id: employeeData.id,
      employee_name: employeeData.name,
      skill_id: skillData.id,
      skill_name: skillData.name,
      current_level: skillData.currentLevel,
      required_level: skillData.requiredLevel,
      training: trainingData,
      exam: examData,
      training_materials: selectedMaterials,
      assigned_date: new Date().toISOString(),
      assigned_by: "Admin", // Replace with actual logged-in user
      priority: "High",
      status: "Active",
    };

    try {
      await onSubmit(assignmentPayload);
      
      // Reset form
      setTrainingData({
        training_date: "",
        training_time: "",
        training_location: "",
        trainer_name: "",
        remarks: "",
      });
      setExamData({
        exam_date: "",
        exam_time: "",
        exam_location: "",
        exam_type: "Theory",
        passing_marks: 70,
        total_marks: 100,
        examiner_name: "",
        remarks: "",
      });
      setSelectedMaterials([]);
      onClose();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert("Failed to create assignment: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <BookOpen className="w-8 h-8" />
                Schedule Training & Exam
              </h2>
              <p className="text-indigo-100 mt-2">
                {employeeData?.name} ({employeeData?.id}) - {skillData?.name}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Skill Gap Info */}
        <div className="px-8 py-4 bg-yellow-50 border-b border-yellow-200">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600" />
            <div>
              <p className="text-sm font-semibold text-yellow-900">
                Skill Gap Identified
              </p>
              <p className="text-xs text-yellow-700">
                Current Level: <strong>L{skillData?.currentLevel}</strong> →
                Required Level: <strong>L{skillData?.requiredLevel}</strong> (Gap
                of {skillData?.requiredLevel - skillData?.currentLevel} levels)
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8 pt-6">
          <div className="flex space-x-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab("training")}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === "training"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Training Schedule
              </div>
            </button>
            <button
              onClick={() => setActiveTab("exam")}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === "exam"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Exam Schedule
              </div>
            </button>
            <button
              onClick={() => setActiveTab("materials")}
              className={`px-6 py-3 font-semibold transition ${
                activeTab === "materials"
                  ? "border-b-2 border-indigo-600 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4" />
                Training Materials
                {selectedMaterials.length > 0 && (
                  <span className="bg-indigo-600 text-white text-xs rounded-full px-2 py-0.5">
                    {selectedMaterials.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {/* Training Tab */}
          {activeTab === "training" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Training Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={trainingData.training_date}
                      onChange={(e) =>
                        setTrainingData({
                          ...trainingData,
                          training_date: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Training Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="time"
                      value={trainingData.training_time}
                      onChange={(e) =>
                        setTrainingData({
                          ...trainingData,
                          training_time: e.target.value,
                        })
                      }
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Training Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={trainingData.training_location}
                      onChange={(e) =>
                        setTrainingData({
                          ...trainingData,
                          training_location: e.target.value,
                        })
                      }
                      placeholder="e.g., Training Room 1, Shop Floor"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Trainer Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={trainingData.trainer_name}
                      onChange={(e) =>
                        setTrainingData({
                          ...trainingData,
                          trainer_name: e.target.value,
                        })
                      }
                      placeholder="Enter trainer name"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Remarks / Special Instructions
                </label>
                <textarea
                  value={trainingData.remarks}
                  onChange={(e) =>
                    setTrainingData({
                      ...trainingData,
                      remarks: e.target.value,
                    })
                  }
                  rows="3"
                  placeholder="Add any special instructions or notes..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                />
              </div>
            </div>
          )}

          {/* Exam Tab */}
          {activeTab === "exam" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Exam Date <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="date"
                      value={examData.exam_date}
                      onChange={(e) =>
                        setExamData({ ...examData, exam_date: e.target.value })
                      }
                      min={trainingData.training_date || new Date().toISOString().split("T")[0]}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Exam Time <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="time"
                      value={examData.exam_time}
                      onChange={(e) =>
                        setExamData({ ...examData, exam_time: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Exam Type
                  </label>
                  <select
                    value={examData.exam_type}
                    onChange={(e) =>
                      setExamData({ ...examData, exam_type: e.target.value })
                    }
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  >
                    <option value="Theory">Theory</option>
                    <option value="Practical">Practical</option>
                    <option value="Both">Both (Theory + Practical)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Exam Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={examData.exam_location}
                      onChange={(e) =>
                        setExamData({
                          ...examData,
                          exam_location: e.target.value,
                        })
                      }
                      placeholder="e.g., Testing Lab, Shop Floor"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Passing Marks
                  </label>
                  <input
                    type="number"
                    value={examData.passing_marks}
                    onChange={(e) =>
                      setExamData({
                        ...examData,
                        passing_marks: parseInt(e.target.value),
                      })
                    }
                    min="0"
                    max={examData.total_marks}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={examData.total_marks}
                    onChange={(e) =>
                      setExamData({
                        ...examData,
                        total_marks: parseInt(e.target.value),
                      })
                    }
                    min="0"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Examiner Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      value={examData.examiner_name}
                      onChange={(e) =>
                        setExamData({
                          ...examData,
                          examiner_name: e.target.value,
                        })
                      }
                      placeholder="Enter examiner name"
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Exam Instructions
                </label>
                <textarea
                  value={examData.remarks}
                  onChange={(e) =>
                    setExamData({ ...examData, remarks: e.target.value })
                  }
                  rows="3"
                  placeholder="Add exam instructions or requirements..."
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                />
              </div>
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === "materials" && (
            <div className="space-y-4">
              <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
                <p className="text-sm text-indigo-900">
                  <strong>Select training materials</strong> that will be
                  assigned to the employee. They can access these before the
                  training date.
                </p>
              </div>

              <div className="space-y-3">
                {availableMaterials.map((material) => (
                  <label
                    key={material.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedMaterials.includes(material.id)
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMaterials.includes(material.id)}
                      onChange={() => handleMaterialToggle(material.id)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-400"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center gap-2">
                        {material.type === "Video" && (
                          <Video className="w-5 h-5 text-indigo-600" />
                        )}
                        {material.type === "PDF" && (
                          <FileText className="w-5 h-5 text-red-600" />
                        )}
                        {material.type === "PPT" && (
                          <FileText className="w-5 h-5 text-orange-600" />
                        )}
                        <span className="font-semibold text-gray-800">
                          {material.title}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {material.type} • {material.duration}
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              {selectedMaterials.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">
                    No materials selected. Select at least one material.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-8 py-6 rounded-b-2xl border-t border-gray-200 flex gap-4">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-4 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Creating Assignment...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Assign & Notify Employee
              </>
            )}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <X className="w-5 h-5" />
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingCard;