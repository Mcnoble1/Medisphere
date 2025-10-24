"use client";

import { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import QRCode from "qrcode";
import {
  Shield,
  User,
  Upload,
  QrCode as QrCodeIcon,
  CheckCircle,
  AlertCircle,
  Wallet,
  FileText,
  Camera,
  Download,
  Copy,
  Eye,
  EyeOff,
  Stethoscope,
  Users,
  Truck,
  Plus,
  X,
  ExternalLink,
} from "lucide-react";

interface PersonaVaultProps {
  userRole?: "patient" | "doctor" | "ngo" | "government" | "pharma";
}

export default function PersonaVault({
  userRole = "patient",
}: PersonaVaultProps) {
  const [activeTab, setActiveTab] = useState("profile");
  const [kycStatus, setKycStatus] = useState("pending"); // pending, verified, rejected
  const [showWalletAddress, setShowWalletAddress] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userVCs, setUserVCs] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditingRoleData, setIsEditingRoleData] = useState(false);
  const [roleDataForm, setRoleDataForm] = useState<any>({});
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [qrCodeType, setQrCodeType] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [profileData, setProfileData] = useState({
    fullName: "",
    dateOfBirth: "",
    nationalId: "",
    phone: "",
    email: "",
    role: "",
    walletAddress: "0x742d35Cc6634C0532925a3b8D404fddF4f780EAD",
    organization: "",
    licenseNumber: "",
    specialty: "",
    companyRegistration: "",
    certifications: [] as string[],
    teamMembers: [] as { name: string; role: string; email: string }[],
  });

  const testData = {
    patient: {
      fullName: "John Doe",
      dateOfBirth: "1990-05-15",
      nationalId: "NIN12345678901",
      phone: "+234 803 123 4567",
      email: "john.doe@email.com",
      role: "patient",
    },
    doctor: {
      fullName: "Dr. Sarah Johnson",
      dateOfBirth: "1985-03-20",
      nationalId: "MDL987654321",
      phone: "+234 801 987 6543",
      email: "dr.sarah@hospital.com",
      licenseNumber: "MD-2024-001",
      specialty: "cardiology",
      organization: "Lagos General Hospital",
    },
    ngo: {
      fullName: "Health for All Foundation",
      dateOfBirth: "2010-01-01",
      phone: "+234 802 555 0123",
      email: "info@healthforall.org",
      organization: "NGO-REG-2024-001",
      teamMembers: [
        {
          name: "Mary Adebayo",
          role: "Program Director",
          email: "mary@healthforall.org",
        },
        {
          name: "James Okafor",
          role: "Field Coordinator",
          email: "james@healthforall.org",
        },
      ],
    },
    pharma: {
      fullName: "MediCorp Nigeria Ltd",
      dateOfBirth: "2005-08-10",
      phone: "+234 809 888 7777",
      email: "contact@medicorp.ng",
      companyRegistration: "RC-123456",
      certifications: [
        "ISO 9001:2015",
        "WHO-GMP Certified",
        "NAFDAC License A4-1234",
      ],
    },
    government: {
      fullName: "Dr. Amina Hassan",
      phone: "+234 807 111 2222",
      email: "amina.hassan@health.gov.ng",
      nationalId: "GOV-ID-789012",
    },
  };

  const fillTestData = () => {
    const data = testData[userRole as keyof typeof testData];
    if (data) {
      setProfileData((prev) => ({ ...prev, ...data }));
    }
  };

  const handleSubmitProfile = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      // Parse full name into first and last name
      const nameParts = profileData.fullName.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      // Prepare profile update data
      const updateData = {
        firstName,
        lastName,
        phoneNumber: profileData.phone,
        roleData: {
          [currentUser.role]: {},
        },
      };

      // Add role-specific data based on user role
      const userRole = currentUser.role;
      const roleSpecificData = updateData.roleData[userRole];

      if (userRole === "DOCTOR") {
        Object.assign(roleSpecificData, {
          organization: profileData.organization,
          licenseNumber: profileData.licenseNumber,
          medicalLicenseNumber: profileData.licenseNumber,
          specialty: profileData.specialty,
        });
      } else if (userRole === "NGO") {
        Object.assign(roleSpecificData, {
          organizationName: profileData.fullName,
          organization: profileData.organization,
          registrationNumber: profileData.organization,
        });
      } else if (userRole === "PHARMA") {
        Object.assign(roleSpecificData, {
          companyName: profileData.fullName,
          businessRegNumber: profileData.companyRegistration,
          operatingLicenses: profileData.certifications,
        });
      } else if (userRole === "GOVERNMENT") {
        Object.assign(roleSpecificData, {
          officialId: profileData.nationalId,
          organization: profileData.organization,
        });
      }

      // Update profile via API
      const response = await apiClient.updateUserProfile(updateData);

      setSuccess("Profile updated successfully!");
      console.log("Profile updated:", response);

      // Refresh user data
      await loadCurrentUser();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setError(error.message || "Failed to update profile");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKYCSubmission = async () => {
    if (!currentUser?.did) {
      setError("User DID not found. Please contact support.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);
    try {
      console.log("Submitting KYC verification:", {
        nationalId: profileData.nationalId,
        userRole,
      });

      // Issue KYC verification credential
      const vcData = {
        type: "KYCVerification",
        claim: {
          nationalId: profileData.nationalId,
          userRole: userRole,
          fullName: profileData.fullName,
          phone: profileData.phone,
          email: profileData.email,
          licenseNumber: profileData.licenseNumber,
          specialty: profileData.specialty,
          organization: profileData.organization,
          submittedAt: new Date().toISOString(),
        },
        expiryDays: 365,
        notifyEmail: profileData.email,
      };

      const response = await apiClient.issueVC(currentUser.did, vcData);

      setKycStatus("pending");
      setSuccess(
        "KYC verification submitted successfully! You will be notified once verified."
      );
      console.log("KYC submitted for verification:", response);

      // Refresh VCs list
      await loadUserVCs();
    } catch (error: any) {
      console.error("Error submitting KYC:", error);
      setError(error.message || "Failed to submit KYC verification");
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = async (type: string) => {
    if (!currentUser?.hederaAccountId) {
      setError("Hedera Account ID not found. Cannot generate QR code.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      console.log("Generating QR code for:", type);

      // Prepare QR data based on type
      let qrData: any = {
        hederaAccountId: currentUser.hederaAccountId,
        type: type,
        userRole: userRole,
        timestamp: new Date().toISOString(),
      };

      // Add type-specific data
      if (type === "basic") {
        qrData = {
          ...qrData,
          name: `${currentUser.firstName} ${currentUser.lastName}`,
          email: currentUser.email,
          role: currentUser.role,
        };
      } else if (type === "patientAccess") {
        // Patient-specific data
        const patientData = currentUser.roleData?.PATIENT || {};
        qrData = {
          ...qrData,
          name: `${currentUser.firstName} ${currentUser.lastName}`,
          email: currentUser.email,
          phone: currentUser.phoneNumber,
          bloodType: patientData.bloodType,
          age: patientData.age,
          emergencyContact: patientData.emergencyContact,
          allergies: patientData.allergies,
          insuranceNumber: patientData.insuranceNumber,
        };
      } else if (type === "medicalProfessional") {
        // Doctor-specific data
        const doctorData = currentUser.roleData?.DOCTOR || {};
        qrData = {
          ...qrData,
          name: `${currentUser.firstName} ${currentUser.lastName}`,
          email: currentUser.email,
          phone: currentUser.phoneNumber,
          licenseNumber:
            doctorData.licenseNumber || doctorData.medicalLicenseNumber,
          specialty: doctorData.specialty,
          organization: doctorData.organization,
        };
      } else if (type === "organizationProfile") {
        // NGO-specific data
        const ngoData = currentUser.roleData?.NGO || {};
        qrData = {
          ...qrData,
          organizationName: ngoData.organizationName,
          registrationNumber: ngoData.registrationNumber,
          email: currentUser.email,
          phone: currentUser.phoneNumber,
          focusAreas: ngoData.focusAreas,
        };
      } else if (type === "supplierVerification") {
        // Pharma-specific data
        const pharmaData = currentUser.roleData?.PHARMA || {};
        qrData = {
          ...qrData,
          companyName: pharmaData.companyName,
          businessRegNumber: pharmaData.businessRegNumber,
          email: currentUser.email,
          phone: currentUser.phoneNumber,
          supplyChainRole: pharmaData.supplyChainRole,
          operatingLicenses: pharmaData.operatingLicenses,
        };
      }

      // Convert to JSON string
      const qrDataString = JSON.stringify(qrData);
      console.log("QR code data:", qrData);

      // Generate QR code as data URL
      const dataUrl = await QRCode.toDataURL(qrDataString, {
        width: 400,
        margin: 2,
        color: {
          dark: "#000000",
          light: "#FFFFFF",
        },
      });

      setQrCodeDataUrl(dataUrl);
      setQrCodeType(type);
      setSuccess(`QR code for ${type} generated successfully!`);
    } catch (error: any) {
      console.error("Error generating QR code:", error);
      setError(error.message || "Failed to generate QR code");
    } finally {
      setIsLoading(false);
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeDataUrl;
    link.download = `identity-qr-${qrCodeType || "code"}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setSuccess("QR code downloaded successfully!");
  };

  const copyQRLink = async () => {
    if (!qrCodeDataUrl) return;

    try {
      // Create a shareable link with the QR data
      const qrDataString = JSON.stringify({
        hederaAccountId: currentUser?.hederaAccountId,
        type: qrCodeType,
        userRole: userRole,
        name: `${currentUser?.firstName} ${currentUser?.lastName}`,
        timestamp: new Date().toISOString(),
      });

      // In a production environment, you would generate a short URL
      // For now, we'll just copy the Hedera account ID
      await navigator.clipboard.writeText(
        `Hedera Account: ${currentUser?.hederaAccountId}`
      );
      setSuccess("Account link copied to clipboard!");
    } catch (error) {
      console.error("Error copying link:", error);
      setError("Failed to copy link");
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const addCertification = () => {
    setProfileData((prev) => ({
      ...prev,
      certifications: [...prev.certifications, ""],
    }));
  };

  const updateCertification = (index: number, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) =>
        i === index ? value : cert
      ),
    }));
  };

  const removeCertification = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const addTeamMember = () => {
    setProfileData((prev) => ({
      ...prev,
      teamMembers: [...prev.teamMembers, { name: "", role: "", email: "" }],
    }));
  };

  const updateTeamMember = (index: number, field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.map((member, i) =>
        i === index ? { ...member, [field]: value } : member
      ),
    }));
  };

  const removeTeamMember = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      teamMembers: prev.teamMembers.filter((_, i) => i !== index),
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess("Copied to clipboard!");
  };

  // Handle role data form changes
  const handleRoleDataChange = (field: string, value: string) => {
    setRoleDataForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Initialize role data form with existing data or empty values
  const initializeRoleDataForm = () => {
    const existingRoleData = currentUser?.roleData?.[currentUser?.role] || {};

    if (userRole === "doctor") {
      setRoleDataForm({
        licenseNumber:
          existingRoleData.licenseNumber ||
          existingRoleData.medicalLicenseNumber ||
          "",
        specialty: existingRoleData.specialty || "",
        organization:
          existingRoleData.organization ||
          existingRoleData.medicalPractice ||
          "",
        yearsOfExperience: existingRoleData.yearsOfExperience || "",
      });
    } else if (userRole === "ngo") {
      setRoleDataForm({
        organizationName: existingRoleData.organizationName || "",
        registrationNumber: existingRoleData.registrationNumber || "",
        organizationType: existingRoleData.organizationType || "",
        focusAreas: existingRoleData.focusAreas?.join(", ") || "",
        operatingCountries:
          existingRoleData.operatingCountries?.join(", ") || "",
      });
    } else if (userRole === "government") {
      setRoleDataForm({
        agencyName: existingRoleData.agencyName || "",
        officialId: existingRoleData.officialId || "",
        designation: existingRoleData.designation || "",
        department: existingRoleData.department || "",
        jurisdiction: existingRoleData.jurisdiction || "",
      });
    } else if (userRole === "pharma") {
      setRoleDataForm({
        companyName: existingRoleData.companyName || "",
        businessRegNumber: existingRoleData.businessRegNumber || "",
        supplyChainRole: existingRoleData.supplyChainRole || "",
        operatingLicenses: existingRoleData.operatingLicenses?.join(", ") || "",
      });
    } else if (userRole === "patient") {
      setRoleDataForm({
        age: existingRoleData.age || "",
        gender: existingRoleData.gender || "",
        bloodType: existingRoleData.bloodType || "",
        emergencyContact: existingRoleData.emergencyContact || "",
        insuranceNumber: existingRoleData.insuranceNumber || "",
        allergies: existingRoleData.allergies?.join(", ") || "",
        chronicConditions: existingRoleData.chronicConditions?.join(", ") || "",
      });
    }
  };

  // Save role data to database
  const handleSaveRoleData = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Prepare data based on role
      let saveData = { ...roleDataForm };

      // Convert comma-separated strings to arrays where needed
      if (userRole === "ngo") {
        saveData.focusAreas = roleDataForm.focusAreas
          ? roleDataForm.focusAreas
              .split(",")
              .map((item: string) => item.trim())
          : [];
        saveData.operatingCountries = roleDataForm.operatingCountries
          ? roleDataForm.operatingCountries
              .split(",")
              .map((item: string) => item.trim())
          : [];
      } else if (userRole === "pharma") {
        saveData.operatingLicenses = roleDataForm.operatingLicenses
          ? roleDataForm.operatingLicenses
              .split(",")
              .map((item: string) => item.trim())
          : [];
      } else if (userRole === "patient") {
        saveData.allergies = roleDataForm.allergies
          ? roleDataForm.allergies.split(",").map((item: string) => item.trim())
          : [];
        saveData.chronicConditions = roleDataForm.chronicConditions
          ? roleDataForm.chronicConditions
              .split(",")
              .map((item: string) => item.trim())
          : [];
        // Convert age to number
        if (saveData.age) saveData.age = parseInt(saveData.age);
      } else if (userRole === "doctor") {
        // Convert years of experience to number
        if (saveData.yearsOfExperience)
          saveData.yearsOfExperience = parseInt(saveData.yearsOfExperience);
      }

      // Save via API
      await apiClient.updateUserRoleData(saveData);

      setSuccess("Information saved successfully!");
      setIsEditingRoleData(false);

      // Refresh user data
      await loadCurrentUser();
    } catch (error: any) {
      console.error("Error saving role data:", error);
      setError(error.message || "Failed to save information");
    } finally {
      setIsLoading(false);
    }
  };

  // Start editing role data
  const startEditingRoleData = () => {
    initializeRoleDataForm();
    setIsEditingRoleData(true);
  };

  // Cancel editing
  const cancelEditingRoleData = () => {
    setIsEditingRoleData(false);
    setRoleDataForm({});
  };

  // Load current user data from new API
  const loadCurrentUser = async () => {
    try {
      const response = await apiClient.getUserProfile();
      const user = response.user;
      setCurrentUser(user);

      // Update profile data with comprehensive user info
      setProfileData((prev) => ({
        ...prev,
        fullName: `${user.firstName} ${user.lastName}` || prev.fullName,
        email: user.email || prev.email,
        phone: user.phoneNumber || prev.phone,
        role: user.role?.toLowerCase() || prev.role,
        walletAddress: user.did || prev.walletAddress,

        // Role-specific data
        organization:
          user.roleData?.[user.role]?.organization || prev.organization,
        licenseNumber:
          user.roleData?.[user.role]?.licenseNumber ||
          user.roleData?.[user.role]?.medicalLicenseNumber ||
          prev.licenseNumber,
        specialty: user.roleData?.[user.role]?.specialty || prev.specialty,
        companyRegistration:
          user.roleData?.[user.role]?.businessRegNumber ||
          prev.companyRegistration,
        nationalId: user.roleData?.[user.role]?.officialId || prev.nationalId,

        // Handle arrays safely
        certifications:
          user.roleData?.[user.role]?.operatingLicenses || prev.certifications,
        teamMembers: prev.teamMembers, // Keep existing for now as it's not in the schema
      }));
    } catch (error: any) {
      console.error("Error loading user profile:", error);
      setError("Failed to load user profile");
    }
  };

  // Load user's verifiable credentials
  const loadUserVCs = async () => {
    if (!currentUser?.did) return;

    try {
      const response = await apiClient.listVCs(currentUser.did);
      setUserVCs(response.vcs || []);

      // Check for KYC verification status
      const kycVC = response.vcs?.find(
        (vc: any) => vc.type === "KYCVerification"
      );
      if (kycVC) {
        setKycStatus("verified");
      }
    } catch (error: any) {
      console.error("Error loading VCs:", error);
      // Don't show error for VCs as it's not critical
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadCurrentUser();
  }, []);

  // Load VCs when user is loaded
  useEffect(() => {
    if (currentUser?.did) {
      loadUserVCs();
    }
  }, [currentUser]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "doctor":
        return Stethoscope;
      case "ngo":
        return Users;
      case "government":
        return Shield;
      case "pharma":
        return Truck;
      default:
        return User;
    }
  };

  const RoleIcon = getRoleIcon(userRole);

  return (
    <div className="space-y-6">
      {/* Error/Success Messages */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-xl">
          <p className="text-sm">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-secondary/10 border border-secondary/20 text-secondary px-4 py-3 rounded-xl">
          <p className="text-sm">{success}</p>
        </div>
      )}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              PersonaVault™
            </h1>
            <p className="text-muted-foreground">Digital Identity System</p>
          </div>
          <Badge variant="outline" className="ml-auto">
            <RoleIcon className="w-3 h-3 mr-1" />
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground">
          {userRole === "doctor" &&
            "Manage your medical credentials, licenses, and professional verification"}
          {userRole === "ngo" &&
            "Create and manage your organization profile for healthcare programs"}
          {userRole === "government" &&
            "Access regulatory tools and compliance management"}
          {userRole === "pharma" &&
            "Verify your company and manage product certifications"}
          {userRole === "patient" &&
            "Secure, decentralized identity management powered by Hedera DID technology"}
        </p>
      </div>

      <div className="max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList
            className={`grid w-full mb-8 ${
              userRole === "patient" ? "grid-cols-3" : "grid-cols-4"
            }`}
          >
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <RoleIcon className="w-4 h-4" />
              Profile
            </TabsTrigger>
            {userRole !== "patient" && (
              <TabsTrigger
                value="verification"
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Verification
              </TabsTrigger>
            )}
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Digital Wallet
            </TabsTrigger>
            <TabsTrigger value="qr" className="flex items-center gap-2">
              <QrCodeIcon className="w-4 h-4" />
              Share Identity
            </TabsTrigger>
          </TabsList>

          {/* Profile Management Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Basic Profile Information */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RoleIcon className="w-5 h-5 text-primary" />
                  Profile Information
                </CardTitle>
                <CardDescription>
                  Your basic account information and identity details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Full Name
                      </Label>
                      <p className="text-foreground font-medium">
                        {currentUser?.firstName} {currentUser?.lastName}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Email Address
                      </Label>
                      <p className="text-foreground">{currentUser?.email}</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Phone Number
                      </Label>
                      <p className="text-foreground">
                        {currentUser?.phoneNumber || "Not provided"}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Country
                      </Label>
                      <p className="text-foreground">
                        {currentUser?.country || "Not provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Role-Specific Data */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RoleIcon className="w-5 h-5 text-secondary" />
                  {userRole === "doctor" && "Medical Professional Information"}
                  {userRole === "ngo" && "Organization Details"}
                  {userRole === "government" && "Government Credentials"}
                  {userRole === "pharma" && "Company Information"}
                  {userRole === "patient" && "Patient Information"}
                </CardTitle>
                <CardDescription>
                  {userRole === "doctor" &&
                    "Your medical credentials, licenses, and professional information"}
                  {userRole === "ngo" &&
                    "Organization registration and operational details"}
                  {userRole === "government" &&
                    "Government credentials and authorization details"}
                  {userRole === "pharma" &&
                    "Company registration and pharmaceutical certifications"}
                  {userRole === "patient" &&
                    "Your healthcare-related information and preferences"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditingRoleData ? (
                  <>
                    {/* Role Data Form */}
                    <div className="space-y-4">
                      {userRole === "doctor" && (
                        <>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="licenseNumber">
                                Medical License Number
                              </Label>
                              <Input
                                id="licenseNumber"
                                value={roleDataForm.licenseNumber || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "licenseNumber",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter your medical license number"
                                className="rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="specialty">
                                Medical Specialty
                              </Label>
                              <Select
                                value={roleDataForm.specialty || ""}
                                onValueChange={(value) =>
                                  handleRoleDataChange("specialty", value)
                                }
                              >
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue placeholder="Select your specialty" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="general">
                                    General Practice
                                  </SelectItem>
                                  <SelectItem value="cardiology">
                                    Cardiology
                                  </SelectItem>
                                  <SelectItem value="pediatrics">
                                    Pediatrics
                                  </SelectItem>
                                  <SelectItem value="surgery">
                                    Surgery
                                  </SelectItem>
                                  <SelectItem value="psychiatry">
                                    Psychiatry
                                  </SelectItem>
                                  <SelectItem value="neurology">
                                    Neurology
                                  </SelectItem>
                                  <SelectItem value="orthopedics">
                                    Orthopedics
                                  </SelectItem>
                                  <SelectItem value="dermatology">
                                    Dermatology
                                  </SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="organization">
                                Medical Practice/Hospital
                              </Label>
                              <Input
                                id="organization"
                                value={roleDataForm.organization || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "organization",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter your practice or hospital name"
                                className="rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="yearsOfExperience">
                                Years of Experience
                              </Label>
                              <Input
                                id="yearsOfExperience"
                                type="number"
                                value={roleDataForm.yearsOfExperience || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "yearsOfExperience",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter years of experience"
                                className="rounded-xl"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {userRole === "ngo" && (
                        <>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="organizationName">
                                Organization Name
                              </Label>
                              <Input
                                id="organizationName"
                                value={roleDataForm.organizationName || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "organizationName",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter organization name"
                                className="rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="registrationNumber">
                                Registration Number
                              </Label>
                              <Input
                                id="registrationNumber"
                                value={roleDataForm.registrationNumber || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "registrationNumber",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter registration number"
                                className="rounded-xl"
                              />
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="organizationType">
                                Organization Type
                              </Label>
                              <Input
                                id="organizationType"
                                value={roleDataForm.organizationType || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "organizationType",
                                    e.target.value
                                  )
                                }
                                placeholder="e.g., Non-profit, Charity, Foundation"
                                className="rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="operatingCountries">
                                Operating Countries
                              </Label>
                              <Input
                                id="operatingCountries"
                                value={roleDataForm.operatingCountries || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "operatingCountries",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter countries (comma-separated)"
                                className="rounded-xl"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="focusAreas">Focus Areas</Label>
                            <Input
                              id="focusAreas"
                              value={roleDataForm.focusAreas || ""}
                              onChange={(e) =>
                                handleRoleDataChange(
                                  "focusAreas",
                                  e.target.value
                                )
                              }
                              placeholder="Enter focus areas (comma-separated)"
                              className="rounded-xl"
                            />
                          </div>
                        </>
                      )}

                      {userRole === "government" && (
                        <>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="agencyName">Agency Name</Label>
                              <Input
                                id="agencyName"
                                value={roleDataForm.agencyName || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "agencyName",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter agency name"
                                className="rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="officialId">Official ID</Label>
                              <Input
                                id="officialId"
                                value={roleDataForm.officialId || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "officialId",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter official ID"
                                className="rounded-xl"
                              />
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="designation">Designation</Label>
                              <Input
                                id="designation"
                                value={roleDataForm.designation || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "designation",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter your designation"
                                className="rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="department">Department</Label>
                              <Input
                                id="department"
                                value={roleDataForm.department || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "department",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter department"
                                className="rounded-xl"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="jurisdiction">Jurisdiction</Label>
                            <Input
                              id="jurisdiction"
                              value={roleDataForm.jurisdiction || ""}
                              onChange={(e) =>
                                handleRoleDataChange(
                                  "jurisdiction",
                                  e.target.value
                                )
                              }
                              placeholder="Enter jurisdiction area"
                              className="rounded-xl"
                            />
                          </div>
                        </>
                      )}

                      {userRole === "pharma" && (
                        <>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="companyName">Company Name</Label>
                              <Input
                                id="companyName"
                                value={roleDataForm.companyName || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "companyName",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter company name"
                                className="rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="businessRegNumber">
                                Business Registration Number
                              </Label>
                              <Input
                                id="businessRegNumber"
                                value={roleDataForm.businessRegNumber || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "businessRegNumber",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter registration number"
                                className="rounded-xl"
                              />
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="supplyChainRole">
                                Supply Chain Role
                              </Label>
                              <Select
                                value={roleDataForm.supplyChainRole || ""}
                                onValueChange={(value) =>
                                  handleRoleDataChange("supplyChainRole", value)
                                }
                              >
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue placeholder="Select supply chain role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Manufacturer">
                                    Manufacturer
                                  </SelectItem>
                                  <SelectItem value="Distributor">
                                    Distributor
                                  </SelectItem>
                                  <SelectItem value="Wholesaler">
                                    Wholesaler
                                  </SelectItem>
                                  <SelectItem value="Retailer">
                                    Retailer
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="operatingLicenses">
                                Operating Licenses
                              </Label>
                              <Input
                                id="operatingLicenses"
                                value={roleDataForm.operatingLicenses || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "operatingLicenses",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter licenses (comma-separated)"
                                className="rounded-xl"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {userRole === "patient" && (
                        <>
                          <div className="grid md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="age">Age</Label>
                              <Input
                                id="age"
                                type="number"
                                value={roleDataForm.age || ""}
                                onChange={(e) =>
                                  handleRoleDataChange("age", e.target.value)
                                }
                                placeholder="Enter your age"
                                className="rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="gender">Gender</Label>
                              <Select
                                value={roleDataForm.gender || ""}
                                onValueChange={(value) =>
                                  handleRoleDataChange("gender", value)
                                }
                              >
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue placeholder="Select gender" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">Male</SelectItem>
                                  <SelectItem value="female">Female</SelectItem>
                                  <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="bloodType">Blood Type</Label>
                              <Select
                                value={roleDataForm.bloodType || ""}
                                onValueChange={(value) =>
                                  handleRoleDataChange("bloodType", value)
                                }
                              >
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue placeholder="Select blood type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="A+">A+</SelectItem>
                                  <SelectItem value="A-">A-</SelectItem>
                                  <SelectItem value="B+">B+</SelectItem>
                                  <SelectItem value="B-">B-</SelectItem>
                                  <SelectItem value="AB+">AB+</SelectItem>
                                  <SelectItem value="AB-">AB-</SelectItem>
                                  <SelectItem value="O+">O+</SelectItem>
                                  <SelectItem value="O-">O-</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="emergencyContact">
                                Emergency Contact
                              </Label>
                              <Input
                                id="emergencyContact"
                                value={roleDataForm.emergencyContact || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "emergencyContact",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter emergency contact"
                                className="rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="insuranceNumber">
                                Insurance Number
                              </Label>
                              <Input
                                id="insuranceNumber"
                                value={roleDataForm.insuranceNumber || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "insuranceNumber",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter insurance number"
                                className="rounded-xl"
                              />
                            </div>
                          </div>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="allergies">Allergies</Label>
                              <Input
                                id="allergies"
                                value={roleDataForm.allergies || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "allergies",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter allergies (comma-separated)"
                                className="rounded-xl"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="chronicConditions">
                                Chronic Conditions
                              </Label>
                              <Input
                                id="chronicConditions"
                                value={roleDataForm.chronicConditions || ""}
                                onChange={(e) =>
                                  handleRoleDataChange(
                                    "chronicConditions",
                                    e.target.value
                                  )
                                }
                                placeholder="Enter conditions (comma-separated)"
                                className="rounded-xl"
                              />
                            </div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Form Actions */}
                    <div className="flex gap-3 pt-4 border-t border-border">
                      <Button
                        onClick={handleSaveRoleData}
                        disabled={isLoading}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                      >
                        {isLoading ? "Saving..." : "Save Information"}
                      </Button>
                      <Button
                        onClick={cancelEditingRoleData}
                        variant="outline"
                        className="rounded-xl bg-transparent"
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : currentUser?.roleData?.[currentUser?.role] ? (
                  <>
                    {/* Display existing role data */}
                    <div className="grid md:grid-cols-2 gap-6">
                      {userRole === "doctor" && (
                        <>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Medical License Number
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.DOCTOR?.licenseNumber ||
                                currentUser.roleData.DOCTOR
                                  ?.medicalLicenseNumber ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Specialty
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.DOCTOR?.specialty ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Medical Practice/Hospital
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.DOCTOR?.organization ||
                                currentUser.roleData.DOCTOR?.medicalPractice ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Years of Experience
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.DOCTOR?.yearsOfExperience ||
                                "Not provided"}
                            </p>
                          </div>
                        </>
                      )}

                      {userRole === "ngo" && (
                        <>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Organization Name
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.NGO?.organizationName ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Registration Number
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.NGO?.registrationNumber ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Organization Type
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.NGO?.organizationType ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Focus Areas
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.NGO?.focusAreas?.join(
                                ", "
                              ) || "Not provided"}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium text-muted-foreground">
                              Operating Countries
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.NGO?.operatingCountries?.join(
                                ", "
                              ) || "Not provided"}
                            </p>
                          </div>
                        </>
                      )}

                      {userRole === "government" && (
                        <>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Agency Name
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.GOVERNMENT?.agencyName ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Official ID
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.GOVERNMENT?.officialId ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Designation
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.GOVERNMENT?.designation ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Department
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.GOVERNMENT?.department ||
                                "Not provided"}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium text-muted-foreground">
                              Jurisdiction
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.GOVERNMENT?.jurisdiction ||
                                "Not provided"}
                            </p>
                          </div>
                        </>
                      )}

                      {userRole === "pharma" && (
                        <>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Company Name
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.PHARMA?.companyName ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Business Registration Number
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.PHARMA?.businessRegNumber ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Supply Chain Role
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.PHARMA?.supplyChainRole ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Operating Licenses
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.PHARMA?.operatingLicenses?.join(
                                ", "
                              ) || "Not provided"}
                            </p>
                          </div>
                        </>
                      )}

                      {userRole === "patient" && (
                        <>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Age
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.PATIENT?.age ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Gender
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.PATIENT?.gender ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Blood Type
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.PATIENT?.bloodType ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Emergency Contact
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.PATIENT?.emergencyContact ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Insurance Number
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.PATIENT?.insuranceNumber ||
                                "Not provided"}
                            </p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Allergies
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.PATIENT?.allergies?.join(
                                ", "
                              ) || "Not provided"}
                            </p>
                          </div>
                          <div className="md:col-span-2">
                            <Label className="text-sm font-medium text-muted-foreground">
                              Chronic Conditions
                            </Label>
                            <p className="text-foreground">
                              {currentUser.roleData.PATIENT?.chronicConditions?.join(
                                ", "
                              ) || "Not provided"}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                    <div className="pt-4 border-t border-border">
                      <Button
                        onClick={startEditingRoleData}
                        variant="outline"
                        className="rounded-xl bg-transparent"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Edit{" "}
                        {userRole === "doctor"
                          ? "Medical"
                          : userRole === "ngo"
                          ? "Organization"
                          : userRole === "government"
                          ? "Government"
                          : userRole === "pharma"
                          ? "Company"
                          : "Patient"}{" "}
                        Information
                      </Button>
                    </div>
                  </>
                ) : (
                  // No role data available
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <RoleIcon className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {userRole === "doctor" && "Medical Information Not Set"}
                      {userRole === "ngo" && "Organization Details Not Set"}
                      {userRole === "government" &&
                        "Government Credentials Not Set"}
                      {userRole === "pharma" && "Company Information Not Set"}
                      {userRole === "patient" && "Patient Information Not Set"}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Add your{" "}
                      {userRole === "doctor"
                        ? "medical credentials and professional"
                        : userRole === "ngo"
                        ? "organization"
                        : userRole === "government"
                        ? "government authorization"
                        : userRole === "pharma"
                        ? "company registration and certification"
                        : "patient"}{" "}
                      information to complete your profile.
                    </p>
                    <Button
                      onClick={startEditingRoleData}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Add{" "}
                      {userRole === "doctor"
                        ? "Medical"
                        : userRole === "ngo"
                        ? "Organization"
                        : userRole === "government"
                        ? "Government"
                        : userRole === "pharma"
                        ? "Company"
                        : "Patient"}{" "}
                      Information
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Identity Verification Tab */}
          {userRole !== "patient" && (
            <TabsContent value="verification" className="space-y-6">
              <Card className="rounded-2xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-secondary" />
                    {userRole === "doctor" && "Medical License Verification"}
                    {userRole === "ngo" && "Organization Verification"}
                    {userRole === "government" && "Government Credentials"}
                    {userRole === "pharma" && "Company Verification"}
                    {userRole === "patient" && "Identity Verification"}
                    <Badge
                      variant={
                        kycStatus === "verified"
                          ? "default"
                          : kycStatus === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                      className="ml-2"
                    >
                      {kycStatus === "verified"
                        ? "Verified"
                        : kycStatus === "rejected"
                        ? "Rejected"
                        : "Pending"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {userRole === "doctor" &&
                      "Upload your medical license and professional certifications"}
                    {userRole === "ngo" &&
                      "Upload your organization registration and legal documents"}
                    {userRole === "government" &&
                      "Verify your government credentials and authorization"}
                    {userRole === "pharma" &&
                      "Upload your company registration and pharmaceutical licenses"}
                    {userRole === "patient" &&
                      "Upload your identification documents for verification"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="nationalId">
                      {userRole === "doctor" && "Medical License Number"}
                      {userRole === "ngo" && "NGO Registration Number"}
                      {userRole === "government" &&
                        "Employee ID / Badge Number"}
                      {userRole === "pharma" && "Company Registration Number"}
                      {userRole === "patient" &&
                        "National ID / Passport Number"}
                    </Label>
                    <Input
                      id="nationalId"
                      value={profileData.nationalId}
                      onChange={(e) =>
                        handleInputChange("nationalId", e.target.value)
                      }
                      placeholder="Enter your ID number"
                      className="rounded-xl"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <Card className="border-dashed border-2 border-muted rounded-2xl">
                      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium mb-1">
                          {userRole === "doctor" && "Upload Medical License"}
                          {userRole === "ngo" &&
                            "Upload Registration Certificate"}
                          {userRole === "government" && "Upload Government ID"}
                          {userRole === "pharma" && "Upload Business License"}
                          {userRole === "patient" && "Upload ID Front"}
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          PNG, JPG up to 10MB
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl bg-transparent"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-dashed border-2 border-muted rounded-2xl">
                      <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm font-medium mb-1">
                          {userRole === "doctor" &&
                            "Upload Professional Certificate"}
                          {userRole === "ngo" &&
                            "Upload Tax Exemption Certificate"}
                          {userRole === "government" &&
                            "Upload Authorization Letter"}
                          {userRole === "pharma" &&
                            "Upload Pharmaceutical License"}
                          {userRole === "patient" && "Upload ID Back"}
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          PNG, JPG up to 10MB
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="rounded-xl bg-transparent"
                        >
                          <Camera className="w-4 h-4 mr-2" />
                          Choose File
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="bg-muted/30 rounded-2xl p-4">
                    <div className="flex items-start gap-3">
                      {kycStatus === "verified" ? (
                        <CheckCircle className="w-5 h-5 text-secondary mt-0.5" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-accent mt-0.5" />
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          {kycStatus === "verified"
                            ? "Identity Verified"
                            : "Verification in Progress"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {kycStatus === "verified"
                            ? "Your identity has been successfully verified on the Hedera network."
                            : "Your documents are being reviewed. This usually takes 24-48 hours."}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleKYCSubmission}
                    disabled={isLoading || kycStatus === "verified"}
                    className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground rounded-xl"
                  >
                    {isLoading
                      ? "Submitting..."
                      : kycStatus === "verified"
                      ? "Verified"
                      : "Submit for Verification"}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Digital Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-accent" />
                  Digital Wallet
                </CardTitle>
                <CardDescription>
                  Your Hedera-based digital wallet for health tokens and
                  transactions
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Hedera Account ID</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowWalletAddress(!showWalletAddress)}
                      className="rounded-xl"
                    >
                      {showWalletAddress ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    {currentUser?.hederaAccountId ? (
                      <a
                        href={`https://hashscan.io/testnet/account/${currentUser.hederaAccountId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        title="View on Hedera Explorer (HashScan)"
                        className="bg-background/50 px-3 py-2 rounded-xl text-sm flex-1 hover:bg-background/70 transition-colors cursor-pointer text-black hover:text-black/80 flex items-center justify-between"
                      >
                        <span>
                          {showWalletAddress
                            ? currentUser.hederaAccountId
                            : "••••••••••••••••••••"}
                        </span>
                        {showWalletAddress && (
                          <ExternalLink className="w-4 h-4 ml-2 flex-shrink-0" />
                        )}
                      </a>
                    ) : (
                      <code className="bg-background/50 px-3 py-2 rounded-xl text-sm flex-1">
                        {showWalletAddress
                          ? "Not available"
                          : "••••••••••••••••••••"}
                      </code>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        copyToClipboard(
                          currentUser?.hederaAccountId || "Not available"
                        )
                      }
                      className="rounded-xl"
                      disabled={!currentUser?.hederaAccountId}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="rounded-2xl bg-primary/10">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-primary">1,250</p>
                      <p className="text-sm text-muted-foreground">
                        Health Points
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl bg-secondary/10">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-secondary">45</p>
                      <p className="text-sm text-muted-foreground">
                        Care Tokens
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl bg-accent/10">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-accent">12</p>
                      <p className="text-sm text-muted-foreground">
                        Verified Records
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Verifiable Credentials</h4>
                  <div className="space-y-2">
                    {userVCs.length > 0 ? (
                      userVCs.map((vc, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                        >
                          <div>
                            <p className="font-medium text-sm">{vc.type}</p>
                            <p className="text-xs text-muted-foreground">
                              Issued:{" "}
                              {new Date(vc.issuanceDate).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge
                              variant="secondary"
                              className="bg-secondary/20 text-secondary"
                            >
                              Valid
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No verifiable credentials found.
                      </p>
                    )}
                  </div>

                  <h4 className="font-medium mt-6">Recent Transactions</h4>
                  <div className="space-y-2">
                    {[
                      {
                        type: "Received",
                        amount: "+50 Health Points",
                        from: "Lagos General Hospital",
                        time: "2 hours ago",
                      },
                      {
                        type: "Sent",
                        amount: "-25 Care Tokens",
                        to: "Dr. Adebayo Consultation",
                        time: "1 day ago",
                      },
                      {
                        type: "Received",
                        amount: "+100 Health Points",
                        from: "Vaccination Campaign",
                        time: "3 days ago",
                      },
                    ].map((tx, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-xl"
                      >
                        <div>
                          <p className="font-medium text-sm">{tx.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {tx.type === "Received"
                              ? `From: ${tx.from}`
                              : `To: ${tx.to}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-medium text-sm ${
                              tx.type === "Received"
                                ? "text-secondary"
                                : "text-muted-foreground"
                            }`}
                          >
                            {tx.amount}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {tx.time}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* QR Code / Share Identity Tab */}
          <TabsContent value="qr" className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCodeIcon className="w-5 h-5 text-muted-foreground" />
                  Share Your Identity
                </CardTitle>
                <CardDescription>
                  Generate QR codes or links to share your verified identity
                  with healthcare providers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="w-64 h-64 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-4 p-4">
                    {qrCodeDataUrl ? (
                      <img
                        src={qrCodeDataUrl}
                        alt="QR Code"
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <QrCodeIcon className="w-24 h-24 text-muted-foreground" />
                    )}
                  </div>
                  {qrCodeDataUrl ? (
                    <>
                      <p className="text-sm text-muted-foreground mb-2 font-medium">
                        {qrCodeType === "basic" && "Basic Identity QR Code"}
                        {qrCodeType === "patientAccess" &&
                          "Patient Access QR Code"}
                        {qrCodeType === "medicalProfessional" &&
                          "Medical Professional QR Code"}
                        {qrCodeType === "organizationProfile" &&
                          "Organization Profile QR Code"}
                        {qrCodeType === "supplierVerification" &&
                          "Supplier Verification QR Code"}
                      </p>
                      <p className="text-xs text-muted-foreground mb-4">
                        Hedera Account: {currentUser?.hederaAccountId}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground mb-4">
                      Select an option below to generate your QR code
                    </p>
                  )}
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      className="rounded-xl bg-transparent"
                      onClick={downloadQRCode}
                      disabled={!qrCodeDataUrl}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      className="rounded-xl bg-transparent"
                      onClick={copyQRLink}
                      disabled={!qrCodeDataUrl}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Share Options</h4>
                  <div className="grid gap-3">
                    <Card className="rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">Basic Identity</p>
                          <p className="text-xs text-muted-foreground">
                            Name, role, and verification status
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="rounded-xl"
                          onClick={() => generateQRCode("basic")}
                          disabled={isLoading}
                        >
                          {isLoading ? "Generating..." : "Generate"}
                        </Button>
                      </div>
                    </Card>
                    {userRole === "doctor" && (
                      <Card className="rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              Medical Professional
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Includes credentials and certifications
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl"
                            onClick={() =>
                              generateQRCode("medicalProfessional")
                            }
                            disabled={isLoading}
                          >
                            {isLoading ? "Generating..." : "Generate"}
                          </Button>
                        </div>
                      </Card>
                    )}
                    {userRole === "patient" && (
                      <Card className="rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              Patient Access
                            </p>
                            <p className="text-xs text-muted-foreground">
                              For healthcare appointments and records
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl"
                            onClick={() => generateQRCode("patientAccess")}
                            disabled={isLoading}
                          >
                            {isLoading ? "Generating..." : "Generate"}
                          </Button>
                        </div>
                      </Card>
                    )}
                    {userRole === "ngo" && (
                      <Card className="rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              Organization Profile
                            </p>
                            <p className="text-xs text-muted-foreground">
                              For program partnerships and funding
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl"
                            onClick={() =>
                              generateQRCode("organizationProfile")
                            }
                            disabled={isLoading}
                          >
                            {isLoading ? "Generating..." : "Generate"}
                          </Button>
                        </div>
                      </Card>
                    )}
                    {userRole === "pharma" && (
                      <Card className="rounded-xl p-4 cursor-pointer hover:bg-muted/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-sm">
                              Supplier Verification
                            </p>
                            <p className="text-xs text-muted-foreground">
                              For supply chain partnerships
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="rounded-xl"
                            onClick={() =>
                              generateQRCode("supplierVerification")
                            }
                            disabled={isLoading}
                          >
                            {isLoading ? "Generating..." : "Generate"}
                          </Button>
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
