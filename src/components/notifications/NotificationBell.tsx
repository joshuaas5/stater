import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import NotificationCenter from './NotificationCenter';

const NotificationBell: React.FC = () => {
  const { unreadCount } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  const toggleNotificationCenter = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <button
        onClick={toggleNotificationCenter}
        className="relative p-2 rounded-full hover:bg-galileo-hover focus:outline-none focus:ring-2 focus:ring-galileo-accent"
        aria-label="Notificau00e7u00f5es"
      >
        <Bell className="w-6 h-6 text-galileo-text" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-galileo-accent rounded-full">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && <NotificationCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />}
    </>
  );
};

export default NotificationBell;
