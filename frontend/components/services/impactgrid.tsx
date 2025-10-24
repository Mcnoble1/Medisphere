"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import apiClient from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Users,
  DollarSign,
  Target,
  MapPin,
  Award,
  Heart,
  Shield,
  Activity,
  BarChart3,
  PieChart,
  Download,
  Globe,
  Plus,
  Loader2,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react"

interface ImpactGridProps {
  userRole?: string
}

interface Campaign {
  _id: string
  title: string
  description: string
  organization: string
  location: {
    country: string
    state: string
    city?: string
  }
  category: string
  status: string
  targetBeneficiaries: number
  currentBeneficiaries: number
  budget: {
    total: number
    spent: number
    currency: string
  }
  startDate: string
  endDate: string
  progress?: number
  budgetUtilization?: number
  rewardConfig: {
    rewardType: string
    rewardPerParticipant: number
    totalRewardPool: number
    rewardsDistributed: number
    tokenId?: string
    tokenSymbol?: string
    tokenName?: string
  }
  participants: Array<{
    _id: string
    userId: any
    joinedAt: string
    contribution: {
      description: string
      verificationStatus: string
      verifiedAt?: string
    }
    reward: {
      amount: number
      distributed: boolean
      distributedAt?: string
      hederaTransactionId?: string
    }
  }>
  impact: {
    totalBeneficiariesReached: number
    totalTokensDistributed: number
    impactScore: number
  }
  userParticipating?: boolean
  participantCount?: number
}

interface Analytics {
  overview: {
    totalCampaigns: number
    activeCampaigns: number
    completedCampaigns: number
    totalBeneficiaries: number
    totalTokensDistributed: number
    totalBudget: number
    totalSpent: number
    avgImpactScore: number
  }
  campaignsByCategory: Array<{ _id: string; count: number }>
}

