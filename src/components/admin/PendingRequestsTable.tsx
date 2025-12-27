/**
 * PendingRequestsTable - Displays pending access requests
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X, Clock, Mail, Phone, Building2, MessageSquare } from 'lucide-react';
import type { AccessRequest } from '@/types/admin';

interface PendingRequestsTableProps {
  requests: AccessRequest[];
  loading: boolean;
  onApprove: (request: AccessRequest) => void;
  onReject: (request: AccessRequest) => void;
}

export function PendingRequestsTable({
  requests,
  loading,
  onApprove,
  onReject,
}: PendingRequestsTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0D2821]" />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-1">No Pending Requests</h3>
        <p className="text-gray-500">New access requests will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <motion.div
          key={request.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
        >
          {/* Main Row */}
          <div
            className="p-4 cursor-pointer"
            onClick={() => setExpandedId(expandedId === request.id ? null : request.id)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2">
                  <Building2 className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <h3 className="font-semibold text-gray-900 truncate">
                    {request.organizationName}
                  </h3>
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                    {request.organizationType}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {request.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-4 h-4" />
                    {request.fullPhone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {request.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onApprove(request);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onReject(request);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedId === request.id && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-gray-100 px-4 py-3 bg-gray-50"
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-1">Message</div>
                  <p className="text-sm text-gray-700">{request.message}</p>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      ))}
    </div>
  );
}

export default PendingRequestsTable;
