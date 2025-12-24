import React from 'react';
import { useAuthStore } from '../../reducers/authStore';
import { useUIStore } from '../../reducers/uiStore';
import { Home, Target, BookOpen, FileText, Users, Calendar, Settings, BarChart } from 'lucide-react';

const Sidebar = () => {
  const { role } = useAuthStore();
  const { sidebarOpen, activeView, setActiveView } = useUIStore();
  
  const menuItems = {
    user: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'my-skills', label: 'My Skills', icon: Target },
      { id: 'trainings', label: 'My Trainings', icon: BookOpen },
      { id: 'exams', label: 'Exams', icon: FileText }
    ], 
    hr: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'operators', label: 'Operators', icon: Users },
      { id: 'training-calendar', label: 'Training Calendar', icon: Calendar },
      { id: 'skill-matrix', label: 'Skill Matrix', icon: Target },
      { id: 'reports', label: 'Reports', icon: BarChart }
    ],
    admin: [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
      { id: 'users', label: 'User Management', icon: Users },
      { id: 'skills', label: 'Skill Management', icon: Target },
      { id: 'trainings', label: 'Training Management', icon: BookOpen },
      { id: 'analytics', label: 'Analytics', icon: BarChart },
      { id: 'settings', label: 'Settings', icon: Settings }
    ]
  };
  
  const items = menuItems[role] || menuItems.user;
  
  if (!sidebarOpen) return null;
  
  return (
    <aside className="w-64 bg-white shadow-lg h-screen overflow-y-auto">
      <div className="p-6">
        {items.map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 transition ${
                activeView === item.id ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;