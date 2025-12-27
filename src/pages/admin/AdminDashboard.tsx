/**
 * AdminDashboard - Main admin dashboard page
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Clock, CheckCircle, Users, Bell, Plus } from 'lucide-react';
import { useAdmin } from '@/admin';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import PendingRequestsTable from '@/components/admin/PendingRequestsTable';
import ApprovedOrganizationsTable from '@/components/admin/ApprovedOrganizationsTable';
import NotificationPanel from '@/components/admin/NotificationPanel';
import ApproveRequestModal from '@/components/admin/ApproveRequestModal';
import RejectRequestModal from '@/components/admin/RejectRequestModal';
import CreateOrganizationModal from '@/components/admin/CreateOrganizationModal';
import {
  getPendingRequests,
  getAllRequests,
  getInstitutes,
} from '@/services/adminApi';
import type { AccessRequest, AdminNotification } from '@/types/admin';
import type { Institute } from '@/types/institute';

// Placeholder functions for notifications (to be implemented in backend later)
const getNotifications = async (): Promise<AdminNotification[]> => [];
const markNotificationRead = async (_id: string): Promise<void> => {};
const markAllNotificationsRead = async (): Promise<void> => {};
const subscribeToPendingCount = (_callback: (count: number) => void): (() => void) => () => {};
const subscribeToNotifications = (_callback: (notifs: AdminNotification[]) => void): (() => void) => () => {};

type TabType = 'pending' | 'approved' | 'all' | 'notifications';

const AdminDashboard = () => {
  const { admin } = useAdmin();
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Data states
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [approvedOrgs, setApprovedOrgs] = useState<Institute[]>([]);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);

  // Counts
  const [pendingCount, setPendingCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  // Modal states
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AccessRequest | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();

    // Subscribe to real-time updates
    const unsubPending = subscribeToPendingCount((count) => {
      setPendingCount(count);
    });

    const unsubNotifications = subscribeToNotifications((notifs) => {
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    });

    return () => {
      unsubPending();
      unsubNotifications();
    };
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pending, institutes, notifs] = await Promise.all([
        getPendingRequests(),
        getInstitutes(),
        getNotifications(),
      ]);
      setPendingRequests(pending);
      // Map backend institute data to frontend format
      const approvedInstitutes = institutes.map((inst: any) => ({
        id: inst.institute_id,
        name: inst.name,
        organizationType: inst.organization_type,
        email: inst.email,
        phone: inst.phone,
        polygon: { coordinates: JSON.parse(inst.polygon_coordinates || '[]') },
        created_at: new Date(inst.created_at),
        updated_at: new Date(inst.updated_at),
      })) as Institute[];
      setApprovedOrgs(approvedInstitutes);
      setNotifications(notifs);
      setPendingCount(pending.length);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    } catch (error) {
      console.error('Failed to load admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (request: AccessRequest) => {
    setSelectedRequest(request);
    setApproveModalOpen(true);
  };

  const handleReject = (request: AccessRequest) => {
    setSelectedRequest(request);
    setRejectModalOpen(true);
  };

  const handleApprovalSuccess = () => {
    loadData();
  };

  const handleMarkNotificationRead = async (id: string) => {
    await markNotificationRead(id);
  };

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead();
  };

  // Mobile tabs for smaller screens
  const tabs = [
    { id: 'pending' as TabType, label: 'Pending', icon: Clock, count: pendingCount },
    { id: 'approved' as TabType, label: 'Approved', icon: CheckCircle, count: approvedOrgs.length },
    { id: 'all' as TabType, label: 'All', icon: Users },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell, count: unreadCount },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <AdminHeader
        unreadCount={unreadCount}
        onNotificationClick={() => {
          setActiveTab('notifications');
          setMobileMenuOpen(false);
        }}
      />

      {/* Sidebar - Desktop */}
      <AdminSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        pendingCount={pendingCount}
        approvedCount={approvedOrgs.length}
        unreadNotifications={unreadCount}
      />

      {/* Mobile Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-30">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  isActive ? 'text-[#0D2821]' : 'text-gray-500'
                }`}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {tab.count > 9 ? '9+' : tab.count}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 pb-20 lg:pb-8 min-h-screen">
        <div className="p-4 md:p-6 max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {activeTab === 'pending' && 'Pending Requests'}
                {activeTab === 'approved' && 'Approved Organizations'}
                {activeTab === 'all' && 'All Requests'}
                {activeTab === 'notifications' && 'Notifications'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {activeTab === 'pending' && 'Review and approve organization access requests'}
                {activeTab === 'approved' && 'Organizations with active dashboard access'}
                {activeTab === 'all' && 'View all access requests'}
                {activeTab === 'notifications' && 'Stay updated on system activity'}
              </p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#0D2821] text-white rounded-lg hover:bg-[#065f46] transition-colors font-medium shadow-sm"
            >
              <Plus className="w-5 h-5" />
              Create Organization
            </button>
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'pending' && (
                <PendingRequestsTable
                  requests={pendingRequests}
                  loading={loading}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              )}

              {activeTab === 'approved' && (
                <ApprovedOrganizationsTable
                  organizations={approvedOrgs}
                  loading={loading}
                />
              )}

              {activeTab === 'all' && (
                <div className="text-center py-12 text-gray-500">
                  All requests view coming soon...
                </div>
              )}

              {activeTab === 'notifications' && (
                <NotificationPanel
                  notifications={notifications}
                  loading={loading}
                  onMarkRead={handleMarkNotificationRead}
                  onMarkAllRead={handleMarkAllRead}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Modals */}
      <ApproveRequestModal
        isOpen={approveModalOpen}
        request={selectedRequest}
        adminEmail={admin?.email || ''}
        onClose={() => {
          setApproveModalOpen(false);
          setSelectedRequest(null);
        }}
        onSuccess={handleApprovalSuccess}
      />

      <RejectRequestModal
        isOpen={rejectModalOpen}
        request={selectedRequest}
        adminEmail={admin?.email || ''}
        onClose={() => {
          setRejectModalOpen(false);
          setSelectedRequest(null);
        }}
        onSuccess={handleApprovalSuccess}
      />

      <CreateOrganizationModal
        isOpen={createModalOpen}
        adminEmail={admin?.email || ''}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={handleApprovalSuccess}
      />
    </div>
  );
};

export default AdminDashboard;
