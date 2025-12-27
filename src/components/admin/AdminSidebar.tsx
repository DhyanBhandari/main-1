/**
 * AdminSidebar - Navigation sidebar for admin dashboard
 */

import { Clock, CheckCircle, Users, Bell, Settings } from 'lucide-react';

type TabType = 'pending' | 'approved' | 'all' | 'notifications';

interface AdminSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingCount: number;
  approvedCount: number;
  unreadNotifications: number;
}

export function AdminSidebar({
  activeTab,
  onTabChange,
  pendingCount,
  approvedCount,
  unreadNotifications,
}: AdminSidebarProps) {
  const tabs = [
    {
      id: 'pending' as TabType,
      label: 'Pending Requests',
      icon: Clock,
      count: pendingCount,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      id: 'approved' as TabType,
      label: 'Approved Organizations',
      icon: CheckCircle,
      count: approvedCount,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      id: 'all' as TabType,
      label: 'All Requests',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      id: 'notifications' as TabType,
      label: 'Notifications',
      icon: Bell,
      count: unreadNotifications,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <aside className="hidden lg:flex fixed top-16 left-0 bottom-0 w-64 border-r border-gray-200 bg-white flex-col p-4">
      <nav className="space-y-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-[#0D2821] text-white shadow-lg'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-white' : tab.color}`} />
              <span className="font-medium flex-1 text-left">{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : `${tab.bgColor} ${tab.color}`
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 uppercase font-semibold mb-3">Quick Stats</div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Pending</span>
            <span className="font-semibold text-yellow-600">{pendingCount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Approved</span>
            <span className="font-semibold text-green-600">{approvedCount}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
