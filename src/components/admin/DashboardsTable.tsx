/**
 * DashboardsTable - Table view of all institute dashboards
 *
 * Shows all created dashboards with actions: View, Edit, Share, Delete
 */

import { Eye, Edit, Share2, Trash2, MapPin } from 'lucide-react';
import { format } from 'date-fns';

interface Institute {
  id: number;
  institute_id: string;
  name: string;
  organization_type: string;
  email: string;
  phone: string;
  polygon_coordinates: string | number[][];
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface DashboardsTableProps {
  dashboards: Institute[];
  loading: boolean;
  onView: (institute: Institute) => void;
  onEdit: (institute: Institute) => void;
  onShare: (institute: Institute) => void;
  onDelete: (institute: Institute) => void;
}

export function DashboardsTable({
  dashboards,
  loading,
  onView,
  onEdit,
  onShare,
  onDelete,
}: DashboardsTableProps) {
  const calculateArea = (coordinates: string | number[][]) => {
    try {
      const coords = typeof coordinates === 'string' ? JSON.parse(coordinates) : coordinates;
      if (!coords || coords.length < 3) return 'N/A';

      // Simple polygon area calculation (Shoelace formula)
      let area = 0;
      for (let i = 0; i < coords.length; i++) {
        const j = (i + 1) % coords.length;
        area += coords[i][0] * coords[j][1];
        area -= coords[j][0] * coords[i][1];
      }
      area = Math.abs(area / 2);

      // Convert to hectares (approximate for lat/lng)
      const areaHectares = area * 111 * 111;
      return areaHectares.toFixed(2);
    } catch {
      return 'N/A';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-12 bg-gray-200 rounded flex-1"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (dashboards.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Dashboards Yet</h3>
        <p className="text-gray-600 mb-6">
          Create your first organization dashboard to get started
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Organization
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Institute ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Area (ha)
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Created
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {dashboards.map((dashboard) => (
              <tr key={dashboard.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{dashboard.name}</div>
                      <div className="text-sm text-gray-500">{dashboard.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono text-gray-900">{dashboard.institute_id}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {calculateArea(dashboard.polygon_coordinates)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">{dashboard.organization_type}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-600">
                    {format(new Date(dashboard.created_at), 'MMM dd, yyyy')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => onView(dashboard)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="View Dashboard"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(dashboard)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit Dashboard"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onShare(dashboard)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Share Credentials"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(dashboard)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Dashboard"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden divide-y divide-gray-200">
        {dashboards.map((dashboard) => (
          <div key={dashboard.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 mb-1">{dashboard.name}</h3>
                <p className="text-xs text-gray-500 mb-2">{dashboard.email}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700 font-mono">
                    {dashboard.institute_id}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
              <div>
                <span className="text-gray-500">Area:</span>{' '}
                <span className="font-medium">{calculateArea(dashboard.polygon_coordinates)} ha</span>
              </div>
              <div>
                <span className="text-gray-500">Type:</span>{' '}
                <span className="font-medium">{dashboard.organization_type}</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Created:</span>{' '}
                <span className="font-medium">
                  {format(new Date(dashboard.created_at), 'MMM dd, yyyy')}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onView(dashboard)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => onEdit(dashboard)}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit
              </button>
              <button
                onClick={() => onShare(dashboard)}
                className="px-3 py-2 text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(dashboard)}
                className="px-3 py-2 text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default DashboardsTable;
