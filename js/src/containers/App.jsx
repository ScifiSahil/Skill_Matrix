// import React from "react";
// import { useAuthStore } from "./reducers/authStore";
// import { useUIStore } from "./reducers/uiStore";

// import Navbar from "./components/Layout/Navbar";
// import Sidebar from "./components/Layout/Sidebar";
// import Modal from "./components/Common/Modal";
// import NotificationToast from "./components/Common/NotificationToast";

// import Login from "./containers/Auth/Login";
// import UserDashboard from "./containers/UserDashboard";
// import HRDashboard from "./containers/HRDashboard";
// import AdminDashboard from "./containers/AdminDashboard";

// const App = () => {
//   const { isAuthenticated, role } = useAuthStore();
//   const { activeView } = useUIStore();

//   // If user is not logged in → show Login
//   if (!isAuthenticated) {
//     return <Login />;
//   }

//   const renderContent = () => {
//     // When clicking dashboard view
//     if (activeView === "dashboard") {
//       switch (role) {
//         case "user":
//           return <UserDashboard />;
//         case "hr":
//           return <HRDashboard />;
//         case "admin":
//           return <AdminDashboard />;
//         default:
//           return <UserDashboard />;
//       }
//     }

//     // Future pages (my skills, trainings etc)
//     // Example:
//     // if (activeView === "skills") return <SkillsPage />;

//     // Default view
//     switch (role) {
//       case "user":
//         return <UserDashboard />;
//       case "hr":
//         return <HRDashboard />;
//       case "admin":
//         return <AdminDashboard />;
//       default:
//         return <UserDashboard />;
//     }
//   };

//   return (
//     <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
//       <Navbar />

//       <div className="flex flex-1 overflow-hidden">
//         <Sidebar />

//         <main className="flex-1 overflow-y-auto">
//           {renderContent()}
//         </main>
//       </div>

//       <Modal />
//       <NotificationToast />
//     </div>
//   );
// };

// export default App;
