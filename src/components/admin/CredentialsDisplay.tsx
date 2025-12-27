/**
 * CredentialsDisplay - Shows generated credentials with copy functionality
 */

import { useState } from 'react';
import { Check, Copy, Mail, AlertTriangle } from 'lucide-react';
import type { GeneratedCredentials } from '@/types/admin';

interface CredentialsDisplayProps {
  credentials: GeneratedCredentials;
  email: string;
  onSendEmail: () => void;
  sendingEmail: boolean;
}

export function CredentialsDisplay({
  credentials,
  email,
  onSendEmail,
  sendingEmail,
}: CredentialsDisplayProps) {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const copyToClipboard = async (text: string, type: 'id' | 'password') => {
    await navigator.clipboard.writeText(text);
    if (type === 'id') {
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } else {
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Warning */}
      <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
        <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm">
          <p className="font-medium text-yellow-800">Important</p>
          <p className="text-yellow-700">
            This password is shown only once. Make sure to copy or send it to the organization.
          </p>
        </div>
      </div>

      {/* Credentials */}
      <div className="space-y-3">
        {/* Institute ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Institute ID</label>
          <div className="flex items-center gap-2">
            <div className="flex-1 font-mono text-lg bg-gray-100 px-4 py-2 rounded-lg">
              {credentials.instituteId}
            </div>
            <button
              onClick={() => copyToClipboard(credentials.instituteId, 'id')}
              className={`p-2 rounded-lg transition-colors ${
                copiedId
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="Copy ID"
            >
              {copiedId ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temporary Password
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 font-mono text-lg bg-gray-100 px-4 py-2 rounded-lg">
              {credentials.password}
            </div>
            <button
              onClick={() => copyToClipboard(credentials.password, 'password')}
              className={`p-2 rounded-lg transition-colors ${
                copiedPassword
                  ? 'bg-green-100 text-green-600'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
              }`}
              title="Copy Password"
            >
              {copiedPassword ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Login URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Login URL</label>
        <div className="text-sm bg-gray-50 px-4 py-2 rounded-lg text-gray-600 break-all">
          {window.location.origin}/institute/login
        </div>
      </div>

      {/* Send Email Button */}
      <button
        onClick={onSendEmail}
        disabled={sendingEmail}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#0D2821] text-white rounded-lg hover:bg-[#065f46] transition-colors disabled:opacity-50"
      >
        <Mail className="w-5 h-5" />
        {sendingEmail ? 'Sending...' : `Send Credentials to ${email}`}
      </button>

      <p className="text-xs text-gray-500 text-center">
        The organization will be required to change their password on first login.
      </p>
    </div>
  );
}

export default CredentialsDisplay;
