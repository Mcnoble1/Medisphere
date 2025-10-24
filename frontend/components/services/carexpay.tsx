"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  CreditCard,
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  QrCode,
  Copy,
  Download,
  Plus,
  TrendingUp,
  TrendingDown,
  Gift,
  RefreshCw,
  DollarSign,
  Coins,
  Building2,
  User,
  Calendar,
  Search,
  Filter,
  Eye,
  EyeOff,
} from "lucide-react"

interface TokenBalance {
  symbol: string
  name: string
  balance: number
  fiatValue: number
  change24h: number
  icon: string
}

interface Transaction {
  id: string
  type: "payment" | "incentive" | "refund" | "grant" | "insurance" | "reward"
  amount: number
  tokenSymbol: string
  fiatAmount: number
  toFrom: string
  timestamp: string
  status: "completed" | "pending" | "failed"
  description: string
  txHash: string
}

const mockTokenBalances: TokenBalance[] = [
  {
    symbol: "CARE",
    name: "Care Tokens",
    balance: 1250.75,
    fiatValue: 625.38,
    change24h: 5.2,
    icon: "💊",
  },
  {
    symbol: "HEALTH",
    name: "Health Points",
    balance: 3420.0,
    fiatValue: 1026.0,
    change24h: -2.1,
    icon: "❤️",
  },
  {
    symbol: "IMPACT",
    name: "Impact Tokens",
    balance: 890.25,
    fiatValue: 445.13,
    change24h: 8.7,
    icon: "🌟",
  },
  {
    symbol: "INSURE",
    name: "Insurance Credits",
    balance: 2100.0,
    fiatValue: 2100.0,
    change24h: 0.0,
    icon: "🛡️",
  },
]

const mockTransactions: Transaction[] = [
  {
    id: "1",
    type: "payment",
    amount: -150.0,
    tokenSymbol: "CARE",
    fiatAmount: -75.0,
    toFrom: "Dr. Adebayo Ogundimu",
    timestamp: "2024-01-15T14:30:00Z",
    status: "completed",
    description: "Consultation payment",
    txHash: "0x8f2a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4",
  },
  {
    id: "2",
    type: "incentive",
    amount: 200.0,
    tokenSymbol: "HEALTH",
    fiatAmount: 60.0,
    toFrom: "Lagos General Hospital",
    timestamp: "2024-01-14T09:15:00Z",
    status: "completed",
    description: "Vaccination incentive",
    txHash: "0x1a2b3c4d5e6f7g8h9i0j1k2l3m4n5o6p7q8r9s0t1u2v3w4x5y6z7a8b9c0d1e2f3g4",
  },
  {
    id: "3",
    type: "grant",
    amount: 500.0,
    tokenSymbol: "IMPACT",
    fiatAmount: 250.0,
    toFrom: "WHO Africa Initiative",
    timestamp: "2024-01-12T16:45:00Z",
    status: "completed",
    description: "Community health program grant",
    txHash: "0x9z8y7x6w5v4u3t2s1r0q9p8o7n6m5l4k3j2i1h0g9f8e7d6c5b4a3z2y1x0w9v8u7t6",
  },
  {
    id: "4",
    type: "insurance",
    amount: -300.0,
    tokenSymbol: "INSURE",
    fiatAmount: -300.0,
    toFrom: "Reliance HMO",
    timestamp: "2024-01-10T11:20:00Z",
    status: "pending",
    description: "Insurance premium payment",
    txHash: "0x5r4e3w2q1a9s8d7f6g5h4j3k2l1z0x9c8v7b6n5m4q3w2e1r0t9y8u7i6o5p4a3s2d1",
  },
  {
    id: "5",
    type: "refund",
    amount: 75.0,
    tokenSymbol: "CARE",
    fiatAmount: 37.5,
    toFrom: "Port Harcourt Clinic",
    timestamp: "2024-01-08T13:10:00Z",
    status: "completed",
    description: "Cancelled appointment refund",
    txHash: "0x7t6y5u4i3o2p1a0s9d8f7g6h5j4k3l2z1x0c9v8b7n6m5q4w3e2r1t0y9u8i7o6p5a4",
  },
]

