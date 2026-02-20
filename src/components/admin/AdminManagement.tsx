/**
 * AdminManagement - Superadmin-only UI for managing admin accounts
 */

import { useState, useEffect } from 'react';
import { Shield, Lock, Trash2, Edit2, Plus, X, Eye, EyeOff } from 'lucide-react';
import {
  getAdminUsers,
  createAdminUser,
  updateAdminUser,
  deleteAdminUser,
} from '@/services/adminApi';
import type { ManagedAdmin, AdminTabPermission } from '@/types/admin';
import { ALL_TAB_PERMISSIONS } from '@/types/admin';

// Hardcoded superadmin emails (read-only display)
const SUPERADMIN_EMAILS = ['dhyanbhandari200@gmail.com', 'erthaloka@gmail.com'];

const TAB_LABELS: Record<AdminTabPermission, string> = {
  dashboards: 'Dashboards',
  pending: 'Pending Requests',
  approved: 'Approved Orgs',
  all: 'All Requests',
  notifications: 'Notifications',
  baseline: 'Baseline Assessment',
};

interface AdminManagementProps {
  adminEmail: string;
}

export default function AdminManagement({ adminEmail }: AdminManagementProps) {
  const [admins, setAdmins] = useState<ManagedAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<ManagedAdmin | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ManagedAdmin | null>(null);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    setLoading(true);
    try {
      const data = await getAdminUsers();
      setAdmins(data);
    } catch (err) {
      console.error('Failed to load admins:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (admin: ManagedAdmin) => {
    try {
      await deleteAdminUser(admin.id);
      setDeleteConfirm(null);
      loadAdmins();
    } catch (err) {
      console.error('Failed to delete admin:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Admin Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#0D2821] text-white rounded-lg hover:bg-[#065f46] transition-colors font-medium shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Add Admin
        </button>
      </div>

      {/* Superadmin Accounts (Read-only) */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-red-600" />
            Superadmin Accounts
          </h3>
          <p className="text-sm text-gray-500 mt-1">These accounts have full access and cannot be modified.</p>
        </div>
        <div className="divide-y divide-gray-100">
          {SUPERADMIN_EMAILS.map((email) => (
            <div key={email} className="px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Lock className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{email}</p>
                  <p className="text-sm text-gray-500">Superadmin - All permissions</p>
                </div>
              </div>
              <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                Superadmin
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Managed Admins */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900">Managed Admin Accounts</h3>
          <p className="text-sm text-gray-500 mt-1">Admins with configurable tab permissions.</p>
        </div>

        {loading ? (
          <div className="px-6 py-12 text-center text-gray-500">Loading...</div>
        ) : admins.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-500">
            No managed admins yet. Click "Add Admin" to create one.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {admins.map((admin) => (
              <div key={admin.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{admin.email}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {admin.permissions.map((perm) => (
                      <span
                        key={perm}
                        className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                        {TAB_LABELS[perm] || perm}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Created by {admin.created_by} on {new Date(admin.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setEditingAdmin(admin)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit permissions"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(admin)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete admin"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      {showAddModal && (
        <AddAdminModal
          adminEmail={adminEmail}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            loadAdmins();
          }}
        />
      )}

      {/* Edit Admin Modal */}
      {editingAdmin && (
        <EditAdminModal
          admin={editingAdmin}
          onClose={() => setEditingAdmin(null)}
          onSuccess={() => {
            setEditingAdmin(null);
            loadAdmins();
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Admin</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete <strong>{deleteConfirm.email}</strong>? They will no longer be able to log in.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== Add Admin Modal ====================

function AddAdminModal({
  adminEmail,
  onClose,
  onSuccess,
}: {
  adminEmail: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<AdminTabPermission[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const togglePermission = (perm: AdminTabPermission) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Email and password are required');
      return;
    }
    if (selectedPermissions.length === 0) {
      setError('Select at least one tab permission');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await createAdminUser({
        email,
        password,
        permissions: selectedPermissions,
        created_by: adminEmail,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create admin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Add New Admin</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D2821] focus:border-transparent"
              placeholder="admin@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D2821] focus:border-transparent pr-10"
                placeholder="Enter password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tab Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_TAB_PERMISSIONS.map((perm) => (
                <label
                  key={perm}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedPermissions.includes(perm)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{TAB_LABELS[perm]}</span>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-white bg-[#0D2821] rounded-lg hover:bg-[#065f46] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== Edit Admin Modal ====================

function EditAdminModal({
  admin,
  onClose,
  onSuccess,
}: {
  admin: ManagedAdmin;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [selectedPermissions, setSelectedPermissions] = useState<AdminTabPermission[]>([...admin.permissions]);
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const togglePermission = (perm: AdminTabPermission) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPermissions.length === 0) {
      setError('Select at least one tab permission');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const updates: { permissions?: AdminTabPermission[]; password?: string } = {
        permissions: selectedPermissions,
      };
      if (newPassword) {
        updates.password = newPassword;
      }
      await updateAdminUser(admin.id, updates);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to update admin');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Edit Admin: {admin.email}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tab Permissions</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_TAB_PERMISSIONS.map((perm) => (
                <label
                  key={perm}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                    selectedPermissions.includes(perm)
                      ? 'bg-blue-50 border-blue-300 text-blue-700'
                      : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedPermissions.includes(perm)}
                    onChange={() => togglePermission(perm)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium">{TAB_LABELS[perm]}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password <span className="text-gray-400">(leave blank to keep current)</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0D2821] focus:border-transparent pr-10"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-white bg-[#0D2821] rounded-lg hover:bg-[#065f46] transition-colors disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
