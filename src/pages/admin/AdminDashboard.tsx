/**
 * AdminDashboard - Main admin dashboard page
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Clock, CheckCircle, Users, Bell, Plus, LayoutDashboard, BarChart3, Shield } from 'lucide-react';
import { useAdmin } from '@/admin';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminSidebar from '@/components/admin/AdminSidebar';
import PendingRequestsTable from '@/components/admin/PendingRequestsTable';
import ApprovedOrganizationsTable from '@/components/admin/ApprovedOrganizationsTable';
import NotificationPanel from '@/components/admin/NotificationPanel';
import DashboardsTable from '@/components/admin/DashboardsTable';
import DashboardPreviewModal from '@/components/admin/DashboardPreviewModal';
import ShareDashboardModal from '@/components/admin/ShareDashboardModal';
import EditDashboardModal from '@/components/admin/EditDashboardModal';
import DeleteDashboardDialog from '@/components/admin/DeleteDashboardDialog';
import ApproveRequestModal from '@/components/admin/ApproveRequestModal';
import RejectRequestModal from '@/components/admin/RejectRequestModal';
import CreateOrganizationModal from '@/components/admin/CreateOrganizationModal';
import BaselineAssessment from '@/components/admin/BaselineAssessment';
import AdminManagement from '@/components/admin/AdminManagement';
import type { AdminTabPermission } from '@/types/admin';
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

type TabType = 'pending' | 'approved' | 'all' | 'notifications' | 'dashboards' | 'baseline' | 'admin-management';

const AdminDashboard = () => {
  const { admin, isSuperAdmin, permissions } = useAdmin();

  // Determine default tab: superadmins get dashboards, regular admins get first permitted tab
  const getDefaultTab = (): TabType => {
    if (isSuperAdmin) return 'dashboards';
    if (permissions.length > 0) return permissions[0] as TabType;
    return 'dashboards';
  };

  const [activeTab, setActiveTab] = useState<TabType>(getDefaultTab());
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

  // Dashboard modal states
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInstitute, setSelectedInstitute] = useState<any>(null);

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

  // Dashboard handlers
  const handleView = (institute: any) => {
    setSelectedInstitute(institute);
    setViewModalOpen(true);
  };

  const handleEdit = (institute: any) => {
    setSelectedInstitute(institute);
    setEditModalOpen(true);
  };

  const handleShare = (institute: any) => {
    setSelectedInstitute(institute);
    setShareModalOpen(true);
  };

  const handleDelete = (institute: any) => {
    setSelectedInstitute(institute);
    setDeleteDialogOpen(true);
  };

  // Mobile tabs for smaller screens
  const allMobileTabs: { id: TabType; label: string; icon: typeof LayoutDashboard; count?: number; permissionId?: AdminTabPermission; superadminOnly?: boolean }[] = [
    { id: 'dashboards', label: 'Dashboards', icon: LayoutDashboard, count: approvedOrgs.length, permissionId: 'dashboards' },
    { id: 'pending', label: 'Pending', icon: Clock, count: pendingCount, permissionId: 'pending' },
    { id: 'approved', label: 'Approved', icon: CheckCircle, count: approvedOrgs.length, permissionId: 'approved' },
    { id: 'all', label: 'All', icon: Users, permissionId: 'all' },
    { id: 'notifications', label: 'Notifications', icon: Bell, count: unreadCount, permissionId: 'notifications' },
    { id: 'baseline', label: 'Baseline', icon: BarChart3, permissionId: 'baseline' },
    { id: 'admin-management', label: 'Admins', icon: Shield, superadminOnly: true },
  ];

  const tabs = allMobileTabs.filter((tab) => {
    if (tab.superadminOnly) return isSuperAdmin;
    if (isSuperAdmin) return true;
    return tab.permissionId && permissions.includes(tab.permissionId);
  });

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
        permissions={permissions}
        isSuperAdmin={isSuperAdmin}
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
                {activeTab === 'dashboards' && 'Dashboards'}
                {activeTab === 'pending' && 'Pending Requests'}
                {activeTab === 'approved' && 'Approved Organizations'}
                {activeTab === 'all' && 'All Requests'}
                {activeTab === 'notifications' && 'Notifications'}
                {activeTab === 'baseline' && 'Baseline Assessment'}
                {activeTab === 'admin-management' && 'Admin Management'}
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                {activeTab === 'dashboards' && 'Manage organization dashboards and credentials'}
                {activeTab === 'pending' && 'Review and approve organization access requests'}
                {activeTab === 'approved' && 'Organizations with active dashboard access'}
                {activeTab === 'all' && 'View all access requests'}
                {activeTab === 'notifications' && 'Stay updated on system activity'}
                {activeTab === 'baseline' && 'Run baseline PPA assessments and download reports'}
                {activeTab === 'admin-management' && 'Manage admin accounts and permissions'}
              </p>
            </div>
            {activeTab !== 'baseline' && activeTab !== 'admin-management' && (
              <button
                onClick={() => setCreateModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#0D2821] text-white rounded-lg hover:bg-[#065f46] transition-colors font-medium shadow-sm"
              >
                <Plus className="w-5 h-5" />
                Create Organization
              </button>
            )}
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
              {activeTab === 'dashboards' && (
                <DashboardsTable
                  dashboards={approvedOrgs.map((org: any) => ({
                    id: org.id,
                    institute_id: org.id,
                    name: org.name,
                    organization_type: org.organizationType,
                    email: org.email,
                    phone: org.phone,
                    polygon_coordinates: org.polygon?.coordinates || [],
                    created_at: org.created_at?.toISOString() || new Date().toISOString(),
                    updated_at: org.updated_at?.toISOString() || new Date().toISOString(),
                    created_by: admin?.email || '',
                  }))}
                  loading={loading}
                  onView={handleView}
                  onEdit={handleEdit}
                  onShare={handleShare}
                  onDelete={handleDelete}
                />
              )}

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

              {activeTab === 'baseline' && (
                <BaselineAssessment adminEmail={admin?.email || ''} />
              )}

              {activeTab === 'admin-management' && isSuperAdmin && (
                <AdminManagement adminEmail={admin?.email || ''} />
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

      {/* Dashboard Modals */}
      <DashboardPreviewModal
        isOpen={viewModalOpen}
        institute={selectedInstitute}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedInstitute(null);
        }}
      />

      <ShareDashboardModal
        isOpen={shareModalOpen}
        institute={selectedInstitute}
        onClose={() => {
          setShareModalOpen(false);
          setSelectedInstitute(null);
        }}
      />

      <EditDashboardModal
        isOpen={editModalOpen}
        institute={selectedInstitute}
        onClose={() => {
          setEditModalOpen(false);
          setSelectedInstitute(null);
        }}
        onSuccess={handleApprovalSuccess}
      />

      <DeleteDashboardDialog
        isOpen={deleteDialogOpen}
        institute={selectedInstitute}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedInstitute(null);
        }}
        onConfirm={handleApprovalSuccess}
      />
    </div>
  );
};

export default AdminDashboard;
