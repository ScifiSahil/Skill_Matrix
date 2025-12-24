import React, { useState, useEffect } from "react";
import { useUIStore } from "../../reducers/uiStore";
import {
  Calendar,
  Clock,
  MapPin,
  User,
  CheckCircle,
  XCircle,
  Loader,
  AlertCircle,
  Award,
  BookOpen,
  FileText,
  TrendingUp,
  Search,
  Filter,
  Download,
} from "lucide-react";

const TrainingManagement = () => {
  const { addNotification } = useUIStore();
  
  // State management
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pending"); // pending | active | results
  const [trainings, setTrainings] = useState([]);
  const [exams, setExams] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Result entry state
  const [showResultModal, setShowResultModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [resultData, setResultData] = useState({
    theory_marks: 0,
    practical_marks: 0,
    remarks: "",
  });

  // Fetch data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // Fetch all trainings
      const trainingResponse = await fetch(
        "http://localhost:8080/api/v1/collection/kln_hr_training_schedule"
      );
      const trainingData = await trainingResponse.json();
      setTrainings(trainingData?.objects || []);

      // Fetch all exams
      const examResponse = await fetch(
        "http://localhost:8080/api/v1/collection/kln_hr_exam_schedule"
      );
      const examData = await examResponse.json();
      setExams(examData?.objects || []);

      // Fetch all assignments
      const assignmentResponse = await fetch(
        "http://localhost:8080/api/v1/collection/kln_hr_employee_assignments"
      );
      const assignmentData = await assignmentResponse.json();
      setAssignments(assignmentData?.objects || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      addNotification({
        type: "error",
        message: "Failed to load training data",
      });
    } finally {
      setLoading(false);
    }
  };

  // Approve training
  const handleApprove = async (trainingId) => {
    try {
      await fetch(
        `http://localhost:8080/api/v1/collection/kln_hr_training_schedule/${trainingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Approved",
            updated_at: new Date().toISOString(),
          }),
        }
      );

      addNotification({
        type: "success",
        message: "Training approved successfully!",
      });
      fetchAllData();
    } catch (error) {
      addNotification({
        type: "error",
        message: "Failed to approve training",
      });
    }
  };

  // Reject training
  const handleReject = async (trainingId) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      await fetch(
        `http://localhost:8080/api/v1/collection/kln_hr_training_schedule/${trainingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Rejected",
            remarks: reason,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      addNotification({
        type: "success",
        message: "Training rejected",
      });
      fetchAllData();
    } catch (error) {
      addNotification({
        type: "error",
        message: "Failed to reject training",
      });
    }
  };

  // Mark attendance
  const handleMarkAttendance = async (trainingId, attended) => {
    try {
      await fetch(
        `http://localhost:8080/api/v1/collection/kln_hr_training_schedule/${trainingId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: attended ? "Completed" : "Absent",
            completion_date: attended ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      addNotification({
        type: "success",
        message: `Attendance marked: ${attended ? "Present" : "Absent"}`,
      });
      fetchAllData();
    } catch (error) {
      addNotification({
        type: "error",
        message: "Failed to mark attendance",
      });
    }
  };

  // Open result entry modal
  const handleOpenResultEntry = (exam) => {
    setSelectedExam(exam);
    setResultData({
      theory_marks: 0,
      practical_marks: 0,
      remarks: "",
    });
    setShowResultModal(true);
  };

  // Submit results and update skill level
  const handleSubmitResults = async () => {
    if (!selectedExam) return;

    const theoryMarks = parseInt(resultData.theory_marks) || 0;
    const practicalMarks = parseInt(resultData.practical_marks) || 0;
    const totalMarks = theoryMarks + practicalMarks;
    const passingMarks = selectedExam.passing_marks || 70;
    const result = totalMarks >= passingMarks ? "Pass" : "Fail";

    try {
      setLoading(true);

      // Update exam with results
      await fetch(
        `http://localhost:8080/api/v1/collection/kln_hr_exam_schedule/${selectedExam.cdb_object_id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            obtained_marks: totalMarks,
            result: result,
            status: "Completed",
            remarks: resultData.remarks,
            updated_at: new Date().toISOString(),
          }),
        }
      );

      // If passed, update skill level
      if (result === "Pass") {
        // Update employee's skill level in skill matrix
        // This will update the actual skill level from current to required
        await updateEmployeeSkillLevel(
          selectedExam.employee_id,
          selectedExam.skill_id,
          selectedExam.skill_name
        );
      }

      addNotification({
        type: "success",
        message: `Results submitted: ${result}${
          result === "Pass" ? " - Skill level updated!" : ""
        }`,
      });

      setShowResultModal(false);
      setSelectedExam(null);
      fetchAllData();
    } catch (error) {
      console.error("Error submitting results:", error);
      addNotification({
        type: "error",
        message: "Failed to submit results",
      });
    } finally {
      setLoading(false);
    }
  };

  // Update employee skill level (this would integrate with your skill matrix store)
  const updateEmployeeSkillLevel = async (employeeId, skillId, skillName) => {
    try {
      // Here you would call your skill matrix API to update the employee's skill level
      // For now, we'll create a record in skill level history
      await fetch(
        "http://localhost:8080/api/v1/collection/kln_hr_skill_level_history",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employee_id: employeeId,
            skill_id: skillId,
            skill_name: skillName,
            previous_level: 3, // You'd get this from actual employee record
            new_level: 4, // Updated level
            updated_reason: "Passed training exam",
            updated_by: "HR",
            updated_at: new Date().toISOString(),
          }),
        }
      );

      console.log("Skill level updated successfully");
    } catch (error) {
      console.error("Error updating skill level:", error);
    }
  };

  // Filter trainings/exams based on search and filter
  const getFilteredItems = (items, statusField = "status") => {
    return items.filter((item) => {
      const matchesSearch =
        item.employee_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.skill_name?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesFilter =
        filterStatus === "all" || item[statusField] === filterStatus;

      return matchesSearch && matchesFilter;
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "scheduled":
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "approved":
        return "bg-green-100 text-green-700 border-green-300";
      case "completed":
        return "bg-blue-100 text-blue-700 border-blue-300";
      case "rejected":
      case "absent":
        return "bg-red-100 text-red-700 border-red-300";
      case "pass":
        return "bg-green-100 text-green-700 border-green-300";
      case "fail":
        return "bg-red-100 text-red-700 border-red-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  if (loading && trainings.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-800 mb-2">
            Loading Training Data...
          </h3>
          <p className="text-gray-600">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Training Management
        </h1>
        <p className="text-gray-600">
          Manage training requests, mark attendance, and record test results
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative flex-1 min-w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by employee or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
            />
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Status</option>
            <option value="Scheduled">Scheduled</option>
            <option value="Approved">Approved</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>

          <button
            onClick={fetchAllData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
          >
            <Loader
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("pending")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition ${
              activeTab === "pending"
                ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <AlertCircle className="w-5 h-5" />
            <span>Pending Approvals</span>
            <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
              {trainings.filter((t) => t.status === "Scheduled").length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("active")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition ${
              activeTab === "active"
                ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <BookOpen className="w-5 h-5" />
            <span>Active Trainings</span>
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              {trainings.filter((t) => t.status === "Approved").length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("results")}
            className={`flex-1 flex items-center justify-center gap-2 px-6 py-4 font-semibold transition ${
              activeTab === "results"
                ? "border-b-2 border-blue-600 text-blue-600 bg-blue-50"
                : "text-gray-600 hover:bg-gray-50"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Test Results</span>
            <span className="bg-purple-500 text-white text-xs px-2 py-1 rounded-full">
              {exams.filter((e) => e.status === "Scheduled").length}
            </span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="space-y-4">
        {/* Pending Approvals Tab */}
        {activeTab === "pending" && (
          <div>
            {getFilteredItems(
              trainings.filter((t) => t.status === "Scheduled"),
              "status"
            ).length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                  No Pending Approvals
                </h3>
                <p className="text-gray-500">
                  All training requests have been processed
                </p>
              </div>
            ) : (
              getFilteredItems(
                trainings.filter((t) => t.status === "Scheduled"),
                "status"
              ).map((training) => (
                <div
                  key={training.cdb_object_id}
                  className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {training.employee_name} ({training.employee_id})
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                            training.status
                          )}`}
                        >
                          {training.status}
                        </span>
                      </div>
                      <p className="text-lg text-blue-600 font-semibold mb-3">
                        🎯 {training.skill_name}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            Training: {formatDate(training.training_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            {training.training_time}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            {training.training_location || "TBD"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            Trainer: {training.trainer_name || "TBD"}
                          </span>
                        </div>
                      </div>

                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-900">
                          <strong>Skill Gap:</strong> Current Level{" "}
                          <span className="font-bold text-orange-600">
                            L{training.current_level}
                          </span>{" "}
                          → Target Level{" "}
                          <span className="font-bold text-green-600">
                            L{training.required_level}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(training.cdb_object_id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Approve Training
                    </button>
                    <button
                      onClick={() => handleReject(training.cdb_object_id)}
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition"
                    >
                      <XCircle className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Active Trainings Tab */}
        {activeTab === "active" && (
          <div>
            {getFilteredItems(
              trainings.filter((t) => t.status === "Approved"),
              "status"
            ).length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                  No Active Trainings
                </h3>
                <p className="text-gray-500">
                  No approved trainings at the moment
                </p>
              </div>
            ) : (
              getFilteredItems(
                trainings.filter((t) => t.status === "Approved"),
                "status"
              ).map((training) => (
                <div
                  key={training.cdb_object_id}
                  className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {training.employee_name} ({training.employee_id})
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                            training.status
                          )}`}
                        >
                          {training.status}
                        </span>
                      </div>
                      <p className="text-lg text-blue-600 font-semibold mb-3">
                        🎯 {training.skill_name}
                      </p>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            {formatDate(training.training_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            {training.training_time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() =>
                        handleMarkAttendance(training.cdb_object_id, true)
                      }
                      className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-semibold transition"
                    >
                      <CheckCircle className="w-5 h-5" />
                      Mark Present
                    </button>
                    <button
                      onClick={() =>
                        handleMarkAttendance(training.cdb_object_id, false)
                      }
                      className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition"
                    >
                      <XCircle className="w-5 h-5" />
                      Mark Absent
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Test Results Tab */}
        {activeTab === "results" && (
          <div>
            {getFilteredItems(exams, "status").length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-600 mb-2">
                  No Tests Scheduled
                </h3>
                <p className="text-gray-500">
                  No exams available for result entry
                </p>
              </div>
            ) : (
              getFilteredItems(exams, "status").map((exam) => (
                <div
                  key={exam.cdb_object_id}
                  className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${
                    exam.status === "Completed"
                      ? "border-blue-500"
                      : "border-purple-500"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">
                          {exam.employee_name} ({exam.employee_id})
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                            exam.status
                          )}`}
                        >
                          {exam.status}
                        </span>
                        {exam.result && (
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(
                              exam.result
                            )}`}
                          >
                            {exam.result}
                          </span>
                        )}
                      </div>
                      <p className="text-lg text-purple-600 font-semibold mb-3">
                        📝 {exam.skill_name}
                      </p>

                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            {formatDate(exam.exam_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-gray-500" />
                          <span className="text-gray-700">
                            {exam.exam_time}
                          </span>
                        </div>
                      </div>

                      {exam.obtained_marks && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                          <p className="text-sm text-blue-900">
                            <strong>Score:</strong> {exam.obtained_marks}/
                            {exam.total_marks} (Passing: {exam.passing_marks})
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {exam.status !== "Completed" && (
                    <button
                      onClick={() => handleOpenResultEntry(exam)}
                      className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg font-semibold transition"
                    >
                      <Award className="w-5 h-5" />
                      Enter Test Results
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Result Entry Modal */}
      {showResultModal && selectedExam && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-8 py-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold">Enter Test Results</h2>
              <p className="text-purple-100 mt-1">
                {selectedExam.employee_name} - {selectedExam.skill_name}
              </p>
            </div>

            <div className="p-8">
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Theory Marks
                  </label>
                  <input
                    type="number"
                    value={resultData.theory_marks}
                    onChange={(e) =>
                      setResultData({
                        ...resultData,
                        theory_marks: e.target.value,
                      })
                    }
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                    placeholder="Out of 50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Practical Marks
                  </label>
                  <input
                    type="number"
                    value={resultData.practical_marks}
                    onChange={(e) =>
                      setResultData({
                        ...resultData,
                        practical_marks: e.target.value,
                      })
                    }
                    min="0"
                    max="50"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                    placeholder="Out of 50"
                  />
                </div>
              </div>

              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Total Marks</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {parseInt(resultData.theory_marks || 0) +
                        parseInt(resultData.practical_marks || 0)}
                      /100
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Passing Marks
                    </p>
                    <p className="text-2xl font-bold text-gray-700">
                      {selectedExam.passing_marks}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Result</p>
                    <p
                      className={`text-2xl font-bold ${
                        parseInt(resultData.theory_marks || 0) +
                          parseInt(resultData.practical_marks || 0) >=
                        selectedExam.passing_marks
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {parseInt(resultData.theory_marks || 0) +
                        parseInt(resultData.practical_marks || 0) >=
                      selectedExam.passing_marks
                        ? "PASS ✓"
                        : "FAIL ✗"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Remarks
                </label>
                <textarea
                  value={resultData.remarks}
                  onChange={(e) =>
                    setResultData({ ...resultData, remarks: e.target.value })
                  }
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-400 focus:border-purple-400"
                  placeholder="Add any remarks or comments..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handleSubmitResults}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-4 rounded-lg font-bold transition disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Submit Results & Update Skill Level
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowResultModal(false);
                    setSelectedExam(null);
                  }}
                  disabled={loading}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-lg font-bold transition disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingManagement;
