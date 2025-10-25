const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://medisphere-api.up.railway.app/api";
const DATABRIDGE_BASE = `${API_BASE_URL}/v1/databridge`;

// Helper function to get auth headers
const getHeaders = (): HeadersInit => {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
      : null;
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// Helper function to handle fetch responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }
  return response.json();
};

// Helper function to build query string
const buildQueryString = (params?: Record<string, any>) => {
  if (!params) return "";
  const query = Object.entries(params)
    .filter(([_, value]) => value !== undefined && value !== null)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");
  return query ? `?${query}` : "";
};

// Types
export interface DataRequest {
  _id: string;
  requester: string;
  requesterName: string;
  requesterType: string;
  owner: string;
  ownerName: string;
  ownerType: string;
  dataRequested: string[];
  purpose: string;
  description?: string;
  justification?: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "pending" | "approved" | "rejected" | "revoked" | "expired";
  requestDate: string;
  validUntil: string;
  approvedAt?: string;
  rejectedAt?: string;
  revokedAt?: string;
  expiresAt?: string;
  patientConsent: boolean;
  consentDate?: string;
  approver?: string;
  approvalNotes?: string;
  rejectionReason?: string;
  revocationReason?: string;
  conditions?: string[];
  hcsCreateTx?: string;
  hcsApproveTx?: string;
  hcsRejectTx?: string;
  hcsRevokeTx?: string;
  accessToken?: string;
  accessCount: number;
  lastAccessedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DataShare {
  _id: string;
  sharer: string;
  sharerName: string;
  sharerType: string;
  recipient: string;
  recipientName: string;
  recipientType: string;
  dataShared: string[];
  purpose: string;
  description?: string;
  status: "active" | "expired" | "revoked";
  sharedDate: string;
  expiryDate: string;
  revokedAt?: string;
  revocationReason?: string;
  accessCount: number;
  lastAccessedAt?: string;
  accessLog?: Array<{
    accessedAt: string;
    ipAddress: string;
    userAgent: string;
    action: string;
  }>;
  accessToken: string;
  conditions?: string[];
  accessRestrictions?: {
    maxAccessCount?: number;
    allowedIpAddresses?: string[];
    allowedTimeWindow?: {
      startTime: string;
      endTime: string;
    };
  };
  hcsCreateTx?: string;
  hcsRevokeTx?: string;
  relatedRequest?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  type: "request" | "share";
  id: string;
  action: string;
  actor: string;
  target: string;
  dataTypes: string[];
  purpose: string;
  accessCount?: number;
  timestamp: string;
  blockchainHashes: {
    create?: string;
    approve?: string;
    reject?: string;
    revoke?: string;
  };
}

// ==================== DATA REQUEST APIs ====================

export const createDataRequest = async (data: {
  ownerId: string;
  dataRequested: string[];
  purpose: string;
  description?: string;
  justification?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  validUntil?: string;
  accessDuration?: number;
}) => {
  const response = await fetch(`${DATABRIDGE_BASE}/requests`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getIncomingRequests = async (params?: {
  status?: string;
  priority?: string;
  dataType?: string;
  limit?: number;
  offset?: number;
}) => {
  const queryString = buildQueryString(params);
  const response = await fetch(
    `${DATABRIDGE_BASE}/requests/incoming${queryString}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  return handleResponse(response);
};

export const getOutgoingRequests = async (params?: {
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  const queryString = buildQueryString(params);
  const response = await fetch(
    `${DATABRIDGE_BASE}/requests/outgoing${queryString}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  return handleResponse(response);
};

export const approveDataRequest = async (
  requestId: string,
  data?: {
    accessDuration?: number;
    conditions?: string[];
    notes?: string;
  }
) => {
  const response = await fetch(
    `${DATABRIDGE_BASE}/requests/${requestId}/approve`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data || {}),
    }
  );
  return handleResponse(response);
};

export const rejectDataRequest = async (
  requestId: string,
  data: {
    reason: string;
    notes?: string;
  }
) => {
  const response = await fetch(
    `${DATABRIDGE_BASE}/requests/${requestId}/reject`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );
  return handleResponse(response);
};

export const revokeDataRequest = async (
  requestId: string,
  data: {
    reason: string;
    notes?: string;
  }
) => {
  const response = await fetch(
    `${DATABRIDGE_BASE}/requests/${requestId}/revoke`,
    {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(data),
    }
  );
  return handleResponse(response);
};

// ==================== DATA SHARE APIs ====================

export const createDataShare = async (data: {
  recipientId: string;
  dataToShare: string[];
  purpose: string;
  description?: string;
  expiryDate?: string;
  accessDuration?: number;
  conditions?: string[];
  accessRestrictions?: {
    maxAccessCount?: number;
    allowedIpAddresses?: string[];
    allowedTimeWindow?: {
      startTime: string;
      endTime: string;
    };
  };
}) => {
  const response = await fetch(`${DATABRIDGE_BASE}/shares`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  return handleResponse(response);
};

export const getOutgoingShares = async (params?: {
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  const queryString = buildQueryString(params);
  const response = await fetch(
    `${DATABRIDGE_BASE}/shares/outgoing${queryString}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  return handleResponse(response);
};

export const getIncomingShares = async (params?: {
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  const queryString = buildQueryString(params);
  const response = await fetch(
    `${DATABRIDGE_BASE}/shares/incoming${queryString}`,
    {
      method: "GET",
      headers: getHeaders(),
    }
  );
  return handleResponse(response);
};

export const revokeDataShare = async (
  shareId: string,
  data?: {
    reason?: string;
  }
) => {
  const response = await fetch(`${DATABRIDGE_BASE}/shares/${shareId}/revoke`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data || {}),
  });
  return handleResponse(response);
};

export const accessSharedData = async (shareId: string) => {
  const response = await fetch(`${DATABRIDGE_BASE}/shares/${shareId}/access`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ==================== AUDIT & LOGS APIs ====================

export const getAuditLogs = async (params?: {
  type?: "all" | "requests" | "shares";
  limit?: number;
  offset?: number;
}) => {
  const queryString = buildQueryString(params);
  const response = await fetch(`${DATABRIDGE_BASE}/logs${queryString}`, {
    method: "GET",
    headers: getHeaders(),
  });
  return handleResponse(response);
};

// ==================== UTILITY FUNCTIONS ====================

export const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: "text-yellow-600 bg-yellow-50",
    approved: "text-green-600 bg-green-50",
    rejected: "text-red-600 bg-red-50",
    revoked: "text-gray-600 bg-gray-50",
    expired: "text-gray-600 bg-gray-50",
    active: "text-green-600 bg-green-50",
  };
  return colors[status] || "text-gray-600 bg-gray-50";
};

export const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    low: "text-blue-600 bg-blue-50",
    medium: "text-yellow-600 bg-yellow-50",
    high: "text-orange-600 bg-orange-50",
    urgent: "text-red-600 bg-red-50",
  };
  return colors[priority] || "text-gray-600 bg-gray-50";
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const isExpired = (expiryDate: string) => {
  return new Date(expiryDate) < new Date();
};
