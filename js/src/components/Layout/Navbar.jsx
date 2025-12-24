import React, { useState } from 'react';
import { useAuthStore } from '../../reducers/authStore';
import { useUIStore } from '../../reducers/uiStore';
import { Bell, LogOut, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { addNotification, notifications } = useUIStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  
  const handleLogout = () => {
    logout();
    addNotification({ type: 'success', message: 'Successfully logged out' });
  };
  
  const unreadCount = notifications?.filter(n => !n.read).length || 0;
  
  return (
    <nav style={{
      background: 'linear-gradient(to right, #1e40af, #2563eb)',
      color: 'white',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{ padding: '12px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left Section - Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: 'white',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
              <span style={{
                color: '#2563eb',
                fontWeight: 'bold',
                fontSize: '20px'
              }}>KT</span>
            </div>
            <div>
              <h1 style={{
                fontSize: '20px',
                fontWeight: 'bold',
                letterSpacing: '0.025em',
                margin: 0
              }}>Kalyani Technoforge</h1>
              <p style={{
                fontSize: '12px',
                color: '#bfdbfe',
                margin: 0
              }}>Skill Matrix System</p>
            </div>
          </div>
          
          {/* Right Section - User Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  position: 'relative',
                  padding: '8px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  color: 'white'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#1e40af'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <Bell style={{ width: '20px', height: '20px' }} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    width: '20px',
                    height: '20px',
                    backgroundColor: '#ef4444',
                    borderRadius: '50%',
                    fontSize: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              
              {/* Notifications Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '8px',
                  width: '320px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  color: '#1f2937',
                  maxHeight: '384px',
                  overflowY: 'auto'
                }}>
                  <div style={{
                    padding: '12px',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb'
                  }}>
                    <h3 style={{
                      fontWeight: 'bold',
                      fontSize: '14px',
                      margin: 0
                    }}>Notifications ({unreadCount})</h3>
                  </div>
                  {!notifications || notifications.length === 0 ? (
                    <div style={{
                      padding: '24px',
                      textAlign: 'center',
                      color: '#6b7280',
                      fontSize: '14px'
                    }}>
                      No notifications
                    </div>
                  ) : (
                    <div>
                      {notifications.slice(0, 5).map((notif, idx) => (
                        <div key={idx} style={{
                          padding: '12px',
                          backgroundColor: !notif.read ? '#eff6ff' : 'white',
                          borderBottom: '1px solid #f3f4f6',
                          cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#f9fafb'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = !notif.read ? '#eff6ff' : 'white'}
                        >
                          <p style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            margin: '0 0 4px 0'
                          }}>{notif.message}</p>
                          <p style={{
                            fontSize: '12px',
                            color: '#6b7280',
                            margin: 0
                          }}>{notif.time || 'Just now'}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* User Profile */}
            <div style={{ position: 'relative' }}>
              <button 
                onClick={() => setShowProfile(!showProfile)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  color: 'white'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1e40af'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <div style={{
                  width: '36px',
                  height: '36px',
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}>
                  <span style={{
                    color: '#2563eb',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'H'}
                  </span>
                </div>
                <div style={{ textAlign: 'left' }}>
                  <p style={{
                    fontWeight: '600',
                    fontSize: '14px',
                    margin: 0
                  }}>
                    {user?.role === 'hr' ? 'HR Manager' : user?.name || 'HR Manager'}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: '#bfdbfe',
                    margin: 0
                  }}>
                    {user?.role?.toUpperCase() || 'HR'}
                  </p>
                </div>
                <ChevronDown style={{ width: '16px', height: '16px' }} />
              </button>
              
              {/* Profile Dropdown */}
              {showProfile && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  marginTop: '8px',
                  width: '224px',
                  backgroundColor: 'white',
                  borderRadius: '8px',
                  boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                  border: '1px solid #e5e7eb',
                  color: '#1f2937'
                }}>
                  <div style={{
                    padding: '12px',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: '#f9fafb'
                  }}>
                    <p style={{
                      fontWeight: 'bold',
                      fontSize: '14px',
                      margin: '0 0 4px 0'
                    }}>{user?.name || 'HR Manager'}</p>
                    <p style={{
                      fontSize: '12px',
                      color: '#6b7280',
                      margin: 0
                    }}>{user?.email || 'hr@kalyani.com'}</p>
                  </div>
                  <div style={{ padding: '8px' }}>
                    <button style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      👤 Profile Settings
                    </button>
                    <button style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.3s'
                    }}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#f3f4f6'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      ⚙️ Preferences
                    </button>
                  </div>
                  <div style={{
                    padding: '8px',
                    borderTop: '1px solid #e5e7eb'
                  }}>
                    <button 
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        backgroundColor: '#fef2f2',
                        color: '#dc2626',
                        borderRadius: '8px',
                        border: 'none',
                        transition: 'all 0.3s',
                        fontWeight: '600',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#fee2e2'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#fef2f2'}
                    >
                      <LogOut style={{ width: '16px', height: '16px' }} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;