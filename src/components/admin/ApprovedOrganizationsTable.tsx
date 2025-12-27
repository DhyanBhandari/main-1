/**
 * ApprovedOrganizationsTable - Displays approved organizations
 */

import { motion } from 'framer-motion';
import { Building2, MapPin, Mail, Phone, Calendar, CheckCircle } from 'lucide-react';
import type { Institute } from '@/types/institute';

interface ApprovedOrganizationsTableProps {
  organizations: Institute[];
  loading: boolean;
}

export function ApprovedOrganizationsTable({
  organizations,
  loading,
}: ApprovedOrganizationsTableProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D2821]" />
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Approved Organizations</h3>
        <p className="text-gray-500">Approved organizations will appear here</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {organizations.map((org) => (
        <motion.div
          key={org.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{org.name}</h3>
                {org.organizationType && (
                  <span className="text-xs text-gray-500">{org.organizationType}</span>
                )}
              </div>
            </div>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
              Active
            </span>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">
                ID: {org.id}
              </span>
            </div>

            {org.email && (
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="w-4 h-4 text-gray-400" />
                {org.email}
              </div>
            )}

            {org.phone && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="w-4 h-4 text-gray-400" />
                {org.phone}
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className="text-xs">
                {org.polygon?.coordinates?.length || 0} polygon points
              </span>
            </div>

            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Calendar className="w-3 h-3" />
              Created: {org.created_at.toLocaleDateString()}
            </div>

            {org.createdBy && (
              <div className="text-xs text-gray-400">By: {org.createdBy}</div>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

export default ApprovedOrganizationsTable;
