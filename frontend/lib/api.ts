const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://medisphere-api.up.railway.app/api";

// Types for API responses
export interface ApiResponse<T = any> {
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  records?: T[]; // For health records endpoints
  data?: T[]; // For other endpoints
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  country: string;
  email: string;
  password: string;
  role: string;
  organization?: string;
  licenseNumber?: string;
  specialty?: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    // did?: string; // Commented out - not used currently
    hederaAccountId?: string;
  };
}

// Health record types
export interface HealthRecord {
  _id: string;
  type:
    | "lab-result"
    | "prescription"
    | "diagnosis"
    | "vaccination"
    | "surgery"
    | "other";
  title: string;
  date: string;
  doctor: string;
  facility: string;
  notes?: string;
  attachments: Array<{
    filename: string;
    url: string;
    publicId?: string;
    size: number;
    format?: string;
    resourceType?: string;
    uploadedAt: string;
  }>;
  consentRecipients: string[];
  isShared: boolean;
  blockchainHash?: string; // Legacy field
  hcsHash: string; // Hedera HCS transaction ID
  hcsTopicId: string; // HCS topic ID
  ipfsCid?: string; // IPFS Content Identifier
  ipfsUrl?: string; // IPFS gateway URL
  canEdit: boolean;
  addedBy: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  addedByRole: string;
  patient: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Insurance claim types
export interface InsuranceClaim {
  _id: string;
  claimNumber: string;
  title: string;
  treatmentDate: string;
  submissionDate: string;
  status: "pending" | "reviewing" | "approved" | "rejected" | "paid";
  totalAmount: number;
  approvedAmount: number;
  items: Array<{
    description: string;
    procedure?: string;
    amount: number;
    covered: boolean;
    coveredAmount: number;
    reason?: string;
  }>;
  diagnosis: string;
  notes?: string;
  attachments: Array<{
    filename: string;
    url: string;
    size: number;
    uploadedAt: string;
  }>;
  reviewNotes?: string;
  reviewedBy?: any;
  reviewedAt?: string;
  insuranceProvider: string;
  policyNumber: string;
  groupNumber?: string;
  patient: any;
  provider: any;
  createdAt: string;
  updatedAt: string;
}

// Payment types
export interface PaymentAccount {
  _id: string;
  user: any;
  healthTokens: number;
  loyaltyPoints: number;
  transactions: Array<{
    type: "earned" | "spent" | "transferred" | "reward" | "grant";
    amount: number;
    description: string;
    relatedService?: string;
    hederaTransactionId: string;
    createdAt: string;
  }>;
  paymentMethods: Array<{
    type: "mobile_money" | "bank_account" | "crypto_wallet";
    provider: string;
    identifier: string;
    isDefault: boolean;
    verificationStatus: "pending" | "verified" | "failed";
  }>;
  totalEarned: number;
  totalSpent: number;
  createdAt: string;
  updatedAt: string;
}

// API client class
class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;

    // Load token from localStorage if available
    if (typeof window !== "undefined") {
      this.token = localStorage.getItem("authToken");
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== "undefined") {
      localStorage.setItem("authToken", token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== "undefined") {
      localStorage.removeItem("authToken");
    }
  }

  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    // Map frontend role names to backend enum values
    const roleMapping: Record<string, string> = {
      patient: "PATIENT",
      doctor: "DOCTOR",
      ngo: "NGO",
      government: "GOVERNMENT",
      pharma: "PHARMA",
    };

    const backendData = {
      ...userData,
      role: roleMapping[userData.role] || userData.role.toUpperCase(),
      phoneNumber: userData.phoneNumber, // Ensure correct field name
    };

