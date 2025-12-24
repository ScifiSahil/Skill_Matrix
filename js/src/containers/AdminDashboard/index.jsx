import React, { useState } from "react";
import { useAuthStore } from "../../reducers/authStore";
import SkillListPage from "../../components/SkillMatrix/SkillListPage";
import SkillMatrixGrid from "../../components/SkillMatrix/SkillMatrixGrid";
import TrainingManagement from "../HRDashboard/TrainingManagement";
import {
  Shield,
  FileText,
  Grid3x3,
  Users,
  Settings,
  BarChart3,
  BookOpen,
} from "lucide-react";

const AdminDashboard = () => {
  const { user } = useAuthStore();
  const [currentView, setCurrentView] = useState("matrix");

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Admin Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-full px-6 py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Shield className="w-12 h-12" />
              <div>
                <h1 className="text-3xl font-bold">Admin Control Panel</h1>
                <p className="text-sm text-purple-100">
                  Full system access and management
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm">
                Logged in as:{" "}
                <span className="font-bold">{user?.name || "Admin"}</span>
              </div>
              <div className="text-xs text-purple-200">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>

          {/* Admin Tab Navigation */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            <button
              onClick={() => setCurrentView("matrix")}
              className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all rounded-t-lg whitespace-nowrap ${
                currentView === "matrix"
                  ? "bg-white text-purple-600 shadow-lg"
                  : "bg-purple-500 text-white hover:bg-purple-400"
              }`}
            >
              <Grid3x3 className="w-5 h-5" />
              <span>Skill Matrix</span>
            </button>

            <button
              onClick={() => setCurrentView("skilllist")}
              className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all rounded-t-lg whitespace-nowrap ${
                currentView === "skilllist"
                  ? "bg-white text-purple-600 shadow-lg"
                  : "bg-purple-500 text-white hover:bg-purple-400"
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Skill List</span>
            </button>

            <button
              onClick={() => setCurrentView("training")}
              className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all rounded-t-lg whitespace-nowrap ${
                currentView === "training"
                  ? "bg-white text-purple-600 shadow-lg"
                  : "bg-purple-500 text-white hover:bg-purple-400"
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Training Management</span>
            </button>

            <button
              onClick={() => setCurrentView("users")}
              className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all rounded-t-lg whitespace-nowrap ${
                currentView === "users"
                  ? "bg-white text-purple-600 shadow-lg"
                  : "bg-purple-500 text-white hover:bg-purple-400"
              }`}
            >
              <Users className="w-5 h-5" />
              <span>User Management</span>
            </button>

            <button
              onClick={() => setCurrentView("analytics")}
              className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all rounded-t-lg whitespace-nowrap ${
                currentView === "analytics"
                  ? "bg-white text-purple-600 shadow-lg"
                  : "bg-purple-500 text-white hover:bg-purple-400"
              }`}
            >
              <BarChart3 className="w-5 h-5" />
              <span>Analytics</span>
            </button>

            <button
              onClick={() => setCurrentView("settings")}
              className={`flex items-center space-x-2 px-6 py-3 font-semibold transition-all rounded-t-lg whitespace-nowrap ${
                currentView === "settings"
                  ? "bg-white text-purple-600 shadow-lg"
                  : "bg-purple-500 text-white hover:bg-purple-400"
              }`}
            >
              <Settings className="w-5 h-5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full">
        {currentView === "matrix" && <SkillMatrixGrid />}
        {currentView === "skilllist" && <SkillListPage />}
        {currentView === "training" && <TrainingManagement />}

        {currentView === "users" && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-xl p-12 text-center">
              <Users className="w-20 h-20 mx-auto text-purple-600 mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                User Management
              </h2>
              <p className="text-gray-600 mb-6">
                Manage all system users, roles, and permissions
              </p>
              <div className="inline-block bg-purple-100 text-purple-700 px-6 py-3 rounded-lg font-semibold">
                Coming Soon
              </div>
            </div>
          </div>
        )}

        {currentView === "analytics" && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-xl p-12 text-center">
              <BarChart3 className="w-20 h-20 mx-auto text-blue-600 mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                Advanced Analytics
              </h2>
              <p className="text-gray-600 mb-6">
                Comprehensive reports, trends, and insights
              </p>
              <div className="inline-block bg-blue-100 text-blue-700 px-6 py-3 rounded-lg font-semibold">
                Coming Soon
              </div>
            </div>
          </div>
        )}

        {currentView === "settings" && (
          <div className="p-6">
            <div className="bg-white rounded-lg shadow-xl p-12 text-center">
              <Settings className="w-20 h-20 mx-auto text-gray-600 mb-6" />
              <h2 className="text-3xl font-bold text-gray-800 mb-3">
                System Settings
              </h2>
              <p className="text-gray-600 mb-6">
                Configure system preferences and parameters
              </p>
              <div className="inline-block bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold">
                Coming Soon
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
