'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type Notification = {
  id: string;
  message: string;
  type: string;
  read: boolean;
  relatedId: string | null;
  createdAt: string;
};

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function fetchNotifications() {
      try {
        const response = await fetch('/api/notifications');
        
        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }
        
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter((notif: Notification) => !notif.read).length);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching notifications:', error);
        setIsLoading(false);
      }
    }

    fetchNotifications();
    
    // Poll for new notifications every minute
    const interval = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(interval);
  }, []);

  async function markAsRead(id: string) {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Failed to mark notification as read');
      }
      
      // Update the local state
      setNotifications(notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  function handleNotificationClick(notification: Notification) {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id);
    }
    
    // Navigate to the related entity if applicable
    if (notification.relatedId) {
      switch (notification.type) {
        case 'LOW_STOCK':
          router.push(`/products/${notification.relatedId}`);
          break;
        case 'ORDER_APPROVED':
        case 'ORDER_RECEIVED':
          router.push(`/purchase-orders/${notification.relatedId}`);
          break;
        default:
          // No navigation
          break;
      }
    }
    
    // Close the dropdown
    setIsOpen(false);
  }

  function getNotificationIcon(type: string) {
    switch (type) {
      case 'LOW_STOCK':
        return '⚠️';
      case 'ORDER_APPROVED':
        return '✅';
      case 'ORDER_RECEIVED':
        return '📦';
      default:
        return '🔔';
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full"
        style={{
          backgroundColor: isOpen ? 'var(--background-subtle)' : 'transparent',
        }}
      >
        <span className="text-xl">🔔</span>
        
        {unreadCount > 0 && (
          <span 
            className="absolute top-0 right-0 px-1.5 py-0.5 rounded-full text-xs font-bold"
            style={{
              backgroundColor: 'var(--error)',
              color: 'white',
            }}
          >
            {unreadCount}
          </span>
        )}
      </button>
      
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-80 rounded-md shadow-lg z-50"
          style={{
            backgroundColor: 'var(--card-background)',
            borderColor: 'var(--card-border)',
            borderWidth: '1px',
          }}
        >
          <div className="p-3 border-b" style={{ borderColor: 'var(--card-border)' }}>
            <h3 className="font-medium" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="p-4 text-center">
                <div className="themed-spinner mx-auto"></div>
                <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Loading notifications...</p>
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-4 text-center">
                <p style={{ color: 'var(--text-secondary)' }}>No notifications</p>
              </div>
            ) : (
              <div>
                {notifications.map(notification => (
                  <div 
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className="p-3 border-b cursor-pointer hover:bg-opacity-50"
                    style={{
                      borderColor: 'var(--card-border)',
                      backgroundColor: notification.read ? 'transparent' : 'var(--background-subtle)',
                    }}
                  >
                    <div className="flex gap-3">
                      <div className="text-xl">{getNotificationIcon(notification.type)}</div>
                      <div>
                        <p style={{ color: 'var(--text-primary)' }}>{notification.message}</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                          {new Date(notification.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="p-2 text-center border-t" style={{ borderColor: 'var(--card-border)' }}>
            <button
              onClick={() => router.push('/notifications')}
              className="text-sm font-medium"
              style={{ color: 'var(--primary)' }}
            >
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
}