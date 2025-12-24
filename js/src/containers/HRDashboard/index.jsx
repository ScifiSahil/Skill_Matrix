import React, { useState, Suspense, lazy, useCallback, memo } from "react";
import { useAuthStore } from "../../reducers/authStore";
import { useUIStore } from "../../reducers/uiStore";
import { useTrainingStore } from "../../reducers/trainingStore";
import MastersCRUD from "../../components/Masters/MastersCRUD";

import {
  FileText,
  Grid3x3,
  Users,
  BarChart3,
  BookOpen,
  Loader,
  Settings2 
} from "lucide-react";
import TestCreation from "../../components/Training/TestCreation";
import TestAssignment from "../../components/Training/TestAssignment";

// ✅ LAZY LOAD heavy components - they will only load when needed
const SkillListPage = lazy(() =>
  import("../../components/SkillMatrix/SkillListPage")
);
const SkillMatrixGrid = lazy(() =>
  import("../../components/SkillMatrix/SkillMatrixGrid")
);
const TrainingManagement = lazy(() => import("./TrainingManagement"));

// ✅ Loading Fallback Component
const LoadingFallback = memo(() => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <Loader className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-3" />
      <p className="text-gray-600 font-medium">Loading...</p>
    </div>
  </div>
));

// ✅ Tab Button Component - Memoized
const TabButton = memo(({ id, icon: Icon, label, currentView, onClick }) => (
  <button
    onClick={() => onClick(id)}
    className={`flex items-center space-x-2 px-4 py-3 font-semibold transition-all whitespace-nowrap text-sm ${
      currentView === id
        ? "bg-blue-600 text-white rounded-t-lg border-b-2 border-blue-600"
        : "text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-t-lg"
    }`}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </button>
));

// ✅ Test Card Component - Memoized
const TestCard = memo(({ test, index, onAssign }) => (
  <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:border-indigo-400 transition-all hover:shadow-lg">
    <div className="p-5">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Test Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-bold">
              Test #{index + 1}
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                test.status === "active"
                  ? "bg-green-100 text-green-700"
                  : test.status === "draft"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {test.status || "Draft"}
            </span>
          </div>

          {/* Test Title */}
          <h4 className="text-lg font-bold text-gray-800 mb-2">
            {test.title || `Skill Assessment Test`}
          </h4>

          {/* Test Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-gray-500 text-xs">Questions</span>
              <p className="font-bold text-gray-800">
                {test.questions?.length || 0}
              </p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-gray-500 text-xs">Duration</span>
              <p className="font-bold text-gray-800">
                {test.duration || 30} min
              </p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-gray-500 text-xs">Pass %</span>
              <p className="font-bold text-gray-800">
                {test.passingPercentage || 60}%
              </p>
            </div>
            <div className="bg-gray-50 p-2 rounded">
              <span className="text-gray-500 text-xs">Assigned</span>
              <p className="font-bold text-gray-800">
                {test.assignedUsers?.length || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Assign Button */}
        <button
          onClick={() => onAssign(test)}
          className="ml-4 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-5 py-3 rounded-lg font-semibold transition-all shadow-md transform hover:scale-105 whitespace-nowrap flex items-center gap-2 text-sm"
        >
          <Users className="w-4 h-4" />
          <span>Assign Users</span>
        </button>
      </div>
    </div>
  </div>
));

// ✅ Empty Tests State Component
const EmptyTestsState = memo(({ onCreateTest }) => (
  <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-8 rounded-xl text-center border-2 border-purple-200">
    <FileText className="w-16 h-16 text-purple-400 mx-auto mb-3" />
    <h3 className="text-xl font-bold text-gray-800 mb-2">
      No Tests Created Yet
    </h3>
    <p className="text-gray-600 mb-4 text-sm">
      Start by creating your first test to assess employee skills
    </p>
    <button
      onClick={onCreateTest}
      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold transition inline-flex items-center gap-2 text-sm"
    >
      <span>➕</span>
      Create Your First Test
    </button>
  </div>
));

