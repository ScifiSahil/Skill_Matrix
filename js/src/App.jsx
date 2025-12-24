import React from "react";
import { useAuthStore } from "./reducers/authStore";
import Navbar from "./components/Layout/Navbar";
import Modal from "./components/Common/Modal";
import NotificationToast from "./components/Common/NotificationToast";
import Login from "./containers/Auth/Login";
import UserDashboard from "./containers/UserDashboard";
import HRDashboard from "./containers/HRDashboard";
import AdminDashboard from "./containers/AdminDashboard";

const App = () => {
  const { isAuthenticated, role } = useAuthStore();

  // Show login if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Login />
        <NotificationToast />
      </>
    );
  }

  // Render dashboard based on role
  const renderDashboard = () => {
    switch (role) {
      case "user":
        return <UserDashboard />;
      case "hr":
        return <HRDashboard />;
      case "admin":
        return <AdminDashboard />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Fixed at top */}
      <Navbar />

      {/* Main Content - Full width, no sidebar */}
      <main className="w-full">{renderDashboard()}</main>

      {/* Global Modals */}
      <Modal />

      {/* Global Notifications */}
      <NotificationToast />
    </div>
  );
};

export default App;
