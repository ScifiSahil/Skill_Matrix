import React, { useEffect } from 'react';
import { useUIStore } from '../../reducers/uiStore';
import { X, CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationToast = () => {
  const { notifications, removeNotification } = useUIStore();
  
  const getIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };
  
  const getColorClass = (type) => {
    switch (type) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'warning': return 'bg-yellow-50 border-yellow-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };
  
  return (
    <div className="fixed top-20 right-4 z-50 space-y-2">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          getIcon={getIcon}
          getColorClass={getColorClass}
          removeNotification={removeNotification}
        />
      ))}
    </div>
  );
};

const NotificationItem = ({ notification, getIcon, getColorClass, removeNotification }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      removeNotification(notification.id);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [notification.id, removeNotification]);
  
  return (
    <div className={`flex items-center space-x-3 p-4 rounded-lg border shadow-lg ${getColorClass(notification.type)} animate-slide-in`}>
      {getIcon(notification.type)}
      <p className="flex-1 font-medium text-gray-800">{notification.message}</p>
      <button onClick={() => removeNotification(notification.id)} className="p-1 hover:bg-white rounded transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default NotificationToast;