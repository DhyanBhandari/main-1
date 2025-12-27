/**
 * AdminHeader - Top header for admin dashboard
 */

import { Bell, LogOut, Shield } from 'lucide-react';
import { useAdmin } from '@/admin';
import { useNavigate } from 'react-router-dom';
import logo from '@/assets/logo-new.png';

interface AdminHeaderProps {
  unreadCount: number;
  onNotificationClick: () => void;
}

export function AdminHeader({ unreadCount, onNotificationClick }: AdminHeaderProps) {
  const { admin, signOut } = useAdmin();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-30 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center gap-4">
        <img src={logo} alt="ErthaLoka" className="h-8 w-auto" />
        <div className="hidden sm:flex items-center gap-2 text-sm">
          <Shield className="w-4 h-4 text-[#0D2821]" />
          <span className="font-semibold text-gray-900">Admin Panel</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          onClick={onNotificationClick}
          className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        {/* User Info */}
        <div className="hidden md:flex items-center gap-3">
          {admin?.photoURL ? (
            <img
              src={admin.photoURL}
              alt={admin.displayName || 'Admin'}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#0D2821] text-white flex items-center justify-center text-sm font-medium">
              {admin?.displayName?.[0] || admin?.email?.[0] || 'A'}
            </div>
          )}
          <div className="text-sm">
            <div className="font-medium text-gray-900">{admin?.displayName || 'Admin'}</div>
            <div className="text-xs text-gray-500">{admin?.email}</div>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleSignOut}
          className="p-2 rounded-lg hover:bg-red-50 text-gray-500 hover:text-red-600 transition-colors"
          title="Sign out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}

export default AdminHeader;
