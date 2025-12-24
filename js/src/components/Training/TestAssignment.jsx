import React, { useState } from "react";
import {
  Users,
  Send,
  X,
  Calendar,
  Clock,
  FileText,
  CheckSquare,
  AlertCircle,
  Search,
  Filter
} from "lucide-react";
import { useTrainingStore } from "../../reducers/trainingStore";

/**
 * Test Assignment Component
 * HR/Admin can assign tests to specific users with deadlines
 */
const TestAssignment = ({ isOpen, onClose, testData }) => {
  const { assignTestToUser, users } = useTrainingStore();
  
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [assignmentDetails, setAssignmentDetails] = useState({
    dueDate: "",
    dueTime: "",
    maxAttempts: 2,
    notifyUser: true,
    remarks: ""
  });

  // Mock users data (in real app, this will come from API)
  const mockUsers = [
    { id: "EMP001", name: "Rajesh Kumar", department: "Production", email: "rajesh@company.com", role: "Operator" },
    { id: "EMP002", name: "Priya Sharma", department: "Quality", email: "priya@company.com", role: "Inspector" },
    { id: "EMP003", name: "Amit Patel", department: "Production", email: "amit@company.com", role: "Supervisor" },
    { id: "EMP004", name: "Sneha Reddy", department: "Maintenance", email: "sneha@company.com", role: "Technician" },
    { id: "EMP005", name: "Vikram Singh", department: "Production", email: "vikram@company.com", role: "Operator" },
    { id: "EMP006", name: "Meera Iyer", department: "Quality", email: "meera@company.com", role: "Manager" },
    { id: "EMP007", name: "Karan Mehta", department: "Production", email: "karan@company.com", role: "Operator" },
    { id: "EMP008", name: "Anjali Gupta", department: "HR", email: "anjali@company.com", role: "Executive" }
  ];

  const departments = ["all", "Production", "Quality", "Maintenance", "HR"];

  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || user.department === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleUserToggle = (userId) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const handleAssign = () => {
    if (selectedUsers.length === 0) {
      alert("Please select at least one user");
      return;
    }

    if (!assignmentDetails.dueDate || !assignmentDetails.dueTime) {
      alert("Please set due date and time");
      return;
    }

    const assignments = selectedUsers.map(userId => {
      const user = mockUsers.find(u => u.id === userId);
      return {
        id: `assign_${Date.now()}_${userId}`,
        testId: testData.id,
        testTitle: testData.title,
        userId: userId,
        userName: user.name,
        userEmail: user.email,
        department: user.department,
        dueDate: assignmentDetails.dueDate,
        dueTime: assignmentDetails.dueTime,
        maxAttempts: assignmentDetails.maxAttempts,
        remainingAttempts: assignmentDetails.maxAttempts,
        status: "assigned",
        assignedAt: new Date().toISOString(),
        assignedBy: "Admin", // Replace with actual user
        notifyUser: assignmentDetails.notifyUser,
        remarks: assignmentDetails.remarks
      };
    });

    // Send to store (you'll need to implement this in trainingStore)
    assignments.forEach(assignment => {
      assignTestToUser(assignment);
    });

    alert(`Test assigned to ${selectedUsers.length} user(s) successfully!`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-6 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-3">
                <Users className="w-8 h-8" />
                Assign Test to Users
              </h2>
              <p className="text-indigo-100 mt-2">
                Test: {testData?.title}
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

        <div className="p-8 space-y-6">
          {/* Test Info */}
          <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-lg">
            <div className="flex items-start gap-4">
              <FileText className="w-6 h-6 text-indigo-600 mt-1" />
              <div className="flex-1">
                <h3 className="font-bold text-indigo-900">{testData?.title}</h3>
                <p className="text-sm text-indigo-700 mt-1">{testData?.description}</p>
                <div className="flex gap-4 mt-3 text-sm text-indigo-600">
                  <span>📝 {testData?.questionCount} Questions</span>
                  <span>⏱️ {testData?.duration} minutes</span>
                  <span>🎯 {testData?.totalMarks} marks</span>
                  <span>✅ {testData?.passingMarks}% to pass</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assignment Settings */}
          <div className="bg-gray-50 p-6 rounded-xl space-y-4">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Assignment Settings
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={assignmentDetails.dueDate}
                  onChange={(e) => setAssignmentDetails({ ...assignmentDetails, dueDate: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Due Time *
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="time"
                    value={assignmentDetails.dueTime}
                    onChange={(e) => setAssignmentDetails({ ...assignmentDetails, dueTime: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Max Attempts
                </label>
                <input
                  type="number"
                  value={assignmentDetails.maxAttempts}
                  onChange={(e) => setAssignmentDetails({ ...assignmentDetails, maxAttempts: parseInt(e.target.value) })}
                  min="1"
                  max="5"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Remarks / Instructions
              </label>
              <textarea
                value={assignmentDetails.remarks}
                onChange={(e) => setAssignmentDetails({ ...assignmentDetails, remarks: e.target.value })}
                rows="2"
                placeholder="Optional: Add any special instructions for the users..."
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
              />
            </div>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={assignmentDetails.notifyUser}
                onChange={(e) => setAssignmentDetails({ ...assignmentDetails, notifyUser: e.target.checked })}
                className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-400"
              />
              <span className="text-sm font-semibold text-gray-700">
                Send email notification to assigned users
              </span>
            </label>
          </div>

          {/* User Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                Select Users ({selectedUsers.length} selected)
              </h3>
              <button
                onClick={handleSelectAll}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {selectedUsers.length === filteredUsers.length ? "Deselect All" : "Select All"}
              </button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or employee ID..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="pl-10 pr-8 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 transition appearance-none bg-white"
                >
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept === "all" ? "All Departments" : dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Users List */}
            <div className="max-h-80 overflow-y-auto space-y-2 border-2 border-gray-200 rounded-lg p-4">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <label
                    key={user.id}
                    className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${
                      selectedUsers.includes(user.id)
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-indigo-300 bg-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleUserToggle(user.id)}
                      className="w-5 h-5 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-400"
                    />
                    <div className="ml-4 flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-gray-800">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.id} • {user.role}</p>
                        </div>
                        <div className="text-right">
                          <span className="inline-block px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-semibold">
                            {user.department}
                          </span>
                        </div>
                      </div>
                    </div>
                  </label>
                ))
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">No users found</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary */}
          {selectedUsers.length > 0 && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <div className="flex items-start gap-3">
                <CheckSquare className="w-5 h-5 text-green-600 mt-1" />
                <div>
                  <p className="font-semibold text-green-900">Ready to Assign</p>
                  <p className="text-sm text-green-700 mt-1">
                    This test will be assigned to <strong>{selectedUsers.length}</strong> user(s).
                    {assignmentDetails.notifyUser && " Email notifications will be sent."}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 px-8 py-6 rounded-b-2xl border-t border-gray-200 flex gap-4">
          <button
            onClick={handleAssign}
            disabled={selectedUsers.length === 0 || !assignmentDetails.dueDate || !assignmentDetails.dueTime}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white py-4 rounded-lg font-bold transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            <Send className="w-5 h-5" />
            Assign Test to {selectedUsers.length} User(s)
          </button>
          <button
            onClick={onClose}
            className="px-8 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 rounded-lg font-bold transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TestAssignment;