const transactionTypeIcons = {
  payment: ArrowUpRight,
  incentive: Gift,
  refund: RefreshCw,
  grant: TrendingUp,
  insurance: Building2,
  reward: Coins,
}

interface CareXPayProps {
  userRole?: string
}

export default function CareXPay({ userRole = "patient" }: CareXPayProps) {
  const [activeTab, setActiveTab] = useState("wallet")
  const [showBalance, setShowBalance] = useState(true)
  const [sendAmount, setSendAmount] = useState("")
  const [sendToken, setSendToken] = useState("")
  const [sendRecipient, setSendRecipient] = useState("")
  const [sendNote, setSendNote] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [isLoading, setIsLoading] = useState(false)
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions)
  const [balances, setBalances] = useState<TokenBalance[]>(mockTokenBalances)
  const [showSendModal, setShowSendModal] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [paymentAccount, setPaymentAccount] = useState<any>(null)

  const testSendData = {
    token: "CARE",
    amount: "100",
    recipient: "0x742d35Cc6634C0532925a3b8D404fddF4f780EAD",
    note: "Payment for consultation services rendered on January 15th, 2024",
  }

  const fillTestSendData = () => {
    setSendToken(testSendData.token)
    setSendAmount(testSendData.amount)
    setSendRecipient(testSendData.recipient)
    setSendNote(testSendData.note)
  }

  const totalFiatValue = balances.reduce((sum, token) => sum + token.fiatValue, 0)

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.toFrom.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterType === "all" || tx.type === filterType
    return matchesSearch && matchesFilter
  })

  const handleSendTokens = async () => {
    if (sendAmount && sendToken && sendRecipient) {
      setIsLoading(true)
      setError(null)
      setSuccess(null)

      try {
        // Find the token being sent
        const tokenToSend = balances.find(b => b.symbol === sendToken)

        if (!tokenToSend) {
          throw new Error("Token not found")
        }

        if (tokenToSend.balance < Number.parseFloat(sendAmount)) {
          throw new Error("Insufficient token balance")
        }

        // Send tokens via API
        const response = await apiClient.sendHTSTokens({
          toAccountId: sendRecipient,
          tokenId: tokenToSend.symbol === 'CARE' ? 'CARE' : (tokenToSend as any).tokenId || tokenToSend.symbol,
          amount: Number.parseFloat(sendAmount),
          description: sendNote || 'Token transfer'
        })

        if (response.success) {
          setSuccess(`Successfully sent ${sendAmount} ${sendToken}!`)

          // Reload balances and transactions
          await loadTokenBalances()
          await loadTransactions()

          // Clear form
          setSendAmount("")
          setSendToken("")
          setSendRecipient("")
          setSendNote("")
        } else {
          throw new Error(response.error || "Failed to send tokens")
        }
      } catch (error: any) {
        console.error("Error sending tokens:", error)
        setError(error.message || "Failed to send tokens. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleClaimReward = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Claiming reward")
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const rewardTransaction: Transaction = {
        id: Date.now().toString(),
        type: "reward",
        amount: 50,
        tokenSymbol: "HEALTH",
        fiatAmount: 15,
        toFrom: "MediSphere Rewards",
        timestamp: new Date().toISOString(),
        status: "completed",
        description: "Daily health activity reward",
        txHash: "0x" + Math.random().toString(16).substring(2, 66),
      }

      setTransactions((prev) => [rewardTransaction, ...prev])
      setBalances((prev) =>
        prev.map((balance) => (balance.symbol === "HEALTH" ? { ...balance, balance: balance.balance + 50 } : balance)),
      )

      console.log("[v0] Reward claimed successfully")
    } catch (error) {
      console.error("[v0] Error claiming reward:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePayBill = async () => {
    setIsLoading(true)
    try {
      console.log("[v0] Processing bill payment")
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const billTransaction: Transaction = {
        id: Date.now().toString(),
        type: "payment",
        amount: -200,
        tokenSymbol: "CARE",
        fiatAmount: -100,
        toFrom: "Lagos General Hospital",
        timestamp: new Date().toISOString(),
        status: "completed",
        description: "Medical bill payment",
        txHash: "0x" + Math.random().toString(16).substring(2, 66),
      }

      setTransactions((prev) => [billTransaction, ...prev])
      setBalances((prev) =>
        prev.map((balance) => (balance.symbol === "CARE" ? { ...balance, balance: balance.balance - 200 } : balance)),
      )

      console.log("[v0] Bill paid successfully")
    } catch (error) {
      console.error("[v0] Error paying bill:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setSuccess("Copied to clipboard!")
  }

  // Load payment account data
  const loadPaymentAccount = async () => {
    try {
      const response = await apiClient.getPaymentAccount()
      setPaymentAccount(response.account)

      // Load token balances from new endpoint
      await loadTokenBalances()

      // Load campaign reward tokens
      await loadCampaignRewardTokens()
    } catch (error: any) {
      console.error("Error loading payment account:", error)
      setError("Failed to load payment account")
    }
  }

  // Load all token balances (Health + HTS tokens)
  const loadTokenBalances = async () => {
    try {
      const response = await apiClient.getTokenBalances()

      if (response.balances && response.balances.length > 0) {
        const formattedBalances: TokenBalance[] = response.balances.map((token: any) => ({
          symbol: token.symbol,
          name: token.name,
          balance: token.balance,
          fiatValue: token.balance * 0.5, // Mock conversion rate
          change24h: 0,
          icon: token.icon || (token.type === 'hts_token' ? '🎁' : '💊'),
        }))
        setBalances(formattedBalances)
      }
    } catch (error: any) {
      console.error("Error loading token balances:", error)
      // Non-critical, don't show error to user
    }
  }

  // Load campaign reward tokens from participated campaigns
  const loadCampaignRewardTokens = async () => {
    try {
      // Get campaigns where user is a participant
      const campaignsResponse = await apiClient.getAvailableCampaigns({ limit: 100 })
      const participatedCampaigns = (campaignsResponse.data || []).filter((c: any) => c.userParticipating)

      // Extract unique HTS tokens from campaigns
      const rewardTokens: TokenBalance[] = []
      const seenTokens = new Set<string>()

      participatedCampaigns.forEach((campaign: any) => {
        if (campaign.rewardConfig?.rewardType === 'hts-token' && campaign.rewardConfig.tokenId) {
          const tokenId = campaign.rewardConfig.tokenId
          if (!seenTokens.has(tokenId)) {
            seenTokens.add(tokenId)

            // Find participant record to get reward amount
            const myParticipation = campaign.participants?.find((p: any) =>
              p.userId?._id === paymentAccount?.user?._id ||
              p.userId === paymentAccount?.user?._id
            )

            const rewardAmount = myParticipation?.reward?.amount || 0
            const distributed = myParticipation?.reward?.distributed || false

            rewardTokens.push({
              symbol: campaign.rewardConfig.tokenSymbol || 'REWARD',
              name: campaign.rewardConfig.tokenName || 'Campaign Reward Token',
              balance: distributed ? rewardAmount : 0,
              fiatValue: (distributed ? rewardAmount : 0) * 0.5, // Mock conversion
              change24h: 0,
              icon: '🎁'
            })
          }
        }
      })

      // Add reward tokens to balances if any found
      if (rewardTokens.length > 0) {
        setBalances(prev => {
          // Remove old reward tokens
          const nonRewardTokens = prev.filter(t => t.icon !== '🎁')
          // Add new reward tokens
          return [...nonRewardTokens, ...rewardTokens]
        })
      }
    } catch (error: any) {
      console.error("Error loading campaign reward tokens:", error)
      // Non-critical, don't show error to user
    }
  }

  // Load transaction history
  const loadTransactions = async () => {
    try {
      const response = await apiClient.getTransactionHistory({ limit: 20 })

      // Convert API transactions to UI format
      const apiTransactions: Transaction[] = (response.data || []).map((tx: any) => ({
        id: tx.hederaTransactionId,
        type: tx.type === "earned" ? "incentive" : tx.type === "spent" ? "payment" : tx.type,
        amount: tx.type === "spent" || tx.type === "transferred" ? -tx.amount : tx.amount,
        tokenSymbol: "CARE",
        fiatAmount: (tx.type === "spent" || tx.type === "transferred" ? -tx.amount : tx.amount) * 0.5,
        toFrom: tx.description.includes("transfer") ? "User Transfer" : "MediSphere System",
        timestamp: tx.createdAt,
        status: "completed" as const,
        description: tx.description,
        txHash: tx.hederaTransactionId,
      })) || []

      setTransactions(apiTransactions)
    } catch (error: any) {
      console.error("Error loading transactions:", error)
      // Don't show error for transactions as it's not critical
    }
  }

  // Load data on component mount
  useEffect(() => {
    loadPaymentAccount()
    loadTransactions()
  }, [])

  // Clear messages after 5 seconds
  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null)
        setSuccess(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error, success])

  return (
    <div className="space-y-8">
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
      {/* Hero Section */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center">
            <CreditCard className="w-6 h-6 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">CareXPay™</h1>
        </div>
        <Badge variant="secondary" className="mb-4 bg-primary/20 text-primary border-primary/30 rounded-full">
          Token-Based Payment System
        </Badge>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Token-based payments, grants, insurance, and rewards powered by Hedera Token Service
        </p>
      </div>

      {/* Balance Overview */}
      <Card className="rounded-2xl bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Total Portfolio Value</h2>
              <p className="text-muted-foreground">Your healthcare token portfolio</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowBalance(!showBalance)} className="rounded-xl">
              {showBalance ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>
          <div className="text-center">
            <p className="text-4xl font-bold text-foreground mb-2">
              {showBalance ? `₦${totalFiatValue.toLocaleString()}` : "••••••"}
            </p>
            {paymentAccount && (
              <p className="text-sm text-muted-foreground mb-2">
                Health Tokens: {showBalance ? paymentAccount.healthTokens.toLocaleString() : "••••••"}
              </p>
            )}
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="w-4 h-4 text-secondary" />
              <span className="text-secondary font-medium">+12.5% this month</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="wallet" className="flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Wallet
            </TabsTrigger>
            <TabsTrigger value="send" className="flex items-center gap-2">
              <ArrowUpRight className="w-4 h-4" />
              Send
            </TabsTrigger>
            <TabsTrigger value="receive" className="flex items-center gap-2">
              <ArrowDownLeft className="w-4 h-4" />
              Receive
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          {/* Wallet Tab */}
          <TabsContent value="wallet" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {balances.map((token) => (
                <Card key={token.symbol} className="rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-primary/20 rounded-xl flex items-center justify-center text-xl">
                          {token.icon}
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{token.name}</h3>
                          <p className="text-sm text-muted-foreground">{token.symbol}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{showBalance ? token.balance.toLocaleString() : "••••"}</p>
                        <p className="text-sm text-muted-foreground">
                          {showBalance ? `₦${token.fiatValue.toLocaleString()}` : "••••"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        {token.change24h >= 0 ? (
                          <TrendingUp className="w-4 h-4 text-secondary" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-destructive" />
                        )}
                        <span
                          className={`text-sm font-medium ${
                            token.change24h >= 0 ? "text-secondary" : "text-destructive"
                          }`}
                        >
                          {token.change24h >= 0 ? "+" : ""}
                          {token.change24h}%
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSendToken(token.symbol)
                            setActiveTab("send")
                          }}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                        >
                          <ArrowUpRight className="w-3 h-3 mr-1" />
                          Send
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab("receive")}
                          className="rounded-xl bg-transparent"
                        >
                          <ArrowDownLeft className="w-3 h-3 mr-1" />
                          Receive
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Quick Actions */}
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="w-5 h-5 text-secondary" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common payment operations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    onClick={handlePayBill}
                    disabled={isLoading}
                    className="h-20 flex-col gap-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-xl"
                  >
                    <DollarSign className="w-6 h-6" />
                    <span className="text-sm">{isLoading ? "Processing..." : "Pay Bill"}</span>
                  </Button>
                  <Button
                    onClick={handleClaimReward}
                    disabled={isLoading}
                    className="h-20 flex-col gap-2 bg-secondary/10 hover:bg-secondary/20 text-secondary rounded-xl"
                  >
                    <Gift className="w-6 h-6" />
                    <span className="text-sm">{isLoading ? "Claiming..." : "Claim Reward"}</span>
                  </Button>
                  <Button className="h-20 flex-col gap-2 bg-accent/10 hover:bg-accent/20 text-accent rounded-xl">
                    <Building2 className="w-6 h-6" />
                    <span className="text-sm">Insurance</span>
                  </Button>
                  <Button className="h-20 flex-col gap-2 bg-muted/10 hover:bg-muted/20 text-muted-foreground rounded-xl">
                    <RefreshCw className="w-6 h-6" />
                    <span className="text-sm">Request Refund</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Send Tab */}
          <TabsContent value="send" className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 text-primary" />
                  Send Tokens
                </CardTitle>
                <CardDescription>Transfer tokens to healthcare providers or other users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sendToken">Token Type</Label>
                    <Select value={sendToken} onValueChange={setSendToken}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select token to send" />
                      </SelectTrigger>
                      <SelectContent>
                        {balances.map((token) => (
                          <SelectItem key={token.symbol} value={token.symbol}>
                            <div className="flex items-center gap-2">
                              <span>{token.icon}</span>
                              <span>
                                {token.name} ({token.balance.toLocaleString()} available)
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sendAmount">Amount</Label>
                    <Input
                      id="sendAmount"
                      type="number"
                      value={sendAmount}
                      onChange={(e) => setSendAmount(e.target.value)}
                      placeholder="0.00"
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sendRecipient">Recipient</Label>
                  <Input
                    id="sendRecipient"
                    value={sendRecipient}
                    onChange={(e) => setSendRecipient(e.target.value)}
                    placeholder="Enter wallet address or select from contacts"
                    className="rounded-xl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sendNote">Note (Optional)</Label>
                  <Textarea
                    id="sendNote"
                    value={sendNote}
                    onChange={(e) => setSendNote(e.target.value)}
                    placeholder="Add a note for this transaction"
                    className="rounded-xl min-h-20"
                  />
                </div>

                {/* Quick Recipients */}
                <div>
                  <Label className="text-sm font-medium">Quick Recipients</Label>
                  <div className="grid md:grid-cols-3 gap-3 mt-2">
                    {[
                      { name: "Dr. Adebayo Ogundimu", type: "Doctor", address: "0x742d35Cc..." },
                      { name: "Lagos General Hospital", type: "Hospital", address: "0x8f2a3b4c..." },
                      { name: "Reliance HMO", type: "Insurance", address: "0x1a2b3c4d..." },
                    ].map((recipient, index) => (
                      <Card
                        key={index}
                        className="rounded-xl p-3 cursor-pointer hover:bg-muted/30 transition-colors"
                        onClick={() => setSendRecipient(recipient.address)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                            <User className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-sm">{recipient.name}</p>
                            <p className="text-xs text-muted-foreground">{recipient.type}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="bg-muted/30 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <Coins className="w-5 h-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Transaction Fee</p>
                      <p className="text-xs text-muted-foreground mt-1">Hedera network fee: ~0.0001 HBAR (≈₦0.05)</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={handleSendTokens}
                    disabled={isLoading || !sendAmount || !sendToken || !sendRecipient}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl"
                  >
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    {isLoading ? "Sending..." : "Send Tokens"}
                  </Button>
                  <Button onClick={fillTestSendData} variant="outline" className="rounded-xl bg-transparent">
                    Fill Test Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Receive Tab */}
          <TabsContent value="receive" className="space-y-6">
            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowDownLeft className="w-5 h-5 text-secondary" />
                  Receive Tokens
                </CardTitle>
                <CardDescription>Share your wallet address to receive payments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="w-48 h-48 bg-muted/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <QrCode className="w-24 h-24 text-muted-foreground" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">QR Code for your Hedera Account ID</p>
                  <div className="flex gap-2 justify-center">
                    <Button variant="outline" className="rounded-xl bg-transparent">
                      <Download className="w-4 h-4 mr-2" />
                      Download QR
                    </Button>
                    <Button
                      onClick={() => copyToClipboard(paymentAccount?.hederaAccountId || paymentAccount?.user?.hederaAccountId || "No Hedera account")}
                      variant="outline"
                      className="rounded-xl bg-transparent"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Address
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">Your Hedera Account ID</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="bg-muted/30 px-3 py-2 rounded-xl text-sm flex-1 font-mono">
                        {paymentAccount?.hederaAccountId || paymentAccount?.user?.hederaAccountId || "No Hedera account"}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(paymentAccount?.hederaAccountId || paymentAccount?.user?.hederaAccountId || "No Hedera account")}
                        className="rounded-xl"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    {(!paymentAccount?.hederaAccountId && !paymentAccount?.user?.hederaAccountId) && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Please create a Hedera account in PersonaVault to receive tokens
                      </p>
                    )}
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Supported Tokens</Label>
                    <div className="grid grid-cols-2 gap-3 mt-2">
                      {balances.map((token) => (
                        <div key={token.symbol} className="flex items-center gap-2 p-2 bg-muted/30 rounded-xl">
                          <span className="text-lg">{token.icon}</span>
                          <div>
                            <p className="font-medium text-sm">{token.symbol}</p>
                            <p className="text-xs text-muted-foreground">{token.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-secondary/10 rounded-2xl p-4">
                  <div className="flex items-start gap-3">
                    <ArrowDownLeft className="w-5 h-5 text-secondary mt-0.5" />
                    <div>
                      <p className="font-medium text-sm">Instant Notifications</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        You'll receive instant notifications when tokens are sent to your wallet.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 rounded-xl"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-full md:w-48 rounded-xl">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Transactions</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="incentive">Incentives</SelectItem>
                  <SelectItem value="refund">Refunds</SelectItem>
                  <SelectItem value="grant">Grants</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="reward">Rewards</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Card className="rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-accent" />
                  Transaction History
                </CardTitle>
                <CardDescription>Your complete payment history on the blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredTransactions.map((transaction) => {
                    const IconComponent = transactionTypeIcons[transaction.type]
                    const isIncoming = transaction.amount > 0
                    return (
                      <div key={transaction.id} className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            transaction.type === "payment"
                              ? "bg-destructive/20"
                              : transaction.type === "incentive" || transaction.type === "reward"
                                ? "bg-secondary/20"
                                : transaction.type === "refund"
                                  ? "bg-primary/20"
                                  : transaction.type === "grant"
                                    ? "bg-accent/20"
                                    : "bg-muted/20"
                          }`}
                        >
                          <IconComponent
                            className={`w-6 h-6 ${
                              transaction.type === "payment"
                                ? "text-destructive"
                                : transaction.type === "incentive" || transaction.type === "reward"
                                  ? "text-secondary"
                                  : transaction.type === "refund"
                                    ? "text-primary"
                                    : transaction.type === "grant"
                                      ? "text-accent"
                                      : "text-muted-foreground"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-1">
                            <div>
                              <h4 className="font-medium text-sm">{transaction.description}</h4>
                              <p className="text-xs text-muted-foreground">
                                {isIncoming ? "From" : "To"}: {transaction.toFrom}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className={`font-medium text-sm ${isIncoming ? "text-secondary" : "text-foreground"}`}>
                                {isIncoming ? "+" : ""}
                                {transaction.amount} {transaction.tokenSymbol}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ₦{Math.abs(transaction.fiatAmount).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  transaction.status === "completed"
                                    ? "default"
                                    : transaction.status === "pending"
                                      ? "secondary"
                                      : "destructive"
                                }
                                className={
                                  transaction.status === "completed"
                                    ? "bg-secondary/20 text-secondary"
                                    : transaction.status === "pending"
                                      ? "bg-accent/20 text-accent"
                                      : ""
                                }
                              >
                                {transaction.status}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  transaction.type === "payment"
                                    ? "border-destructive/30 text-destructive"
                                    : transaction.type === "incentive" || transaction.type === "reward"
                                      ? "border-secondary/30 text-secondary"
                                      : transaction.type === "refund"
                                        ? "border-primary/30 text-primary"
                                        : transaction.type === "grant"
                                          ? "border-accent/30 text-accent"
                                          : "border-muted/30 text-muted-foreground"
                                }`}
                              >
                                {transaction.type}
                              </Badge>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(transaction.timestamp).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <code className="text-xs bg-background/50 px-2 py-1 rounded font-mono">
                              {transaction.txHash.substring(0, 20)}...
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => copyToClipboard(transaction.txHash)}
                              className="h-6 w-6 p-0 rounded"
                            >
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
