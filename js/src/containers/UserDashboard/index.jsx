import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  BookOpen,
  FileText,
  Award,
  CheckCircle,
  Loader,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { useAuthStore } from "../../reducers/authStore";
import { useTrainingStore } from "../../reducers/trainingStore";
import TakeTest from "../../components/Training/TakeTest";

const UserDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [trainings, setTrainings] = useState([]);
  const [exams, setExams] = useState([]);
  
  // Test Management State
  const [showTest, setShowTest] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState(null);

  // Get current user
  const { user } = useAuthStore();
  const currentEmployeeId = user?.employee_id || user?.id || "4961";

  console.log("👤 Current User:", user);
  console.log("🆔 Employee ID:", currentEmployeeId);

  // Store Functions
  const { 
    getUserTestAssignments, 
    getTestById, 
    submitTestResult,
    getUserTestResults,
    testAssignments, // 🆕 Direct access to all assignments
    tests // 🆕 Direct access to all tests
  } = useTrainingStore();

  // Get Test Assignments
  const allAssignments = testAssignments || []; // Get all assignments
  const userAssignments = getUserTestAssignments(currentEmployeeId);
  const testResults = getUserTestResults(currentEmployeeId);

  // 🆕 Debug logs
  useEffect(() => {
    console.log("📊 All Test Assignments:", allAssignments);
    console.log("👤 User Assignments:", userAssignments);
    console.log("📝 All Tests:", tests);
    console.log("🎯 Test Results:", testResults);
  }, [allAssignments, userAssignments, tests, testResults]);

  useEffect(() => {
    fetchEmployeeData();
  }, []);

  const fetchEmployeeData = async () => {
    setLoading(true);
    try {
      // Fetch trainings
      const trainingsResponse = await fetch(
        `http://localhost:8080/api/v1/collection/kln_hr_training_schedule?employee_id=${currentEmployeeId}`
      );
      const trainingsData = await trainingsResponse.json();
      setTrainings(trainingsData?.objects || []);

      // Fetch exams
      const examsResponse = await fetch(
        `http://localhost:8080/api/v1/collection/kln_hr_exam_schedule?employee_id=${currentEmployeeId}`
      );
      const examsData = await examsResponse.json();
      setExams(examsData?.objects || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Test Handler Functions
  const handleStartTest = (assignment) => {
    const testData = getTestById(assignment.testId);
    
    console.log("🚀 Starting test:", assignment);
    console.log("📝 Test data:", testData);
    
    if (!testData) {
      alert('❌ Test data not found!');
      return;
    }
    
    setCurrentAssignment({
      ...assignment,
      testData
    });
    
    setShowTest(true);
  };

  const handleSubmitTest = (results) => {
    submitTestResult(results);
    setShowTest(false);
    
    const passed = results.results.passed;
    const score = results.results.percentage;
    
    alert(
      `✅ Test Submitted Successfully!\n\n` +
      `📊 Score: ${score}%\n` +
      `${passed ? '✅ Status: PASSED' : '❌ Status: FAILED'}\n` +
      `📝 Correct: ${results.results.correctAnswers}/${results.results.totalQuestions}\n` +
      `🎯 Marks: ${results.results.earnedMarks}/${results.results.totalMarks}\n\n` +
      `Check detailed results in your dashboard.`
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-3xl font-bold mb-6">My Learning Dashboard</h1>

      {/* Debug Info - Remove in production */}
      <div className="bg-yellow-50 border-2 border-yellow-300 p-4 rounded-lg mb-6">
        <p className="font-bold text-yellow-900">🔍 Debug Info:</p>
        <p className="text-sm text-yellow-800">User ID: {currentEmployeeId}</p>
        <p className="text-sm text-yellow-800">Total Assignments in Store: {allAssignments.length}</p>
        <p className="text-sm text-yellow-800">My Assignments: {userAssignments.length}</p>
        <p className="text-sm text-yellow-800">Total Tests Available: {tests?.length || 0}</p>
        {allAssignments.length > 0 && (
          <details className="mt-2">
            <summary className="cursor-pointer text-sm font-semibold text-yellow-900">View All Assignments</summary>
            <pre className="text-xs bg-yellow-100 p-2 rounded mt-2 overflow-auto max-h-40">
              {JSON.stringify(allAssignments, null, 2)}
            </pre>
          </details>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <BookOpen className="w-10 h-10 text-blue-500 mb-3" />
          <p className="text-2xl font-bold text-blue-600">
            {trainings.filter((t) => t.status === "Scheduled").length}
          </p>
          <p className="text-sm text-gray-600">Active Trainings</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <FileText className="w-10 h-10 text-purple-500 mb-3" />
          <p className="text-2xl font-bold text-purple-600">
            {exams.filter((e) => e.status === "Scheduled").length}
          </p>
          <p className="text-sm text-gray-600">Upcoming Exams</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <Award className="w-10 h-10 text-green-500 mb-3" />
          <p className="text-2xl font-bold text-green-600">
            {exams.filter((e) => e.result === "Pass").length}
          </p>
          <p className="text-sm text-gray-600">Certificates Earned</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <CheckCircle className="w-10 h-10 text-indigo-500 mb-3" />
          <p className="text-2xl font-bold text-indigo-600">
            {userAssignments.filter((a) => a.status === "assigned").length}
          </p>
          <p className="text-sm text-gray-600">Pending Tests</p>
        </div>
      </div>

      {/* 🆕 MY ASSIGNED TESTS SECTION */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
          <FileText className="w-6 h-6 text-indigo-600" />
          My Assigned Tests
        </h2>
        
        {userAssignments.length === 0 ? (
          <div className="bg-gray-50 p-8 rounded-xl text-center border-2 border-gray-200">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-semibold">No tests assigned yet.</p>
            <p className="text-gray-500 text-sm mt-2">
              Tests will appear here when HR assigns them to you.
            </p>
            {allAssignments.length > 0 && (
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <AlertCircle className="w-6 h-6 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> There are {allAssignments.length} test(s) in the system, but none are assigned to your user ID: <code className="bg-yellow-100 px-2 py-1 rounded">{currentEmployeeId}</code>
                </p>
                <p className="text-xs text-yellow-700 mt-2">
                  Please check with HR or verify your employee ID is correct.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {userAssignments.map((assignment, index) => {
              const testResult = testResults.find(r => r.assignmentId === assignment.id);
              const isPending = assignment.status === 'assigned' && assignment.remainingAttempts > 0;
              const isPassed = assignment.status === 'passed';
              const isFailed = assignment.status === 'failed';
              
              return (
                <div 
                  key={assignment.id || index} 
                  className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${
                    isPending ? 'border-indigo-300 bg-indigo-50' : 
                    isPassed ? 'border-green-300 bg-green-50' : 
                    isFailed ? 'border-red-300 bg-red-50' :
                    'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-800 mb-3">
                        {assignment.testTitle}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {/* Status Badge */}
                        <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                          isPending ? 'bg-yellow-100 text-yellow-700' :
                          isPassed ? 'bg-green-100 text-green-700' :
                          isFailed ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {isPending ? '⏳ Pending' :
                           isPassed ? '✅ Passed' :
                           isFailed ? '❌ Failed' :
                           '📝 ' + assignment.status.toUpperCase()}
                        </span>
                        
                        {/* Due Date */}
                        <span className="bg-red-100 text-red-700 px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          Due: {assignment.dueDate} at {assignment.dueTime}
                        </span>
                        
                        {/* Attempts */}
                        <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                          assignment.remainingAttempts > 0 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          🔁 Attempts: {assignment.remainingAttempts} left
                        </span>
                        
                        {/* Score if available */}
                        {testResult && (
                          <span className={`px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 ${
                            testResult.results.passed ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                          }`}>
                            <TrendingUp className="w-4 h-4" />
                            Last Score: {testResult.results.percentage}%
                          </span>
                        )}
                      </div>

                      {/* Remarks */}
                      {assignment.remarks && (
                        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200 mb-3">
                          <p className="text-sm text-blue-900">
                            <strong>📋 Instructions:</strong> {assignment.remarks}
                          </p>
                        </div>
                      )}

                      {/* Test Details */}
                      <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                        <span>📝 Questions: {assignment.questionCount || 'N/A'}</span>
                        <span>⏱️ Duration: {assignment.duration || 'N/A'} min</span>
                        <span>🎯 Pass Mark: {assignment.passingMarks || 'N/A'}%</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="ml-6 flex flex-col gap-3">
                      {isPending && (
                        <button
                          onClick={() => handleStartTest(assignment)}
                          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-4 rounded-lg font-bold shadow-lg transition-all transform hover:scale-105 whitespace-nowrap flex items-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Start Test
                        </button>
                      )}
                      
                      {testResult && (
                        <button
                          onClick={() => {
                            const r = testResult.results;
                            alert(
                              `📊 Test Results - ${assignment.testTitle}\n\n` +
                              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                              `📈 Score: ${r.percentage}%\n` +
                              `${r.passed ? '✅ Status: PASSED' : '❌ Status: FAILED'}\n` +
                              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
                              `📝 Correct Answers: ${r.correctAnswers}/${r.totalQuestions}\n` +
                              `🎯 Marks Obtained: ${r.earnedMarks}/${r.totalMarks}\n` +
                              `⏱️ Time Taken: ${Math.floor(r.timeTaken / 60)} min ${r.timeTaken % 60} sec\n` +
                              `━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n` +
                              `View detailed question-wise analysis in the system.`
                            );
                          }}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-2"
                        >
                          <FileText className="w-5 h-5" />
                          View Results
                        </button>
                      )}

                      {isFailed && assignment.remainingAttempts > 0 && (
                        <button
                          onClick={() => handleStartTest(assignment)}
                          className="bg-orange-600 hover:bg-orange-700 text-white px-8 py-3 rounded-lg font-bold transition-all whitespace-nowrap flex items-center gap-2"
                        >
                          🔄 Retry Test
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Upcoming Trainings */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          Upcoming Trainings
        </h2>
        {trainings.filter((t) => t.status === "Scheduled").length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No upcoming trainings
          </p>
        ) : (
          <div className="space-y-4">
            {trainings
              .filter((t) => t.status === "Scheduled")
              .map((training) => (
                <div
                  key={training.cdb_object_id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-300 transition"
                >
                  <h3 className="font-bold text-lg mb-2">
                    {training.skill_name}
                  </h3>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(training.training_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {training.training_time}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Upcoming Exams */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-6 h-6 text-purple-600" />
          Upcoming Exams
        </h2>
        {exams.filter((e) => e.status === "Scheduled").length === 0 ? (
          <p className="text-gray-500 text-center py-8">No upcoming exams</p>
        ) : (
          <div className="space-y-4">
            {exams
              .filter((e) => e.status === "Scheduled")
              .map((exam) => (
                <div
                  key={exam.cdb_object_id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-purple-300 transition"
                >
                  <h3 className="font-bold text-lg mb-2">{exam.skill_name}</h3>
                  <div className="flex gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(exam.exam_date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {exam.exam_time}
                    </div>
                  </div>
                  <div className="mt-2 text-sm">
                    <span className="font-semibold">Type:</span>{" "}
                    {exam.exam_type}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* 🆕 TAKE TEST MODAL */}
      {showTest && currentAssignment && (
        <TakeTest
          testData={currentAssignment.testData}
          assignmentData={currentAssignment}
          onSubmit={handleSubmitTest}
          onClose={() => setShowTest(false)}
        />
      )}
    </div>
  );
};

export default UserDashboard;