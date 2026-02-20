/**
 * AdminSidebar - Navigation sidebar for admin dashboard
 */

import { Clock, CheckCircle, Users, Bell, LayoutDashboard, BarChart3, Shield } from 'lucide-react';
import type { AdminTabPermission } from '@/types/admin';

type TabType = 'pending' | 'approved' | 'all' | 'notifications' | 'dashboards' | 'baseline' | 'admin-management';

interface AdminSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  pendingCount: number;
  approvedCount: number;
  unreadNotifications: number;
  permissions: AdminTabPermission[];
  isSuperAdmin: boolean;
}

export function AdminSidebar({
  activeTab,
  onTabChange,
  pendingCount,
  approvedCount,
  unreadNotifications,
  permissions,
  isSuperAdmin,
}: AdminSidebarProps) {
  const allTabs: {
    id: TabType;
    label: string;
    icon: typeof LayoutDashboard;
    count?: number;
    color: string;
    bgColor: string;
    permissionId?: AdminTabPermission;
    superadminOnly?: boolean;
  }[] = [
    {
      id: 'dashboards',
      label: 'Dashboards',
      icon: LayoutDashboard,
      count: approvedCount,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      permissionId: 'dashboards',
    },
    {
      id: 'pending',
      label: 'Pending Requests',
      icon: Clock,
      count: pendingCount,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      permissionId: 'pending',
    },
    {
      id: 'approved',
      label: 'Approved Organizations',
      icon: CheckCircle,
      count: approvedCount,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      permissionId: 'approved',
    },
    {
      id: 'all',
      label: 'All Requests',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      permissionId: 'all',
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: Bell,
      count: unreadNotifications,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      permissionId: 'notifications',
    },
    {
      id: 'baseline',
      label: 'Baseline Assessment',
      icon: BarChart3,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      permissionId: 'baseline',
    },
    {
      id: 'admin-management',
      label: 'Admin Management',
      icon: Shield,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      superadminOnly: true,
    },
  ];

  // Filter tabs: superadmin sees all, regular admin sees only permitted + no admin-management
  const tabs = allTabs.filter((tab) => {
    if (tab.superadminOnly) return isSuperAdmin;
    if (isSuperAdmin) return true;
    return tab.permissionId && permissions.includes(tab.permissionId);
  });

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