export default function ImpactGrid({ userRole = "ngo" }: ImpactGridProps) {
  // State for campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [availableCampaigns, setAvailableCampaigns] = useState<Campaign[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [analytics, setAnalytics] = useState<Analytics | null>(null)

  // Loading states
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(false)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false)
  const [isCreatingCampaign, setIsCreatingCampaign] = useState(false)
  const [isJoiningCampaign, setIsJoiningCampaign] = useState<string | null>(null)
  const [isVerifyingParticipant, setIsVerifyingParticipant] = useState<string | null>(null)
  const [isDistributingRewards, setIsDistributingRewards] = useState(false)
  const [isCreatingToken, setIsCreatingToken] = useState(false)

  // Error states
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [showNewCampaignDialog, setShowNewCampaignDialog] = useState(false)
  const [showRewardConfigDialog, setShowRewardConfigDialog] = useState(false)
  const [showTokenCreationDialog, setShowTokenCreationDialog] = useState(false)
  const [showParticipantsDialog, setShowParticipantsDialog] = useState(false)

  // Form states
  const [newCampaignForm, setNewCampaignForm] = useState({
    title: "",
    description: "",
    organization: "",
    location: {
      country: "",
      state: "",
      city: "",
    },
    category: "vaccination",
    targetBeneficiaries: "",
    budget: {
      total: "",
      currency: "USD",
    },
    startDate: "",
    endDate: "",
  })

  const [rewardConfigForm, setRewardConfigForm] = useState({
    rewardType: "hbar" as "hbar" | "hts-token" | "none",
    rewardPerParticipant: "",
  })

  const [tokenCreationForm, setTokenCreationForm] = useState({
    tokenName: "",
    tokenSymbol: "",
    initialSupply: "",
    rewardPerParticipant: "",
  })

  const [joinCampaignDescription, setJoinCampaignDescription] = useState("")

  // Fetch campaigns based on user role
  useEffect(() => {
    fetchData()
  }, [userRole])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (userRole === "ngo" || userRole === "government") {
        // Fetch NGO's own campaigns
        const response = await apiClient.getCampaigns({ limit: 50 })
        setCampaigns(response.data || [])
        if (response.data && response.data.length > 0) {
          setSelectedCampaign(response.data[0])
        }

        // Fetch analytics
        fetchAnalytics()
      } else {
        // Fetch available campaigns for patients/doctors
        fetchAvailableCampaigns()
      }
    } catch (err: any) {
      setError(err.message || "Failed to load campaigns")
      console.error("Error fetching campaigns:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableCampaigns = async () => {
    try {
      setIsLoadingAvailable(true)
      const response = await apiClient.getAvailableCampaigns({ limit: 50 })
      setAvailableCampaigns(response.data || [])
      if (response.data && response.data.length > 0) {
        setSelectedCampaign(response.data[0])
      }
    } catch (err: any) {
      console.error("Error fetching available campaigns:", err)
    } finally {
      setIsLoadingAvailable(false)
    }
  }

  const fetchAnalytics = async () => {
    try {
      setIsLoadingAnalytics(true)
      const response = await apiClient.getCampaignAnalytics()
      setAnalytics(response)
    } catch (err: any) {
      console.error("Error fetching analytics:", err)
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  const handleCampaignCreation = async () => {
    if (
      !newCampaignForm.title ||
      !newCampaignForm.organization ||
      !newCampaignForm.targetBeneficiaries ||
      !newCampaignForm.budget.total ||
      !newCampaignForm.location.country ||
      !newCampaignForm.location.state
    ) {
      alert("Please fill in all required fields")
      return
    }

    try {
      setIsCreatingCampaign(true)
      setError(null)

      const campaignData = {
        title: newCampaignForm.title,
        description: newCampaignForm.description,
        location: newCampaignForm.location,
        category: newCampaignForm.category,
        targetBeneficiaries: parseInt(newCampaignForm.targetBeneficiaries),
        budget: {
          total: parseFloat(newCampaignForm.budget.total),
          currency: newCampaignForm.budget.currency,
        },
        startDate: newCampaignForm.startDate,
        endDate: newCampaignForm.endDate,
      }

      const response = await apiClient.createCampaign(campaignData)

      // If reward config is set, update the campaign
      if (rewardConfigForm.rewardType !== "none" && rewardConfigForm.rewardPerParticipant) {
        const createdCampaignId = response.campaign._id
        await apiClient.updateCampaign(createdCampaignId, {
          rewardConfig: {
            rewardType: rewardConfigForm.rewardType,
            rewardPerParticipant: parseFloat(rewardConfigForm.rewardPerParticipant),
          },
        })
      }

      // Reset form and close dialog
      setNewCampaignForm({
        title: "",
        description: "",
        organization: "",
        location: { country: "", state: "", city: "" },
        category: "vaccination",
        targetBeneficiaries: "",
        budget: { total: "", currency: "USD" },
        startDate: "",
        endDate: "",
      })
      setRewardConfigForm({
        rewardType: "hbar",
        rewardPerParticipant: "",
      })
      setShowNewCampaignDialog(false)
      setShowRewardConfigDialog(false)

      // Refresh campaigns
      fetchData()

      // Show success with HCS transaction details
      const network = "testnet" // Change to "mainnet" for production
      const hashscanUrl = `https://hashscan.io/${network}/transaction/${response.hcsTransactionId}`

      alert(
        `Campaign created successfully!\n\n` +
          `HCS Transaction: ${response.hcsTransactionId}\n` +
          `Topic ID: ${response.hcsTopicId}\n\n` +
          `View on HashScan: ${hashscanUrl}`,
      )
    } catch (err: any) {
      setError(err.message || "Failed to create campaign")
      alert(`Error: ${err.message}`)
    } finally {
      setIsCreatingCampaign(false)
    }
  }

  const handleJoinCampaign = async (campaignId: string) => {
    try {
      setIsJoiningCampaign(campaignId)
      setError(null)

      await apiClient.joinCampaign(campaignId, {
        contributionDescription: joinCampaignDescription || "Joined campaign",
      })

      setJoinCampaignDescription("")
      alert("Successfully joined campaign!")

      // Refresh available campaigns
      fetchAvailableCampaigns()
    } catch (err: any) {
      setError(err.message || "Failed to join campaign")
      alert(`Error: ${err.message}`)
    } finally {
      setIsJoiningCampaign(null)
    }
  }

  const handleVerifyParticipant = async (campaignId: string, participantId: string, status: string) => {
    try {
      setIsVerifyingParticipant(participantId)
      setError(null)

      await apiClient.verifyParticipant(campaignId, participantId, {
        verificationStatus: status,
        notes: status === "verified" ? "Contribution verified by NGO" : "Contribution rejected",
      })

      alert(`Participant ${status === "verified" ? "verified" : "rejected"} successfully!`)

      // Refresh campaigns
      fetchData()
    } catch (err: any) {
      setError(err.message || "Failed to verify participant")
      alert(`Error: ${err.message}`)
    } finally {
      setIsVerifyingParticipant(null)
    }
  }

  const handleDistributeRewards = async (campaignId: string) => {
    if (!confirm("Are you sure you want to distribute rewards to all verified participants?")) {
      return
    }

    try {
      setIsDistributingRewards(true)
      setError(null)

      const response = await apiClient.distributeRewards(campaignId)

      alert(
        `Rewards distributed successfully!\n\nTotal: ${response.distribution.totalParticipants}\nSuccess: ${response.distribution.successCount}\nFailed: ${response.distribution.failCount}\nTotal Distributed: ${response.distribution.totalDistributed}`,
      )

      // Refresh campaigns
      fetchData()
    } catch (err: any) {
      setError(err.message || "Failed to distribute rewards")
      alert(`Error: ${err.message}`)
    } finally {
      setIsDistributingRewards(false)
    }
  }

  const handleCreateToken = async (campaignId: string) => {
    if (
      !tokenCreationForm.tokenName ||
      !tokenCreationForm.tokenSymbol ||
      !tokenCreationForm.initialSupply ||
      !tokenCreationForm.rewardPerParticipant
    ) {
      alert("Please fill in all token creation fields")
      return
    }

    try {
      setIsCreatingToken(true)
      setError(null)

      const response = await apiClient.createCampaignToken(campaignId, {
        tokenName: tokenCreationForm.tokenName,
        tokenSymbol: tokenCreationForm.tokenSymbol,
        initialSupply: parseInt(tokenCreationForm.initialSupply),
        rewardPerParticipant: parseFloat(tokenCreationForm.rewardPerParticipant),
      })

      // Show success with token and HCS details
      const network = "testnet" // Change to "mainnet" for production
      const tokenHashscanUrl = `https://hashscan.io/${network}/token/${response.token.tokenId}`
      const hcsHashscanUrl = `https://hashscan.io/${network}/transaction/${response.hcsTransactionId}`

      alert(
        `Token created successfully!\n\n` +
          `Token ID: ${response.token.tokenId}\n` +
          `Symbol: ${response.token.tokenSymbol}\n` +
          `Supply: ${response.token.initialSupply}\n\n` +
          `Token Transaction: ${response.token.transactionId}\n` +
          `HCS Transaction: ${response.hcsTransactionId}\n` +
          `Topic ID: ${response.hcsTopicId}\n\n` +
          `View Token: ${tokenHashscanUrl}\n` +
          `View HCS Log: ${hcsHashscanUrl}`,
      )

      setTokenCreationForm({
        tokenName: "",
        tokenSymbol: "",
        initialSupply: "",
        rewardPerParticipant: "",
      })
      setShowTokenCreationDialog(false)

      // Refresh campaigns
      fetchData()
    } catch (err: any) {
      setError(err.message || "Failed to create token")
      alert(`Error: ${err.message}`)
    } finally {
      setIsCreatingToken(false)
    }
  }

  // Calculate total metrics
  const impactMetrics = analytics?.overview || {
    totalBudget: 0,
    totalSpent: 0,
    totalBeneficiaries: 0,
    totalTokensDistributed: 0,
    activeCampaigns: 0,
    completedCampaigns: 0,
  }

  const isNgoOrGov = userRole === "ngo" || userRole === "government"
  const displayCampaigns = isNgoOrGov ? campaigns : availableCampaigns

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 text-foreground">Impact Analytics Dashboard</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          {isNgoOrGov
            ? "Grant, vaccination, campaign, and aid distribution ledger with transparent impact tracking"
            : "Discover and participate in health campaigns to make a difference and earn rewards"}
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Key Metrics - Only for NGO/Gov */}
      {isNgoOrGov && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Funds</p>
                  <p className="text-2xl font-bold text-foreground">
                    ${impactMetrics.totalBudget?.toLocaleString() || 0}
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Participants</p>
                  <p className="text-2xl font-bold text-foreground">
                    {impactMetrics.totalParticipants?.toLocaleString() || 0}
                  </p>
                </div>
                <Users className="w-8 h-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tokens Distributed</p>
                  <p className="text-2xl font-bold text-foreground">
                    {impactMetrics.totalTokensDistributed?.toLocaleString() || 0}
                  </p>
                </div>
                <Shield className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold text-foreground">{impactMetrics.activeCampaigns || 0}</p>
                </div>
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="campaigns" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="campaigns">
            {isNgoOrGov ? "My Campaigns" : "Available Campaigns"}
          </TabsTrigger>
          <TabsTrigger value="details">Campaign Details</TabsTrigger>
          {isNgoOrGov && <TabsTrigger value="participants">Participants</TabsTrigger>}
          {isNgoOrGov && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
        </TabsList>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{isNgoOrGov ? "My Campaigns" : "Available Campaigns"}</CardTitle>
                  <CardDescription>
                    {isNgoOrGov ? "Manage your healthcare campaigns" : "Join campaigns and earn rewards"}
                  </CardDescription>
                </div>
                {isNgoOrGov && (
                  <Dialog open={showNewCampaignDialog} onOpenChange={setShowNewCampaignDialog}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2 rounded-xl">
                        <Plus className="w-4 h-4" />
                        New Campaign
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>Create New Campaign</DialogTitle>
                        <DialogDescription>Launch a new healthcare campaign with blockchain tracking</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="campaign-title">Campaign Title *</Label>
                            <Input
                              id="campaign-title"
                              placeholder="Malaria Prevention Initiative"
                              value={newCampaignForm.title}
                              onChange={(e) => setNewCampaignForm({ ...newCampaignForm, title: e.target.value })}
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="organization">Organization *</Label>
                            <Input
                              id="organization"
                              placeholder="Health for All NGO"
                              value={newCampaignForm.organization}
                              onChange={(e) =>
                                setNewCampaignForm({ ...newCampaignForm, organization: e.target.value })
                              }
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="category">Category *</Label>
                            <Select
                              value={newCampaignForm.category}
                              onValueChange={(value) => setNewCampaignForm({ ...newCampaignForm, category: value })}
                            >
                              <SelectTrigger className="rounded-xl">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="malaria-prevention">Malaria Prevention</SelectItem>
                                <SelectItem value="maternal-health">Maternal Health</SelectItem>
                                <SelectItem value="child-nutrition">Child Nutrition</SelectItem>
                                <SelectItem value="vaccination">Vaccination</SelectItem>
                                <SelectItem value="emergency-relief">Emergency Relief</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="target-beneficiaries">Target Beneficiaries *</Label>
                            <Input
                              id="target-beneficiaries"
                              type="number"
                              placeholder="50000"
                              value={newCampaignForm.targetBeneficiaries}
                              onChange={(e) =>
                                setNewCampaignForm({ ...newCampaignForm, targetBeneficiaries: e.target.value })
                              }
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="budget-total">Budget (USD) *</Label>
                            <Input
                              id="budget-total"
                              type="number"
                              placeholder="250000"
                              value={newCampaignForm.budget.total}
                              onChange={(e) =>
                                setNewCampaignForm({
                                  ...newCampaignForm,
                                  budget: { ...newCampaignForm.budget, total: e.target.value },
                                })
                              }
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="country">Country *</Label>
                            <Input
                              id="country"
                              placeholder="Nigeria"
                              value={newCampaignForm.location.country}
                              onChange={(e) =>
                                setNewCampaignForm({
                                  ...newCampaignForm,
                                  location: { ...newCampaignForm.location, country: e.target.value },
                                })
                              }
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="state">State *</Label>
                            <Input
                              id="state"
                              placeholder="Lagos"
                              value={newCampaignForm.location.state}
                              onChange={(e) =>
                                setNewCampaignForm({
                                  ...newCampaignForm,
                                  location: { ...newCampaignForm.location, state: e.target.value },
                                })
                              }
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="city">City</Label>
                            <Input
                              id="city"
                              placeholder="Lagos City"
                              value={newCampaignForm.location.city}
                              onChange={(e) =>
                                setNewCampaignForm({
                                  ...newCampaignForm,
                                  location: { ...newCampaignForm.location, city: e.target.value },
                                })
                              }
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="start-date">Start Date *</Label>
                            <Input
                              id="start-date"
                              type="date"
                              value={newCampaignForm.startDate}
                              onChange={(e) => setNewCampaignForm({ ...newCampaignForm, startDate: e.target.value })}
                              className="rounded-xl"
                            />
                          </div>
                          <div>
                            <Label htmlFor="end-date">End Date *</Label>
                            <Input
                              id="end-date"
                              type="date"
                              value={newCampaignForm.endDate}
                              onChange={(e) => setNewCampaignForm({ ...newCampaignForm, endDate: e.target.value })}
                              className="rounded-xl"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            placeholder="Describe the campaign objectives and implementation strategy..."
                            rows={3}
                            value={newCampaignForm.description}
                            onChange={(e) => setNewCampaignForm({ ...newCampaignForm, description: e.target.value })}
                            className="rounded-xl"
                          />
                        </div>

                        {/* Reward Configuration */}
                        <div className="border-t pt-4 space-y-3">
                          <h4 className="font-medium">Reward Configuration</h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="reward-type">Reward Type</Label>
                              <Select
                                value={rewardConfigForm.rewardType}
                                onValueChange={(value: any) =>
                                  setRewardConfigForm({ ...rewardConfigForm, rewardType: value })
                                }
                              >
                                <SelectTrigger className="rounded-xl">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="hbar">HBAR (Hedera)</SelectItem>
                                  <SelectItem value="hts-token">HTS Token (Create Custom)</SelectItem>
                                  <SelectItem value="none">No Rewards</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            {rewardConfigForm.rewardType !== "none" && (
                              <div>
                                <Label htmlFor="reward-per-participant">Reward Per Participant</Label>
                                <Input
                                  id="reward-per-participant"
                                  type="number"
                                  placeholder="100"
                                  value={rewardConfigForm.rewardPerParticipant}
                                  onChange={(e) =>
                                    setRewardConfigForm({ ...rewardConfigForm, rewardPerParticipant: e.target.value })
                                  }
                                  className="rounded-xl"
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        <Button
                          onClick={handleCampaignCreation}
                          disabled={isCreatingCampaign}
                          className="w-full rounded-xl"
                        >
                          {isCreatingCampaign ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creating Campaign...
                            </>
                          ) : (
                            "Create Campaign"
                          )}
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {displayCampaigns.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    {isNgoOrGov ? "No campaigns created yet" : "No available campaigns at the moment"}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {displayCampaigns.map((campaign) => (
                    <div
                      key={campaign._id}
                      className="border rounded-lg p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                      onClick={() => setSelectedCampaign(campaign)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">{campaign.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              campaign.status === "active"
                                ? "default"
                                : campaign.status === "completed"
                                  ? "secondary"
                                  : "outline"
                            }
                          >
                            {campaign.status}
                          </Badge>
                          {!isNgoOrGov && campaign.userParticipating && (
                            <Badge variant="default" className="bg-green-500">
                              Joined
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="grid md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Organization:</span>
                          <p className="font-medium">{campaign.organization}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Location:</span>
                          <p className="font-medium">
                            {campaign.location.city || campaign.location.state}, {campaign.location.country}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Beneficiaries:</span>
                          <p className="font-medium">
                            {campaign.currentBeneficiaries?.toLocaleString() || 0} /{" "}
                            {campaign.targetBeneficiaries.toLocaleString()}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">
                            {isNgoOrGov ? "Budget Used:" : "Participants:"}
                          </span>
                          <p className="font-medium">
                            {isNgoOrGov
                              ? `${campaign.budgetUtilization || 0}%`
                              : campaign.participantCount || campaign.participants?.length || 0}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <Progress value={campaign.progress || 0} className="h-2" />
                      </div>

                      {/* Join button for patients/doctors */}
                      {!isNgoOrGov && !campaign.userParticipating && campaign.status === "active" && (
                        <div className="mt-3 flex gap-2">
                          <Input
                            placeholder="Describe your contribution (optional)"
                            value={joinCampaignDescription}
                            onChange={(e) => setJoinCampaignDescription(e.target.value)}
                            className="rounded-xl flex-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <Button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleJoinCampaign(campaign._id)
                            }}
                            disabled={isJoiningCampaign === campaign._id}
                            className="rounded-xl"
                          >
                            {isJoiningCampaign === campaign._id ? (
                              <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Joining...
                              </>
                            ) : (
                              "Join Campaign"
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaign Details Tab */}
        <TabsContent value="details" className="space-y-6">
          {selectedCampaign ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{selectedCampaign.title}</CardTitle>
                    <CardDescription>{selectedCampaign.organization}</CardDescription>
                  </div>
                  <Badge
                    variant={
                      selectedCampaign.status === "active"
                        ? "default"
                        : selectedCampaign.status === "completed"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {selectedCampaign.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedCampaign.description}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium">Campaign Details</h4>
                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Category:</span>
                        <span className="font-medium">{selectedCampaign.category}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Location:</span>
                        <span className="font-medium">
                          {selectedCampaign.location.state}, {selectedCampaign.location.country}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Start Date:</span>
                        <span className="font-medium">{new Date(selectedCampaign.startDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">End Date:</span>
                        <span className="font-medium">{new Date(selectedCampaign.endDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium">Impact Metrics</h4>
                    <div className="bg-muted/30 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Target Beneficiaries:</span>
                        <span className="font-medium">{selectedCampaign.targetBeneficiaries.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current Reached:</span>
                        <span className="font-medium">
                          {selectedCampaign.currentBeneficiaries?.toLocaleString() || 0}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress:</span>
                        <span className="font-medium">{selectedCampaign.progress || 0}%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Impact Score:</span>
                        <span className="font-medium">{selectedCampaign.impact.impactScore || 0}/100</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Reward Information */}
                {selectedCampaign.rewardConfig.rewardType !== "none" && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-3">Reward Information</h4>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Reward Type:</span>
                        <span className="font-medium text-green-800">
                          {selectedCampaign.rewardConfig.rewardType === "hbar"
                            ? "HBAR"
                            : selectedCampaign.rewardConfig.tokenSymbol || "HTS Token"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Per Participant:</span>
                        <span className="font-medium text-green-800">
                          {selectedCampaign.rewardConfig.rewardPerParticipant}
                        </span>
                      </div>
                      {selectedCampaign.rewardConfig.tokenId && (
                        <div className="flex justify-between text-sm">
                          <span className="text-green-700">Token ID:</span>
                          <a
                            href={`https://hashscan.io/testnet/token/${selectedCampaign.rewardConfig.tokenId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-green-800 hover:underline flex items-center gap-1"
                          >
                            {selectedCampaign.rewardConfig.tokenId}
                            <Globe className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Total Distributed:</span>
                        <span className="font-medium text-green-800">
                          {selectedCampaign.rewardConfig.rewardsDistributed || 0}
                        </span>
                      </div>
                    </div>

                    {/* Token creation button for NGO/Gov if reward type is HTS but no token created */}
                    {isNgoOrGov &&
                      selectedCampaign.rewardConfig.rewardType === "hts-token" &&
                      !selectedCampaign.rewardConfig.tokenId && (
                        <Dialog open={showTokenCreationDialog} onOpenChange={setShowTokenCreationDialog}>
                          <DialogTrigger asChild>
                            <Button className="w-full mt-3 rounded-xl">Create Campaign Token</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Create HTS Token</DialogTitle>
                              <DialogDescription>
                                Create a custom Hedera Token Service (HTS) token for this campaign
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="token-name">Token Name *</Label>
                                <Input
                                  id="token-name"
                                  placeholder="Health Campaign Token"
                                  value={tokenCreationForm.tokenName}
                                  onChange={(e) =>
                                    setTokenCreationForm({ ...tokenCreationForm, tokenName: e.target.value })
                                  }
                                  className="rounded-xl"
                                />
                              </div>
                              <div>
                                <Label htmlFor="token-symbol">Token Symbol *</Label>
                                <Input
                                  id="token-symbol"
                                  placeholder="HCT"
                                  value={tokenCreationForm.tokenSymbol}
                                  onChange={(e) =>
                                    setTokenCreationForm({ ...tokenCreationForm, tokenSymbol: e.target.value })
                                  }
                                  className="rounded-xl"
                                />
                              </div>
                              <div>
                                <Label htmlFor="initial-supply">Initial Supply *</Label>
                                <Input
                                  id="initial-supply"
                                  type="number"
                                  placeholder="10000"
                                  value={tokenCreationForm.initialSupply}
                                  onChange={(e) =>
                                    setTokenCreationForm({ ...tokenCreationForm, initialSupply: e.target.value })
                                  }
                                  className="rounded-xl"
                                />
                              </div>
                              <div>
                                <Label htmlFor="token-reward-per-participant">Reward Per Participant *</Label>
                                <Input
                                  id="token-reward-per-participant"
                                  type="number"
                                  placeholder="100"
                                  value={tokenCreationForm.rewardPerParticipant}
                                  onChange={(e) =>
                                    setTokenCreationForm({
                                      ...tokenCreationForm,
                                      rewardPerParticipant: e.target.value,
                                    })
                                  }
                                  className="rounded-xl"
                                />
                              </div>
                              <Button
                                onClick={() => handleCreateToken(selectedCampaign._id)}
                                disabled={isCreatingToken}
                                className="w-full rounded-xl"
                              >
                                {isCreatingToken ? (
                                  <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Creating Token...
                                  </>
                                ) : (
                                  "Create Token"
                                )}
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      )}
                  </div>
                )}

                {/* Blockchain Verification */}
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-3">Blockchain Verification</h4>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Award className="w-5 h-5 text-green-500" />
                      <span className="font-medium text-green-700">Campaign Verified on Hedera</span>
                    </div>
                    <div className="text-sm text-green-600 space-y-1">
                      <p>Fund allocation verified on Hedera</p>
                      <p>Impact metrics transparent and immutable</p>
                      <p>Guardian compliance verified</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">Select a campaign to view details</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Participants Tab - NGO/Gov Only */}
        {isNgoOrGov && (
          <TabsContent value="participants" className="space-y-6">
            {selectedCampaign ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Campaign Participants</CardTitle>
                      <CardDescription>
                        Manage and verify participant contributions for {selectedCampaign.title}
                      </CardDescription>
                    </div>
                    {selectedCampaign.rewardConfig.rewardType !== "none" &&
                      selectedCampaign.participants.some(
                        (p) => p.contribution.verificationStatus === "verified" && !p.reward.distributed,
                      ) && (
                        <Button
                          onClick={() => handleDistributeRewards(selectedCampaign._id)}
                          disabled={isDistributingRewards}
                          className="rounded-xl"
                        >
                          {isDistributingRewards ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Distributing...
                            </>
                          ) : (
                            "Distribute Rewards"
                          )}
                        </Button>
                      )}
                  </div>
                </CardHeader>
                <CardContent>
                  {selectedCampaign.participants.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-muted-foreground">No participants yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedCampaign.participants.map((participant) => (
                        <div key={participant._id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h5 className="font-medium">
                                {participant.userId.firstName} {participant.userId.lastName}
                              </h5>
                              <p className="text-sm text-muted-foreground">{participant.userId.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {participant.contribution.verificationStatus === "verified" ? (
                                <Badge variant="default" className="bg-green-500">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Verified
                                </Badge>
                              ) : participant.contribution.verificationStatus === "rejected" ? (
                                <Badge variant="destructive">
                                  <XCircle className="w-3 h-3 mr-1" />
                                  Rejected
                                </Badge>
                              ) : (
                                <Badge variant="outline">
                                  <Clock className="w-3 h-3 mr-1" />
                                  Pending
                                </Badge>
                              )}
                              {participant.reward.distributed && (
                                <Badge variant="default" className="bg-blue-500">
                                  Rewarded
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="text-sm space-y-1 mb-3">
                            <p className="text-muted-foreground">
                              <span className="font-medium">Role:</span> {participant.userId.role}
                            </p>
                            <p className="text-muted-foreground">
                              <span className="font-medium">Joined:</span>{" "}
                              {new Date(participant.joinedAt).toLocaleDateString()}
                            </p>
                            {participant.userId.hederaAccountId && (
                              <p className="text-muted-foreground font-mono text-xs">
                                <span className="font-medium">Hedera ID:</span> {participant.userId.hederaAccountId}
                              </p>
                            )}
                            {participant.contribution.description && (
                              <p className="text-muted-foreground">
                                <span className="font-medium">Contribution:</span> {participant.contribution.description}
                              </p>
                            )}
                            {participant.reward.distributed && participant.reward.hederaTransactionId && (
                              <p className="text-muted-foreground text-xs">
                                <span className="font-medium">Reward TX:</span>{" "}
                                <a
                                  href={`https://hashscan.io/testnet/transaction/${participant.reward.hederaTransactionId}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="hover:underline text-blue-600"
                                >
                                  {participant.reward.hederaTransactionId.substring(0, 20)}...
                                </a>
                              </p>
                            )}
                          </div>

                          {participant.contribution.verificationStatus === "pending" && (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleVerifyParticipant(selectedCampaign._id, participant._id, "verified")}
                                disabled={isVerifyingParticipant === participant._id}
                                className="rounded-xl"
                              >
                                {isVerifyingParticipant === participant._id ? (
                                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                ) : (
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                )}
                                Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleVerifyParticipant(selectedCampaign._id, participant._id, "rejected")}
                                disabled={isVerifyingParticipant === participant._id}
                                className="rounded-xl"
                              >
                                <XCircle className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Select a campaign to view participants</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        )}

        {/* Analytics Tab - NGO/Gov Only */}
        {isNgoOrGov && (
          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Campaign Analytics
                </CardTitle>
                <CardDescription>Comprehensive overview of your impact campaigns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {isLoadingAnalytics ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : analytics ? (
                  <>
                    {/* Overview Stats */}
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">Campaign Status</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Campaigns:</span>
                            <span className="font-medium">{analytics.overview.totalCampaigns}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Active:</span>
                            <span className="font-medium text-green-600">{analytics.overview.activeCampaigns}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Completed:</span>
                            <span className="font-medium">{analytics.overview.completedCampaigns}</span>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">Financial Overview</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Budget:</span>
                            <span className="font-medium">${analytics.overview.totalBudget?.toLocaleString() || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Total Spent:</span>
                            <span className="font-medium">${analytics.overview.totalSpent?.toLocaleString() || 0}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Utilization:</span>
                            <span className="font-medium">
                              {analytics.overview.totalBudget
                                ? Math.round((analytics.overview.totalSpent / analytics.overview.totalBudget) * 100)
                                : 0}
                              %
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-3">Impact Summary</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Beneficiaries:</span>
                            <span className="font-medium">
                              {analytics.overview.totalBeneficiaries?.toLocaleString() || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Tokens Distributed:</span>
                            <span className="font-medium">
                              {analytics.overview.totalTokensDistributed?.toLocaleString() || 0}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Avg Impact Score:</span>
                            <span className="font-medium">
                              {analytics.overview.avgImpactScore?.toFixed(1) || 0}/100
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Campaigns by Category */}
                    {analytics.campaignsByCategory && analytics.campaignsByCategory.length > 0 && (
                      <div className="border rounded-lg p-4">
                        <h4 className="font-medium mb-4">Campaigns by Category</h4>
                        <div className="space-y-3">
                          {analytics.campaignsByCategory.map((cat) => (
                            <div key={cat._id} className="flex items-center justify-between">
                              <span className="text-sm capitalize">{cat._id.replace("-", " ")}</span>
                              <div className="flex items-center gap-2">
                                <div className="w-32 bg-muted rounded-full h-2">
                                  <div
                                    className="bg-primary h-2 rounded-full"
                                    style={{
                                      width: `${(cat.count / analytics.overview.totalCampaigns) * 100}%`,
                                    }}
                                  />
                                </div>
                                <span className="text-sm font-medium w-8">{cat.count}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No analytics data available</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