    const response = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify(backendData),
    });

    if (response.token) {
      this.setToken(response.token);
    }

    return response;
  }

  async getCurrentUser(): Promise<any> {
    return this.request("/auth/me");
  }

  async logout(): Promise<{ message: string }> {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  // Health records endpoints
  async getMyRecords(params?: {
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<HealthRecord>> {
    const query = new URLSearchParams();
    if (params?.type) query.append("type", params.type);
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.offset) query.append("offset", params.offset.toString());

    return this.request(`/records/my?${query.toString()}`);
  }

  async createRecord(
    recordData: any
  ): Promise<{ message: string; record: HealthRecord }> {
    return this.request("/records", {
      method: "POST",
      body: JSON.stringify(recordData),
    });
  }

  async uploadDocuments(
    formData: FormData
  ): Promise<{ message: string; record: HealthRecord }> {
    const url = `${this.baseURL}/records/upload`;

    const headers: Record<string, string> = {};
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData, // Don't set Content-Type - let browser set it with boundary
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  async getPatientRecords(
    patientId: string,
    params?: {
      type?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<PaginatedResponse<HealthRecord>> {
    const query = new URLSearchParams();
    if (params?.type) query.append("type", params.type);
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.offset) query.append("offset", params.offset.toString());

    return this.request(`/records/patient/${patientId}?${query.toString()}`);
  }

  async updateRecordSharing(
    recordId: string,
    sharingData: { isShared: boolean; consentRecipients: string[] }
  ): Promise<{ record: HealthRecord }> {
    return this.request(`/records/${recordId}/sharing`, {
      method: "PUT",
      body: JSON.stringify(sharingData),
    });
  }

  async getRecordStats(): Promise<any> {
    return this.request("/records/stats");
  }

  // Insurance claims endpoints
  async getMyClaims(params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<InsuranceClaim>> {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.offset) query.append("offset", params.offset.toString());

    return this.request(`/insurance/claims/my?${query.toString()}`);
  }

  async createInsuranceClaim(
    claimData: any
  ): Promise<{ claim: InsuranceClaim }> {
    return this.request("/insurance/claims", {
      method: "POST",
      body: JSON.stringify(claimData),
    });
  }

  async getClaimById(claimId: string): Promise<{ claim: InsuranceClaim }> {
    return this.request(`/insurance/claims/${claimId}`);
  }

  async getClaimStats(): Promise<any> {
    return this.request("/insurance/claims/stats");
  }

  // Payment endpoints
  async getPaymentAccount(): Promise<{ account: PaymentAccount }> {
    return this.request("/payments/account");
  }

  async addTransaction(transactionData: {
    type: string;
    amount: number;
    description: string;
    relatedService?: string;
  }): Promise<any> {
    return this.request("/payments/transactions", {
      method: "POST",
      body: JSON.stringify(transactionData),
    });
  }

  async getTransactionHistory(params?: {
    type?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<any>> {
    const query = new URLSearchParams();
    if (params?.type) query.append("type", params.type);
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.offset) query.append("offset", params.offset.toString());

    return this.request(`/payments/transactions?${query.toString()}`);
  }

  async getPaymentMethods(): Promise<{ paymentMethods: any[] }> {
    return this.request("/payments/methods");
  }

  async addPaymentMethod(methodData: any): Promise<any> {
    return this.request("/payments/methods", {
      method: "POST",
      body: JSON.stringify(methodData),
    });
  }

  async transferTokens(transferData: {
    recipientId: string;
    amount: number;
    description: string;
  }): Promise<any> {
    return this.request("/payments/transfer", {
      method: "POST",
      body: JSON.stringify(transferData),
    });
  }

  async getAccountAnalytics(): Promise<any> {
    return this.request("/payments/analytics");
  }

  // HTS Token endpoints
  async getTokenBalances(params?: { syncWithNetwork?: boolean }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.syncWithNetwork) query.append("syncWithNetwork", "true");
    return this.request(`/payments/tokens/balances?${query.toString()}`);
  }

  async associateToken(tokenData: {
    tokenId: string;
    tokenSymbol: string;
    tokenName: string;
    decimals?: number;
  }): Promise<any> {
    return this.request("/payments/tokens/associate", {
      method: "POST",
      body: JSON.stringify(tokenData),
    });
  }

  async sendHTSTokens(data: {
    toUserId?: string;
    toAccountId?: string;
    tokenId: string;
    amount: number;
    description?: string;
  }): Promise<any> {
    return this.request("/payments/tokens/send", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getCampaignRewardTokens(): Promise<any> {
    return this.request("/payments/tokens/campaign-rewards");
  }

  // Impact Grid / Campaign endpoints
  async getCampaigns(params?: {
    status?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<any>> {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.category) query.append("category", params.category);
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.offset) query.append("offset", params.offset.toString());

    return this.request(`/impact/campaigns?${query.toString()}`);
  }

  async createCampaign(campaignData: any): Promise<{ campaign: any }> {
    return this.request("/impact/campaigns", {
      method: "POST",
      body: JSON.stringify(campaignData),
    });
  }

  async getCampaignById(campaignId: string): Promise<{ campaign: any }> {
    return this.request(`/impact/campaigns/${campaignId}`);
  }

  async updateCampaign(
    campaignId: string,
    updates: any
  ): Promise<{ campaign: any }> {
    return this.request(`/impact/campaigns/${campaignId}`, {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async updateCampaignStatus(
    campaignId: string,
    status: string
  ): Promise<{ campaign: any }> {
    return this.request(`/impact/campaigns/${campaignId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });
  }

  async addMilestone(
    campaignId: string,
    milestone: any
  ): Promise<{ campaign: any }> {
    return this.request(`/impact/campaigns/${campaignId}/milestones`, {
      method: "POST",
      body: JSON.stringify(milestone),
    });
  }

  async completeMilestone(
    campaignId: string,
    milestoneId: string,
    impact: any
  ): Promise<{ campaign: any }> {
    return this.request(
      `/impact/campaigns/${campaignId}/milestones/${milestoneId}/complete`,
      {
        method: "PUT",
        body: JSON.stringify({ impact }),
      }
    );
  }

  async generateReport(
    campaignId: string,
    report: any
  ): Promise<{ campaign: any }> {
    return this.request(`/impact/campaigns/${campaignId}/reports`, {
      method: "POST",
      body: JSON.stringify(report),
    });
  }

  async getCampaignAnalytics(): Promise<any> {
    return this.request("/impact/analytics");
  }

  async getAvailableCampaigns(params?: {
    category?: string;
    location?: string;
    limit?: number;
    offset?: number;
  }): Promise<PaginatedResponse<any>> {
    const query = new URLSearchParams();
    if (params?.category) query.append("category", params.category);
    if (params?.location) query.append("location", params.location);
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.offset) query.append("offset", params.offset.toString());

    return this.request(`/impact/campaigns/available?${query.toString()}`);
  }

  async joinCampaign(
    campaignId: string,
    data: { contributionDescription?: string }
  ): Promise<{ campaign: any }> {
    return this.request(`/impact/campaigns/${campaignId}/join`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async verifyParticipant(
    campaignId: string,
    participantId: string,
    data: { verificationStatus: string; notes?: string }
  ): Promise<{ campaign: any }> {
    return this.request(
      `/impact/campaigns/${campaignId}/participants/${participantId}/verify`,
      {
        method: "PUT",
        body: JSON.stringify(data),
      }
    );
  }

  async distributeRewards(campaignId: string): Promise<any> {
    return this.request(`/impact/campaigns/${campaignId}/distribute-rewards`, {
      method: "POST",
    });
  }

  async createCampaignToken(
    campaignId: string,
    data: {
      tokenName: string;
      tokenSymbol: string;
      initialSupply: number;
      rewardPerParticipant: number;
    }
  ): Promise<any> {
    return this.request(`/impact/campaigns/${campaignId}/create-token`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // User Details endpoints
  async getUserProfile(): Promise<any> {
    return this.request("/user/profile");
  }

  async updateUserProfile(profileData: {
    firstName?: string;
    lastName?: string;
    phoneNumber?: string;
    country?: string;
    roleData?: any;
  }): Promise<any> {
    return this.request("/user/profile", {
      method: "PUT",
      body: JSON.stringify(profileData),
    });
  }

  async updatePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<any> {
    return this.request("/user/password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
  }

  async getUserRoleData(): Promise<any> {
    return this.request("/user/profile/role-data");
  }

  async updateUserRoleData(roleData: any): Promise<any> {
    return this.request("/user/profile/role-data", {
      method: "PUT",
      body: JSON.stringify(roleData),
    });
  }

  async getInsurers(): Promise<{ insurers: any[] }> {
    return this.request("/user/insurers");
  }

  // Persona endpoints (DID resolution, VC issuance)
  async resolveDID(did: string): Promise<any> {
    return this.request(`/persona/${did}`);
  }

  async issueVC(
    did: string,
    vcData: {
      type: string;
      claim: any;
      expiryDays?: number;
      notifyEmail?: string;
      notifyPhone?: string;
    }
  ): Promise<any> {
    return this.request(`/persona/${did}/vc`, {
      method: "POST",
      body: JSON.stringify(vcData),
    });
  }

  async listVCs(did: string): Promise<any> {
    return this.request(`/persona/${did}/vcs`);
  }

  // MedFlow endpoints (appointments and prescriptions)
  async createAppointment(appointmentData: {
    clinicId: string;
    scheduledAt: string;
    reason: string;
  }): Promise<any> {
    return this.request("/medflow/appointments", {
      method: "POST",
      body: JSON.stringify(appointmentData),
    });
  }

  async listAppointments(params?: { status?: string }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    return this.request(`/medflow/appointments?${query.toString()}`);
  }

  async acceptAppointment(appointmentId: string): Promise<any> {
    return this.request(`/medflow/appointments/${appointmentId}/accept`, {
      method: "PATCH",
    });
  }

  async cancelAppointment(appointmentId: string): Promise<any> {
    return this.request(`/medflow/appointments/${appointmentId}/cancel`, {
      method: "PATCH",
    });
  }

  async issuePrescription(prescriptionData: {
    appointmentId: string;
    title: string;
    payload: any;
  }): Promise<any> {
    return this.request("/medflow/prescriptions", {
      method: "POST",
      body: JSON.stringify(prescriptionData),
    });
  }

  async getPrescription(prescriptionId: string): Promise<any> {
    return this.request(`/medflow/prescriptions/${prescriptionId}`);
  }

  async listPrescriptions(params?: { status?: string }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    return this.request(`/medflow/prescriptions?${query.toString()}`);
  }

  async listDoctors(params?: {
    specialty?: string;
    search?: string;
    limit?: number;
  }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.specialty) query.append("specialty", params.specialty);
    if (params?.search) query.append("search", params.search);
    if (params?.limit) query.append("limit", params.limit.toString());
    return this.request(`/medflow/doctors?${query.toString()}`);
  }

  async uploadMedflowDocuments(
    formData: FormData
  ): Promise<{ message: string; record: HealthRecord }> {
    const url = `${this.baseURL}/medflow/records/upload`;

    const headers: Record<string, string> = {};
    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData, // Don't set Content-Type - let browser set it with boundary
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          errorData.error ||
          `HTTP error! status: ${response.status}`
      );
    }

    return response.json();
  }

  // Claim endpoints
  async createClaim(claimData: {
    recordId: string;
    insurerId: string;
    amountRequested: number;
    currency?: string;
    description: string;
    attachments?: string[];
  }): Promise<any> {
    return this.request("/claims", {
      method: "POST",
      body: JSON.stringify(claimData),
    });
  }

  async getClaimsList(params?: { status?: string }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    return this.request(`/claims?${query.toString()}`);
  }

  async getClaim(claimId: string): Promise<any> {
    return this.request(`/claims/${claimId}`);
  }

  async approveClaim(
    claimId: string,
    data: {
      amountApproved?: number;
      payoutMethod?: string;
      payoutDetails?: any;
    }
  ): Promise<any> {
    return this.request(`/claims/${claimId}/approve`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async rejectClaim(claimId: string, data: { reason: string }): Promise<any> {
    return this.request(`/claims/${claimId}/reject`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async validateClaimRecord(claimId: string): Promise<any> {
    return this.request(`/claims/${claimId}/validate`);
  }

  async getClaimAudit(claimId: string): Promise<any> {
    return this.request(`/claims/${claimId}/audit`);
  }

  // MediTrace endpoints (pharmaceutical supply chain tracking)
  async createBatch(batchData: {
    productName: string;
    batchNumber: string;
    quantity?: number;
    manufacturingDate?: string;
    expiryDate?: string;
    manufacturingFacility?: string;
    metadata?: any;
    manufacturerDid: string;
  }): Promise<any> {
    return this.request("/meditrace/batch", {
      method: "POST",
      body: JSON.stringify(batchData),
    });
  }

  async addBatchEvent(eventData: {
    batchNumber: string;
    action: string;
    actorDid: string;
    location?: string;
    notes?: string;
    toAccountId?: string;
    toAccountPrivateKey?: string;
  }): Promise<any> {
    return this.request("/meditrace/event", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  }

  async getBatchByNumber(batchNumber: string): Promise<any> {
    return this.request(`/meditrace/batch/${batchNumber}`);
  }

  async verifyBatchToken(tokenId: string): Promise<any> {
    return this.request(`/meditrace/verify/${tokenId}`);
  }

  async reportBatchIssue(reportData: {
    batchNumber: string;
    reporterDid: string;
    issueType: "counterfeit" | "temperature" | "damaged" | "expired" | "other";
    description: string;
    location: string;
    evidence?: string[];
  }): Promise<any> {
    return this.request("/meditrace/report", {
      method: "POST",
      body: JSON.stringify(reportData),
    });
  }

  async getAllBatches(params?: {
    manufacturerDid?: string;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    const query = new URLSearchParams();
    if (params?.manufacturerDid)
      query.append("manufacturerDid", params.manufacturerDid);
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.offset) query.append("offset", params.offset.toString());
    return this.request(`/meditrace/batches?${query.toString()}`);
  }

  // HealthIQ endpoints (AI health assistant)
  async sendHealthIQMessage(data: {
    message: string;
    conversationId?: string;
  }): Promise<{
    success: boolean;
    conversationId: string;
    message: any;
  }> {
    return this.request("/healthiq/chat", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getHealthIQConversations(params?: {
    limit?: number;
    skip?: number;
    isActive?: boolean;
  }): Promise<{
    success: boolean;
    conversations: any[];
    total: number;
  }> {
    const query = new URLSearchParams();
    if (params?.limit) query.append("limit", params.limit.toString());
    if (params?.skip) query.append("skip", params.skip.toString());
    if (params?.isActive !== undefined)
      query.append("isActive", params.isActive.toString());
    return this.request(`/healthiq/conversations?${query.toString()}`);
  }

  async getHealthIQConversation(conversationId: string): Promise<{
    success: boolean;
    conversation: any;
  }> {
    return this.request(`/healthiq/conversations/${conversationId}`);
  }

  async deleteHealthIQConversation(conversationId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.request(`/healthiq/conversations/${conversationId}`, {
      method: "DELETE",
    });
  }

  async uploadHealthData(data: {
    bloodPressure?: string;
    heartRate?: string;
    weight?: string;
    height?: string;
    sleepHours?: string;
    exerciseMinutes?: string;
    symptoms?: string;
    temperature?: string;
    oxygenSaturation?: string;
  }): Promise<{
    success: boolean;
    message: string;
    profile: any;
  }> {
    return this.request("/healthiq/health-data", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async getHealthProfile(): Promise<{
    success: boolean;
    profile: any | null;
    message?: string;
  }> {
    return this.request("/healthiq/health-profile");
  }

  async generateHealthInsights(): Promise<{
    success: boolean;
    insights: any[];
    message: string;
  }> {
    return this.request("/healthiq/generate-insights", {
      method: "POST",
    });
  }

  async getHealthInsights(params?: {
    insightType?: string;
    limit?: number;
  }): Promise<{
    success: boolean;
    insights: any[];
  }> {
    const query = new URLSearchParams();
    if (params?.insightType) query.append("insightType", params.insightType);
    if (params?.limit) query.append("limit", params.limit.toString());
    return this.request(`/healthiq/insights?${query.toString()}`);
  }

  async markInsightViewed(insightId: string): Promise<{
    success: boolean;
    insight: any;
  }> {
    return this.request(`/healthiq/insights/${insightId}/view`, {
      method: "PUT",
    });
  }

  // GovHealth endpoints (Regulatory Compliance & Licensing)
  async issueLicense(licenseData: {
    issuedTo: string;
    issuedToType: "practitioner" | "facility" | "lab" | "pharmacy";
    issuedBy: string;
    validFrom: string;
    validUntil: string;
    complianceRequirements?: string[];
    certificateBlob?: string;
  }): Promise<{ message: string; license: any }> {
    return this.request("/gov-health/licenses", {
      method: "POST",
      body: JSON.stringify(licenseData),
    });
  }

  async revokeLicense(
    licenseId: string,
    data: {
      revokedBy: string;
      reason: string;
    }
  ): Promise<{ message: string; license: any }> {
    return this.request(`/gov-health/licenses/${licenseId}/revoke`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async listLicenses(params?: {
    status?: "active" | "revoked" | "expired";
    issuedTo?: string;
  }): Promise<{ licenses: any[] }> {
    const query = new URLSearchParams();
    if (params?.status) query.append("status", params.status);
    if (params?.issuedTo) query.append("issuedTo", params.issuedTo);
    return this.request(`/gov-health/licenses?${query.toString()}`);
  }

  async getLicenseById(licenseId: string): Promise<{ license: any }> {
    return this.request(`/gov-health/licenses/${licenseId}`);
  }

  async updateLicenseStatus(
    licenseId: string,
    data: {
      status: "active" | "revoked" | "expired";
      updatedBy: string;
      reason?: string;
    }
  ): Promise<{ message: string; license: any }> {
    return this.request(`/gov-health/licenses/${licenseId}/status`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async createAudit(auditData: {
    targetEntity: string;
    performedBy: string;
    summary: string;
    findings: string[];
    severity: "low" | "medium" | "high";
    reportBlob?: string;
    targetLicenseId?: string;
  }): Promise<{ message: string; audit: any }> {
    return this.request("/gov-health/audits", {
      method: "POST",
      body: JSON.stringify(auditData),
    });
  }

  async listAudits(params?: {
    severity?: "low" | "medium" | "high";
    targetEntity?: string;
    performedBy?: string;
  }): Promise<{ audits: any[] }> {
    const query = new URLSearchParams();
    if (params?.severity) query.append("severity", params.severity);
    if (params?.targetEntity) query.append("targetEntity", params.targetEntity);
    if (params?.performedBy) query.append("performedBy", params.performedBy);
    return this.request(`/gov-health/audits?${query.toString()}`);
  }

  async getAuditById(auditId: string): Promise<{ audit: any }> {
    return this.request(`/gov-health/audits/${auditId}`);
  }

  async getComplianceStats(): Promise<{
    licenses: {
      total: number;
      active: number;
      expired: number;
      revoked: number;
      expiringSoon: number;
    };
    audits: {
      total: number;
      highSeverity: number;
      mediumSeverity: number;
      lowSeverity: number;
    };
    complianceScore: number;
  }> {
    return this.request("/gov-health/stats/compliance");
  }

  async getPublicHealthData(params?: {
    region?: string;
    dataType?:
      | "disease_statistics"
      | "vaccination_rates"
      | "facility_capacity"
      | "licensing_stats"
      | "audit_summary";
    timeframe?: "daily" | "weekly" | "monthly" | "quarterly" | "yearly";
    startDate?: string;
    endDate?: string;
    anonymized?: boolean;
  }): Promise<{ counts: any; messages: any[] }> {
    const query = new URLSearchParams();
    if (params?.region) query.append("region", params.region);
    if (params?.dataType) query.append("dataType", params.dataType);
    if (params?.timeframe) query.append("timeframe", params.timeframe);
    if (params?.startDate) query.append("startDate", params.startDate);
    if (params?.endDate) query.append("endDate", params.endDate);
    if (params?.anonymized !== undefined)
      query.append("anonymized", params.anonymized.toString());
    return this.request(`/gov-health/public-data?${query.toString()}`);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