const HRDashboard = () => {
  // Test Management State
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  // Existing State
  const { user } = useAuthStore();
  const { activeView } = useUIStore();
  const [currentView, setCurrentView] = useState("matrix");

  // ✅ Track which components have been loaded (for state preservation)
  const [loadedViews, setLoadedViews] = useState({
    matrix: false,
    skilllist: false,
    training: false,
  });

  // Get Tests from Store
  const { tests, getTests } = useTrainingStore();
  const allTests = getTests();

  // ✅ Memoized tab change handler
  const handleTabChange = useCallback((view) => {
    setCurrentView(view);
    setLoadedViews((prev) => ({ ...prev, [view]: true }));
  }, []);

  // ✅ Memoized handlers
  const handleCreateTest = useCallback(() => setShowCreateTest(true), []);
  const handleCloseCreateTest = useCallback(() => setShowCreateTest(false), []);

  const handleAssignTest = useCallback((test) => {
    setSelectedTest(test);
    setShowAssignment(true);
  }, []);

  const handleCloseAssignment = useCallback(() => setShowAssignment(false), []);

  // Tabs configuration
  const tabs = [
    { id: "matrix", icon: Grid3x3, label: "Skill Matrix" },
    { id: "skilllist", icon: FileText, label: "Skill List" },
    { id: "training", icon: BookOpen, label: "Training" },
    { id: "operators", icon: Users, label: "Operators" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "masters", icon: Settings2, label: "Masters" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Tabs */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-full px-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => (
              <TabButton
                key={tab.id}
                id={tab.id}
                icon={tab.icon}
                label={tab.label}
                currentView={currentView}
                onClick={handleTabChange}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full">
        {/* ✅ Use CSS to hide/show instead of conditional rendering to preserve state */}
        <div style={{ display: currentView === "matrix" ? "block" : "none" }}>
          {(currentView === "matrix" || loadedViews.matrix) && (
            <Suspense fallback={<LoadingFallback />}>
              <SkillMatrixGrid />
            </Suspense>
          )}
        </div>

        <div
          style={{ display: currentView === "skilllist" ? "block" : "none" }}
        >
          {(currentView === "skilllist" || loadedViews.skilllist) && (
            <Suspense fallback={<LoadingFallback />}>
              <SkillListPage />
            </Suspense>
          )}
        </div>

        <div style={{ display: currentView === "training" ? "block" : "none" }}>
          {(currentView === "training" || loadedViews.training) && (
            <div className="p-6">
              <Suspense fallback={<LoadingFallback />}>
                <TrainingManagement />
              </Suspense>

              {/* 🆕 TEST MANAGEMENT SECTION */}
              <div className="mt-6 border-t-2 border-purple-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                      <FileText className="w-6 h-6 text-purple-600" />
                      Test Management System
                    </h2>
                    <p className="text-gray-600 text-sm mt-1">
                      Create tests and assign them to employees for skill
                      assessment
                    </p>
                  </div>

                  {/* Create Test Button */}
                  <button
                    onClick={handleCreateTest}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 shadow-md transition-all transform hover:scale-105 text-sm"
                  >
                    <span className="text-xl">➕</span>
                    <span>Create New Test</span>
                  </button>
                </div>

                {/* Created Tests List */}
                <div className="space-y-4">
                  {allTests.length === 0 ? (
                    <EmptyTestsState onCreateTest={handleCreateTest} />
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-bold text-gray-800">
                          Created Tests ({allTests.length})
                        </h3>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {allTests.map((test, index) => (
                          <TestCard
                            key={test.id}
                            test={test}
                            index={index}
                            onAssign={handleAssignTest}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {currentView === "operators" && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <Users className="w-16 h-16 mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Operator Management
              </h2>
              <p className="text-gray-600">
                Operator profiles and performance tracking will be shown here.
              </p>
            </div>
          </div>
        )}

        {currentView === "analytics" && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <BarChart3 className="w-16 h-16 mx-auto text-purple-600 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Analytics & Reports
              </h2>
              <p className="text-gray-600">
                Detailed analytics, trends, and downloadable reports will be
                shown here.
              </p>
            </div>
          </div>
        )}

        <div style={{ display: currentView === "masters" ? "block" : "none" }}>
          {(currentView === "masters" || loadedViews.masters) && (
            <MastersCRUD />
          )}
        </div>
      </div>

      {/* 🆕 TEST CREATION MODAL */}
      <TestCreation
        isOpen={showCreateTest}
        onClose={handleCloseCreateTest}
        skillData={null}
      />

      {/* 🆕 TEST ASSIGNMENT MODAL */}
      <TestAssignment
        isOpen={showAssignment}
        onClose={handleCloseAssignment}
        testData={selectedTest}
      />
    </div>
  );
};

export default memo(HRDashboard);

// import React, { useState } from 'react';
// import { useAuthStore } from '../../reducers/authStore';
// import { useUIStore } from '../../reducers/uiStore';
// import SkillListPage from '../../components/SkillMatrix/SkillListPage';
// import SkillMatrixGrid from '../../components/SkillMatrix/SkillMatrixGrid';
// import { FileText, Grid3x3, Users, BarChart3 } from 'lucide-react';

// const HRDashboard = () => {
//   const { user } = useAuthStore();
//   const { activeView } = useUIStore();
//   const [currentView, setCurrentView] = useState('matrix'); // 'matrix' or 'skilllist'

//   return (
//     <div className="min-h-screen bg-gray-50">
//       {/* Top Navigation Tabs */}
//       <div className="bg-white shadow-md border-b-2 border-blue-600">
//         <div className="max-w-full px-6 py-4">
//           <div className="flex items-center justify-between mb-4">
//             <div>
//               <h1 className="text-2xl font-bold text-gray-800">HR Management Dashboard</h1>
//               <p className="text-sm text-gray-600">Welcome, {user?.name}</p>
//             </div>
//             <div className="text-right">
//               <div className="text-sm text-gray-600">Department: {user?.department}</div>
//               <div className="text-xs text-gray-500">{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
//             </div>
//           </div>

//           {/* Tab Navigation */}
//           <div className="flex space-x-2 border-b-2 border-gray-200">
//             <button
//               onClick={() => setCurrentView('matrix')}
//               className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all ${
//                 currentView === 'matrix'
//                   ? 'bg-blue-600 text-white rounded-t-lg border-b-2 border-blue-600'
//                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-t-lg'
//               }`}
//             >
//               <Grid3x3 className="w-5 h-5" />
//               <span>Skill Matrix (Prod_4DU)</span>
//             </button>

//             <button
//               onClick={() => setCurrentView('skilllist')}
//               className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all ${
//                 currentView === 'skilllist'
//                   ? 'bg-blue-600 text-white rounded-t-lg border-b-2 border-blue-600'
//                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-t-lg'
//               }`}
//             >
//               <FileText className="w-5 h-5" />
//               <span>Skill List Management</span>
//             </button>

//             <button
//               onClick={() => setCurrentView('operators')}
//               className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all ${
//                 currentView === 'operators'
//                   ? 'bg-blue-600 text-white rounded-t-lg border-b-2 border-blue-600'
//                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-t-lg'
//               }`}
//             >
//               <Users className="w-5 h-5" />
//               <span>Operator Management</span>
//             </button>

//             <button
//               onClick={() => setCurrentView('analytics')}
//               className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all ${
//                 currentView === 'analytics'
//                   ? 'bg-blue-600 text-white rounded-t-lg border-b-2 border-blue-600'
//                   : 'bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-t-lg'
//               }`}
//             >
//               <BarChart3 className="w-5 h-5" />
//               <span>Analytics & Reports</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Main Content Area */}
//       <div className="w-full">
//         {currentView === 'matrix' && <SkillMatrixGrid />}
//         {currentView === 'skilllist' && <SkillListPage />}
//         {currentView === 'operators' && (
//           <div className="p-6">
//             <div className="bg-white rounded-lg shadow-md p-8 text-center">
//               <Users className="w-16 h-16 mx-auto text-blue-600 mb-4" />
//               <h2 className="text-2xl font-bold text-gray-800 mb-2">Operator Management</h2>
//               <p className="text-gray-600">Operator training assignments and attendance tracking will be shown here.</p>
//             </div>
//           </div>
//         )}
//         {currentView === 'analytics' && (
//           <div className="p-6">
//             <div className="bg-white rounded-lg shadow-md p-8 text-center">
//               <BarChart3 className="w-16 h-16 mx-auto text-purple-600 mb-4" />
//               <h2 className="text-2xl font-bold text-gray-800 mb-2">Analytics & Reports</h2>
//               <p className="text-gray-600">Detailed analytics, trends, and downloadable reports will be shown here.</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default HRDashboard;
